<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/logo/advisoryo-dark.svg">
    <img src="public/logo/advisoryo.svg" alt="advisoryo" width="320">
  </picture>
</p>

# advisoryo

> Plattform, auf der Hersteller ihre Security Advisories im Format **CSAF 2.0** veröffentlichen und auf der jede Person sie durchsuchen kann.

**Name:** Bryan Wiest
**Repository:** https://github.com/bryanwiest/advisoryo
**Kurs:** Web-Applikationen, WS 2026/27, HTWG Konstanz

## Projektidee

advisoryo ist eine Web-Plattform, auf der Hersteller ihre Security Advisories als CSAF-2.0-Dokumente hochladen. Die Plattform validiert jedes Dokument gegen das offizielle Schema, extrahiert die wichtigsten Angaben (betroffene Produkte, CVEs, Schweregrad, Status) und macht sie öffentlich durchsuchbar. Zielgruppe sind Hersteller von Produkten mit digitalen Elementen, die nach dem EU Cyber Resilience Act (CRA) Schwachstellen und Sicherheitsupdates kommunizieren müssen, aber kein eigenes CSAF-Portal betreiben, sowie Betreiber und Security-Teams, die wissen wollen, ob ihre Produkte betroffen sind.

## Hintergrund: CSAF

Das [Common Security Advisory Framework (CSAF) 2.0](https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html) ist ein OASIS-Standard für maschinenlesbare Security Advisories im JSON-Format und wird vom BSI empfohlen. Ein Dokument hat ein Profil (z. B. `csaf_security_advisory`, `csaf_vex`, `csaf_informational_advisory`), einen Produktbaum (`product_tree`) und eine Liste von Schwachstellen (`vulnerabilities`) mit Produktstatus wie `known_affected`, `fixed` oder `known_not_affected`. Über `document.tracking` werden Revisionen versioniert.

advisoryo speichert das **Originaldokument unverändert** und zusätzlich ein **normalisiertes Datenmodell**, über das gesucht und angezeigt wird.

## Rollen

Hersteller sind als **Organisationen** auf der Plattform. Das können Softwareanbieter sein, aber auch Hersteller von Hardware, IoT-Geräten oder Maschinen.

| Rolle | Bereich | Rechte |
|---|---|---|
| Gast (nicht angemeldet) | öffentlich | Advisories suchen, ansehen und als JSON herunterladen |
| Publisher | eigene Organisation | Advisories hochladen, neue Revisionen einspielen, eigene Advisories zurückziehen |
| Organisationsverwalter | eigene Organisation | Wie Publisher; zusätzlich Publisher der eigenen Organisation einladen, sperren und entfernen sowie Organisationsprofil pflegen |
| Plattform-Admin | gesamte Plattform | Organisationen freischalten und sperren, Organisationsverwalter festlegen, Advisories bei Missbrauch sperren |

Die Rechte werden im Backend geprüft: ohne Anmeldung `401`, ohne passende Rolle oder bei fremder Organisation `403`.

## Funktionen

**Kern (fest eingeplant)**

- **Upload** eines CSAF-Dokuments per Formular mit Größenlimit
- **Validierung** gegen das offizielle CSAF-2.0-JSON-Schema mit verständlicher Fehlerliste
- **Öffentliche Übersicht und Suche** nach CVE-ID, Produkt, Hersteller, Schweregrad (CVSS) und Status
- **Detailansicht** mit betroffenen Produkten, Schwachstellen, Maßnahmen (`remediations`) und Download des Originals
- **Organisationsverwaltung**: Organisationsverwalter laden Publisher ein und verwalten sie

**Erweiterungen (je nach Umfang)**

- Versionierung über `document.tracking` mit Revisionshistorie und Diff-Ansicht
- Zusätzliche CSAF-Prüfungen über das Schema hinaus (Mandatory Tests aus Kapitel 6.1 der Spezifikation)
- Watchlist: Produkte abonnieren und neue betroffene Advisories sehen
- Öffentliche Verzeichnisse nach CSAF-Spezifikation (`provider-metadata.json`, ROLIE-Feed), damit andere CSAF-Werkzeuge die Advisories automatisch abrufen können

## Technologie-Stack (geplant)

