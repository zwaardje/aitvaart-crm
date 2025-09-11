# CRM Hooks voor Uitvaart Begleider

Deze hooks bieden een complete set van React Query hooks voor het beheren van alle aspecten van het uitvaart CRM systeem. Alle hooks respecteren de Row Level Security (RLS) policies en zorgen ervoor dat gebruikers alleen toegang hebben tot hun eigen data.

## Overzicht van Hooks

### 🔐 Authenticatie & Profiel

- `useAuth()` - Beheer van gebruikersauthenticatie en profiel

### 👥 Client Management

- `useClients()` - Beheer van alle clients
- `useClient(id)` - Beheer van een specifieke client

### 💀 Overledenen Management

- `useDeceased()` - Beheer van alle overledenen
- `useDeceasedPerson(id)` - Beheer van een specifieke overledene

### ⚰️ Uitvaart Management

- `useFunerals()` - Beheer van alle uitvaarten
- `useFuneral(id)` - Beheer van een specifieke uitvaart
- `useFuneralCosts(funeralId)` - Kosten overzicht van een uitvaart
- `useFuneralCostBreakdown(funeralId)` - Gedetailleerde kosten breakdown

### 🏪 Leveranciers Management

- `useSuppliers()` - Beheer van alle leveranciers
- `useSupplier(id)` - Beheer van een specifieke leverancier
- `useSupplierPricelist(supplierId)` - Beheer van leverancier prijslijst

### 📄 Document Management

- `useDocuments(funeralId)` - Beheer van documenten per uitvaart
- `useDocument(id)` - Beheer van een specifiek document

### 💰 Facturatie & Offertes

- `useFuneralEstimates(funeralId)` - Beheer van offertes
- `useEstimateItems(estimateId)` - Beheer van offerte items
- `useFuneralInvoices(funeralId)` - Beheer van facturen
- `useInvoiceItems(invoiceId)` - Beheer van factuur items

### 🎨 Bedrijfsbranding

- `useCompanyBranding()` - Beheer van bedrijfsbranding en huisstijl

## Gebruik Voorbeelden

### Authenticatie

```tsx
import { useAuth } from "@/hooks";

function ProfileComponent() {
  const { user, profile, updateProfile, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
      <button onClick={() => updateProfile({ company_name: "New Company" })}>
        Update Company
      </button>
    </div>
  );
}
```

### Client Management

```tsx
import { useClients, useClient } from "@/hooks";

function ClientsList() {
  const { clients, isLoading, createClient } = useClients();

  const handleCreateClient = () => {
    createClient({
      preferred_name: "John",
      last_name: "Doe",
      phone_number: "+31612345678",
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={handleCreateClient}>Add Client</button>
      {clients.map((client) => (
        <div key={client.id}>
          {client.preferred_name} {client.last_name}
        </div>
      ))}
    </div>
  );
}
```

### Uitvaart Management

```tsx
import { useFunerals, useFuneralCosts } from "@/hooks";

function FuneralDetails({ funeralId }: { funeralId: string }) {
  const { funeral, updateFuneral } = useFuneral(funeralId);
  const { costs } = useFuneralCosts(funeralId);

  return (
    <div>
      <h2>
        Uitvaart voor {funeral?.deceased?.first_names}{" "}
        {funeral?.deceased?.last_name}
      </h2>
      <p>
        Client: {funeral?.client?.preferred_name} {funeral?.client?.last_name}
      </p>
      <p>Totale kosten: €{costs?.total_cost || 0}</p>

      <button onClick={() => updateFuneral({ location: "Nieuwe locatie" })}>
        Update Locatie
      </button>
    </div>
  );
}
```

### Document Upload

```tsx
import { useDocuments } from "@/hooks";

function DocumentUpload({ funeralId }: { funeralId: string }) {
  const { uploadDocument, isUploading } = useDocuments(funeralId);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadDocument({
        file,
        description: "Contract document",
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} disabled={isUploading} />
      {isUploading && <p>Uploading...</p>}
    </div>
  );
}
```

## Belangrijke Features

### 🔒 Automatische Beveiliging

- Alle hooks respecteren automatisch de RLS policies
- Gebruikers kunnen alleen hun eigen data zien en bewerken
- `entrepreneur_id` wordt automatisch toegevoegd bij het aanmaken van records

### ⚡ Optimistic Updates

- React Query zorgt voor caching en optimistic updates
- Automatische refetch bij mutaties
- Stale time configuratie voor optimale performance

### 📁 File Management

- Automatische upload naar Supabase Storage
- Signed URLs voor veilige downloads
- Organisatie van bestanden per gebruiker en uitvaart

### 💾 Type Safety

- Volledige TypeScript ondersteuning
- Database types worden automatisch gegenereerd
- IntelliSense ondersteuning voor alle properties

## Error Handling

Alle hooks hebben ingebouwde error handling:

```tsx
const { clients, error, isLoading } = useClients();

if (error) {
  return <div>Error: {error.message}</div>;
}

if (isLoading) {
  return <div>Loading...</div>;
}
```

## Performance Tips

1. **Gebruik specifieke hooks** voor single records in plaats van de lijst hooks
2. **Stale time** is geconfigureerd voor optimale caching
3. **Query invalidation** gebeurt automatisch bij mutaties
4. **Parallel queries** kunnen gebruikt worden voor gerelateerde data

## Database Views

De hooks maken gebruik van database views voor complexe queries:

- `funeral_costs` - Totaal kosten per uitvaart
- `funeral_cost_breakdown` - Gedetailleerde kosten breakdown per leverancier

Deze views worden automatisch bijgewerkt wanneer de onderliggende data verandert.
