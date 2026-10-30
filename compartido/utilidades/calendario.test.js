import test from "node:test";
import assert from "node:assert/strict";
import {
  agruparPorSemana,
  crearFecha,
  diaDeLaSemana,
  fechaATexto,
  generarRango,
} from "./calendario.js";

test("rechaza fechas inexistentes y numera los días de lunes a domingo", () => {
  assert.equal(crearFecha("2026-02-30"), undefined);
  assert.equal(diaDeLaSemana(crearFecha("2026-10-01")), 4);
  assert.equal(diaDeLaSemana(crearFecha("2026-10-04")), 7);
});

test("agrupa octubre y noviembre de 2026 según semanas lunes-domingo", () => {
  const octubre = agruparPorSemana(generarRango(crearFecha("2026-10-01"), crearFecha("2026-10-30")));
  assert.deepEqual(octubre.map((semana) => semana.lunes), [
    "2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26",
  ]);
  assert.equal(octubre.length, 5);
  assert.equal(octubre[0].parcial, true);
  assert.equal(octubre[4].parcial, true);
  assert.equal(octubre[4].domingoEnLista, false);

  const noviembre = agruparPorSemana(generarRango(crearFecha("2026-11-01"), crearFecha("2026-11-30")));
  assert.equal(noviembre.length, 6);
  assert.deepEqual(noviembre[0].fechas, ["2026-11-01"]);
  assert.equal(fechaATexto(crearFecha("2026-11-01")), "2026-11-01");
});
