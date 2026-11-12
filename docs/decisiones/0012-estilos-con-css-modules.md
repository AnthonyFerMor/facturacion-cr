# 0012. Estilos con CSS Modules y propiedades personalizadas

Fecha: 2026-11-10. Estado: aceptada.

## Contexto

La base visual necesita un solo lugar para los colores, la tipografía y los espacios del [diseño](../diseno.md), y una forma de escribir los estilos de cada componente. La plantilla de Next.js propone Tailwind por defecto. CSS Modules viene incluido en Next.js y no hay que instalar nada.

## Decisión

- Los valores del diseño son propiedades personalizadas de CSS, definidas una sola vez en `src/app/globals.css`.
- Cada componente tiene al lado su archivo `.module.css`, que usa esas propiedades.
- La estructura de una página o de una sección se arma con CSS Grid. Flexbox queda para el interior de un componente.
- No hay estilos en línea.

## Alternativas descartadas

- Tailwind: suma una dependencia con su configuración y deja el estilo de cada elemento repartido en nombres de clases dentro del marcado. Con pocas pantallas y componentes propios, un archivo de estilos por componente se lee más directo.
- Una librería de componentes ya hecha: trae su propio aspecto, y habría que deshacerlo para llegar al diseño de este proyecto.

## Consecuencias

Los nombres de clase quedan aislados por componente. No hay clases de utilidad compartidas: lo que se repite se vuelve un componente. Cambiar un color es cambiar una línea de `globals.css`.
