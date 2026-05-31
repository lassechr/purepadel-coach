# PurePadel Coach — Projektoverblik

## Arkitektur

**Single-file SPA** — al kode bor i `index.html` (HTML + CSS + JavaScript). Ingen build-proces, ingen NPM. Deployes ved at uploade filer til en webserver.

```
purepadel-coach/
├── index.html          ← Hele appen (CSS + JS + HTML ~4600 linjer)
├── service-worker.js   ← PWA + push-notifikationer
├── manifest.json       ← PWA manifest
├── icon-192.png        ← App-ikon
├── icon-512.png        ← App-ikon
├── CNAME               ← coach.purepadel.dk (GitHub Pages/Cloudflare)
├── _headers            ← Cache-Control headers (Cloudflare/Netlify)
├── .htaccess           ← Cache-Control headers (Apache/FTP)
├── serve.sh            ← Lokal udviklingsserver (Python)
└── CLAUDE.md           ← Dette dokument
```

## Backend: Supabase

**Projekt-URL:** `https://fhpqetgfrfhecbbzxguz.supabase.co`

Supabase håndterer ALT serverside logik:
- Auth (email/password via `auth.users`)
- Database (PostgreSQL med RLS)
- Edge Functions (privilegerede operationer)

Frontenden bruger udelukkende:
- `anon`-nøglen (offentlig, beregnet til client-side brug)
- Brugerens JWT-token til autoriserede kald
- Edge Functions til operationer der kræver `service_role`

### Databas-tabeller

| Tabel | Indhold |
|-------|---------|
| `profiles` | Brugerprofiler (rolle, navn, email, club_id, is_player, subscription) |
| `players` | Spillerprofiler (niveau, side, noter, profile_id link) |
| `clubs` | Klubber (navn, logo, admin-profil) |
| `teams` | Hold (navn, club_id, sæson) |
| `team_members` | Hold-tilknytning (player_id=profiles.id, is_reserve, is_trainer, is_captain) |
| `events` | Begivenheder/kampe (team_id, dato, sted, type) |
| `event_responses` | Svar på begivenheder (player_id=profiles.id, response, note) |
| `drills` | Øvelser oprettet af trænere |
| `sessions` | Træningssessioner med øvelser |

**Vigtigt:** `team_members.player_id` og `event_responses.player_id` peger begge på `profiles.id` (ikke `players.id`). `players.profile_id` linker en spiller til en profil.

### Edge Functions (kører med service_role)

| Funktion | Formål |
|----------|--------|
| `create-user` | Opretter auth-bruger + profil |
| `delete-user` | Sletter auth-bruger |
| `reset-password` | Nulstiller password |
| `send-push` | Sender Web Push notifikation |
| `send-email` | Sender email via Resend |

### Sikkerhedsmodel

- **RLS (Row Level Security)** skal være aktiveret på alle tabeller i Supabase
- `anon`-nøglen er offentlig og designet til client-side — sikkerhed ligger i RLS-politikker
- Privilegerede operationer (opret/slet auth-brugere) kører kun i Edge Functions med `service_role`-nøgle
- Frontenden verificerer roller via JWT-claims i `profiles`-tabellen

## Brugerroller

| Rolle | Adgang |
|-------|--------|
| `superadmin` | Alt + admin-panel for alle klubber |
| `club_admin` | Administrerer sin klub, spillere, hold |
| `trainer` | Spillere, øvelser, træninger, hold og begivenheder. Kan have `is_player=true` |
| `player` | Kun player-UI: egne hold, begivenheder, svar |

## Faner (tabs) — Træner/Admin UI

| Tab-id | Funktion | Render-funktion |
|--------|----------|-----------------|
| `admin` | Superadmin: statistik + brugerstyring | `rAdmin()` |
| `drills` | Øvelsesbibliotek (DB + Google Sheets) | `rDrills()` |
| `players` | Spilleroversigt og -profiler | `rPlayers()` |
| `matches` | Træninger/kampe med resultater | `rMatches()` |
| `hold` | Hold, events, begivenheder | `rHold()` |
| `mine_traening` | Vises kun hvis `is_player=true` | `rMineTraening()` |
| `historik` | Træningshistorik | `rHistorik()` |
| `konto` | Profilstyring | `rKonto()` |

## Player UI (separat view)

Spillere (`role=player`) ser et helt andet UI via `rPlayerApp()`:
- Mine hold + holdinfo
- Kaptajn-panel (hvis `is_captain=true`)
- Begivenhedskort med tilmeld/afbud (`rPlayerEventCard`)
- Notifikationsindstillinger

## Nøgle-mønstre i koden

### State-håndtering
```js
var STATE = { session, profile, players, drills, teams, events, ... };
```
Al data bor i `STATE`. `render()` kaldes efter enhver ændring.

### Supabase-kald
```js
sbGet(table, query)      // GET /rest/v1/{table}?{query}
sbPost(table, data)      // POST /rest/v1/{table}
sbPatch(table, data, q)  // PATCH /rest/v1/{table}?{q}
sbDelete(table, query)   // DELETE /rest/v1/{table}?{query}
sbAuth(email, pw)        // Login
```

### Render-mønster
Alle render-funktioner returnerer HTML-strings som sættes i `#app`:
```js
function rXxx() {
  var html = '';
  html += '...';
  return html;
}
```

### Modal-system
`STATE.modal` styrer hvilken modal der vises. Modaler renderes i bunden af `render()`.

### Data-indlæsning
- `loadAll()` — henter al data ved login og refresh
- `loadPlayerData()` — henter spiller-specifik data (hold, events, svar)
- Data fra Google Sheets (øvelser) via `loadSheet()`

## Push-notifikationer

VAPID public key er hardcoded. Push sendes via Supabase Edge Function `send-push`.
Klienten registrerer subscription via `subscribeToPush()` og gemmer til `profiles.push_subscription`.

## PWA

- Service Worker: cache-strategi der altid henter frisk `index.html` fra netværket
- Manifest: standalone-mode, mørkt tema
- iOS: Safari "Tilføj til hjemmeskærm" kræves for push på iPhone

## Lokal udvikling

```bash
./serve.sh          # Starter server på http://localhost:8080
```

Service Worker og Push kræver HTTPS i produktion, men fungerer på `localhost`.

## Deploy (FTP/Apache)

Upload følgende filer til roden af din webserver:
```
index.html
service-worker.js
manifest.json
icon-192.png
icon-512.png
.htaccess
```

`.htaccess` sørger for korrekte cache-headers så browserne altid henter den nyeste version.

## Kendte begrænsninger / TODO

- Google Sheets-integration til øvelser er read-only og kræver offentligt Sheet
- `rEventDetail`'s "Ikke svaret"-liste bruger `players.id` vs `event_responses.player_id` (profiles.id) — kan give forkert tælling
- Subscription-udløbsdato tjekkes kun client-side (kan omgås)
- Ingen offline-support (Service Worker cacher ikke data)
