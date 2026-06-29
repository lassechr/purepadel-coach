# PurePadel landingpage — projektoverblik

Erstatning for den nedlagte Shopify-webshop på **purepadel.dk**. En selvstændig,
statisk side (HTML/CSS/JS i én fil) der viser produkter + kontakt + sociale links.
Ingen build, ingen framework. Hostes på Simply.com webhotel.

> Dette dokument er en handoff til videre arbejde (fx i VS Code).

---

## 1. Hurtige fakta

| | |
|---|---|
| **Repo** | `lassechr/purepadel-coach` |
| **Branch** | `claude/pure-padel-landing-rt3e3k` |
| **Mappe** | `landing/` |
| **Live URL** | https://purepadel.dk (www mangler SSL — se §6) |
| **Webhotel** | Simply.com — Basic Suite (linux) |
| **Webserver** | `linux266.unoeuro.com` — IP `93.191.156.154` |
| **MySQL** | `mysql76.unoeuro.com` (tilgængelig, ikke brugt endnu) |
| **Navneservere** | `ns1/ns2/ns3.simply.com` |
| **Deploy** | Manuel upload til web-roden via Simply File Manager / FTP |

---

## 2. Filstruktur

```
landing/
├── index.html      ← HELE siden (HTML + CSS + JS). Redigér CONFIG + PRODUCTS i toppen
├── logo.png        ← logo (hvid-på-mørk udgave passer bedst)
├── .htaccess       ← forside-prioritet (index.html før index.php), cache, sikkerhed
├── produkter/      ← alle produktbilleder (fx Adidas-Metalbonectrl.webp)
├── README.md       ← kort brugervejledning
└── PROJEKT.md      ← dette dokument
```

> **Vigtigt:** `index.html` i repo-roden er en ANDEN app (coach-appen). Landingpagen
> ligger udelukkende i `landing/`.

---

## 3. Sådan virker siden

Alt rendres client-side i JavaScript ud fra to objekter i toppen af `index.html`:

### CONFIG — oplysninger
```js
const CONFIG = {
  brand:    "PurePadel",
  tagline:  "Padeludstyr til alle",
  intro:    "Se vores produkter herunder og kontakt mig direkte ...",
  email:    "info@purepadel.dk",
  phone:    "91334262",
  facebook:  "https://www.facebook.com/purepadeldk",
  instagram: "https://www.instagram.com/purepadel_dk",
};
```
Tomt felt (`""`) skjuler den tilhørende knap/linje automatisk.

### PRODUCTS — produktlisten
```js
const PRODUCTS = [
  {
    id:    "AdidasCTRL26",                       // unikt, uden mellemrum → bruges i ?p=
    name:  "Adidas Metalbone CTRL 2026",
    price: "2.899 kr.",
    image: "produkter/Adidas-Metalbonectrl.webp", // ÉT billede
    text:  "Beskrivelse ...",
    badge: "Sikker vinder"                        // valgfri mærkat, ellers ""
  },
  // ... flere produkter
];
```

### Flere billeder pr. produkt (galleri)
Brug `images: [...]` i stedet for `image:`. Første billede vises på forsiden (+ et 📷-tal),
resten klikkes frem som miniaturer på produktsiden:
```js
images: ["produkter/bat-1.webp", "produkter/bat-2.webp", "produkter/bat-3.webp"],
```

### Funktioner i koden
- **Forside:** hero (logo + intro + FB/IG) + produkt-grid + kontakt + footer
- **Enkelt produkt:** `?p=<id>` viser kun ét produkt (delbart link). "Del"-knap kopierer linket
- **"Kontakt for køb":** åbner en `mailto:` til `CONFIG.email` med produktnavn i emnet
- **Robusthed:** manglende billede → pæn "Billede mangler"-pladsholder; manglende logo → tekst-wordmark

Centrale JS-funktioner: `productImages()`, `imgOrPlaceholder()`, `cardHTML()`,
`singleHTML()`, `contactHTML()`, `render()`. Ingen afhængigheder.

---

## 4. Vigtige regler (faldgruber)

- **Filnavne er case-sensitive** på webhotellet: `Billede.WEBP` ≠ `billede.webp`.
  Stien i `image:`/`images:` skal matche filen 100%.
- **Sti til billeder:** ligger billedet i `produkter/`, skal stien være
  `"produkter/filnavn.webp"` (ikke kun `"filnavn.webp"`).
- **Cache:** efter upload, hård-genindlæs med `Ctrl+F5`.

---

## 5. Hosting & DNS (Simply.com)

