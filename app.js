// import { sumar, multiplicar, dividir, restar } from "./calculadora/index.js";
// import { esNumero, esPositivo } from "./helpers/index.js";

// let primerPago  = 850000;
// let segundoPago = 975000;

// try {
//   let resultadoSuma = sumar(primerPago, segundoPago);
//   let multiplo = (resultadoSuma > 0 ) ? multiplicar(resultadoSuma, 2) : "No se puede multiplicar"; 
//   let pagoDia = dividir(resultadoSuma, 30)
//   let diferencia = multiplicar(pagoDia ,  9);

//   console.log(`El resultado de sumar ${primerPago} + ${segundoPago} = ${resultadoSuma}`);  
//   console.log(`El resultado de multiplicar ${resultadoSuma} x ${2} = ${multiplo}`);
//   console.log(`El pago por dia trabajado es: ${pagoDia} COP`);
//   console.log(`El descuento por los dias no justificados es: ${diferencia} COP`);
  
  
// } catch (error) {
//   console.log(error.message);  
// }


// var prompt = require('prompt-sync')();
// //
// // get input from the user.
// //
// var n = prompt('How many more times? ');

import promptSync from 'prompt-sync';

const prompt = promptSync();

const result = prompt("Ingrese algo: ");
console.log(`El valor que ingreso la persona es: ${result}`);

