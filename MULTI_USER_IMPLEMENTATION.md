# Multi-User Support Implementation

Dit document beschrijft de implementatie van multi-user ondersteuning in het Aitvaart CRM systeem.

## Overzicht

Het systeem is uitgebreid van een single-user naar een multi-user architectuur met de volgende kenmerken:

- **Organisaties**: Bedrijven kunnen meerdere gebruikers hebben
- **Rollen**: Verschillende gebruikersrollen met verschillende permissions
- **Gedeelde Toegang**: Begravenissen kunnen worden gedeeld tussen teamleden
- **Granulaire Permissions**: Flexibel permissions systeem

## Database Structuur

### Nieuwe Tabellen

#### 1. Organizations

```sql
- id (uuid, primary key)
- name (text, not null)
- description (text)
- plan_type (basic/premium/enterprise)
- max_users (integer)
- is_active (boolean)
- billing information
```

#### 2. Organization Members

```sql
- id (uuid, primary key)
- organization_id (uuid, foreign key)
- user_id (uuid, foreign key)
- role (owner/admin/editor/viewer)
- status (active/pending/suspended)
- permissions (granular permissions)
```

#### 3. Permissions System

```sql
- permissions (definieer alle beschikbare permissions)
- role_permissions (welke permissions heeft een rol)
- user_permissions (specifieke permissions per gebruiker)
- permission_groups (logische groepering van permissions)
```

#### 4. Funeral Team Assignments

```sql
- id (uuid, primary key)
- funeral_id (uuid, foreign key)
- user_id (uuid, foreign key)
- role (assigned/primary/backup)
- permissions (array van permissions)
```

## Rollen en Permissions

### Rollen

- **Owner**: Volledige toegang tot alle functionaliteiten
- **Admin**: Beheer van gebruikers en organisatie (behalve systeem instellingen)
- **Editor**: Beheer van begravenissen, klanten en leveranciers
- **Viewer**: Alleen leesrechten

### Permissions Systeem

Het nieuwe permissions systeem is flexibel en uitbreidbaar:

```typescript
// Voorbeelden van permissions
- manage_users: Gebruikers beheren
- create_funerals: Begravenissen aanmaken
- edit_funerals: Begravenissen bewerken
- view_financials: Financiële gegevens bekijken
- manage_settings: Instellingen beheren
```

## Implementatie Details

### 1. Database Migraties

#### `20250111000000_add_multi_user_support.sql`

- Voegt organisatie en team structuur toe
- Migreert bestaande data naar nieuwe structuur
- Implementeert Row Level Security (RLS) policies

#### `20250111000001_add_permissions_system.sql`

- Voegt flexibel permissions systeem toe
- Vervangt hardcoded permission kolommen
- Implementeert permission groepen en rollen

### 2. Hooks

#### `useOrganizations.ts`

- Beheer van organisaties
- Gebruikers uitnodigen en beheren
- Organisatie instellingen

#### `usePermissions.ts`

- Permissions beheren
- Rol-based permissions
- User-specific permissions
- Permission checking

### 3. Components

#### `PermissionManager.tsx`

- Visuele interface voor permissions beheer
- Rol-based en user-specific permissions
- Permission groepen

#### `UserManager.tsx`

- Gebruikers beheren binnen organisatie
- Uitnodigingen versturen
- Rollen toewijzen

### 4. RLS Policies

Alle bestaande tabellen zijn bijgewerkt met nieuwe RLS policies:

```sql
-- Voorbeeld: Funerals
create policy "Organization members can access funeral records"
  on funerals for all using (
    organization_id in (
      select organization_id
      from organization_members
      where user_id = auth.uid() and status = 'active'
    )
  );
```

## Gebruik

### 1. Organisatie Beheer

```typescript
// Huidige organisatie ophalen
const { data: userOrganization } = useCurrentUserOrganization();

// Gebruikers beheren
const { data: members } = useOrganizationMembers(organizationId);
```

### 2. Permissions Control

```typescript
// Controleren of gebruiker permission heeft
const { data: canManage } = useHasPermission("manage_users", organizationId);

// Meerdere permissions controleren
const { data: permissions } = useHasPermissions(
  ["create_funerals", "edit_funerals"],
  organizationId
);
```

### 3. Team Assignments

```typescript
// Teamleden toewijzen aan begravenis
```

## Migratie van Bestaande Data

### Automatische Migratie

1. **Organisatie Aanmaken**: Voor elke bestaande gebruiker wordt een default organisatie aangemaakt
2. **Membership**: Bestaande gebruikers worden automatisch eigenaar van hun organisatie
3. **Data Toewijzing**: Alle bestaande data wordt toegewezen aan de juiste organisatie

### Backward Compatibility

- Oude permission kolommen blijven bestaan (als deprecated)
- Bestaande functionaliteit blijft werken
- Geleidelijke migratie naar nieuw systeem

## Voordelen

### 1. Flexibiliteit

- Nieuwe permissions kunnen eenvoudig worden toegevoegd
- Permission groepen voor logische organisatie
- Context-specifieke permissions

### 2. Schaalbaarheid

- Ondersteunt grote teams
- Rol-based access control
- Granulaire permissions

### 3. Beveiliging

- Row Level Security op alle tabellen
- Organisatie-isolatie
- Audit trail voor permissions

### 4. Gebruiksvriendelijkheid

- Intuïtieve interface voor permissions beheer
- Visuele rol en permission management
- Team assignment interface

## Toekomstige Uitbreidingen

### 1. Advanced Permissions

- Time-based permissions
- Resource-specific permissions
- Conditional permissions

### 2. Audit Logging

- Permission changes tracking
- User activity logging
- Security monitoring

### 3. API Integration

- REST API voor permissions
- Webhook support
- Third-party integrations

## Conclusie

De multi-user implementatie biedt een solide basis voor team-gebaseerd beheer van begravenissen. Het flexibele permissions systeem maakt het mogelijk om de toegang precies af te stemmen op de behoeften van elke organisatie, terwijl de bestaande functionaliteit behouden blijft.
