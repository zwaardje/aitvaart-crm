# Progressive Web App (PWA) Setup

## ✅ Wat is toegevoegd

### 1. Web App Manifest (`/public/manifest.json`)

Het manifest maakt de app installeerbaar op mobiele apparaten en definieert:

- **App naam & beschrijving**: "Aitvaart CRM"
- **Display mode**: `standalone` (opent zonder browser UI)
- **Theme colors**: Zwart (#0a0a0a) voor consistent uiterlijk
- **Start URL**: `/dashboard` (opent direct in het dashboard)
- **App iconen**: SVG + PNG formaten voor verschillende apparaten
- **Shortcuts**: Snelkoppelingen naar "Nieuwe uitvaart" en "Dashboard"

### 2. App Iconen (`/public/icons/`)

- **icon.svg**: Vector icon dat schaalt naar alle formaten
- **icon-192.png**: Standaard app icon (192x192px)
- **icon-512.png**: Hoge resolutie icon (512x512px)

> 💡 **Tip**: Vervang deze placeholder iconen met je eigen design. Zie `/public/icons/README.md` voor instructies.

### 3. Meta Tags (in `src/app/layout.tsx`)

Toegevoegde optimalisaties voor mobiele apparaten:

#### Viewport Configuratie

```typescript
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};
```

#### PWA Meta Tags

- **Apple Web App**: Specifieke configuratie voor iOS apparaten
- **Mobile Web App**: Algemene mobile app instellingen
- **Theme Color**: Consistent kleurenschema (#0a0a0a)
- **App Icons**: Links naar verschillende icon formaten

### 4. Extra Bestanden

- **robots.txt**: Zoekrobots configuratie (private app)
- **browserconfig.xml**: Windows tile configuratie
- **offline.html**: Offline fallback pagina (voor toekomstige service worker)

## 📱 Hoe te testen

### Op iPhone/iPad (Safari)

1. Open de app in Safari
2. Tik op het "Delen" icoon (vierkant met pijl omhoog)
3. Scroll naar beneden en tik op "Zet op beginscherm"
4. Bevestig de naam en tik op "Voeg toe"
5. De app verschijnt nu als icon op je beginscherm

### Op Android (Chrome)

1. Open de app in Chrome
2. Tik op het menu (drie puntjes rechtsboven)
3. Tik op "App installeren" of "Toevoegen aan startscherm"
4. Bevestig de installatie
5. De app verschijnt nu als icon op je startscherm

### Op Desktop (Chrome/Edge)

1. Open de app in Chrome of Edge
2. Kijk naar de adresbalk voor een installatie-icoon (+)
3. Klik op het icoon en bevestig de installatie
4. De app opent in een eigen venster

## 🔍 Installatie Testen met DevTools

### Chrome DevTools

1. Open DevTools (F12 of Cmd+Option+I)
2. Ga naar de "Application" tab
3. Klik op "Manifest" in het menu links
4. Controleer of alle velden correct zijn ingevuld
5. Klik op "Service Workers" om te zien of de app installeerbaar is

### Lighthouse Audit

1. Open DevTools → "Lighthouse" tab
2. Selecteer "Progressive Web App"
3. Klik op "Analyze page load"
4. Bekijk de PWA score en aanbevelingen

## 🚀 Verwachte Resultaten

Na installatie:

- ✅ App opent in standalone mode (geen browser UI)
- ✅ App icon verschijnt op home screen
- ✅ Splash screen met app icon en naam
- ✅ Theme color matcht app design (#0a0a0a)
- ✅ Shortcuts werken (nieuwe uitvaart, dashboard)

## 📊 PWA Checklist

- [x] Web App Manifest aanwezig
- [x] App icons in meerdere formaten
- [x] Viewport meta tag geconfigureerd
- [x] Theme color ingesteld
- [x] Apple-specifieke meta tags
- [x] Standalone display mode
- [x] Start URL gedefinieerd
- [ ] Service Worker (volgende stap)
- [ ] Offline ondersteuning (volgende stap)
- [ ] Push notificaties (toekomstig)

## 🔜 Volgende Stappen

### Fase 2: Service Worker

- Cache strategie implementeren
- Offline functionaliteit toevoegen
- Background sync voor forms

### Fase 3: Advanced Features

- Push notificaties
- Periodic background sync
- Share target API

## 🛠️ Onderhoud

### Manifest Updaten

Bij het wijzigen van de app naam, kleuren of iconen:

1. Update `/public/manifest.json`
2. Update meta tags in `src/app/layout.tsx`
3. Vervang iconen in `/public/icons/`
4. Test de installatie opnieuw

### Browser Cache

Bij grote wijzigingen aan het manifest:

1. Gebruikers moeten de app opnieuw installeren
2. Of: Implementeer versioning in de manifest
3. Of: Gebruik service worker om updates te forceren

## 📚 Bronnen

- [Web App Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [iOS PWA Guidelines](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [Maskable Icons](https://web.dev/maskable-icon/)
