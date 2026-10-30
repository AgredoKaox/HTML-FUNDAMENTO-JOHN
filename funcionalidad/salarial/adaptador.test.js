import test from "node:test";
import assert from "node:assert/strict";
import { adaptarDatosSalariales, errorDeValidacion } from "./adaptador.js";

const datosValidos = {
  mes: "2026-10",
  valorHora: "10000",
  patron: "8,8,8,8,8,4",
  faltas: "",
  jornadas: "",
};

function capturarError(cambios) {
  let errorCapturado;
  assert.throws(
    () => {
      try {
        adaptarDatosSalariales(
          cambios.mes ?? datosValidos.mes,
          cambios.valorHora ?? datosValidos.valorHora,
          cambios.patron ?? datosValidos.patron,
          cambios.faltas ?? datosValidos.faltas,
          cambios.jornadas ?? datosValidos.jornadas,
        );
      } catch (error) {
        errorCapturado = error;
        throw error;
      }
    },
    errorDeValidacion,
  );
  return errorCapturado;
}

test("produce la entidad salarial saneada y ordena sus listas", () => {
  const datos = adaptarDatosSalariales(
    datosValidos.mes,
    datosValidos.valorHora,
    datosValidos.patron,
    "2026-10-20,2026-10-06",
    "2026-10-28=8/2,2026-10-27=10",
  );
  assert.equal(datos.fechaInicio, "2026-10-01");
  assert.equal(datos.fechaFin, "2026-10-30");
  assert.deepEqual(datos.faltas, ["2026-10-06", "2026-10-20"]);
  assert.deepEqual(datos.jornadasEspeciales[0], {
    fecha: "2026-10-27",
    horas: 10,
    horasNocturnas: 0,
  });
});

test("rechaza todas las causas especificadas y adjunta la advertencia de más de 24 horas", async (t) => {
  const casos = [
    ["patrón sobre 24", { patron: "8,8,8,8,8,25" }, "maximo_horas"],
    ["valor con separador de miles", { valorHora: "10.000" }, "formato_decimal"],
    ["falta en domingo", { faltas: "2026-10-04" }, "domingo"],
    ["falta festiva", { faltas: "2026-10-12" }, "festivo"],
    ["falta día 31", { faltas: "2026-10-31" }, "fuera_periodo"],
    ["falta repetida", { faltas: "2026-10-06,2026-10-06" }, "duplicado"],
    ["falta en día no programado", { patron: "8,0,8,8,8,4", faltas: "2026-10-06" }, "dia_no_programado"],
    ["falta y jornada simultáneas", { faltas: "2026-10-06", jornadas: "2026-10-06=8" }, "contradiccion_falta"],
    ["horas nocturnas mayores a jornada", { jornadas: "2026-10-28=8/9" }, "horas_nocturnas_invalidas"],
    ["patrón vacío", { patron: "0,0,0,0,0,0" }, "sin_dias_trabajados"],
    ["mes inexistente", { mes: "2026-13" }, "mes_invalido"],
  ];

  for (const [nombre, cambios, codigo] of casos) {
    await t.test(nombre, () => {
      const error = capturarError(cambios);
      assert.ok(error.problemas.some((problema) => problema.codigo === codigo));
      if (nombre === "patrón sobre 24") {
        assert.ok(error.advertencias.some((advertencia) => advertencia.codigo === "maximo_diario"));
      }
      if (nombre === "valor con separador de miles") {
        assert.ok(error.problemas.some((problema) => problema.mensaje.includes("10000")));
      }
    });
  }
});
