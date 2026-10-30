import { esNumero } from "../helpers/index.js";
export const sumar = (a, b) =>  {
   if (esNumero(a) && esNumero(b)) {
    return  a + b 
   }else{
    throw new Error("NO podemos realizar la suma");
   }
}