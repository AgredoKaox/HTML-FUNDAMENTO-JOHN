const formatoPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});
const formatoHoras = new Intl.NumberFormat("es-CO", { maximumFractionDigits: 2 });

export function imprimirLiquidacion(liquidacion) {
  console.log("Periodo:", liquidacion.periodo.fechaInicio, "a", liquidacion.periodo.fechaFin);
  console.log("Resumen:");
  console.log("Gran Total:", formatoPesos.format(liquidacion.granTotal));
  console.log("Descuento por faltas:", formatoPesos.format(liquidacion.descuentoPorFaltas));
  console.log("Descuento por dominicales:", formatoPesos.format(liquidacion.descuentoPorDominicales));
  console.log("Descuentos:", formatoPesos.format(liquidacion.descuentos));
  console.log("Adicionales por horas Extras:", formatoPesos.format(liquidacion.adicionales));
  console.log("Total a Pagar:", formatoPesos.format(liquidacion.totalAPagar));
  const filas = liquidacion.semanas.map((semana) => ({
    Lunes: semana.lunes,
    Parcial: semana.parcial ? "Sí" : "No",
    "Horas trabajadas": formatoHoras.format(semana.horasTrabajadas),
    "Horas extra": formatoHoras.format(semana.horasExtra),
    "Pago de días": formatoPesos.format(semana.pagoDias),
    Dominical: semana.dominicalPagado
      ? formatoPesos.format(semana.valorDominical)
      : formatoPesos.format(semana.descuentoDominical),
    Adicionales: formatoPesos.format(semana.adicionales),
  }));
  console.log("Desglose semanal:");
  console.table(filas);
  for (const advertencia of liquidacion.advertencias) {
    console.warn("ADVERTENCIA", advertencia.mensaje);
  }
}

export function imprimirError(error) {
  if (Array.isArray(error?.problemas) && Array.isArray(error?.advertencias)) {
    for (const problema of error.problemas) {
      console.error(`${problema.campo}: ${problema.mensaje}`);
    }
    for (const advertencia of error.advertencias) {
      console.warn("ADVERTENCIA", advertencia.mensaje);
    }
    return;
  }
  console.error(error instanceof Error ? error.message : "Ocurrió un error inesperado.");
}
