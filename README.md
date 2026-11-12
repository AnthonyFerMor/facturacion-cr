# facturacion-cr

[Leer en español](README.es.md)

A web app for electronic invoicing in Costa Rica, made for freelancers who bill clients abroad. It issues the export invoice (document type 09, version 4.4) in US dollars, sends it to the tax authority (Ministerio de Hacienda), follows it until it is accepted or rejected, and keeps the signed XML, the PDF and the response.

Status: in development. You can sign in with an email link and save the issuer profile, foreign customers and services; it does not issue invoices yet. The plan and the design decisions are in `docs/`, in Spanish, and the work is tracked in the [milestones](https://github.com/AnthonyFerMor/facturacion-cr/milestones).

## Why it exists

It is a complete, open implementation of the life cycle of an invoice on top of the open source [hacienda-cr](https://github.com/DojoCodingLabs/hacienda-cr) SDK: build, sign, send, track, deliver and archive. Hacienda already has a free invoicing tool, Tico Factura, and this project does not try to replace it.

## Run it locally

You need Node 24, npm and Docker.

```bash
npm install
npm run setup
npm run dev
```

`npm run setup` starts a local Supabase with Docker, applies the migrations and writes `.env.local`. The app opens at http://localhost:3000. To sign in, type an email address and open the link that arrives in the local mailbox at http://localhost:54724. The database comes with a sample person, `mariana@ejemplo.test`, with an issuer profile, two customers and two services; any other address signs in without one. The link points to port 3000, so the app has to run there.

Before opening a pull request, run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db` and `npm run build`.

## Documents (in Spanish)

- [Product](docs/producto.md): the problem, the user, the scope of the first version and the risks.
- [Architecture](docs/arquitectura.md): components, the flow of an invoice, data, errors and tests.
- [Threat model](docs/seguridad.md): what is protected, from whom, and what risk remains.
- [Plan](docs/plan.md): stages, tasks and how the work is done.
- [Decisions](docs/decisiones/): one per file, with the context and the rejected alternatives.
- [Design](docs/diseno.md): the visual direction.
- [References](docs/referencias.md): regulations and APIs, with their dates.

## Stack

Next.js and TypeScript on Vercel, Supabase (Postgres, Auth, Storage and pg_cron), and the hacienda-cr SDK to build, validate, sign and send the documents.

## Glossary

| Spanish | English |
| --- | --- |
| Emisor | Issuer: the person who issues the invoice |
| Receptor | Recipient: the client |
| Comprobante | Electronic document: an invoice or a credit note |
| Clave | The 50-digit key that identifies a document |
| Consecutivo | The sequential number of a document |
| CAByS | Hacienda's catalog of goods and services |

## License

[MIT](LICENSE)
