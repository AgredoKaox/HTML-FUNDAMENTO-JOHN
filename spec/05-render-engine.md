# 05 - Especificación: Motor de Presentación Único

## Responsabilidad y Ubicación
Este archivo representa la única frontera de salida de la aplicación y debe ubicarse en el directorio de recursos compartidos. Es el único que escribe en la consola nativa (tercera regla del documento 00).

## Requerimientos
Debe exponer dos acciones: imprimir una liquidación exitosa e imprimir un error. Ambas imprimen además las advertencias que traigan.

**Imprimir liquidación.** Recibe el objeto **liquidacion** (documento 04) y muestra, en este orden:
1. Periodo.
2. Resumen: Gran Total, descuento por faltas, descuento por dominicales, Descuentos, Adicionales y Total a Pagar.
3. Desglose semanal: una fila por semana, con lunes, indicador de semana parcial, horas trabajadas, horas extra, pago de días, dominical (pagado o descontado) y adicionales.
4. Advertencias, una por línea, con la palabra ADVERTENCIA al inicio.

**Imprimir error.** Recibe un **errorDeValidacion** (documento 03) y muestra cada problema con su campo y mensaje, y después cada advertencia asociada. Si recibe cualquier otro tipo de error, muestra su mensaje sin detalles internos.

## Reglas de formato
- Los importes se muestran como pesos colombianos, sin decimales y con separador de miles. Dar formato a un número no es una operación matemática ni redondea: el redondeo ya vino hecho de la calculadora.
- Las horas se muestran con hasta dos decimales.
- Las filas del desglose semanal se arman con valores simples (texto y números) y se entregan a la tabla nativa de la consola.
- Los errores usan el canal de error de la consola; las advertencias, el canal de advertencias.

## Regla inquebrantable (reiterada)
Queda absolutamente prohibido usar métodos de serialización a cadenas de texto (por ejemplo convertir un objeto a JSON) o inspección profunda. Cada valor se entrega a la consola nativa como valor simple o como lista de objetos simples para la tabla, sin convertirlo a texto de forma manual. El motor no calcula, no valida y no modifica el objeto recibido.