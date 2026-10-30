# 00 - Reglas de Negocio y Arquitectura (Verdad Absoluta)

## Objetivo
El propósito de este documento es dictar la arquitectura inquebrantable y las reglas de negocio de una aplicación de cálculo de sueldos por terminal. El sistema debe ser modular, basado en funcionalidades y regido por los principios de diseño de software sólido, priorizando la responsabilidad única. Si otro documento contradice a este, prevalece este.

---

# PARTE A - ARQUITECTURA

## Reglas Inquebrantables
Primera regla: El flujo de datos es estrictamente unidireccional. La información ingresa por un gestor central, se purifica en un adaptador usando validadores externos, se calcula en un servicio usando una calculadora externa y una utilidad de calendario externa, y culmina en el motor de presentación.

Segunda regla: La aplicación debe tener un único punto de entrada en la raíz del proyecto. Toda la ejecución se orquesta desde allí.

Tercera regla: Se exige un único punto de impresión. Queda estrictamente prohibido emitir resultados, advertencias o errores desde cualquier archivo que no sea el motor de presentación centralizado. Solamente este archivo tiene permiso para comunicarse con la consola del sistema. Única excepción: el texto de cada pregunta que la librería de captura muestra al usuario al pedir un dato; esa pregunta no es un resultado, advertencia ni error, y el gestor de entrada no escribe nada más en la consola.

Cuarta regla: Aislamiento de utilidades. Las operaciones matemáticas, las validaciones de datos y las operaciones de calendario no pueden estar mezcladas con la lógica de negocio. Deben existir como herramientas independientes y genéricas que cualquier parte del sistema pueda invocar, sin conocer reglas salariales. Alcance de la prohibición matemática: los servicios no pueden usar operadores aritméticos directos (suma, resta, multiplicación, división, módulo) sobre dinero, horas ni conteos de negocio. Las comparaciones lógicas (mayor, menor, igual) y el control de ciclos son libres.

Quinta regla (Topología Estricta): El árbol de directorios se compone de tres carpetas base: un núcleo para las configuraciones de entrada, un directorio compartido para el motor de presentación y las utilidades genéricas (validador, calculadora y calendario, cada una en su propio subdirectorio o archivo de utilidades), y un directorio de funcionalidades para la lógica salarial, que puede contener un subdirectorio de configuración con los parámetros del negocio. El orquestador principal reside en la raíz. No se permite ninguna otra carpeta base.

Sexta regla (Ecosistema de Módulos Moderno): El proyecto debe configurarse de forma global para operar nativamente con el sistema de módulos de ECMAScript. Se debe instruir al entorno de ejecución para que trate todos los archivos como módulos modernos. Para la comunicación entre archivos, es obligatorio utilizar exclusivamente las declaraciones de importación y exportación modernas, y toda importación local debe incluir la extensión del archivo. Queda estrictamente prohibido el uso del sistema antiguo de módulos de CommonJS en todo el proyecto.

Séptima regla (Validador exclusivo): El único archivo autorizado para invocar al módulo validador es el adaptador de sanitización. Ningún otro archivo valida datos con ese módulo.

Octava regla (Contratos nombrados): Los objetos que viajan entre capas (datos salariales, liquidación y error de validación) tienen los nombres de propiedades definidos en los documentos 03 y 04. Ninguna capa los renombra ni agrega propiedades no documentadas.

---

# PARTE B - REGLAS DE NEGOCIO

## Glosario
- **Periodo**: del día 1 al día 30 del mes elegido. El día 31 no hace parte de ningún periodo. En febrero el periodo va del 1 al último día del mes.
- **Semana**: de lunes a domingo. Una semana puede estar partida entre dos meses y entonces es **semana parcial**: solo se consideran sus días dentro del periodo.
- **Día laborable**: de lunes a sábado.
- **Valor de la hora**: dinero que se paga por una hora ordinaria.
- **Patrón de horas**: seis valores de horas, uno por cada día de lunes a sábado. Pueden ser distintos entre sí; un valor de cero significa que ese día de la semana no se trabaja.
- **Jornada especial**: fecha concreta cuyas horas reales reemplazan al patrón (o que es un domingo o festivo trabajado). Puede declarar cuántas de sus horas fueron nocturnas.
- **Falta injustificada**: fecha laborable programada en la que el empleado no se presentó y no hay justificante. Por ahora es el único tipo de falta que existe.
- **Festivo**: fecha incluida en la lista configurable de festivos.
- **Dominical**: pago del día de descanso (domingo) de una semana.

## Reglas
**R1 - Pago de un día.** El pago de un día laborable es sus horas por el valor de la hora. Las horas son las del patrón o, si existe una jornada especial en esa fecha, las de esa jornada.

