# Supabase Invite System Setup Guide

## 🚀 Supabase Native Invite Flow

This system now uses Supabase's native `inviteUserByEmail` functionality, which provides:

- **Built-in email sending** (no SMTP configuration needed)
- **Secure token management** (handled by Supabase)
- **OAuth integration** (seamless sign-in flow)
- **Automatic user creation** (for new users)

## ⚙️ Configuration

Add these environment variables to your `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application URL (for invite redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔧 Supabase Setup

1. **Enable Email Auth** in Supabase Dashboard:

   - Go to Authentication → Settings
   - Enable "Enable email confirmations"
   - Configure your email templates

2. **Configure OAuth Providers** (optional):
   - Go to Authentication → Providers
   - Enable Google OAuth (recommended)
   - Configure redirect URLs

## 🚀 Database Migration

Run the invite system migration:

```bash
supabase db push --include-all
```

## ✨ Features

### For Existing Users:

- **Direct Addition**: Users are added immediately to the organization
- **No Email Required**: Direct database insertion
- **Dashboard Access**: Immediate access to the application

### For New Users:

- **Supabase Invite**: Uses Supabase's native invite system
- **Professional Email**: Supabase handles email sending and styling
- **OAuth Sign-in**: Seamless Google OAuth integration
- **Auto Account Creation**: User account created automatically
- **Secure Flow**: Token-based authentication handled by Supabase

### Admin Features:

- **Simple Invite Process**: Just email, role, and permissions
- **Real-time Updates**: Immediate feedback on invite status
- **Organization Management**: Full team member management
- **Permission Control**: Granular permission system

## 🎯 Usage

1. **Send Invite**: Go to Settings → Team Members → Invite Member
2. **Fill Details**: Enter email, role, and permissions
3. **Supabase Handles**: Email sending, token management, user creation
4. **User Signs In**: User clicks invite link and signs in with OAuth
5. **Auto-Add**: User is automatically added to organization

## 🔒 Security

- **Token Expiry**: Invites expire after 7 days
- **Email Validation**: Only invited email can accept invite
- **Permission Checks**: Only admins/owners can send invites
- **RLS Policies**: Database-level security for all operations

## 📊 Tracking

The system tracks:

- Email sent timestamp
- Email opened timestamp (if implemented)
- Email clicked timestamp (if implemented)
- Invite accepted/declined timestamp
- User who accepted/declined

## 🛠️ Customization

### Email Templates

- Edit `src/lib/email/templates.ts`
- Customize HTML styling and content
- Add organization branding

### Invite Expiry

- Change expiry time in migration file
- Default is 7 days

### Permissions

- Modify permission structure in database
- Update UI components accordingly
