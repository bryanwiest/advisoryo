<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="client/src/assets/logo/advisoryo-dark.svg">
    <img src="client/src/assets/logo/advisoryo.svg" alt="advisoryo" width="320">
  </picture>
</p>

# advisoryo

**Name:** Bryan Wiest
**Repository:** https://github.com/bryanwiest/advisoryo

## Projektidee

advisoryo ist eine Web-Plattform, auf der Hersteller ihre Security Advisories im Format CSAF 2.0 hochladen, die gegen das offizielle Schema validiert und anschließend öffentlich durchsuchbar gemacht werden. Sie richtet sich an Hersteller von Produkten mit digitalen Elementen, die nach dem EU Cyber Resilience Act Schwachstellen veröffentlichen müssen, aber kein eigenes CSAF-Portal betreiben. Betreiber und Security-Teams können ohne Konto nach CVE, Produkt, Hersteller, Schweregrad und Status suchen und sehen so, ob ihre Produkte betroffen sind.

## Starten

Voraussetzung: Node.js 20.19 oder neuer (getestet mit Node 22).

```bash
npm install
npm run dev
```

Die App läuft dann unter http://localhost:5173. Weitere Befehle: `npm run build` (Typprüfung mit `tsc` und Produktions-Build nach `client/dist`), `npm run preview` (Build lokal ausliefern) und `npm run lint` (oxlint).

Das Repository ist ein npm-Workspace: `npm install` im Root installiert die Abhängigkeiten von `client/`, und die Root-Skripte rufen die des Clients auf. In M3 kommt `server/` als zweiter Workspace dazu.

**Ausprobieren:** Unter `/upload` liegen zwei Beispieldateien zum Herunterladen, ein gültiges Advisory (`client/public/samples/thd-sa-2026-012.json`) und ein ungültiges mit vier Fehlern (`client/public/samples/invalid-thd-sa-2026-013.json`). Beide für „Thermo Devices AG“ hochladen. Das gültige erscheint danach in der Liste, auf der Startseite und auf der Herstellerseite. Hochgeladene Advisories liegen bis M3 nur im React-State und sind nach einem Reload weg.

## Kriterien-Zuordnung M2

Alle Pfade relativ zu `client/`.

| Kriterium | Datei | Zeile / Hinweis |
|---|---|---|
| Tooling: npm und Vite | package.json | Z. 7 (`vite` als Dev-Server), Z. 8 (`tsc -b && vite build`); Root-`package.json` (Workspace, `npm install && npm run dev`) |
| | vite.config.ts | Vite mit `@vitejs/plugin-react` |
| TypeScript aktiv genutzt | tsconfig.app.json | Z. 20 (`strict`) |
| | src/types/csaf.ts | Typen für das CSAF-2.0-Format (eingelesene, nicht vertrauenswürdige Daten, daher alles optional) |
| | src/types/advisory.ts | Z. 44 (normalisiertes `Advisory`), Union-Types `Severity` und `ProductStatus` |
| | src/lib/csaf.ts | Z. 11 (Discriminated Union `ValidationResult`), Z. 53 (`validateCsaf(input: unknown)`), Z. 171 (`toAdvisory`) |
| | src/lib/severity.ts | Z. 31, 35 (Type Guards `value is Severity`) |
| | src/lib/filter.ts | Z. 6 (`AdvisoryFilters`), Filtern und Sortieren als reine Funktionen |
| Komponenten | src/components/ | 15 Komponenten, z. B. `AdvisoryCard`, `AdvisoryTable`, `FilterPanel`, `SeverityBadge`, `StatusLabel`, `VulnerabilityPanel`, `ProductStatusTable`, `RevisionHistory`, `ValidationErrors` |
| | src/pages/ | Eine Komponente pro Route |
| Daten über Props | src/App.tsx | Z. 29–33 (`advisories` und `onPublish` an die Seiten) |
| | src/components/AdvisoryTable.tsx | Props-Interface Z. 8; wiederverwendet in src/pages/AdvisoriesPage.tsx Z. 63 und src/pages/OrganizationPage.tsx Z. 49 |
| | src/components/FilterPanel.tsx | Z. 5 (`filters`, `organizations`, `onChange`, `onReset`); Callback nach oben in src/pages/AdvisoriesPage.tsx Z. 38 |
| | src/components/AdvisoryCard.tsx, SeverityBadge.tsx, StatusLabel.tsx | Kleine Anzeige-Komponenten mit typisierten Props, mehrfach verwendet |
| useState | src/App.tsx | Z. 18 (alle Advisories), Z. 20 (`publish` ersetzt bzw. ergänzt) |
| | src/pages/UploadPage.tsx | Z. 21–28 (kontrolliertes Formular, Fehlerliste, Prüfstatus) |
| | src/pages/RegisterPage.tsx | Z. 33 (ein State-Objekt für das ganze Formular), Z. 36 (abgeleiteter Zustand `passwordsDiffer`) |
| | src/components/SearchForm.tsx | Z. 8–9 |
| useEffect | src/hooks/useDocumentTitle.ts | Z. 5 (Seitentitel je Route, eigener Hook) |
| | src/components/Layout.tsx | Z. 11 (bei Routenwechsel nach oben scrollen) |
| | src/components/ValidationErrors.tsx | Z. 12 (Fokus auf das Prüfergebnis setzen) |
| Durchgängige Nutzeraktion: Formular → Liste | src/pages/UploadPage.tsx | Z. 34 (Datei lesen, JSON parsen, `validateCsaf`, `checkUpload`), Z. 69 (`onPublish`), Z. 70 (Weiterleitung zur Detailseite) |
| | src/App.tsx | Z. 20 (State-Update), danach sichtbar in Liste, Startseite und Herstellerseite |
| | src/lib/upload.ts | Z. 22 (Plattformregeln: Herausgeber passt zur Organisation, keine doppelte ID, Revision muss neuer sein) |
| Durchgängige Nutzeraktion: Filter | src/pages/AdvisoriesPage.tsx | Z. 19 (`useSearchParams`), Z. 21 (Filtern), Z. 25 (URL aktualisieren) |
| | src/components/SearchForm.tsx | Z. 16 (Suche auf der Startseite führt zur gefilterten Liste) |
| Routing mit React Router | src/App.tsx | Z. 27–36: 7 Routen plus 404 (`path="*"`), gemeinsames Layout als Elternroute |
| | src/components/Layout.tsx | Z. 19 (`<Outlet />`) |
| | src/components/SiteHeader.tsx | Z. 18–20 (`NavLink` setzt `aria-current`) |
| | src/pages/AdvisoryPage.tsx | Z. 28 (`useParams`), Z. 37 (Navigations-State nach dem Upload) |

