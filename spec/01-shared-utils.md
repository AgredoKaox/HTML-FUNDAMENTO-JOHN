# 01 - Especificación: Utilidades Compartidas (Calculadora y Validador)

## Responsabilidad y Ubicación
Este documento detalla dos módulos independientes que deben ubicarse dentro de un subdirectorio de utilidades, dentro de la carpeta de recursos compartidos. Ninguno conoce reglas salariales, ninguno imprime en consola y ninguno importa otro módulo del proyecto.

## Requerimientos del Módulo Validador
Se requiere crear un módulo encargado exclusivamente de evaluar datos. Cada acción responde únicamente verdadero o falso; no transforma datos ni lanza errores. Debe exponer:

1. Verificar si un valor es numérico y finito (rechaza texto vacío, no numérico, infinito y nulo).
2. Verificar si un número es no negativo (mayor o igual a cero).
3. Verificar si un número es positivo estricto (mayor que cero).
4. Verificar si un número es entero.
5. Verificar si un número está dentro de un rango, con límites inclusivos.
6. Verificar si un texto tiene formato decimal simple: solo dígitos, con punto decimal opcional y un máximo de decimales indicado por quien invoca. Rechaza comas, espacios, signos, notación científica y separadores de miles.
7. Verificar si un texto no está vacío después de quitarle los espacios.

Aclaración que corrige una contradicción anterior: "no negativo" y "positivo estricto" son acciones distintas. Cada campo declara cuál necesita; ningún documento debe llamar "positivo" a una validación que acepta el cero.

## Requerimientos del Módulo Calculadora
Se requiere crear un módulo matemático aislado. Debe exponer acciones individuales para:

1. Suma, resta, multiplicación y división de dos números. La división con divisor cero lanza un error descriptivo.
2. Suma de una lista de números (lista vacía da cero).
3. Promedio de una lista de números. Una lista vacía lanza un error descriptivo.
4. Máximo y mínimo entre dos números.
5. Redondeo al entero más cercano (la mitad se redondea alejándose de cero), con el que se aplica la regla de redondeo del documento 00.

Regla de oro: Ningún servicio de negocio tiene permitido realizar cálculos matemáticos por su cuenta; todos están obligados a invocar las acciones de este módulo de calculadora cuando necesiten operar con números. Para multiplicar por un porcentaje se multiplica por la tasa expresada en decimal (0.25 para 25%), y para "uno más el recargo" se usa la acción de suma.