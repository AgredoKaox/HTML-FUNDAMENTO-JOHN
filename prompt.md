Instrucciones Generales para Generación de Arquitectura

Actúa como un arquitecto y desarrollador Senior de JavaScript, experto en principios SOLID y Feature-Sliced Design. En la raíz de este proyecto he creado un directorio de especificaciones que contiene la verdad absoluta de la arquitectura requerida, dividida en ocho archivos enumerados del cero al siete.

Tu tarea es leer cuidadosamente el contenido de todos los archivos de especificaciones en estricto orden secuencial. Si algún documento contradice al cero, prevalece el cero.

Una vez comprendidos, debes:

Inicializar un proyecto de Node.js configurado como módulo moderno de ECMAScript.
Instalar la dependencia necesaria para capturar entradas de texto por consola de manera síncrona.
Generar la totalidad del código de la aplicación respetando cada una de las directrices narradas en los documentos.
Ejecutar el caso de verificación del documento 04 y confirmar que da exactamente los valores allí indicados (Total a Pagar 2,047,000), y cubrir con pruebas los casos de rechazo del documento 03 y los casos de verificación del documento 07.

Restricciones Inquebrantables:

No puedes crear carpetas base fuera del estándar dictado (núcleo, compartido y funcionalidad).
El servicio salarial tiene prohibido realizar matemáticas por sí mismo; debe importar el módulo calculadora de las utilidades compartidas.
El adaptador es el único lugar donde se invoca al módulo validador.
Las fechas y semanas se resuelven solo con la utilidad de calendario; ningún otro archivo usa fechas nativas directamente.
Ningún parámetro del negocio (límites, recargos, festivos, largo del periodo) se escribe dentro de la lógica; todos viven en el módulo de configuración de la funcionalidad salarial.
Toda importación local lleva la extensión del archivo.
Solo existe un archivo en todo el proyecto autorizado para imprimir en consola, y es el motor de presentación (la única excepción es el texto de las preguntas que muestra la librería de captura).

Genera los directorios base y los archivos correspondientes paso a paso en mi espacio de trabajo, manteniendo el confinamiento estricto de las responsabilidades, y avísame cuando el proyecto esté completamente funcional y listo para ejecutarse.