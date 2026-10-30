import {
  dividir,
  maximo,
  multiplicar,
  promedio,
  redondear,
  restar,
  sumar,
  sumarLista,
} from "../../compartido/utilidades/calculadora.js";
import {
  agruparPorSemana,
  crearFecha,
  diaDeLaSemana,
  generarRango,
} from "../../compartido/utilidades/calendario.js";
import {
  configuracionSalarial,
  limiteSemanal,
  recargoDominicalFestivo,
} from "./configuracion.js";

export function generarLiquidacion(datosSalariales) {
  const fechaInicio = crearFecha(datosSalariales.fechaInicio);
  const fechaFin = crearFecha(datosSalariales.fechaFin);
  const fechasPeriodo = generarRango(fechaInicio, fechaFin);
  const semanasCalendario = agruparPorSemana(fechasPeriodo);
  const fechasFalta = new Set(datosSalariales.faltas);
  const jornadas = new Map(datosSalariales.jornadasEspeciales.map((jornada) => [jornada.fecha, jornada]));
  const festivos = new Set(configuracionSalarial.festivosPorAnio[datosSalariales.anio] ?? []);
  const semanas = [];
  const advertencias = [];
  const advertir = (codigo, mensaje) => {
    if (!advertencias.some((advertencia) => advertencia.codigo === codigo && advertencia.mensaje === mensaje)) {
      advertencias.push({ codigo, mensaje });
    }
  };
  const horasPatronSemanal = sumarLista(datosSalariales.patronHoras);

  if (configuracionSalarial.festivosPorAnio[datosSalariales.anio] === undefined) {
    advertir("sin_festivos", `No hay festivos configurados para ${datosSalariales.anio}; el cálculo se realizará sin festivos.`);
  }

  for (const semanaCalendario of semanasCalendario) {
    const limiteHoras = limiteSemanal(semanaCalendario.lunes);
    const horasTrabajadasDias = [];
    const pagosDiasProgramados = [];
    const faltasSemana = [];
    const adicionalesNocturnos = [];
    const adicionalesDominicalFestivo = [];
    let descuentoFaltas = 0;
    let tieneFalta = false;
    let horasNocturnasSemana = 0;
    for (const fechaTexto of semanaCalendario.fechas) {
      const fecha = crearFecha(fechaTexto);
      const diaSemana = diaDeLaSemana(fecha);
      const jornada = jornadas.get(fechaTexto);
      const esFestivoFecha = festivos.has(fechaTexto);

      if (diaSemana === 7) {
        if (jornada) {
          if (jornada.horas > configuracionSalarial.horasDiariasAdvertencia) {
            advertir("jornada_extensa", `La jornada del ${fechaTexto} supera ${configuracionSalarial.horasDiariasAdvertencia} horas.`);
          }
          agregarAdicionalDominicalFestivo(jornada, fechaTexto, datosSalariales.valorHora, adicionalesDominicalFestivo);
        }
        continue;
      }

      const indicePatron = diaSemana - 1;
      const horasDia = jornada && !esFestivoFecha ? jornada.horas : datosSalariales.patronHoras[indicePatron];
      const pagoDia = multiplicar(horasDia, datosSalariales.valorHora);
      const horasJornada = jornada ? jornada.horas : horasDia;
      if (horasJornada > configuracionSalarial.horasDiariasAdvertencia) {
        advertir("jornada_extensa", `La jornada del ${fechaTexto} supera ${configuracionSalarial.horasDiariasAdvertencia} horas.`);
      }
      if (horasDia > 0) {
        pagosDiasProgramados.push(pagoDia);
      }
      if (fechasFalta.has(fechaTexto)) {
        descuentoFaltas = sumar(descuentoFaltas, pagoDia);
        faltasSemana.push(fechaTexto);
        tieneFalta = true;
        continue;
      }

      if (esFestivoFecha) {
        if (jornada) {
          agregarAdicionalDominicalFestivo(jornada, fechaTexto, datosSalariales.valorHora, adicionalesDominicalFestivo);
        }
        continue;
      }

      horasTrabajadasDias.push(horasDia);
      if (jornada) {
        horasNocturnasSemana = sumar(horasNocturnasSemana, jornada.horasNocturnas);
        adicionalesNocturnos.push(multiplicar(
          multiplicar(jornada.horasNocturnas, datosSalariales.valorHora),
          configuracionSalarial.recargoNocturno,
        ));
      }
    }

    if (horasPatronSemanal > limiteHoras) {
      advertir("patron_supera_limite", `El patrón semanal de ${horasPatronSemanal} horas supera el límite de ${limiteHoras} horas.`);
    }
    if (semanaCalendario.parcial) {
      advertir("semana_parcial", `La semana del ${semanaCalendario.lunes} es parcial.`);
    }

    const horasTrabajadas = sumarLista(horasTrabajadasDias);
    const horasExtra = maximo(0, restar(horasTrabajadas, limiteHoras));
    if (horasExtra > configuracionSalarial.horasExtraAdvertencia) {
      advertir("horas_extra_extensas", `La semana del ${semanaCalendario.lunes} supera ${configuracionSalarial.horasExtraAdvertencia} horas extra.`);
    }
    if (horasExtra > 0 && horasNocturnasSemana > 0) {
      advertir("extra_nocturna_aproximada", `La semana del ${semanaCalendario.lunes} combina horas extra y nocturnas; las extras se consideran diurnas.`);
    }

    const pagoDias = redondear(sumarLista(pagosDiasProgramados));
    const valorDominical = semanaCalendario.domingoEnLista
      ? redondear(pagosDiasProgramados.length > 0 ? promedio(pagosDiasProgramados) : promedio(datosSalariales.patronHoras.map((horas) => multiplicar(horas, datosSalariales.valorHora)).filter((pago) => pago > 0)))
      : 0;
    const tieneDiaLaborableEnPeriodo = semanaCalendario.fechas.some(
      (fechaTexto) => diaDeLaSemana(crearFecha(fechaTexto)) !== 7,
    );
    if (semanaCalendario.domingoEnLista && !tieneDiaLaborableEnPeriodo) {
      advertir("dominical_sin_dias", `El domingo ${semanaCalendario.domingo} no tiene días laborables del periodo para verificar faltas de la semana anterior.`);
    }
    const descuentoDominical = semanaCalendario.domingoEnLista && tieneFalta ? valorDominical : 0;
    const dominicalPagado = semanaCalendario.domingoEnLista && !tieneFalta ? valorDominical : 0;
    const adicionalExtras = redondear(multiplicar(
      multiplicar(horasExtra, datosSalariales.valorHora),
      configuracionSalarial.recargoExtraDiurna,
    ));
    const adicionalNocturno = redondear(sumarLista(adicionalesNocturnos));
    const adicionalDominicalFestivo = redondear(sumarLista(adicionalesDominicalFestivo));
    const descuentoFaltasRedondeado = redondear(descuentoFaltas);

    semanas.push({
      lunes: semanaCalendario.lunes,
      parcial: semanaCalendario.parcial,
      horasTrabajadas,
      horasExtra,
      pagoDias,
      valorDominical,
      dominicalPagado: semanaCalendario.domingoEnLista && !tieneFalta,
      fechasFalta: faltasSemana,
      descuentoFaltas: descuentoFaltasRedondeado,
      descuentoDominical: redondear(descuentoDominical),
      adicionalExtras,
      adicionalNocturno,
      adicionalDominicalFestivo,
      adicionales: sumarLista([adicionalExtras, adicionalNocturno, adicionalDominicalFestivo]),
    });
  }

  const granTotal = sumarLista(semanas.map((semana) => sumar(semana.pagoDias, semana.valorDominical)));
  const descuentoPorFaltas = sumarLista(semanas.map((semana) => semana.descuentoFaltas));
  const descuentoPorDominicales = sumarLista(semanas.map((semana) => semana.descuentoDominical));
  const descuentos = sumar(descuentoPorFaltas, descuentoPorDominicales);
  const adicionales = sumarLista(semanas.map((semana) => semana.adicionales));
  const totalAPagar = sumar(restar(granTotal, descuentos), adicionales);

  return {
    periodo: {
      fechaInicio: datosSalariales.fechaInicio,
      fechaFin: datosSalariales.fechaFin,
      cantidadDias: fechasPeriodo.length,
    },
    semanas,
    granTotal,
    descuentoPorFaltas,
    descuentoPorDominicales,
    descuentos,
    adicionales,
    totalAPagar,
    advertencias,
  };
}

function agregarAdicionalDominicalFestivo(jornada, fecha, valorHora, destino) {
  const recargo = recargoDominicalFestivo(fecha);
  const factorDiurno = sumar(1, recargo);
  const factorNocturno = sumar(factorDiurno, configuracionSalarial.recargoNocturno);
  const horasDiurnas = restar(jornada.horas, jornada.horasNocturnas);
  destino.push(
    multiplicar(multiplicar(horasDiurnas, valorHora), factorDiurno),
    multiplicar(multiplicar(jornada.horasNocturnas, valorHora), factorNocturno),
  );
}
