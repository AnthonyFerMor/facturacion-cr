# 0011. README en inglés y en español; el dominio, en español

Fecha: 2026-11-10. Estado: aceptada.

## Contexto

El dominio es la norma tributaria de Costa Rica, que está en español: emisor, receptor, clave, consecutivo, CAByS. Los nombres del XML de Hacienda también están en español. Quien revisa el repo para un trabajo remoto puede no leer español.

## Decisión

- `README.md` en inglés, corto, y `README.es.md` con lo mismo en español. Cada uno enlaza al otro en la primera línea.
- Documentos, decisiones, issues, PRs y commits en español.
- En el código, los nombres del dominio van en español, como en el Anexo, y lo genérico de infraestructura usa el nombre estándar de cada librería.
- La interfaz está en español.

## Alternativas descartadas

- Todo en inglés: traducir los términos del Anexo crea un segundo vocabulario que hay que comparar a cada rato con la norma y con el XML. `issuer` no aparece en ningún documento de Hacienda; `Emisor`, en todos.
- Todo en español: una persona que no lee español no pasa del README.

## Consecuencias

El README en inglés lleva un glosario corto con los términos del dominio. El código mezcla dos idiomas a propósito.
