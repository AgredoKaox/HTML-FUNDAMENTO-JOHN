Actúa como un desarrollador Senior. Necesito que apliques una refactorización de ecosistema sobre el código que ya tenemos generado en este proyecto, sin alterar la lógica matemática ni la arquitectura actual.

Por favor, realiza exclusivamente las siguientes tres acciones:

Primera acción: Modifica el archivo de configuración del proyecto para declarar que todo el entorno operará nativamente como un módulo moderno de ECMAScript.

Segunda acción: Recorre todos los archivos del proyecto y migra el sistema de exportación e importación. Elimina cualquier rastro del sistema antiguo (CommonJS) y reemplázalo por las declaraciones de importación y exportación modernas. Asegúrate de incluir la extensión de archivo correspondiente en todas las importaciones locales para que el entorno moderno no falle.

Tercera acción: En el archivo del gestor central de entrada, ajusta la importación de la librería "prompt-sync" para que sea compatible con este nuevo entorno moderno de módulos y asegúrate de que se inicialice correctamente.

Muéstrame los archivos modificados o aplícalos directamente. No generes nuevas funcionalidades, solo migra el código existente a este nuevo estándar.