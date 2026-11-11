# Diseño

## Dirección

- Producto. Una persona que trabaja por su cuenta en Costa Rica emite su factura de exportación en dólares, la ve aceptada por Hacienda y la deja archivada.
- Carácter. Exacta, serena, documental.
- Mundo. El comprobante en papel: la hoja, la tinta azul de la firma y el sello de recibido.
- Momentos. El comprobante dibujado como una hoja con su sello, en el detalle y en la vista previa al emitir. En el resumen del mes, el total en colones y las barras de los últimos doce meses.
- Firma. La clave de 50 dígitos partida en sus seis partes (país, fecha, emisor, consecutivo, situación y código de seguridad), cada vez que se identifica un comprobante.

## Reglas

- Las superficies usan una sola escala de grises neutros. El color está en el acento y en los estados.
- Un solo acento, el azul de tinta, para la acción principal, la selección y el mes en curso.
- El estado de un comprobante se muestra con un punto de color y su texto, y en el detalle con el sello. Nunca solo con color.
- Tipografía IBM Plex Sans en pesos 400 y 500. IBM Plex Mono solo para la clave, los números de comprobante y las horas de la bitácora.
- Las cifras usan un solo formato, el de `es-CR`, con dos decimales y números tabulares.
- Iconos de lucide, de 18 px y trazo de 1,5.
- Espacios en múltiplos de 4 px.
- La versión 1 solo tiene tema claro.
- El modo simulado se dice siempre en la barra superior, con texto.
- El borde de un campo tiene contraste de 3:1 con su fondo, porque es lo único que lo delimita.

Los valores están una sola vez en `src/app/globals.css`, y los componentes compartidos en `src/componentes/` ([decisión 0012](decisiones/0012-estilos-con-css-modules.md)).
