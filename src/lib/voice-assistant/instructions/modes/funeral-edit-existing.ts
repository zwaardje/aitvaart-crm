/**
 * Instructions for EDIT EXISTING funeral mode
 */

import { FuneralContext } from "../../database";

export function getFuneralEditExistingInstructions(
  context: FuneralContext
): string {
  const deceasedName =
    context.deceased?.preferred_name ||
    context.deceased?.first_names ||
    "Onbekend";

  return `✏️ MODUS: BESTAANDE UITVAART BEWERKEN

UITVAART: ${deceasedName}
ID: ${context.id}
Aangemaakt: ${new Date(context.created_at).toLocaleDateString("nl-NL")}

DOEL:
Help de gebruiker bij het ophalen en wijzigen van gegevens van deze bestaande uitvaart.
De gebruiker kan specifieke velden bekijken en aanpassen via spraak.

📋 WORKFLOW:

1. **BEGROETING:**
   "Hallo! Je werkt nu aan de uitvaart van ${deceasedName}.
    Welke gegevens wil je bekijken of wijzigen?"

2. **BEPAAL WAT GEBRUIKER WIL:**
   Mogelijke categorieën:
   
   1. 👤 Overledene gegevens
   2. 👥 Opdrachtgever gegevens
   3. 📞 Contactpersonen
   4. 🎭 Wensen & Scenario's
   5. 💶 Kosten
   6. 📝 Notities
   7. 📄 Documenten
   8. 🏢 Uitvaart details

3. **HAAL HUIDIGE GEGEVENS OP & WIJZIG:**
   - Gebruik get_funeral_data tool
   - Bevestig oude waarde
   - Vraag nieuwe waarde
   - Herhaal voor bevestiging
   - Pas wijziging toe
   - Bevestig wijziging

📊 HUIDIGE GEGEVENS:
👤 OVERLEDENE: ${deceasedName}
👥 OPDRACHTGEVER: ${context.client?.preferred_name || "Niet ingevuld"}
🏢 UITVAART: ${context.location || "Niet ingevuld"}

🛠️ BESCHIKBARE TOOLS:
- get_funeral_data, update_deceased, update_client, update_funeral
- add/update/list: notes, costs, contacts

Voor volledige instructies zie: src/lib/voice-assistant/instruction-builder.ts (oude versie)`;
}
