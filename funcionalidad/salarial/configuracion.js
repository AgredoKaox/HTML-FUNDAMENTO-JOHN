export const configuracionSalarial = {
  largoMaximoPeriodo: 30,
  horasMaximasPorDia: 24,
  horasDiariasAdvertencia: 10,
  horasExtraAdvertencia: 12,
  limiteSemanalPorVigencia: [
    { desde: "0001-01-01", horas: 48 },
    { desde: "2023-07-15", horas: 47 },
    { desde: "2024-07-15", horas: 46 },
    { desde: "2025-07-15", horas: 44 },
    { desde: "2026-07-15", horas: 42 },
  ],
  recargoExtraDiurna: 0.25,
  recargoNocturno: 0.35,
  recargoDominicalFestivoPorVigencia: [
    { desde: "0001-01-01", tasa: 0.75 },
    { desde: "2025-07-01", tasa: 0.8 },
    { desde: "2026-07-01", tasa: 0.9 },
    { desde: "2027-07-01", tasa: 1 },
  ],
  festivosPorAnio: {
    2026: [
      "2026-01-01", "2026-01-12", "2026-03-23", "2026-04-02", "2026-04-03",
      "2026-05-01", "2026-05-18", "2026-06-08", "2026-06-15", "2026-06-29",
      "2026-07-20", "2026-08-07", "2026-08-17", "2026-10-12", "2026-11-02",
      "2026-11-16", "2026-12-08", "2026-12-25",
    ],
  },
};

export function limiteSemanal(fecha) {
  let vigente = configuracionSalarial.limiteSemanalPorVigencia[0].horas;
  for (const regla of configuracionSalarial.limiteSemanalPorVigencia) {
    if (fecha >= regla.desde) {
      vigente = regla.horas;
    }
  }
  return vigente;
}

export function recargoDominicalFestivo(fecha) {
  let vigente = configuracionSalarial.recargoDominicalFestivoPorVigencia[0].tasa;
  for (const regla of configuracionSalarial.recargoDominicalFestivoPorVigencia) {
    if (fecha >= regla.desde) {
      vigente = regla.tasa;
    }
  }
  return vigente;
}