| Schicht | Technologie | Begründung |
|---|---|---|
| Frontend und Backend | Next.js (App Router) mit TypeScript | Ein Projekt für Oberfläche und API; öffentliche Advisory-Seiten können serverseitig gerendert werden und sind damit schnell und auffindbar |
| API | Next.js Route Handlers unter `/api/...` | Eigene REST-Endpunkte mit Ressourcen-URLs, Methoden und Statuscodes |
| Validierung | [Ajv](https://ajv.js.org/) mit dem offiziellen CSAF-2.0-Schema, Zod für API-Eingaben | Das Schema des Standards lässt sich direkt verwenden |
| Datenbank | PostgreSQL über Prisma, lokal per Docker Compose | Relationales Modell für Organisationen, Rollen und Advisories; JSONB für das Originaldokument; Volltextsuche eingebaut. SQLite (schwächer bei JSON und Suche) und MongoDB (umständlich für Rollen und Beziehungen) wurden verworfen |
| Auth | Session-Cookie (httpOnly, SameSite) mit gehashten Passwörtern (argon2) | Einfacher gegen XSS und CSRF abzusichern als ein JWT im LocalStorage |

Die Entscheidungen werden in der Ausarbeitung mit Alternativen begründet, z. B. Next.js gegenüber Vite-SPA mit separatem Express-Backend, PostgreSQL gegenüber SQLite oder MongoDB.

## Datenmodell (Entwurf)

```
User ──< Membership (Rolle: PUBLISHER | ORG_MANAGER) >── Organization ──< Advisory ──< Revision
                                                                           │
                                                                           ├──< Vulnerability (CVE, CVSS, Status)
                                                                           └──< Product (Name, Version, CPE/PURL)
```

`User` hat zusätzlich ein Flag für Plattform-Admins. `Revision` enthält das Originaldokument (JSONB), die `tracking.id`, die Versionsnummer und den Upload-Zeitpunkt.

## URL-Struktur

| Pfad | Inhalt |
|---|---|
| `/` | Startseite mit Suche und neuesten Advisories |
| `/advisories` | Liste mit Filtern |
| `/advisories/:id` | Detailansicht eines Advisories |
| `/organizations/:slug` | Öffentliches Profil eines Herstellers mit seinen Advisories |
| `/upload` | Upload-Formular (Publisher) |
| `/org` | Verwaltung der eigenen Organisation (Organisationsverwalter) |
| `/login`, `/register` | Anmeldung und Registrierung |
| `/admin` | Plattformverwaltung (Plattform-Admin) |

REST-API (ab M3, Entwurf):

| Methode | Pfad | Beschreibung | Rolle |
|---|---|---|---|
| GET | `/api/advisories?q=&cve=&severity=&org=` | Suchen und filtern | alle |
| GET | `/api/advisories/:id` | Details inkl. Revisionen | alle |
| GET | `/api/advisories/:id/raw` | Originaldokument (neueste Revision) | alle |
| POST | `/api/advisories` | Neues Advisory hochladen | Publisher, Organisationsverwalter |
| POST | `/api/advisories/:id/revisions` | Neue Revision einspielen | Publisher, Organisationsverwalter (eigene Org) |
| DELETE | `/api/advisories/:id` | Zurückziehen bzw. sperren | Publisher (eigene Org), Plattform-Admin |
| GET | `/api/organizations/:slug/members` | Mitglieder anzeigen | Organisationsverwalter (eigene Org) |
| POST | `/api/organizations/:slug/members` | Publisher einladen | Organisationsverwalter (eigene Org) |
| DELETE | `/api/organizations/:slug/members/:userId` | Publisher entfernen | Organisationsverwalter (eigene Org) |
| PATCH | `/api/organizations/:slug` | Organisation freischalten oder sperren | Plattform-Admin |
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
| M2 | React/TypeScript-App mit Routing; Advisories aus lokalen CSAF-Beispieldateien | 18.11.2026 | `Meilenstein 2` |
| M3 | API, PostgreSQL mit Prisma, Auth mit Rollen, Schema-Validierung, Security-Check | 13.01.2027 | `Meilenstein 3` |
| M4 | Tests (Autorisierung, Validierung, Parser), Betrieb per Docker Compose, Demo-Video, Ausarbeitung | nach Vorlesungsende | `Meilenstein 4` |

## Sicherheit (Vorüberlegungen)

Hochgeladene Dokumente sind fremde, nicht vertrauenswürdige Eingaben. Geplant sind deshalb:

- Strenges Größenlimit und reine JSON-Verarbeitung, keine Ausführung von Inhalten
- Felder aus Advisories werden nur als Text ausgegeben (React-Escaping, kein `dangerouslySetInnerHTML`), Links nur mit `https:`
- Prisma mit parametrisierten Queries gegen Injection
- Session-Cookies mit `httpOnly`, `Secure`, `SameSite=Lax`; Prüfung des `Origin`-Headers bei schreibenden Anfragen gegen CSRF
- Jede Rechteprüfung im Backend, inklusive der Zugehörigkeit zur Organisation
- Secrets ausschließlich in `.env` (nicht im Repository), Vorlage in `.env.example`

## Lokales Setup

*Folgt mit M2/M3.* Ziel: `docker compose up` startet Datenbank und App, `npm install && npm run dev` startet die Entwicklungsumgebung, alles in unter zehn Minuten.

## Offene Punkte

1. Abstimmen, ob Next.js für M2 statt der vorgegebenen Kombination aus Vite und React Router akzeptiert wird.
2. Umfang der Erweiterungen nach M2 festlegen.

## Lizenz

Siehe [LICENSE](LICENSE).
