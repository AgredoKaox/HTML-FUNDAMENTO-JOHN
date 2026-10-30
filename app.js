import { preguntar } from "./nucleo/gestor-entrada.js";
import { adaptarDatosSalariales, errorDeValidacion } from "./funcionalidad/salarial/adaptador.js";
import { generarLiquidacion } from "./funcionalidad/salarial/servicio.js";
import { imprimirError, imprimirLiquidacion } from "./compartido/presentacion/motor.js";

export function iniciarAplicacion() {
  for (let intento = 0; intento < 3; intento += 1) {
    try {
      const datosCrudos = [
        preguntar("Mes de liquidación (año-mes, por ejemplo 2026-10): "),
        preguntar("Valor de la hora (sin separadores de miles): "),
        preguntar("Horas por día de lunes a sábado (seis números separados por comas): "),
        preguntar("Fechas de falta injustificada (año-mes-día separadas por comas; vacío si no hubo): "),
        preguntar("Jornadas especiales (fecha=horas o fecha=horas/nocturnas, separadas por comas; vacío si no hubo): "),
      ];
      const datosSalariales = adaptarDatosSalariales(...datosCrudos);
      imprimirLiquidacion(generarLiquidacion(datosSalariales));
      process.exitCode = 0;
      return;
    } catch (error) {
      imprimirError(error);
      if (!(error instanceof errorDeValidacion)) {
        process.exitCode = 1;
        return;
      }
    }
  }

  process.exitCode = 1;
}

iniciarAplicacion();
