<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo/advisoryo-dark.svg">
    <img src="assets/logo/advisoryo.svg" alt="advisoryo" width="320">
  </picture>
</p>

# advisoryo

**Name:** Bryan Wiest
**Repository:** https://github.com/bryanwiest/advisoryo

## Projektidee

advisoryo ist eine Web-Plattform, auf der Hersteller ihre Security Advisories im Format CSAF 2.0 hochladen, die gegen das offizielle Schema validiert und anschließend öffentlich durchsuchbar gemacht werden. Sie richtet sich an Hersteller von Produkten mit digitalen Elementen, die nach dem EU Cyber Resilience Act Schwachstellen veröffentlichen müssen, aber kein eigenes CSAF-Portal betreiben. Betreiber und Security-Teams können ohne Konto nach CVE, Produkt, Hersteller, Schweregrad und Status suchen und sehen so, ob ihre Produkte betroffen sind.

## Kriterien-Zuordnung M1

| Kriterium | Datei | Zeile / Hinweis |
|---|---|---|
| Semantische HTML-Struktur | index.html | Z. 16–199 (`header`, `nav`, `main`, `section`, `article`, `footer`) |
| | advisory.html | Z. 36–172 (`article` mit `header`, `section`, `aside`, Breadcrumb-`nav`, `table` mit `caption` und `th scope`) |
| Formular mit Labels | upload.html | Z. 44–88 (Upload-Formular: `label for`/`name`, Datei-Upload, `fieldset`/`legend`, Pflichtfelder) |
| | register.html | Z. 44–103 (Registrierung mit `fieldset`, `type="email"`, `type="url"`, `minlength`) |
| | login.html | Z. 41–58 (Anmeldung mit `autocomplete`) |
| | advisories.html | Z. 46–87 (Filter mit Checkboxen, Select und Datum, `method="get"`) |
| | index.html | Z. 44–60 (Suchformular) |
| Responsives Layout (Flexbox/Grid) | css/layout.css | Flexbox: Z. 10 (Header), Z. 72 (Footer); Grid: Z. 112 (Sidebar-Layout), Z. 126 (Detail-Layout) |
| | css/components.css | Flexbox: Z. 27 (Suchformular), Z. 267 (Formulare), Z. 341 (Ergebnis-Kopf); Grid: Z. 65 (Advisory-Karten), Z. 166 (Schritte), Z. 660 (zweispaltige Formularzeilen) |
| Media Query | css/components.css | Z. 222, 234, 245, 255 (Karten, Schritte, Hero), Z. 665 (Formularzeilen) |
| | css/layout.css | Z. 118, 132 (Sidebar- und Detail-Layout ab 56rem) |
| | css/base.css | Z. 30 (`prefers-color-scheme: dark`) |
| URL-Struktur | index.html, advisories.html, advisory.html, organization.html, upload.html, login.html, register.html | Pfade: /, /advisories, /advisories/:id, /organizations/:slug, /upload, /login, /register |

## Background: CSAF

The [Common Security Advisory Framework (CSAF) 2.0](https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html) is an OASIS standard for machine-readable security advisories in JSON and is recommended by the German Federal Office for Information Security (BSI). A document has a profile (e.g. `csaf_security_advisory`, `csaf_vex`, `csaf_informational_advisory`), a product tree (`product_tree`) and a list of vulnerabilities (`vulnerabilities`) with product statuses such as `known_affected`, `fixed` or `known_not_affected`. Revisions are versioned via `document.tracking`.

advisoryo stores the **original document unchanged** and additionally a **normalized data model** that is used for search and display.

## Related tools: Secvisogram and BSI CSAF tooling

