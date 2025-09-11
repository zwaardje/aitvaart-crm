# Environment Setup

Deze applicatie heeft de volgende environment variables nodig om correct te functioneren.

## Vereiste Environment Variables

### Supabase Configuration

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Stream Video SDK Configuration

```bash
# Stream Video SDK (voor voice assistant)
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

### NextAuth Configuration

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key
```

### Google OAuth (Optional)

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Microsoft OAuth (Optional)

```bash
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
MICROSOFT_TENANT_ID=common
```

### Email Configuration (Optional)

```bash
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com
```

## Setup Instructies

1. **Maak een `.env.local` bestand** in de root directory van het project
2. **Voeg de bovenstaande environment variables toe** met je eigen waarden
3. **Herstart de development server** (`npm run dev`)

## Waar vind je deze waarden?

### Supabase

1. Ga naar [supabase.com](https://supabase.com)
2. Log in op je account
3. Selecteer je project
4. Ga naar **Settings** > **API**
5. Kopieer de **Project URL** en **anon public** key
6. Voor de service role key, ga naar **Settings** > **API** > **Service Role** (let op: deze is gevoelig!)

### Stream Video SDK

1. Ga naar [getstream.io](https://getstream.io)
2. Maak een account en log in
3. Ga naar je dashboard en selecteer "Video & Audio"
4. Kopieer je **API Key** en **API Secret** uit de credentials sectie
5. Gebruik dezelfde API Key voor zowel `NEXT_PUBLIC_STREAM_API_KEY` als `STREAM_API_KEY`

### NextAuth Secret

Genereer een willekeurige string voor `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### Google OAuth Setup

1. Ga naar [Google Cloud Console](https://console.cloud.google.com)
2. Maak een nieuw project of selecteer een bestaand project
3. Ga naar **APIs & Services** > **Credentials**
4. Klik op **Create Credentials** > **OAuth 2.0 Client IDs**
5. Selecteer **Web application**
6. Voeg toe aan **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Kopieer de **Client ID** en **Client Secret**

### Microsoft OAuth Setup

1. Ga naar [Azure Portal](https://portal.azure.com)
2. Ga naar **Azure Active Directory** > **App registrations**
3. Klik op **New registration**
4. Voer een naam in en selecteer **Accounts in any organizational directory**
5. Voeg toe aan **Redirect URI**:
   - `http://localhost:3000/api/auth/callback/microsoft` (development)
   - `https://yourdomain.com/api/auth/callback/microsoft` (production)
6. Ga naar **Certificates & secrets** en maak een **New client secret**
7. Kopieer de **Application (client) ID** en **Client secret**

### Email Setup (Gmail)

1. Schakel **2-factor authentication** in op je Gmail account
2. Genereer een **App Password**:
   - Ga naar Google Account settings
   - Security > 2-Step Verification > App passwords
   - Genereer een app password voor "Mail"
3. Gebruik je Gmail adres en het app password in de environment variables

## Development vs Production

- **Development**: Alleen `NEXT_PUBLIC_SUPABASE_URL` en `NEXT_PUBLIC_SUPABASE_ANON_KEY` zijn vereist
- **Production**: Alle environment variables zijn vereist

## Troubleshooting

### "SUPABASE_SERVICE_ROLE_KEY is required" Error

Dit betekent dat de service role key ontbreekt. Voor development is dit optioneel, maar voor productie is het vereist.

### "Invalid input" ZodError

Controleer of alle vereiste environment variables correct zijn ingesteld en de juiste lengte hebben.
