# 0010. Repo público desde el primer PR, con licencia MIT

Fecha: 2026-11-10. Estado: aceptada.

## Contexto

Con el plan gratuito de GitHub, un repo privado no tiene reglas de rama: la API responde «Upgrade to GitHub Pro or make this repository public». Tampoco tiene el bloqueo de secretos al hacer push, y los minutos de Actions son limitados. En un repo público las tres cosas son gratis.

Para que otra persona pueda leer el código, correrlo y reutilizarlo, el repo tiene que ser público y tener una licencia. El SDK sobre el que se apoya también es abierto, con licencia MIT.

## Decisión

El repo pasa a público cuando estén los documentos y antes del primer PR de código. La rama `main` tiene una regla: los cambios entran solo por PR, con la integración continua en verde, y se mergean con squash.

La licencia es MIT.

El repo no se fija en el perfil ni se enlaza desde el currículum hasta que la demo pública funcione.

## Alternativas descartadas

- Privado hasta tener la demo: deja el repo sin reglas de rama y sin bloqueo de secretos justo mientras se arma el proyecto. El historial se vería completo igual al abrirlo.
- Sin licencia, con todos los derechos reservados: nadie podría reutilizar el código, y eso contradice presentarlo como una implementación abierta.
- AGPL-3.0: obliga a publicar los cambios a quien lo ofrezca como servicio. Tendría sentido si el plan fuera venderlo.

## Consecuencias

Todo lo que entra al repo queda público, también en el historial. Los datos de prueba son inventados y no entra ningún secreto ni ninguna llave. Antes de abrirlo se revisa el contenido completo. Con MIT cualquiera puede usar el código, también dentro de un producto pago.