### Entscheidungen in M2

- **Single-Page-App mit Vite statt SSR-Framework (Next.js):** advisoryo bekommt in M3 ein eigenes Express-Backend mit REST-API. Eine SPA trennt Client und API sauber; SEO für einzelne Advisories wäre ein Argument für SSR, ist für das Projekt aber nachrangig.
- **Echte CSAF-Dokumente als Beispieldaten:** Die Beispiele in `src/data/csaf/` sind CSAF-2.0-JSON und laufen beim Start durch dieselbe Validierung und Normalisierung wie ein Upload (`src/data/advisories.ts`). So gibt es nur einen Weg vom Dokument zur Anzeige, und das Originaldokument bleibt zum Download erhalten.
- **Filter in der URL statt im State:** Die Filter stehen als Query-Parameter in der URL (`/advisories?severity=critical&status=fixed`). Damit lassen sich gefilterte Listen als Link teilen, der Zurück-Button funktioniert, und die Suche auf der Startseite verlinkt einfach dorthin.
- **State in `App` statt Context oder Store:** Es gibt genau einen geteilten Zustand (die Advisories), der über Props an die Seiten geht. Context oder eine Bibliothek wie Redux wären dafür zu viel; in M3 ersetzt ein Fetch gegen das Backend diesen State.
- **M1-CSS übernommen:** Das Design aus M1 liegt unverändert in `src/styles/`, Ergänzungen für Zustände, die es erst mit Interaktion gibt (Hinweise, Fehler, leere Liste), in `src/styles/app.css`.
- **Grenzen:** Die Validierung prüft nur einen Teil des CSAF-Schemas; die vollständige Prüfung gegen das JSON-Schema und die Pflichttests folgt im Backend. Anmeldung und Registrierung sind bis M3 nur Formulare ohne Funktion.

## Kriterien-Zuordnung M1

Der statische HTML/CSS-Prototyp liegt im Repository-Root des Tags [`Meilenstein-1`](https://github.com/bryanwiest/advisoryo/tree/Meilenstein-1); die Datei- und Zeilenangaben unten beziehen sich auf diesen Stand. Seit M2 lebt das Design in `client/src/styles/`.

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

## Project structure

```
advisoryo/
├── package.json             npm workspace root (scripts: dev, build, preview, lint)
├── client/                  React app (Vite, TypeScript)
│   ├── index.html
│   ├── public/
│   │   ├── samples/         CSAF files to try the upload (one valid, one invalid)
│   │   └── .well-known/     security.txt (RFC 9116)
│   └── src/
│       ├── main.tsx         entry point
│       ├── App.tsx          routes and shared state
│       ├── pages/           one component per route
│       ├── components/      reusable components (cards, tables, filters, badges)
│       ├── hooks/           custom hooks
│       ├── lib/             CSAF validation and normalization, filters, upload rules
│       ├── types/           CSAF format and normalized data model
│       ├── data/            sample organizations and CSAF documents
│       ├── styles/          CSS from M1 plus app.css for M2
│       └── assets/          logos and hero illustration
├── README.md
└── LICENSE
```

## URL structure

| Path | Content |
|---|---|
| `/` | Home page with search and latest advisories |
| `/advisories` | List with filters as query parameters (`q`, `severity`, `status`, `org`, `from`, `sort`) |
| `/advisories/:id` | Advisory detail view, `:id` is the CSAF tracking ID in lower case |
| `/organizations/:slug` | Public manufacturer profile with its advisories |
| `/upload` | Upload form (publisher) |
| `/login`, `/register` | Sign-in and registration |
| `/org` | Management of the own organization (organization manager, planned for M3) |
| `/admin` | Platform administration (platform admin, planned for M3) |

## License

See [LICENSE](LICENSE).
