# 0003. Montos con aritmética decimal propia

Fecha: 2026-11-06. Revisada: 2026-11-10. Estado: aceptada.

## Contexto

El Anexo 4.4 pide montos con hasta 5 decimales, y Hacienda rechaza el comprobante si los cálculos no cuadran. El cálculo legacy del SDK usa números de JavaScript y redondea con `toFixed`, que no aplica HALF_UP (el arreglo está en el PR #124 del SDK, en borrador desde el 29 de octubre de 2026). La API exact del SDK usa decimales, pero no cubre la factura de exportación. El armador de la factura de exportación no calcula nada: recibe los montos como números de JavaScript y los escribe tal cual en el XML.

## Decisión

Un módulo `src/dominio/montos` con enteros `BigInt` escalados a 5 decimales y redondeo HALF_UP, y encima el cálculo de líneas y del resumen según el Anexo. Los valores calculados se le pasan al SDK al armar el XML. En la base, los montos son `numeric(18,5)`.

## Alternativas descartadas

- El cálculo del SDK: tiene el error de redondeo descrito arriba.
- Una librería decimal como decimal.js: suma una dependencia para algo que cabe en un módulo chico y que hay que entender a fondo.

## Consecuencias

El módulo lleva pruebas de propiedades y casos sacados de los ejemplos del Anexo.

Un número de JavaScript guarda con exactitud 15 cifras, así que el paso al SDK es seguro solo hasta diez enteros y cinco decimales. El dominio rechaza montos de diez mil millones o más, muy por debajo del máximo del Anexo, y una prueba comprueba que el texto que el SDK escribe en el XML es el mismo monto que salió del módulo.

Si el arreglo de redondeo del SDK se mergea, se comparan los resultados de los dos.
