# 03 - Especificación: Adaptador de Sanitización Salarial

## Responsabilidad y Ubicación
Este documento detalla el adaptador de datos para el salario, el cual debe ubicarse dentro del directorio de la funcionalidad salarial. Es el único archivo que invoca al módulo validador (séptima regla del documento 00).

## Entradas
El adaptador es una función pura que transforma textos crudos en datos seguros. Recibe cinco textos provenientes de la entrada del usuario:

1. **Mes de liquidación**, con formato año-mes (por ejemplo 2026-10).
2. **Valor de la hora**, con punto decimal opcional y hasta dos decimales (por ejemplo 10000 o 10000.50). No se aceptan comas ni separadores de miles: "10.000" se rechaza porque es ambiguo.
3. **Horas por día de lunes a sábado**: seis números separados por comas, en ese orden (por ejemplo 8,8,8,8,8,4). Admiten hasta dos decimales. Un cero significa que ese día no se trabaja.
4. **Fechas de falta injustificada**: fechas año-mes-día separadas por comas. Texto vacío significa ninguna.
5. **Jornadas especiales**: elementos separados por comas con la forma fecha=horas o fecha=horas/nocturnas (por ejemplo 2026-10-28=8/2). Texto vacío significa ninguna.

Antes de validar, el adaptador separa por comas y elimina espacios. Los parámetros del negocio (largo del periodo, horas máximas, festivos) los lee del módulo de configuración de la funcionalidad salarial, y las operaciones de fechas las pide a la utilidad de calendario (documento 07).

## Validaciones
Debe recoger todos los problemas encontrados, no solo el primero, para que el usuario corrija todo de una vez. Cada problema lleva el campo, un código y un mensaje descriptivo.

**Mes.** Formato año-mes válido y mes entre 1 y 12. El periodo resultante va del día 1 al día 30 (o al último día si el mes es febrero).

**Valor de la hora.** Formato decimal simple y mayor a cero.

**Patrón.** Exactamente seis valores, cada uno con formato decimal simple, mayor o igual a cero y menor o igual a 24. Al menos uno mayor a cero. Un valor mayor a 24 es rechazo y además genera la advertencia "un día no puede tener más de 24 horas".

**Faltas.** Cada fecha debe: existir, estar dentro del periodo (el día 31 no lo está), no repetirse, no ser domingo, no ser festivo, tener horas mayores a cero ese día (del patrón) y no tener jornada especial. La cantidad de faltas no se pregunta aparte: se deduce de esta lista.

**Jornadas especiales.** Cada fecha debe existir, estar dentro del periodo, no repetirse y no coincidir con una falta. Las horas deben ser mayores a cero y menores o iguales a 24 (más de 24 es rechazo con advertencia). Las horas nocturnas, si se indican, deben ser mayores o iguales a cero y no superar las horas de esa jornada. Una jornada con cero horas se rechaza: si no se trabajó, debe declararse como falta.

## Salida correcta
Si todo es válido, devuelve una entidad limpia llamada **datosSalariales** con exactamente estas propiedades:
- año y mes (números enteros).
- fecha de inicio y fecha de fin del periodo (texto año-mes-día).
- valor de la hora (número).
- patrón de horas: lista de seis números, de lunes a sábado.
- faltas: lista de fechas (texto año-mes-día), ordenada y sin repetidos.
- jornadas especiales: lista ordenada de objetos con fecha, horas y horas nocturnas (cero si no se indicó).

## Salida con problemas
Si hay uno o más problemas, el adaptador lanza una excepción propia llamada **errorDeValidacion** que contiene dos listas: *problemas* (campo, código, mensaje) y *advertencias* (código, mensaje). El adaptador no imprime nada; solo entrega la excepción.

## Casos de rechazo que deben cubrirse
| Entrada | Resultado |
|---|---|
| Patrón 8,8,8,8,8,25 | Rechazo del patrón más advertencia de 24 horas |
| Valor de hora 10.000 | Rechazo por formato; el mensaje pide escribir 10000 |
| Falta 2026-10-04 (domingo) | Rechazo: los domingos no se declaran como falta |
| Falta 2026-10-12 (festivo) | Rechazo: el festivo no es día de falta |
| Falta 2026-10-31 | Rechazo: el día 31 no hace parte del periodo |
| Falta repetida | Rechazo por duplicado |
| Falta en un día con cero horas en el patrón | Rechazo: ese día no estaba programado |
| Falta y jornada especial en la misma fecha | Rechazo por contradicción |
| 2026-10-28=8/9 | Rechazo: las horas nocturnas superan las horas |
| Patrón 0,0,0,0,0,0 | Rechazo: no hay ningún día de trabajo |
| Mes 2026-13 | Rechazo: mes inexistente |