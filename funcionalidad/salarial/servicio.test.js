import test from "node:test";
import assert from "node:assert/strict";
import { adaptarDatosSalariales } from "./adaptador.js";
import { generarLiquidacion } from "./servicio.js";

test("liquida el caso obligatorio de octubre de 2026", () => {
  const datos = adaptarDatosSalariales(
    "2026-10",
    "10000",
    "8,8,8,8,8,4",
    "2026-10-06,2026-10-20",
    "2026-10-18=5,2026-10-27=10,2026-10-28=8/2,2026-10-30=10",
  );
  const liquidacion = generarLiquidacion(datos);

  assert.equal(liquidacion.granTotal, 2246666);
  assert.equal(liquidacion.descuentoPorFaltas, 160000);
  assert.equal(liquidacion.descuentoPorDominicales, 146666);
  assert.equal(liquidacion.descuentos, 306666);
  assert.equal(liquidacion.adicionales, 107000);
  assert.equal(liquidacion.totalAPagar, 2047000);
  assert.deepEqual(
    liquidacion.advertencias.map(({ codigo }) => codigo).sort(),
    ["extra_nocturna_aproximada", "patron_supera_limite", "semana_parcial", "semana_parcial"].sort(),
  );
});

test("calcula el caso sin faltas ni jornadas especiales", () => {
  const datos = adaptarDatosSalariales("2026-10", "10000", "8,8,8,8,8,4", "", "");
  const liquidacion = generarLiquidacion(datos);
  assert.equal(liquidacion.granTotal, 2206666);
  assert.equal(liquidacion.descuentos, 0);
  assert.equal(liquidacion.adicionales, 10000);
  assert.equal(liquidacion.totalAPagar, 2216666);
});
