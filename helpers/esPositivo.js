import { esNumero } from "./esNumero.js";
export const esPositivo = (a) => {
  return (a >= 0 && esNumero(a)) ? true : false;
}