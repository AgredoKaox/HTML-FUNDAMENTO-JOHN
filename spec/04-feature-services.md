# 04 - Especificación: Servicio de Cálculo Salarial

## Responsabilidad y Ubicación
Este servicio se ubica dentro de la carpeta de la funcionalidad salarial. Su única responsabilidad es orquestar las reglas del negocio del documento 00 (Parte B). No valida entradas, no imprime, no formatea.

## Módulo de configuración
Dentro de la funcionalidad salarial existe un módulo de configuración que contiene todos los parámetros de la Parte C del documento 00: largo del periodo, topes de horas, límites semanales por vigencia, recargos y la lista de festivos por año. El servicio y el adaptador lo importan; nadie más. Los valores por vigencia se eligen según la fecha del hecho: el recargo dominical/festivo por la fecha trabajada y el límite semanal por el lunes de la semana. Los festivos de ejemplo para el último trimestre de 2026 son 12-oct, 2-nov, 16-nov, 8-dic y 25-dic; la lista del año debe completarse desde una fuente oficial.

## Requerimientos
El servicio salarial debe exponer una acción para generar la liquidación mensual. Recibe la entidad **datosSalariales** del adaptador.

Para realizar su trabajo, el servicio tiene estrictamente prohibido usar signos matemáticos directos sobre dinero, horas o conteos de negocio; debe obligatoriamente importar e invocar al módulo Calculadora. Para fechas y semanas usa la utilidad de Calendario.

## Flujo de cálculo
1. **Calendario del periodo.** Generar todas las fechas del periodo y agruparlas por semana lunes-domingo. Marcar cada semana como parcial si le faltan días.
2. **Por cada semana**, recorrer sus fechas:
   1. Domingos: solo se anotan; si tienen jornada especial, pasan al paso 2.6.
   2. Lunes a sábado: horas del día = las de la jornada especial si existe y no es festivo; si no, las del patrón.
   3. Pago del día = horas por valor de la hora. Los días con horas mayores a cero se anotan como programados.
   4. Si la fecha es falta: el pago del día se suma al descuento por faltas de la semana y la semana queda marcada con falta. Esa fecha no suma horas.
   5. Si no es falta ni festivo: sus horas se suman a las horas trabajadas de la semana. Si tiene horas nocturnas, el recargo nocturno (horas nocturnas por valor de la hora por 0.35) se suma a los adicionales.
   6. Domingo o festivo con jornada especial: adicional = horas diurnas por valor de la hora por (1 + recargo dominical/festivo vigente), más horas nocturnas por valor de la hora por (1 + recargo dominical/festivo + 0.35).
3. **Horas extra de la semana.** Horas extra = máximo entre cero y (horas trabajadas menos límite semanal vigente). Adicional por extras = horas extra por valor de la hora por 0.25.
4. **Pago de días de la semana** = suma de los pagos de todos los días programados (incluye días con falta y festivos, que el descuento y la regla R2 ya tratan).
5. **Dominical de la semana.** Solo si el domingo de la semana está dentro del periodo (R6). Su valor es el promedio del pago de los días programados de la semana. Si la semana no tiene días programados dentro del periodo, aplica R5. Si la semana tiene falta, el dominical se descuenta completo.
6. **Redondeo.** Redondear con la calculadora cada concepto de la semana (pago de días, dominical, descuento por faltas, descuento por dominical, adicionales).
7. **Totales.** Gran Total = suma de pago de días más dominicales de todas las semanas. Descuento por faltas y descuento por dominicales = sumas respectivas. Descuentos = ambos. Adicionales = suma de todos los adicionales. **Total a Pagar = Gran Total − Descuentos + Adicionales.**
8. **Advertencias** (no detienen el cálculo): semana parcial; dominical sin días en el periodo (R5); patrón semanal que supera el límite vigente; más de 12 horas extra en una semana; alguna jornada de más de 10 horas; semana con horas extra y horas nocturnas (clasificación aproximada); año sin lista de festivos configurada.

## Salida
El servicio retorna un objeto llamado **liquidacion** con:
- periodo: fecha de inicio, fecha de fin y cantidad de días.
- semanas: lista donde cada elemento trae lunes, si es parcial, horas trabajadas, horas extra, pago de días, valor del dominical, si el dominical fue pagado, fechas de falta, descuento por faltas, descuento por dominical, adicional por extras, adicional nocturno y adicional dominical/festivo.
- gran total, descuento por faltas, descuento por dominicales, descuentos, adicionales y total a pagar.
- advertencias: lista de código y mensaje.

## Caso de verificación obligatorio
Entradas: mes 2026-10; valor de la hora 10000; patrón 8,8,8,8,8,4; festivo 12-oct; faltas 6-oct y 20-oct; jornadas especiales 18-oct=5 (domingo), 27-oct=10, 28-oct=8/2 y 30-oct=10. Límite semanal 42 y recargo dominical 90%.

| Semana (lunes) | Horas | Extra | Pago de días | Dominical | Desc. faltas | Desc. dominical | Adicionales |
|---|---|---|---|---|---|---|---|
| 28-sep (parcial, 1 al 4) | 20 | 0 | 200,000 | 66,667 pagado | 0 | 0 | 0 |
| 5-oct | 36 | 0 | 440,000 | 73,333 | 80,000 | 73,333 | 0 |
| 12-oct | 36 | 0 | 440,000 | 73,333 pagado | 0 | 0 | 95,000 |
| 19-oct | 36 | 0 | 440,000 | 73,333 | 80,000 | 73,333 | 0 |
| 26-oct (parcial, 26 al 30) | 44 | 2 | 440,000 | sin domingo | 0 | 0 | 12,000 |

Resultado esperado: Gran Total 2,246,666; descuento por faltas 160,000; descuento por dominicales 146,666; Descuentos 306,666; Adicionales 107,000; **Total a Pagar 2,047,000.**
Notas del caso: el festivo del 12 paga su día y no suma horas; los 95,000 de la semana del 12 son 5 horas del domingo 18 por 10,000 por 1.90; los 12,000 de la última semana son 5,000 de extras (2 horas por 10,000 por 0.25) más 7,000 de recargo nocturno (2 horas por 10,000 por 0.35). Advertencias esperadas: dos semanas parciales, patrón de 44 horas sobre el límite de 42 y semana con extras y horas nocturnas.

Sin faltas ni jornadas especiales, el mismo caso da Gran Total 2,206,666, descuentos 0, adicionales 10,000 (extras de las semanas del 5 y del 19) y Total a Pagar 2,216,666.