**R2 - Festivo entre lunes y sábado.** Un festivo que cae de lunes a sábado se paga como un día programado con las horas del patrón, no cuenta como falta, no interrumpe la semana y no suma horas para el límite semanal. Si se trabaja, se declara como jornada especial y sus horas reciben el recargo dominical/festivo (R7) además del pago del día.

**R3 - Falta injustificada.** Cada falta descuenta el pago de ese día (R1). Solo puede declararse en una fecha laborable del periodo, que no sea festivo, con horas mayores a cero y sin jornada especial.

**R4 - Dominical.** El domingo se paga aunque se descanse, siempre que no exista ninguna falta injustificada de lunes a sábado en los días de esa semana que caen dentro del periodo. Si hay una o más faltas, el dominical de esa semana no se paga (se descuenta). El valor de un dominical es el promedio del pago diario de los días de esa semana con horas mayores a cero dentro del periodo, que equivale a un día de salario ordinario cuando las horas son iguales.

**R5 - Dominical sin días en el periodo.** Si un domingo cae en el periodo pero ningún día laborable de su semana cae en él (ocurre cuando el mes empieza en domingo), el dominical se paga asumiendo que no hay faltas, con valor igual al promedio del pago diario del patrón, y se emite una advertencia para que se verifiquen las faltas de la semana anterior.

**R6 - Dominical de semana sin domingo en el periodo.** Una semana cuyo domingo cae fuera del periodo no genera dominical en este periodo, aunque sus días laborables sí se paguen.

**R7 - Horas extra y recargos.** Todo lo que sigue se calcula como pago adicional sobre el pago base de R1 (que ya incluye cada hora al 100%):
1. *Horas extra diurnas*: por semana, las horas trabajadas de lunes a sábado (sin festivos ni faltas) que superen el límite semanal vigente. Recargo vigente: 25%.
2. *Recargo nocturno*: las horas nocturnas declaradas en jornadas especiales de lunes a sábado reciben un recargo de 35%.
3. *Trabajo dominical o festivo*: cada hora trabajada en domingo o festivo se paga a valor de hora por uno más el recargo dominical/festivo vigente en esa fecha (90% desde el 1 de julio de 2026), y si es nocturna se suma además el 35%. Estas horas no cuentan para el límite semanal.
4. Fuera de esta versión: la clasificación de cuáles horas extra son nocturnas (extra nocturna, 75%) y las horas extra en domingo o festivo. Se asume que toda hora extra es diurna y se emite advertencia cuando la semana tiene horas extra y horas nocturnas a la vez.

**R8 - Rechazo frente a advertencia.** Es *rechazo* (el programa no continúa) todo dato que no puede existir o que viola el formato: horas de un día mayores a 24, fechas inexistentes o fuera del periodo, falta en domingo o festivo, duplicados y números mal escritos. Toda causa de rechazo genera además una *advertencia* explicativa. Es solo *advertencia* (el cálculo continúa) lo que es posible pero sospechoso: jornada diaria mayor a 10 horas, patrón semanal que supera el límite semanal, más de 12 horas extra en una semana, semanas parciales y años sin festivos configurados.

**R9 - Redondeo.** Todo dinero se redondea al peso entero más cercano una sola vez, al calcular cada concepto de cada semana. Los totales son la suma de esos valores ya redondeados. Nunca se redondean valores intermedios.

**R10 - Fuera de alcance.** Faltas justificadas, faltas de medio día o por horas, incapacidades, vacaciones, licencias, prestaciones sociales, deducciones de seguridad social y auxilio de transporte.

---

# PARTE C - PARÁMETROS CONFIGURABLES
Ningún número de esta lista puede estar escrito dentro de la lógica: todos viven en el módulo de configuración de la funcionalidad salarial.

| Parámetro | Valor vigente | Naturaleza |
|---|---|---|
| Largo máximo del periodo | 30 días | fijo |
| Horas máximas por día | 24 | rechazo |
| Horas diarias que disparan advertencia | 10 | advertencia |
| Horas extra semanales que disparan advertencia | 12 | advertencia |
| Límite semanal de horas | 48 hasta el 14-jul-2023; 47 desde el 15-jul-2023; 46 desde el 15-jul-2024; 44 desde el 15-jul-2025; 42 desde el 15-jul-2026 | por vigencia; en la semana de transición rige el valor vigente en el lunes de esa semana |
| Recargo hora extra diurna | 25% | fijo |
| Recargo nocturno | 35% | fijo |
| Recargo dominical/festivo | 75% hasta el 30-jun-2025; 80% desde el 1-jul-2025; 90% desde el 1-jul-2026; 100% desde el 1-jul-2027 | por vigencia, según la fecha trabajada |
| Festivos | lista de fechas por año | configurable |

Los festivos se cargan por año completo. Si el año del periodo no tiene lista, se emite una advertencia y se calcula sin festivos. Los porcentajes y el límite semanal siguen la Ley 2101 de 2021 y la Ley 2466 de 2025 y deben revisarse cuando cambie la norma.