DNS administreres hos Simply (domænet bruger Simply's navneservere).
Relevante records:

| Type | Hostnavn | Værdi | Note |
|------|----------|-------|------|
| A | `purepadel.dk` | `93.191.156.154` | webhotel |
| A | `www` | `93.191.156.154` | webhotel |
| CNAME | `coach` | `lassechr.github.io` | coach-app (GitHub Pages) |
| CNAME | `app` | `…vercel-dns…` | separat app (Vercel) |
| MX/TXT/SRV | `@`, `send.mail` … | Simply / Amazon SES | e-mail |

**Fjernet under fejlsøgning (Shopify-rester):**
- `www CNAME → shops.myshopify.com` (gav Cloudflare **Error 1001**)
- `AAAA purepadel.dk → 2620:0127:f00f:5::` (Shopify IPv6 → ramte død shop på IPv6-net)

---

## 6. SSL-status

- ✅ `purepadel.dk` — gratis **Let's Encrypt** + "Tving HTTPS" aktiveret
  (Simply: *Website → HTTPS-beskyttelse* — IKKE den betalte "Bestil SSL-certifikat")
- ⚠️ `www.purepadel.dk` — **mangler eget certifikat**. Skal dukke op på samme
  HTTPS-side nu hvor www's A-record peger på Simply; aktivér HTTPS + Tving HTTPS der.
  Dukker det ikke op: tilføj `www` som hostnavn/alias, eller bed Simply support.

> Let's Encrypt virker kun når domænets A/AAAA peger *direkte* på Simply-serveren.
> Tjek spredning på whatsmydns.net (A og AAAA) hvis det driller.

---

## 7. Deploy-arbejdsgang

**Repoet er master.** For at undgå at den lokale og live-version driver fra hinanden:

1. Redigér `landing/index.html` (CONFIG/PRODUCTS) — i repoet / VS Code
2. Læg evt. nye billeder i `landing/produkter/`
3. Upload de ændrede filer til web-roden på Simply (File Manager / FTP), **overskriv**
4. `Ctrl+F5` på siden

Redigér **ikke** filen direkte på webhotellet — så bliver de to versioner uenige.

---

## 8. Idé: smartere produkt-vedligehold

I dag redigeres produkter i JS-arrayet + manuel upload. Tre mulige forbedringer:

### Niveau 1 — separat `produkter.json`
Flyt produkterne ud i en lille JSON-fil som siden `fetch`'er. Mindre fil at rette.
Stadig: upload + JSON-syntaks + billeder separat.

### Niveau 2 — Google Sheet-styret (let, ingen upload)
Produkter i et regneark; siden læser arket (samme mønster som coach-appens øvelser).
Redigér i regnearket → siden opdaterer sig selv. Billeder lægges stadig i `produkter/`
og filnavnet skrives i arket.

### Niveau 3 — rigtigt admin-panel ⭐ (anbefalet)
Adgangskode-beskyttet `admin` på selve siden:
- Formular til tilføj/ret/slet produkter
- **Billed-upload direkte** (gemmes i `produkter/`)
- Gem → siden opdateret med det samme

**Foreslået arkitektur (alt på Simply, PHP):**
```
landing/
├── index.html        ← læser produkter via fetch('produkter.json')
├── produkter.json    ← data (skrives af admin)
├── admin.php         ← login + formular; skriver produkter.json; håndterer upload
├── api.php           ← (valgfri) gem/hent endpoints
└── produkter/        ← billeder (admin uploader hertil)
```
- Login: simpel session + hash'et password (evt. i en `config.php` uden for web-roden)
- Datalager: flad `produkter.json` (nemmest) eller MySQL (`mysql76.unoeuro.com`)
- Upload: `move_uploaded_file()` → `produkter/`, valider filtype/størrelse
- Sikkerhed: kun `.php`-skrivning bag login; saniter filnavne; begræns til billed-mimetyper

> Beslutning udestår: **Niveau 2 (Google Sheet)** eller **Niveau 3 (admin-panel)**.

---

## 9. Status / TODO

- [x] Landingpage live på `https://purepadel.dk` med HTTPS
- [x] Produkt-grid, enkelt-produkt-delelinks, kontakt, FB/IG
- [x] Galleri (flere billeder pr. produkt)
- [x] Repo = master (live-indhold flettet ind)
- [ ] **SSL på `www.purepadel.dk`**
- [ ] Erstat eksempel-produkter (`padel-taske`, `purepadel-tshirt`) med rigtige
- [ ] Evt. flere billeder på Adidas-batet
- [ ] Beslut + byg smartere vedligehold (Google Sheet vs. admin-panel)
- [ ] Bekræft at `logo.png` er uploadet

---

## 10. Lokal udvikling

Det er ren statisk HTML — åbn `landing/index.html` direkte i browseren, eller kør en
lille server for at teste relative stier korrekt:
```bash
cd landing
python3 -m http.server 8000
# → http://localhost:8000
```
Test delelink: `http://localhost:8000/?p=AdidasCTRL26`
