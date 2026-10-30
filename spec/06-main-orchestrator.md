# 06 - Especificación: Orquestador Principal y Punto de Entrada

## Responsabilidad y Ubicación
Este es el archivo principal ubicado en la raíz del proyecto. Es el director de la orquesta: no calcula, no valida y no imprime.

## Requerimientos
Debe exponer una acción de inicialización general. Esa acción ejecuta un ciclo de hasta tres intentos y dentro del ciclo hay un único bloque de captura de excepciones; no existe ningún otro bloque de captura en el orquestador.

## Flujo secuencial de cada intento
1. Invoca al gestor de entrada central cinco veces consecutivas para preguntar al usuario, en este orden:
   1. Mes de liquidación (año-mes, por ejemplo 2026-10).
   2. Valor de la hora (sin separadores de miles).
   3. Horas por día de lunes a sábado (seis números separados por comas).
   4. Fechas de falta injustificada (año-mes-día separadas por comas; vacío si no hubo).
   5. Jornadas especiales (fecha=horas o fecha=horas/nocturnas, separadas por comas; vacío si no hubo).
2. Envía estos cinco textos al adaptador de sanitización salarial.
3. Toma la entidad datosSalariales devuelta y se la entrega al servicio salarial.
4. Recibe la liquidación calculada y la envía al motor de presentación para ser mostrada.

## Manejo de errores
- Si el adaptador lanza un errorDeValidacion, el bloque de captura lo envía de inmediato a la acción de error del motor de presentación y el ciclo repite todo el intento desde la primera pregunta. Al agotar los tres intentos, termina con código de salida 1.
- Cualquier otro error (inesperado) se envía al motor de presentación y la aplicación termina sin reintentar, con código de salida 1.
- Con una liquidación exitosa la aplicación termina con código de salida 0.
- Asignar el código de salida no se considera imprimir.