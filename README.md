# Händelser Webbplats

En modern React-baserad webbplats för att visa händelser, budget, packlista och säsongsöversikt. Data hämtas direkt från Google Sheets.

## Funktioner

- **Händelser**: Visa och filtrera händelser baserat på säsong, typ, plats och skolledighet
- **Budget**: Se kostnader per månad och totalt för säsongen
- **Packlista**: Checklista för vad som ska packas
- **Säsongsöversikt**: Översikt av alla händelser i tidsordning

## Teknik

- React 19
- Vite
- Tailwind CSS 4
- React Router
- PapaParse (för CSV-parsing från Google Sheets)

## Komma igång

### Installation

```bash
npm install
```

### Utveckling

```bash
npm run dev
```

Öppna http://localhost:5173 i din webbläsare.

### Bygga för produktion

```bash
npm run build
```

Byggda filer skapas i `dist/` mappen.

### Förhandsgranska produktionsbygget

```bash
npm run preview
```

## Google Sheets Integration

Webbplatsen hämtar data från publika Google Sheets CSV-exporter. URL:erna finns i:
- `src/pages/Handelser.jsx` - för händelsedata
- `src/pages/Budget.jsx` - för budgetdata
- `src/pages/Sasongsoversikt.jsx` - för säsongsöversikt

För att ändra datakällan, uppdatera `SHEET_URL` konstanterna i respektive fil.

## Struktur

```
src/
├── components/          # React-komponenter
│   ├── Layout.jsx      # Huvudlayout med navigation
│   ├── EventCard.jsx   # Händelsekort
│   └── EventFilters.jsx # Filtreringskomponenter
├── pages/              # Sidor
│   ├── Handelser.jsx   # Händelser-sidan
│   ├── Budget.jsx      # Budget-sidan
│   ├── Packlista.jsx   # Packlista-sidan
│   └── Sasongsoversikt.jsx # Säsongsöversikt-sidan
├── hooks/              # Custom React hooks
│   └── useGoogleSheet.js # Hook för att hämta Google Sheets data
├── utils/              # Hjälpfunktioner
│   └── dateUtils.js    # Datum- och säsongsfunktioner
├── App.jsx             # Huvudapplikationen
├── main.jsx            # Entrypoint
└── index.css           # Tailwind CSS imports
```
