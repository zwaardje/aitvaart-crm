# App Iconen

## Huidige Status

De app gebruikt momenteel een placeholder SVG icon (`icon.svg`) dat automatisch schaalt naar alle formaten.

## Echte PNG Iconen Genereren

Om echte PNG iconen te genereren uit de SVG, heb je verschillende opties:

### Optie 1: Online Tool

1. Ga naar https://realfavicongenerator.net/
2. Upload je `icon.svg` bestand
3. Download de gegenereerde iconen
4. Vervang de bestanden in deze folder

### Optie 2: ImageMagick (Command Line)

Als je ImageMagick geïnstalleerd hebt:

```bash
# Installeer ImageMagick (macOS)
brew install imagemagick

# Genereer PNG's
cd public/icons
magick icon.svg -resize 192x192 icon-192.png
magick icon.svg -resize 512x512 icon-512.png
```

### Optie 3: Figma/Adobe Illustrator

1. Open `icon.svg` in je design tool
2. Exporteer als PNG in de volgende formaten:
   - 192x192px → `icon-192.png`
   - 512x512px → `icon-512.png`

## Benodigde Formaten

- `icon.svg` - Vector formaat (schaalt naar alle formaten)
- `icon-192.png` - Standaard app icon
- `icon-512.png` - Hoge resolutie app icon

## Design Richtlijnen

- Gebruik een eenvoudig, herkenbaar ontwerp
- Zorg voor voldoende contrast
- Test hoe het icon eruitziet op zowel lichte als donkere achtergronden
- Houd rekening met "safe zone" voor maskable icons (80% van de totale grootte)
