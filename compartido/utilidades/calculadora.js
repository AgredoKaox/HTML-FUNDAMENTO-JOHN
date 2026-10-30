export function sumar(a, b) {
  return a + b;
}

export function restar(a, b) {
  return a - b;
}

export function multiplicar(a, b) {
  return a * b;
}

export function dividir(a, b) {
  if (b === 0) {
    throw new Error("No se puede dividir entre cero.");
  }
  return a / b;
}

export function sumarLista(valores) {
  return valores.reduce((total, valor) => sumar(total, valor), 0);
}

export function promedio(valores) {
  if (valores.length === 0) {
    throw new Error("No se puede calcular el promedio de una lista vacía.");
  }
  return dividir(sumarLista(valores), valores.length);
}

export function maximo(a, b) {
  return Math.max(a, b);
}

export function minimo(a, b) {
  return Math.min(a, b);
}

export function redondear(valor) {
  return Math.sign(valor) * Math.floor(Math.abs(valor) + 0.5);
}
