# 07 - Especificación: Utilidad de Calendario

## Responsabilidad y Ubicación
Módulo genérico de fechas, ubicado en el directorio de recursos compartidos junto a las demás utilidades. No conoce festivos, salarios, periodos de pago ni reglas de dominicales: solo responde preguntas de calendario. No imprime en consola y no importa otros módulos del proyecto.

## Requerimientos
Todas las fechas se manejan en hora universal (UTC) para que el resultado no dependa de la zona horaria ni del horario de verano de la máquina. Dentro de este módulo sí se permite aritmética de fechas con las herramientas nativas del lenguaje.

Debe exponer estas acciones:

1. **Crear fecha desde texto.** Recibe un texto con formato año-mes-día (cuatro dígitos, guion, dos dígitos, guion, dos dígitos). Devuelve la fecha, o nada si el texto no cumple el formato o la fecha no existe (30 de febrero, mes 13, día 00). Nunca ajusta una fecha inválida a otra "parecida".
2. **Convertir fecha a texto** en el mismo formato año-mes-día. Es la única representación que viaja entre capas.
3. **Día de la semana.** Devuelve un número del 1 (lunes) al 7 (domingo). Se evita la numeración nativa que empieza en domingo.
4. **Es domingo.** Atajo del anterior.
5. **Sumar días** a una fecha (acepta negativos). Devuelve una fecha nueva sin modificar la original.
6. **Último día del mes** para un año y mes dados.
7. **Generar rango.** Lista ordenada de fechas entre dos fechas, ambas incluidas. Si el inicio es posterior al fin devuelve una lista vacía.
8. **Lunes de la semana** de una fecha.
9. **Agrupar por semana.** Recibe una lista ordenada de fechas y devuelve una lista de semanas lunes-domingo. Cada semana trae: su lunes, sus fechas dentro de la lista dada, la fecha de su domingo y un indicador de si ese domingo está en la lista. Una semana es parcial cuando le faltan días respecto de lunes a domingo.

## Casos de verificación
- Crear fecha desde el texto 2026-02-30 devuelve nada.
- El 1 de octubre de 2026 es jueves (4), el 4 de octubre es domingo (7).
- Agrupar del 1 al 30 de octubre de 2026 produce cinco semanas con lunes 28-sep, 5-oct, 12-oct, 19-oct y 26-oct. La primera y la última son parciales; el domingo de la última (1-nov) no está en la lista.
- Agrupar del 1 al 30 de noviembre de 2026 produce seis semanas; la primera solo contiene el domingo 1-nov.