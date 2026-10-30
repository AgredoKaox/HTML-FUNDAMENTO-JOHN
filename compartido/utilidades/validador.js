export function esNumeroFinito(valor) {
  return typeof valor === "number" && Number.isFinite(valor);
}

export function esNoNegativo(valor) {
  return esNumeroFinito(valor) && valor >= 0;
}

export function esPositivo(valor) {
  return esNumeroFinito(valor) && valor > 0;
}

export function esEntero(valor) {
  return esNumeroFinito(valor) && Number.isInteger(valor);
}

export function estaEnRango(valor, minimo, maximo) {
  return esNumeroFinito(valor) && valor >= minimo && valor <= maximo;
}

export function tieneFormatoDecimal(texto, maxDecimales = 2) {
  if (typeof texto !== "string") {
    return false;
  }
  const patron = maxDecimales === 0
    ? /^\d+$/
    : new RegExp(`^\\d+(?:\\.\\d{1,${maxDecimales}})?$`);
  return patron.test(texto);
}

export function noEstaVacio(texto) {
  return typeof texto === "string" && texto.trim().length > 0;
}
