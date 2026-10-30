import {
  esNoNegativo,
  esPositivo,
  tieneFormatoDecimal,
} from "../../compartido/utilidades/validador.js";
import {
  crearFecha,
  diaDeLaSemana,
  fechaATexto,
  ultimoDiaDelMes,
} from "../../compartido/utilidades/calendario.js";
import { configuracionSalarial } from "./configuracion.js";

export class errorDeValidacion extends Error {
  constructor(problemas, advertencias) {
    super("Los datos ingresados contienen errores.");
    this.name = "errorDeValidacion";
    this.problemas = problemas;
    this.advertencias = advertencias;
  }
}

export function adaptarDatosSalariales(textoMes, textoValorHora, textoPatron, textoFaltas, textoJornadas) {
  const problemas = [];
  const advertencias = [];
  const agregarProblema = (campo, codigo, mensaje) => problemas.push({ campo, codigo, mensaje });
  const agregarAdvertencia = (codigo, mensaje) => {
    if (!advertencias.some((advertencia) => advertencia.codigo === codigo)) {
      advertencias.push({ codigo, mensaje });
    }
  };

  let anio;
  let mes;
  let inicio;
  let fin;
  const partesMes = typeof textoMes === "string" ? textoMes.match(/^(\d{4})-(\d{2})$/) : null;
  if (partesMes) {
    anio = Number(partesMes[1]);
    mes = Number(partesMes[2]);
    if (mes >= 1 && mes <= 12) {
      inicio = crearFecha(`${partesMes[1]}-${partesMes[2]}-01`);
      fin = crearFecha(`${partesMes[1]}-${partesMes[2]}-${String(Math.min(configuracionSalarial.largoMaximoPeriodo, ultimoDiaDelMes(anio, mes))).padStart(2, "0")}`);
      if (!inicio || !fin) {
        agregarProblema("mes", "fecha_invalida", "El año o mes indicado no representa una fecha válida.");
      }
    } else {
      agregarProblema("mes", "mes_invalido", "El mes debe estar entre 01 y 12.");
    }
  } else {
    agregarProblema("mes", "formato_mes", "Escriba el mes con formato año-mes, por ejemplo 2026-10.");
  }

  let valorHora;
  if (!tieneFormatoDecimal(textoValorHora, 2)) {
    agregarProblema("valorHora", "formato_decimal", "Escriba un número decimal simple, por ejemplo 10000.");
    if (typeof textoValorHora === "string" && /^\d{1,3}(?:\.\d{3})+$/.test(textoValorHora)) {
      problemas[problemas.length - 1].mensaje = "Escriba 10000 sin separadores de miles.";
    }
  } else {
    valorHora = Number(textoValorHora);
    if (!esPositivo(valorHora)) {
      agregarProblema("valorHora", "valor_no_positivo", "El valor de la hora debe ser mayor que cero.");
    }
  }

  const partesPatron = typeof textoPatron === "string" ? textoPatron.split(",").map((valor) => valor.trim()) : [];
  const patronHoras = [];
  if (partesPatron.length !== 6) {
    agregarProblema("patron", "cantidad_dias", "El patrón debe contener exactamente seis valores de lunes a sábado.");
  }
  for (const [indice, valor] of partesPatron.entries()) {
    if (!tieneFormatoDecimal(valor, 2)) {
      agregarProblema("patron", "formato_horas", `El valor del día ${indice + 1} no tiene formato decimal válido.`);
      continue;
    }
    const horas = Number(valor);
    patronHoras.push(horas);
    if (!esNoNegativo(horas)) {
      agregarProblema("patron", "horas_negativas", `Las horas del día ${indice + 1} no pueden ser negativas.`);
    }
    if (horas > configuracionSalarial.horasMaximasPorDia) {
      agregarProblema("patron", "maximo_horas", `Las horas del día ${indice + 1} superan el máximo permitido.`);
      agregarAdvertencia("maximo_diario", "un día no puede tener más de 24 horas");
    }
  }
  if (patronHoras.length === 6 && !patronHoras.some(esPositivo)) {
    agregarProblema("patron", "sin_dias_trabajados", "Debe haber al menos un día con horas mayores a cero.");
  }

  const fechasFalta = [];
  for (const valor of parseLista(textoFaltas)) {
    const fecha = crearFecha(valor);
    if (!fecha) {
      agregarProblema("faltas", "fecha_invalida", `La fecha "${valor}" no existe o no tiene formato año-mes-día.`);
      continue;
    }
    const fechaTexto = fechaATexto(fecha);
    if (!estaEnPeriodo(fecha, inicio, fin)) {
      agregarProblema("faltas", "fuera_periodo", `La fecha ${valor} está fuera del periodo.`);
    }
    if (fechasFalta.includes(fechaTexto)) {
      agregarProblema("faltas", "duplicado", `La falta ${valor} está repetida.`);
    } else {
      fechasFalta.push(fechaTexto);
    }
    if (diaDeLaSemana(fecha) === 7) {
      agregarProblema("faltas", "domingo", "Los domingos no se declaran como falta.");
    }
    if (esFestivo(fechaTexto, anio)) {
      agregarProblema("faltas", "festivo", "El festivo no es día de falta.");
    }
    const posicionDia = diaDeLaSemana(fecha) - 1;
    if (patronHoras.length === 6 && patronHoras[posicionDia] === 0) {
      agregarProblema("faltas", "dia_no_programado", "Ese día no estaba programado en el patrón.");
    }
  }
  fechasFalta.sort();

  const jornadasEspeciales = [];
  for (const elemento of parseLista(textoJornadas)) {
    const partesJornada = elemento.match(/^(\d{4}-\d{2}-\d{2})=(\d+(?:\.\d{1,2})?)(?:\/(\d+(?:\.\d{1,2})?))?$/);
    if (!partesJornada) {
      agregarProblema("jornadasEspeciales", "formato_jornada", `La jornada "${elemento}" no tiene el formato fecha=horas/nocturnas.`);
      continue;
    }
    const [, fechaEntrada, textoHoras, textoNocturnas] = partesJornada;
    const fecha = crearFecha(fechaEntrada);
    if (!fecha) {
      agregarProblema("jornadasEspeciales", "fecha_invalida", `La fecha ${fechaEntrada} no existe.`);
      continue;
    }
    const fechaTexto = fechaATexto(fecha);
    if (!estaEnPeriodo(fecha, inicio, fin)) {
      agregarProblema("jornadasEspeciales", "fuera_periodo", `La fecha ${fechaEntrada} está fuera del periodo.`);
    }
    if (jornadasEspeciales.some((jornada) => jornada.fecha === fechaTexto)) {
      agregarProblema("jornadasEspeciales", "duplicado", `La jornada ${fechaEntrada} está repetida.`);
    }
    const horas = Number(textoHoras);
    const horasNocturnas = textoNocturnas === undefined ? 0 : Number(textoNocturnas);
    if (!esPositivo(horas)) {
      agregarProblema("jornadasEspeciales", "horas_no_positivas", "Una jornada especial debe tener horas mayores a cero.");
    }
    if (horas > configuracionSalarial.horasMaximasPorDia) {
      agregarProblema("jornadasEspeciales", "maximo_horas", "La jornada especial supera el máximo de 24 horas.");
      agregarAdvertencia("maximo_diario", "un día no puede tener más de 24 horas");
    }
    if (!esNoNegativo(horasNocturnas) || horasNocturnas > horas) {
      agregarProblema("jornadasEspeciales", "horas_nocturnas_invalidas", "Las horas nocturnas no pueden ser negativas ni superar las horas de la jornada.");
    }
    if (fechasFalta.includes(fechaTexto)) {
      agregarProblema("jornadasEspeciales", "contradiccion_falta", "No puede declarar falta y jornada especial en la misma fecha.");
    }
    jornadasEspeciales.push({ fecha: fechaTexto, horas, horasNocturnas });
  }
  jornadasEspeciales.sort((a, b) => a.fecha.localeCompare(b.fecha));

  if (Number.isInteger(anio) && !Object.hasOwn(configuracionSalarial.festivosPorAnio, anio)) {
    agregarAdvertencia("sin_festivos", `No hay festivos configurados para ${anio}; el cálculo se realizará sin festivos.`);
  }
  if (problemas.length > 0) {
    throw new errorDeValidacion(problemas, advertencias);
  }

  return {
    anio,
    mes,
    fechaInicio: fechaATexto(inicio),
    fechaFin: fechaATexto(fin),
    valorHora,
    patronHoras,
    faltas: fechasFalta,
    jornadasEspeciales,
  };
}

function parseLista(texto) {
  return typeof texto === "string" && texto.trim() !== ""
    ? texto.split(",").map((valor) => valor.trim())
    : [];
}

function estaEnPeriodo(fecha, inicio, fin) {
  return Boolean(inicio && fin && fecha >= inicio && fecha <= fin);
}

function esFestivo(fecha, anio) {
  return (configuracionSalarial.festivosPorAnio[anio] ?? []).includes(fecha);
}
