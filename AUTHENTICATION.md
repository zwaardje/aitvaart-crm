# Authenticatie Setup - Uitvaart CRM

Deze applicatie gebruikt Supabase Auth direct voor authenticatie en autorisatie. Supabase Auth wordt gebruikt via client-side forms en middleware voor route protection.

## 🚀 Setup

### 1. Environment Variabelen

Voeg de volgende variabelen toe aan je `.env.local` bestand:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 2. Supabase Setup

Zorg ervoor dat je Supabase project de volgende configuratie heeft:

- **Row Level Security (RLS)** is ingeschakeld op alle tabellen
- **Auth policies** zijn correct geconfigureerd
- **Profiles tabel** bestaat en is gekoppeld aan `auth.users`

### 3. Database Schema

De authenticatie werkt met de volgende database structuur:

```sql
-- Profiles tabel (automatisch aangemaakt via trigger)
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  full_name text,
  company_name text,
  phone_number text,
  avatar_url text
);

-- RLS Policy
CREATE POLICY "Profiles are viewable by owner only"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
```

## 🔐 Authenticatie Flow

### 1. Registratie (Sign Up)

- Gebruiker vult formulier in op `/auth/signup`
- Account wordt aangemaakt in Supabase Auth via `supabase.auth.signUp()`
- Als email verificatie vereist is, wordt gebruiker geïnformeerd om email te controleren
- Als email al bevestigd is (bijv. in development mode), wordt gebruiker doorgestuurd naar login pagina
- Profiel wordt automatisch aangemaakt via database trigger

### 2. Inloggen (Sign In)

- Gebruiker vult credentials in op `/auth/signin`
- Supabase Auth valideert credentials via `supabase.auth.signInWithPassword()`
- Session wordt aangemaakt en opgeslagen in cookies via Supabase SSR
- Gebruiker wordt doorgestuurd naar dashboard

### 3. Route Protection

- Middleware gebruikt Supabase SSR pattern om session te refreshen
- Middleware beschermt alle routes behalve auth pagina's
- Ongeauthenticeerde gebruikers worden doorgestuurd naar login
- Authenticated gebruikers worden doorgestuurd naar dashboard als ze auth pagina's bezoeken

## 📁 Bestanden Overzicht

### Authenticatie Configuratie

- `middleware.ts` - Route protection middleware (gebruikt Supabase SSR pattern)
- `src/lib/supabase/browser.ts` - Browser Supabase client voor client-side auth
- `src/lib/supabase/server.ts` - Server Supabase client voor server-side auth
- `src/lib/auth-utils.ts` - Auth utility hooks (`useCurrentUser`, `useCurrentUserId`)
- `src/lib/auth.ts` - **@deprecated** NextAuth configuratie (niet gebruikt)
- `src/app/api/auth/[...nextauth]/route.ts` - **@deprecated** NextAuth API route (niet gebruikt)

### Authenticatie Pagina's

- `src/app/auth/signin/page.tsx` - Login pagina
- `src/app/auth/signup/page.tsx` - Registratie pagina
- `src/app/auth/forgot-password/page.tsx` - Wachtwoord reset pagina

### Hooks & Components

- `src/hooks/useAuth.ts` - Authenticatie hook (gebruikt Supabase Auth)
- `src/components/auth/AuthGuard.tsx` - Auth guard component
- `src/components/forms/SignInForm.tsx` - Login formulier
- `src/components/forms/SignUpForm.tsx` - Registratie formulier
- `src/app/dashboard/page.tsx` - Beschermde dashboard pagina

## 🎨 UI Features

### Tailwind CSS Styling

- Moderne, responsive design
- Consistent kleurenschema (Indigo primary)
- Loading states en error handling
- Form validatie met react-hook-form

### Form Validatie

- Zod schema validatie
- Real-time error messages
- Nederlandse error messages
- Accessibility features

## 🔧 Gebruik

### useAuth Hook

```tsx
import { useAuth } from "@/hooks";

function MyComponent() {
  const { user, profile, isLoading, isAuthenticated, updateProfile, signOut } =
    useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Direct Supabase Auth Usage

```tsx
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useCurrentUser } from "@/lib/auth-utils";

function MyComponent() {
  const { user, loading } = useCurrentUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return <div>Hello {user.email}</div>;
}
```

## 🛡️ Beveiliging

### Row Level Security (RLS)

- Alle database queries respecteren automatisch RLS policies
- Gebruikers kunnen alleen hun eigen data zien en bewerken
- `entrepreneur_id` wordt automatisch toegevoegd bij nieuwe records

### Session Management

- Supabase Auth gebruikt JWT tokens voor session management
- Tokens worden automatisch opgeslagen in cookies via Supabase SSR
- Middleware refresht automatisch de session bij elke request
- Tokens bevatten user ID en andere essentiële informatie

### Route Protection

- Middleware beschermt alle routes
- Publieke routes: `/`, `/auth/*`
- Beschermde routes: `/dashboard`, `/api/*` (behalve auth)

## 🚨 Troubleshooting

### Veelvoorkomende Problemen

1. **"No user logged in" errors**

   - Controleer of Supabase environment variabelen correct zijn ingesteld
   - Verificeer of Supabase auth is ingeschakeld in je Supabase project
   - Check of cookies correct worden opgeslagen (check browser developer tools)

2. **RLS Policy errors**

   - Controleer of RLS policies correct zijn ingesteld
   - Verificeer of `auth.uid()` correct werkt
   - Check database permissions

3. **Session niet persistent**
   - Verificeer cookie settings in browser
   - Check of middleware correct de session refresht
   - Controleer Supabase project settings voor auth configuratie
   - Check of email verificatie niet vereist is (in development mode)

### Debug Tips

- Gebruik browser developer tools om cookies te inspecteren
- Check Supabase dashboard voor auth logs
- Verificeer network requests in browser
- Controleer server logs voor errors

## 📚 Aanvullende Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Validation Documentation](https://zod.dev/)

## ⚠️ Opmerkingen

- **NextAuth is niet meer in gebruik**: De applicatie gebruikt nu direct Supabase Auth. NextAuth bestanden zijn gemarkeerd als `@deprecated` maar blijven in de codebase voor referentie.
- **Email Verificatie**: Standaard vereist Supabase email verificatie. In development mode kan dit worden uitgeschakeld in Supabase project settings.
