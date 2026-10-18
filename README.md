# advisoryo

> Plattform zum Hochladen, Prüfen und Durchsuchen von Security Advisories im Format **CSAF 2.0** und **CycloneDX (VEX)**.

<!-- Name und Matrikelnummer nur eintragen, wenn das Repository privat ist. Sonst nur in die Moodle-Abgabe. -->
**Name:** Bryan … (Matrikelnummer: …)
**Repository:** https://github.com/bryanwiest/advisoryo
**Kurs:** Web-Applikationen, WS 2026/27, HTWG Konstanz

## Projektidee

advisoryo ist eine Web-Plattform, auf der Hersteller und Maintainer ihre Security Advisories als CSAF-2.0- oder CycloneDX-VEX-JSON hochladen. Die Plattform validiert jede Datei gegen das offizielle Schema, extrahiert die wichtigsten Angaben (betroffene Produkte, CVEs, Schweregrad, Status) und macht sie für Nutzerinnen und Nutzer durchsuch- und filterbar. Zielgruppe sind kleinere Softwareanbieter ohne eigenes CSAF-Portal sowie Admins und Security-Teams, die wissen wollen, ob ihre eingesetzten Produkte betroffen sind.

## Hintergrund: CSAF und CycloneDX

| Format | Herausgeber | Zweck | Relevanz für advisoryo |
|---|---|---|---|
| [CSAF 2.0](https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html) | OASIS | Maschinenlesbare Security Advisories (Profile u. a. `csaf_security_advisory`, `csaf_vex`) | Hauptformat; wird vom BSI empfohlen |
| [CycloneDX 1.5/1.6](https://cyclonedx.org/specification/overview/) | OWASP | SBOM-Standard, mit `vulnerabilities`-Abschnitt auch als VEX nutzbar | Zweitformat für VEX-Aussagen zu Komponenten |

Beide Formate sind JSON, aber unterschiedlich strukturiert. advisoryo speichert deshalb das **Originaldokument unverändert** und zusätzlich ein **normalisiertes Datenmodell**, über das gesucht und angezeigt wird.

## Rollen

| Rolle | Rechte |
|---|---|
| Gast (nicht angemeldet) | Veröffentlichte Advisories suchen, ansehen und als JSON herunterladen |
| Publisher | Zusätzlich: Advisories für die eigene Organisation hochladen, neue Revisionen einspielen, eigene Advisories zurückziehen |
| Admin | Zusätzlich: Organisationen und Nutzer verwalten, Publisher freischalten, beliebige Advisories sperren |

Die Rechte werden im Backend geprüft (401 ohne Anmeldung, 403 ohne passende Rolle oder Organisation).

## Geplante Funktionen

- **Upload** einer JSON-Datei per Formular (Drag-and-drop), Größenlimit, Formaterkennung CSAF vs. CycloneDX
- **Validierung** gegen das offizielle JSON-Schema (CSAF 2.0 bzw. CycloneDX 1.5/1.6) mit verständlicher Fehlerliste
- **Versionierung** über `document.tracking` (CSAF) bzw. `version`/`serialNumber` (CycloneDX): neue Revisionen ersetzen alte nicht, sondern werden als Historie geführt
- **Übersicht und Suche** nach CVE-ID, Produktname, Hersteller, Schweregrad (CVSS) und Status (`known_affected`, `fixed`, `not_affected`, …)
- **Detailansicht** mit betroffenen Produkten, Schwachstellen, Remediation und Link zum Originaldokument
- **Download** des Originaldokuments, unverändert
- *Optional:* Watchlist für Produkte, Export eines `provider-metadata.json`-Feeds nach CSAF-Spezifikation

## Technologie-Stack (geplant)

| Schicht | Technologie | Begründung |
|---|---|---|
| Frontend | React + TypeScript + Vite, React Router | Vorgabe M2; SPA passt, weil Upload und Verwaltung hinter einem Login liegen |
| Backend | Node.js + Express (TypeScript) | Vorgabe M3; eigene REST-API, gleiche Sprache wie im Frontend |
| Validierung | [Ajv](https://ajv.js.org/) mit den offiziellen JSON-Schemas, zusätzlich Zod für API-Eingaben | Schemas der Standards lassen sich direkt verwenden |
| Datenbank | SQLite (Entwicklung) bzw. PostgreSQL, Zugriff über Prisma | Relationales Modell (Organisation → Advisory → Revision → Schwachstelle/Produkt), Migrationen inklusive |
| Auth | Session-Cookie (httpOnly, SameSite) mit gehashten Passwörtern (bcrypt/argon2) | Einfacher CSRF- und XSS-Schutz als bei JWT im LocalStorage |

Die Entscheidungen werden in der Ausarbeitung mit Alternativen begründet (z. B. SSR vs. SPA, JSON-Spalte vs. vollständig normalisiertes Schema).

## Datenmodell (Entwurf)

```
User ──< Membership >── Organization ──< Advisory ──< Revision
                                                    │
                                                    ├──< Vulnerability (CVE, CVSS, Status)
                                                    └──< Product (Name, Version, CPE/PURL)
```

`Revision` enthält das Originaldokument (JSON), Format, Spezifikationsversion und Upload-Zeitpunkt.

## URL-Struktur

| Pfad | Inhalt |
|---|---|
| `/` | Startseite mit Suche und neuesten Advisories |
| `/advisories` | Liste mit Filtern |
| `/advisories/:id` | Detailansicht eines Advisories |
| `/upload` | Upload-Formular (Publisher) |
| `/login`, `/register` | Anmeldung und Registrierung |
| `/admin` | Verwaltung (Admin) |

REST-API (ab M3, Entwurf):

| Methode | Pfad | Beschreibung | Rolle |
|---|---|---|---|
| GET | `/api/advisories?q=&cve=&severity=` | Suchen und filtern | alle |
| GET | `/api/advisories/:id` | Details inkl. Revisionen | alle |
| GET | `/api/advisories/:id/revisions/:rev/raw` | Originaldokument | alle |
| POST | `/api/advisories` | Neues Advisory hochladen | Publisher |
| POST | `/api/advisories/:id/revisions` | Neue Revision | Publisher (eigene Org) |
| DELETE | `/api/advisories/:id` | Zurückziehen/sperren | Publisher (eigene Org), Admin |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout` | Authentifizierung | – |

## Kriterien-Zuordnung M1

*Wird mit dem HTML/CSS-Prototyp ausgefüllt.*

| Kriterium | Datei | Zeile / Hinweis |
|---|---|---|
| Semantische HTML-Struktur | `index.html` | Z. … |
| Formular mit Labels | `upload.html` | Z. … (Upload-Formular) |
| Responsives Layout (Flexbox/Grid) | `styles.css` | Z. … |
| Media Query | `styles.css` | Z. … |
| URL-Struktur | `index.html`, `advisories.html`, `advisory.html`, `upload.html`, `login.html` | siehe Abschnitt URL-Struktur |

## Meilensteine

| Meilenstein | Inhalt | Abgabe | Git-Tag |
|---|---|---|---|
| M1 | Statischer HTML/CSS-Prototyp: Startseite, Liste, Detail, Upload, Login | 21.10.2026 | `Meilenstein 1` |
| M2 | React/TS-App mit Routing; Advisories aus lokalen Beispiel-JSONs | 18.11.2026 | `Meilenstein 2` |
| M3 | Express-API, Prisma/DB, Auth mit Rollen, Schema-Validierung, Security-Check | 13.01.2027 | `Meilenstein 3` |
| M4 | Tests (Autorisierung, Validierung, Parser), Betrieb per Docker Compose, Demo-Video, Ausarbeitung | nach Vorlesungsende | `Meilenstein 4` |

## Sicherheit (Vorüberlegungen)

Hochgeladene Dokumente sind fremde, nicht vertrauenswürdige Eingaben. Geplant sind deshalb:

- Strenges Größenlimit und reine JSON-Verarbeitung, keine Ausführung von Inhalten
- Ausgabe von Feldern aus Advisories nur als Text (React-Escaping, kein `dangerouslySetInnerHTML`), Links nur mit erlaubten Schemas (`https:`)
- Prisma mit parametrisierten Queries gegen Injection
- Session-Cookies mit `httpOnly`, `SameSite=Lax`/`Strict`, CORS nur für das eigene Frontend
- Secrets ausschließlich in `.env` (nicht im Repository), Vorlage in `.env.example`

## Lokales Setup

*Folgt mit M2/M3.* Ziel: `npm install && npm run dev` bzw. `docker compose up` startet die App in unter zehn Minuten.

## Annahmen und offene Fragen

Dieser Entwurf trifft folgende Annahmen, die noch bestätigt werden müssen:

1. Beide Formate (CSAF 2.0 und CycloneDX VEX) werden unterstützt, CSAF hat Priorität.
2. Advisories sind nach dem Hochladen öffentlich lesbar; nur das Hochladen braucht ein Konto.
3. Drei Rollen (Gast, Publisher, Admin), Publisher gehören zu einer Organisation.
4. Stack wie oben beschrieben, Betrieb lokal bzw. per Docker Compose, kein Cloud-Hosting.

## Lizenz

Siehe [LICENSE](LICENSE).
