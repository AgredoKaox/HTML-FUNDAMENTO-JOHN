const formatoFecha = /^\d{4}-\d{2}-\d{2}$/;
const milisegundosPorDia = 86400000;

export function crearFecha(texto) {
  if (typeof texto !== "string" || !formatoFecha.test(texto)) {
    return undefined;
  }
  const [anio, mes, dia] = texto.split("-").map(Number);
  const fecha = crearFechaUTC(anio, mes - 1, dia);
  if (
    fecha.getUTCFullYear() !== anio
    || fecha.getUTCMonth() !== mes - 1
    || fecha.getUTCDate() !== dia
  ) {
    return undefined;
  }
  return fecha;
}

export function fechaATexto(fecha) {
  const anio = String(fecha.getUTCFullYear()).padStart(4, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function diaDeLaSemana(fecha) {
  const diaNativo = fecha.getUTCDay();
  return diaNativo === 0 ? 7 : diaNativo;
}

export function esDomingo(fecha) {
  return diaDeLaSemana(fecha) === 7;
}

export function sumarDias(fecha, dias) {
  return new Date(fecha.getTime() + (dias * milisegundosPorDia));
}

export function ultimoDiaDelMes(anio, mes) {
  return crearFechaUTC(anio, mes, 0).getUTCDate();
}

export function generarRango(inicio, fin) {
  const fechas = [];
  for (let fecha = new Date(inicio); fecha <= fin; fecha = sumarDias(fecha, 1)) {
    fechas.push(new Date(fecha));
  }
  return fechas;
}

export function lunesDeLaSemana(fecha) {
  return sumarDias(fecha, 1 - diaDeLaSemana(fecha));
}

export function agruparPorSemana(fechas) {
  const grupos = new Map();
  for (const fecha of fechas) {
    const lunes = lunesDeLaSemana(fecha);
    const clave = fechaATexto(lunes);
    if (!grupos.has(clave)) {
      grupos.set(clave, { lunes, fechas: [] });
    }
    grupos.get(clave).fechas.push(new Date(fecha));
  }

  return Array.from(grupos.values(), ({ lunes, fechas: fechasSemana }) => {
    const domingo = sumarDias(lunes, 6);
    return {
      lunes: fechaATexto(lunes),
      fechas: fechasSemana.map(fechaATexto),
      domingo: fechaATexto(domingo),
      domingoEnLista: fechasSemana.some((fecha) => fecha.getTime() === domingo.getTime()),
      parcial: fechasSemana.length !== 7,
    };
  });
}

function crearFechaUTC(anio, mes, dia) {
  const fecha = new Date(0);
  fecha.setUTCHours(0, 0, 0, 0);
  fecha.setUTCFullYear(anio, mes, dia);
  return fecha;
}
