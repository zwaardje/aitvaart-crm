# Full Text Search Implementation

Deze implementatie voegt een uitgebreide full text search functionaliteit toe aan de CRM applicatie, gebaseerd op PostgreSQL's ingebouwde full text search mogelijkheden.

## 🚀 Features

- **Algemene zoekfunctie** voor notities, kosten, begravenissen en contactpersonen
- **Nederlandse taalondersteuning** met `to_tsvector('dutch', ...)`
- **Relevance ranking** met `ts_rank()`
- **Flexibele componenten** voor verschillende gebruiksscenario's
- **TypeScript ondersteuning** met volledige type safety
- **Internationalisatie** met Nederlandse en Engelse vertalingen

## 📁 Bestanden

### Database

- `supabase/migrations/20250110000000_add_full_text_search.sql` - Database migratie met FTS indexes

### Hooks

- `src/hooks/useSearch.ts` - Hoofdsearch hook met caching en error handling

### Components

- `src/components/ui/SearchBar.tsx` - Zoekbalk met sorteeropties en resultaten

### Translations

- `src/messages/nl.json` - Nederlandse vertalingen
- `src/messages/en.json` - Engelse vertalingen

## 🛠 Installatie

1. **Database migratie uitvoeren:**

```bash
supabase db push
```

2. **Componenten zijn al geëxporteerd** in `src/components/ui/index.ts`

3. **Hooks zijn al geëxporteerd** in `src/hooks/index.ts`

## 💻 Gebruik

### Basis Search Component

```tsx
import { SearchBar } from "@/components/ui";

function MyComponent() {
  const handleResultsChange = (results) => {
    // Handle search results
    console.log("Search results:", results);
  };

  return (
    <SearchBar
      onResultsChange={handleResultsChange}
      placeholder="Zoek in alles..."
      limit={50}
    />
  );
}
```

### Search met Entity Type Filtering

```tsx
<Search
  onResultClick={handleResultClick}
  entityTypes={["note", "funeral"]} // Alleen notities en begravenissen
  variant="inline"
/>
```

### Compact Search voor Headers

```tsx
import { SearchHeader } from "@/components/ui";

function Header() {
  return (
    <header>
      <SearchHeader className="ml-auto" />
    </header>
  );
}
```

### Custom Search Hook

```tsx
import { useSearch } from "@/hooks";

function CustomSearch() {
  const { results, isLoading, error } = useSearch({
    query: "zoekterm",
    limit: 20,
    sortBy: "date_desc", // "relevance" | "date_asc" | "date_desc"
  });

  return (
    <div>
      {results.map((result) => (
        <div key={result.entity_id}>
          {result.title} - {result.entity_type}
        </div>
      ))}
    </div>
  );
}
```

## 🔍 Zoekfunctionaliteit

### Ondersteunde Entiteiten

1. **Notities** (`funeral_notes`)

   - Zoekt in: `title` en `content`
   - Navigeert naar: `/funerals/{funeral_id}/notities`

2. **Kosten** (`funeral_suppliers`)

   - Zoekt in: `product_name` en `notes`
   - Navigeert naar: `/funerals/{funeral_id}/kosten`

3. **Contactpersonen** (`funeral_contacts`)

   - Zoekt in: `relation` en `notes`
   - Navigeert naar: `/funerals/{funeral_id}/contacten`

4. **Begravenissen** (`funerals` + `deceased`)
   - Zoekt in: `location`, `funeral_director`, en overledene namen
   - Navigeert naar: `/funerals/{funeral_id}`

### Zoekoperatoren

- **AND zoeken**: Meerdere woorden worden gecombineerd met `&`
- **Fuzzy matching**: "begrafenis" vindt ook "begrafenissen"
- **Stemming**: Nederlandse taalondersteuning voor woordvormen
- **Ranking**: Resultaten gesorteerd op relevantie

### Sorteeropties

- **Relevantie**: Standaard, gebaseerd op `ts_rank()`
- **Nieuwste eerst**: Meest recente resultaten eerst
- **Oudste eerst**: Oudste resultaten eerst

## 🎨 Component Varianten

### Search Component

- `variant="inline"` - Inline weergave met directe resultaten
- `variant="modal"` - Modal popup voor compacte interfaces

### SearchResults Component

- `SearchResults` - Volledige kaartweergave met details
- `SearchResultsCompact` - Compacte lijstweergave

## 🌐 Internationalisatie

### Nederlandse Keys

```json
{
  "search": {
    "search": "Zoeken",
    "placeholder": "Zoek in notities, kosten, begravenissen en contacten...",
    "entity": {
      "note": "Notitie",
      "cost": "Kosten",
      "contact": "Contact",
      "funeral": "Begrafenis"
    }
  }
}
```

### Engelse Keys

```json
{
  "search": {
    "search": "Search",
    "placeholder": "Search in notes, costs, funerals and contacts...",
    "entity": {
      "note": "Note",
      "cost": "Cost",
      "contact": "Contact",
      "funeral": "Funeral"
    }
  }
}
```

## 🔧 Database Details

### FTS Columns

Elke tabel heeft een `fts` generated column die automatisch wordt bijgewerkt:

```sql
-- Voorbeeld voor funeral_notes
ALTER TABLE public.funeral_notes
ADD COLUMN fts tsvector GENERATED ALWAYS AS (
  to_tsvector('dutch', title || ' ' || COALESCE(content, ''))
) STORED;

CREATE INDEX idx_funeral_notes_fts ON public.funeral_notes USING gin(fts);
```

### Search Function

De `search_all_entities()` functie combineert alle tabellen:

```sql
SELECT * FROM search_all_entities('zoekterm', 50);
```

## 🚀 Performance

- **GIN Indexes** voor snelle full text search
- **Generated Columns** voor automatische index updates
- **Query Caching** met React Query (5 minuten)
- **Debounced Search** in de SearchBar component
- **Pagination** met configurable limits

## 🔒 Security

- **RLS Policies** worden gerespecteerd
- **Auth.uid()** filtering in search function
- **Input Sanitization** in search queries
- **Error Handling** met fallback naar lege resultaten

## 📱 Mobile Support

- **Responsive Design** met Tailwind CSS
- **Touch-friendly** interfaces
- **Keyboard Navigation** ondersteuning
- **Accessible** met ARIA labels

## 🧪 Testing

Om de search functionaliteit te testen:

1. Ga naar `/search` voor de dedicated search pagina
2. Voeg de `SearchHeader` component toe aan je header
3. Gebruik de `Search` component in je eigen pagina's

## 🔮 Toekomstige Uitbreidingen

- **Search Analytics** - Track populaire zoektermen
- **Search History** - Bewaar recente zoekopdrachten
- **Advanced Filters** - Filter op datum, type, etc.
- **Search Suggestions** - Auto-complete functionaliteit
- **Export Results** - Exporteer zoekresultaten naar PDF/Excel
