# 02 - Especificación: Gestor de Entrada Central

## Responsabilidad y Ubicación
Este archivo debe ubicarse en el directorio del núcleo del proyecto.

## Requerimientos
Se requiere diseñar un módulo que actúe como envoltura y abstracción de la librería externa específica llamada "prompt-sync" para la captura de datos por consola de manera síncrona.

Dado que todo el proyecto opera bajo el sistema de módulos de ECMAScript (establecido en las reglas de negocio), la importación de esta librería externa debe adaptarse utilizando la sintaxis de importación por defecto moderna, y su inicialización debe realizarse inmediatamente después de ser importada.

El gestor debe exponer una acción genérica para realizar preguntas al usuario y capturar su respuesta en formato de texto. Este módulo es el único autorizado en toda la aplicación para importar y utilizar dicha librería de consola, centralizando así la obtención de información y evitando que los servicios de negocio se acoplen a dependencias externas.

Comportamiento obligatorio de la acción de preguntar:
1. Recibe el texto de la pregunta y lo entrega a la librería, que es quien lo muestra (excepción documentada en la tercera regla del documento 00). El gestor no escribe nada más en la consola.
2. Devuelve siempre un texto. Si la librería devuelve un valor nulo (por ejemplo, cuando el usuario cierra la entrada), el gestor devuelve un texto vacío.
3. Elimina los espacios al inicio y al final de la respuesta. No interpreta, no convierte ni valida: eso es trabajo del adaptador.
4. No reintenta, no tiene valores por defecto y no conoce el significado de las preguntas.