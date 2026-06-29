# PurePadel landingpage

Selvstændig landingpage der erstatter den nedlagte webshop. Ingen build, ingen backend —
bare statiske filer. Alt redigeres i toppen af `index.html`.

## Filer
```
landing/
├── index.html      ← hele siden (rediger CONFIG + PRODUCTS i toppen)
├── logo.png        ← dit logo (upload selv — den hvide-på-mørk version passer bedst)
└── produkter/      ← produktbilleder (opret mappen og læg billeder her)
```

## Sådan retter du oplysninger
Åbn `index.html`, find blokken `const CONFIG = {...}` øverst og udfyld:
- `email`, `phone` (lad stå tom `""` for at skjule)
- `facebook`, `instagram` (indsæt de fulde URL'er)
- `intro` (teksten i toppen)

## Sådan tilføjer du et produkt
Find `const PRODUCTS = [...]` og tilføj et nyt objekt:
```js
{
  id:    "kort-unikt-id",            // bruges i delelinket ?p=kort-unikt-id
  name:  "Produktnavn",
  price: "899 kr.",
  image: "produkter/mit-billede.jpg",
  text:  "Beskrivelse...",
  badge: "Tilbud"                    // valgfri mærkat, ellers ""
}
```
Læg billedet i `produkter/`-mappen med samme filnavn.

### Flere billeder pr. produkt (galleri)
Brug `images: [...]` i stedet for `image:`. Det første billede vises på forsiden,
resten kan klikkes frem som miniaturer inde på produktet:
```js
{
  id:     "padelbat-pro",
  name:   "Padelbat Pro",
  price:  "1.199 kr.",
  images: ["produkter/bat-1.webp", "produkter/bat-2.webp", "produkter/bat-3.webp"],
  text:   "Beskrivelse...",
  badge:  ""
}
```
Vigtigt: sti + filnavn skal matche filen 100% (også store/små bogstaver).

## Del-link til ét produkt
`https://www.purepadel.dk/?p=kort-unikt-id` åbner kun det produkt.
Knappen **Del** på hvert produkt kopierer linket automatisk.

## Logo
Upload dit logo som `logo.png` i denne mappe. Mangler det, vises bare teksten "PurePadel".
