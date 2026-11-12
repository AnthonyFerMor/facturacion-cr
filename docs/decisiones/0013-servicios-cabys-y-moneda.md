# 0013. Servicios con CAByS de servicios, en dólares o colones

Fecha: 2026-11-12. Estado: aceptada.

## Contexto

Cada línea de una factura lleva un código CAByS, una unidad de medida de la nota 15 del Anexo 4.4 y un precio, y la factura entera va en una moneda. Las líneas van a salir de los servicios guardados, así que lo que acepta un servicio es lo que después llega a Hacienda.

Lo que el Anexo y el producto dicen sobre eso:

- Con un código CAByS de bienes (primer dígito de 0 a 4), la factura de exportación tiene que llevar la partida arancelaria. Los códigos de servicios empiezan con 5 a 9.
- La nota 15 mezcla unidades de mercancías, como kilos y litros, con unidades de servicios.
- La primera versión emite la factura de exportación en dólares ([producto](../producto.md)). Con una moneda que no sea el colón, el Anexo pide el tipo de cambio.

## Decisión

- Un servicio lleva solo códigos CAByS de servicios: 13 dígitos que empiezan con 5, 6, 7, 8 o 9. La búsqueda en el catálogo descarta los de bienes.
- La unidad de medida es una de las de servicio de la nota 15: servicios profesionales (Sp), servicios técnicos (St), servicios personales (Spe), otro tipo de servicio (Os), hora (h) y día (D).
- El precio va en dólares o en colones. Los servicios en dólares son los de la factura de exportación; los de colones quedan para la factura local de la última etapa.
- El precio sigue la [decisión 0003](0003-montos-con-aritmetica-decimal.md): `numeric(18,5)`, mayor que cero y menor que diez mil millones.

Las reglas están en `src/dominio/` y se repiten como restricciones de la tabla `servicios`.

## Alternativas descartadas

- Aceptar también códigos de bienes y pedir la partida arancelaria: suma un campo y su validación para algo que esta app no factura.
- Ofrecer todas las unidades de la nota 15: la mayoría son de mercancías, y entre tantas es más fácil elegir mal.
- Aceptar cualquier moneda del Anexo: con otra que no sea el dólar, la factura pediría un tipo de cambio que la app no consulta.

## Consecuencias

Facturar un bien, o en otra moneda, pide una decisión nueva: la partida arancelaria en el primer caso, y el tipo de cambio de esa moneda en el segundo. La pantalla de nueva factura tiene que ofrecer solo los servicios en la moneda de la factura.