[Secvisogram](https://github.com/secvisogram/secvisogram) is an open-source, browser-based editor for CSAF 2.0 documents developed on behalf of the BSI. It lets authors create, edit and validate advisories through a form or JSON editor and export them as CSAF JSON. A hosted instance is available at [secvisogram.github.io](https://secvisogram.github.io/).

Secvisogram and advisoryo complement each other:

| | Secvisogram | advisoryo |
|---|---|---|
| Purpose | **Authoring** a single CSAF document | **Publishing and finding** many CSAF documents |
| Users | The author of an advisory | Manufacturers (organizations with publishers) and the public |
| Storage | Local, in the browser (or via an optional backend) | Central database with organizations, roles and revisions |
| Search across advisories | No | Yes (CVE, product, manufacturer, severity, status) |

The intended workflow is: a publisher writes the advisory in Secvisogram, exports the JSON and uploads it to advisoryo, which validates and publishes it. For validation beyond the JSON schema, advisoryo can reuse [`@secvisogram/csaf-validator-lib`](https://github.com/secvisogram/csaf-validator-lib), the JavaScript library behind Secvisogram's checks, which implements the mandatory tests from section 6.1 of the CSAF specification. Using the same checks as Secvisogram means a document that is valid there is also accepted by advisoryo.

The BSI also maintains [CSAF tools in Go](https://github.com/gocsaf/csaf) (e.g. `csaf_provider`, `csaf_checker`, `csaf_downloader`) for running a CSAF provider on your own server. advisoryo targets manufacturers who do not want to operate such infrastructure themselves.

## Roles

Manufacturers are represented on the platform as **organizations**. They can be software vendors, but also manufacturers of hardware, IoT devices or machinery.

| Role | Scope | Permissions |
|---|---|---|
| Guest (not signed in) | public | Search, view and download advisories as JSON |
| Publisher | own organization | Upload advisories, add new revisions, withdraw own advisories |
| Organization manager | own organization | Same as publisher; additionally invite, suspend and remove publishers of their organization and maintain the organization profile |
| Platform admin | entire platform | Approve and suspend organizations, assign organization managers, block advisories in case of abuse |

Permissions are checked in the backend: `401` without a session, `403` without the required role or for another organization.

## Features

**Core (committed)**

- **Upload** of a CSAF document via a form, with a size limit
- **Validation** against the official CSAF 2.0 JSON schema with a readable list of errors
- **Public overview and search** by CVE ID, product, manufacturer, severity (CVSS) and status
- **Detail view** with affected products, vulnerabilities, remediations and download of the original document
- **Organization management**: organization managers invite and manage publishers

**Extensions (depending on scope)**

- Versioning via `document.tracking` with revision history and a diff view
- Additional CSAF checks beyond the schema (mandatory tests from section 6.1 of the specification, via `csaf-validator-lib`)
- "Open in Secvisogram" for viewing or editing a published advisory in the BSI editor
- Watchlist: subscribe to products and see new advisories that affect them
- Public directories according to the CSAF specification (`provider-metadata.json`, ROLIE feed) so that other CSAF tools can fetch the advisories automatically

## Technology stack (planned)

| Layer | Technology | Rationale |
|---|---|---|
| Frontend and backend | Next.js (App Router) with TypeScript | One project for UI and API; public advisory pages can be rendered on the server, which makes them fast and indexable |
| API | Next.js route handlers under `/api/...` | Own REST endpoints with resource URLs, proper methods and status codes |
| Validation | [Ajv](https://ajv.js.org/) with the official CSAF 2.0 schema, `csaf-validator-lib` for spec tests, Zod for API input | The standard's schema and the BSI tooling can be used directly |
| Database | PostgreSQL via Prisma, locally via Docker Compose | Relational model for organizations, roles and advisories; JSONB for the original document; built-in full-text search. SQLite (weaker for JSON and search) and MongoDB (awkward for roles and relations) were ruled out |
| Auth | Session cookie (httpOnly, SameSite) with hashed passwords (argon2) | Easier to protect against XSS and CSRF than a JWT in localStorage |

The decisions and the alternatives considered are discussed in the written report, e.g. Next.js versus a Vite SPA with a separate Express backend, and PostgreSQL versus SQLite or MongoDB.

## Data model (draft)

```
User ──< Membership (role: PUBLISHER | ORG_MANAGER) >── Organization ──< Advisory ──< Revision
                                                                           │
                                                                           ├──< Vulnerability (CVE, CVSS, status)
                                                                           └──< Product (name, version, CPE/PURL)
```

`User` additionally has a flag for platform admins. `Revision` holds the original document (JSONB), the `tracking.id`, the version number and the upload timestamp.

## URL structure

| Path | Content |
|---|---|
| `/` | Home page with search and latest advisories |
| `/advisories` | List with filters |
| `/advisories/:id` | Advisory detail view |
| `/organizations/:slug` | Public manufacturer profile with its advisories |
| `/upload` | Upload form (publisher) |
| `/org` | Management of the own organization (organization manager) |
| `/login`, `/register` | Sign-in and registration |
| `/admin` | Platform administration (platform admin) |

REST API (from M3, draft):

| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/api/advisories?q=&cve=&severity=&org=` | Search and filter | everyone |
| GET | `/api/advisories/:id` | Details including revisions | everyone |
| GET | `/api/advisories/:id/raw` | Original document (latest revision) | everyone |
| POST | `/api/advisories` | Upload a new advisory | publisher, organization manager |
| POST | `/api/advisories/:id/revisions` | Add a new revision | publisher, organization manager (own org) |
| DELETE | `/api/advisories/:id` | Withdraw or block | publisher (own org), platform admin |
| GET | `/api/organizations/:slug/members` | List members | organization manager (own org) |
| POST | `/api/organizations/:slug/members` | Invite a publisher | organization manager (own org) |
| DELETE | `/api/organizations/:slug/members/:userId` | Remove a publisher | organization manager (own org) |
| PATCH | `/api/organizations/:slug` | Approve or suspend an organization | platform admin |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Authentication | – |

## Project structure

```
advisoryo/
├── index.html          /                      home with search and latest advisories
├── advisories.html     /advisories            list with filters
├── advisory.html       /advisories/:id        detail view (filled with one example advisory)
├── organization.html   /organizations/:slug   public manufacturer profile
├── upload.html         /upload                upload form (publisher)
├── login.html          /login                 sign-in
├── register.html       /register              organization registration
├── css/
│   ├── base.css        design tokens, reset, typography, buttons
│   ├── layout.css      header, footer, page head, grid layouts
│   └── components.css  forms, cards, tables, page components
├── assets/
│   ├── logo/           logo variants (light and dark)
│   └── csaf/           example CSAF 2.0 document (download on the detail page)
├── .well-known/
│   └── security.txt    security contact (RFC 9116)
├── README.md
└── LICENSE
```

The static prototype has no templating, so `advisory.html` and `organization.html` each show one example. From M2 on they become routes that render any advisory or organization from data.

## Milestones

| Milestone | Content | Due | Git tag |
|---|---|---|---|
| M1 | Static HTML/CSS prototype: home, list, detail, upload, login | 2026-10-21 | `Meilenstein 1` |
| M2 | React/TypeScript app with routing; advisories from local CSAF sample files | 2026-11-18 | `Meilenstein 2` |
| M3 | API, PostgreSQL with Prisma, auth with roles, schema validation, security check | 2027-01-13 | `Meilenstein 3` |
| M4 | Tests (authorization, validation, parser), deployment via Docker Compose, demo video, written report | after the lecture period | `Meilenstein 4` |

## Security (initial considerations)

Uploaded documents are untrusted third-party input. Planned measures:

- Strict size limit and pure JSON processing, no execution of content
- Fields from advisories are rendered as text only (React escaping, no `dangerouslySetInnerHTML`), links only with `https:`
- Prisma with parameterized queries against injection
- Session cookies with `httpOnly`, `Secure`, `SameSite=Lax`; `Origin` header check on state-changing requests against CSRF
- Every permission check in the backend, including organization membership
- Secrets only in `.env` (never committed), template in `.env.example`

## Local setup

*Follows with M2/M3.* Goal: `docker compose up` starts the database and the app, `npm install && npm run dev` starts the development environment, all in under ten minutes.

## Open points

1. Confirm whether Next.js is accepted for M2 instead of the required combination of Vite and React Router.
2. Decide on the scope of the extensions after M2.

## License

See [LICENSE](LICENSE).
