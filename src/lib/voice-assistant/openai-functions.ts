/**
 * OpenAI function definitions for the voice assistant
 */
export const OPENAI_FUNCTIONS = [
  {
    name: "add_note",
    description: "Voeg een notitie toe aan de uitvaart",
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "De inhoud van de notitie",
        },
        title: {
          type: "string",
          description: "Een korte titel voor de notitie (optioneel)",
        },
        is_important: {
          type: "boolean",
          description: "Of de notitie belangrijk is (standaard: false)",
        },
      },
      required: ["content"],
    },
  },
  {
    name: "add_cost",
    description: "Voeg kosten toe aan de uitvaart",
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "Het bedrag in euro's",
        },
        description: {
          type: "string",
          description: "Beschrijving van de kosten",
        },
      },
      required: ["amount", "description"],
    },
  },
  {
    name: "add_contact",
    description: "Voeg een contact toe aan de uitvaart",
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "De volledige naam van het contact",
        },
        phone: {
          type: "string",
          description: "Telefoonnummer (optioneel)",
        },
        email: {
          type: "string",
          description: "Email adres (optioneel)",
        },
        relationship: {
          type: "string",
          description:
            "Relatie tot de overledene (bijv. 'Familie', 'Vriend', 'Collega')",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "get_funeral_info",
    description: "Krijg informatie over de huidige uitvaart",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "search_funeral_by_name",
    description:
      "Zoek naar uitvaartgegevens op basis van de naam van de overledene",
    parameters: {
      type: "object",
      properties: {
        deceased_name: {
          type: "string",
          description: "De naam van de overledene om naar te zoeken",
        },
      },
      required: ["deceased_name"],
    },
  },
];

/**
 * Sanitize BSN to protect PII - only show last 4 digits
 */
function sanitizeBSN(bsn: string | null | undefined): string {
  if (!bsn || bsn === "Onbekend") {
    return "Onbekend";
  }
  // Show only last 4 digits, mask the rest
  if (bsn.length >= 4) {
    return `****${bsn.slice(-4)}`;
  }
  return "REDACTED";
}

/**
 * Sanitize phone number to protect PII - only show last 4 digits
 */
function sanitizePhone(phone: string | null | undefined): string {
  if (!phone || phone === "Onbekend") {
    return "Onbekend";
  }
  // Remove all non-digits and show only last 4 digits
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 4) {
    return `****${digits.slice(-4)}`;
  }
  return "REDACTED";
}

/**
 * Sanitize address to protect PII - only show city
 */
function sanitizeAddress(
  street: string | null | undefined,
  houseNumber: string | null | undefined,
  city: string | null | undefined
): string {
  if (!city || city === "Onbekend") {
    return "Onbekend";
  }
  return `${city}`;
}

/**
 * Sanitize name to protect PII - only show first name and first letter of last name
 */
function sanitizeName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  if (!firstName || firstName === "Onbekend") {
    return "Onbekend";
  }
  const lastInitial = lastName ? ` ${lastName.charAt(0)}.` : "";
  return `${firstName}${lastInitial}`;
}

/**
 * Generate funeral-specific instructions for the AI
 */
export function generateFuneralInstructions(
  funeralId: string,
  funeralContext: any
): string {
  return `
Je bent een Nederlandse voice assistant voor uitvaartbegeleiders. 
Je helpt bij het beheren van uitvaarten en hun details.

HUIDIGE UITVAART CONTEXT:
- Uitvaart ID: ${funeralId}
- Status: Actief
- Aangemaakt: ${funeralContext?.created_at || "Onbekend"}
- Laatst bijgewerkt: ${funeralContext?.updated_at || "Onbekend"}

👤 OVERLEDENE:
- Naam: ${sanitizeName(
    funeralContext?.deceased?.preferred_name ||
      funeralContext?.deceased?.first_names,
    funeralContext?.deceased?.last_name
  )}
- Geboortedatum: ${funeralContext?.deceased?.date_of_birth || "Onbekend"}
- Overlijdensdatum: ${funeralContext?.deceased?.date_of_death || "Onbekend"}
- Geboorteplaats: ${funeralContext?.deceased?.place_of_birth || "Onbekend"}
- Geslacht: ${funeralContext?.deceased?.gender || "Onbekend"}
- BSN: ${sanitizeBSN(funeralContext?.deceased?.social_security_number)}

👥 OPDRACHTGEVER:
- Naam: ${sanitizeName(
    funeralContext?.client?.preferred_name,
    funeralContext?.client?.last_name
  )}
- Geslacht: ${funeralContext?.client?.gender || "Onbekend"}
- Geboortedatum: ${funeralContext?.client?.date_of_birth || "Onbekend"}
- Geboorteplaats: ${funeralContext?.client?.place_of_birth || "Onbekend"}
- Locatie: ${sanitizeAddress(
    funeralContext?.client?.street,
    funeralContext?.client?.house_number,
    funeralContext?.client?.city
  )}
- Postcode: ${funeralContext?.client?.postal_code || "Onbekend"}
- Telefoon: ${sanitizePhone(funeralContext?.client?.phone_number)}

🏢 UITVAART DETAILS:
- Locatie: ${funeralContext?.location || "Nog niet bepaald"}
- Uitvaartleider: ${funeralContext?.funeral_director || "Nog niet toegewezen"}
- Ondertekend op: ${funeralContext?.signing_date || "Nog niet ondertekend"}

FUNCTIONALITEITEN:
Je kunt helpen met:
- Notities toevoegen en beheren
- Kosten bijhouden en leveranciers
- Contacten van familie en vrienden
- Documenten zoeken en organiseren
- Scenario's doorlopen voor verschillende onderdelen
- Zoeken naar uitvaarten op basis van overledene naam
- Algemene vragen over uitvaartbegeleiding

DATABASE FUNCTIONALITEIT:
Je kunt direct data toevoegen aan de database door te zeggen:
- "Voeg notitie toe: [jouw notitie]" - voegt een notitie toe
- "Voeg kosten toe: [bedrag] voor [beschrijving]" - voegt kosten toe
- "Voeg contact toe: naam [naam] telefoon [nummer] email [email]" - voegt contact toe
- "Zoek uitvaart voor [naam overledene]" - zoekt naar uitvaart op basis van naam en schakelt automatisch naar die context
- "Wat weet je over deze uitvaart?" - toont alle beschikbare informatie

CONTEXT SWITCHING:
Wanneer je een uitvaart zoekt via naam, wordt de context automatisch bijgewerkt naar die uitvaart. 
Alle volgende commando's werken dan binnen die nieuwe uitvaart context.

Wanneer je data toevoegt, bevestig dit altijd met een korte samenvatting en verwijs naar de overledene.

Wees vriendelijk, professioneel en spreek Nederlands.
Geef korte, duidelijke antwoorden en vraag door als je meer informatie nodig hebt.
`;
}

/**
 * Create function call from transcript using OpenAI function definitions
 */
export function createFunctionCallFromTranscript(
  transcript: string,
  functionName: string,
  functions: any[]
): any | null {
  const lowerTranscript = transcript.toLowerCase();

  // Find the function definition
  const functionDef = functions.find((f) => f.name === functionName);
  if (!functionDef) return null;

  switch (functionName) {
    case "add_note":
      if (
        lowerTranscript.includes("notitie") ||
        lowerTranscript.includes("note")
      ) {
        // Extract content using regex patterns
        let content = null;
        if (
          lowerTranscript.includes("voeg") &&
          lowerTranscript.includes("notitie") &&
          lowerTranscript.includes("toe")
        ) {
          const match = transcript.match(/voeg\s+notitie\s+toe\s*:?\s*(.+)/i);
          if (match) {
            content = match[1].trim();
          }
        } else {
          // Try other patterns
          const patterns = [
            /notitie\s*:?\s*(.+)/i,
            /note\s*:?\s*(.+)/i,
            /voeg\s+toe\s*:?\s*(.+)/i,
          ];
          for (const pattern of patterns) {
            const match = transcript.match(pattern);
            if (match) {
              content = match[1].trim();
              break;
            }
          }
        }

        if (content) {
          return {
            name: "add_note",
            arguments: {
              content: content,
              title: `Notitie: ${content.substring(0, 50)}${
                content.length > 50 ? "..." : ""
              }`,
              is_important:
                lowerTranscript.includes("belangrijk") ||
                lowerTranscript.includes("urgent"),
            },
          };
        }
      }
      break;

    case "add_cost":
      if (
        lowerTranscript.includes("kosten") ||
        lowerTranscript.includes("cost")
      ) {
        // Try different patterns for cost extraction
        let costInfo = null;

        // Pattern: "voeg kosten toe: 500 euro voor bloemen"
        if (
          lowerTranscript.includes("voeg") &&
          lowerTranscript.includes("kosten") &&
          lowerTranscript.includes("toe")
        ) {
          const match = transcript.match(/voeg\s+kosten\s+toe\s*:?\s*(.+)/i);
          if (match) {
            const costText = match[1].trim();
            costInfo = extractCostFromTranscript(costText);
          }
        }

        // Fallback to original extraction
        if (!costInfo) {
          costInfo = extractCostFromTranscript(transcript);
        }

        if (costInfo) {
          return {
            name: "add_cost",
            arguments: {
              amount: costInfo.amount,
              description: costInfo.description,
            },
          };
        }
      }
      break;

    case "add_contact":
      if (
        lowerTranscript.includes("contact") ||
        lowerTranscript.includes("persoon")
      ) {
        const contactInfo = extractContactFromTranscript(transcript);
        if (contactInfo) {
          return {
            name: "add_contact",
            arguments: {
              name: contactInfo.name,
              phone: contactInfo.phone,
              email: contactInfo.email,
              relationship: "Familie",
            },
          };
        }
      }
      break;

    case "get_funeral_info":
      if (
        lowerTranscript.includes("info") ||
        lowerTranscript.includes("informatie") ||
        lowerTranscript.includes("wat") ||
        lowerTranscript.includes("wie")
      ) {
        return {
          name: "get_funeral_info",
          arguments: {},
        };
      }
      break;

    case "search_funeral_by_name":
      if (
        lowerTranscript.includes("zoek") ||
        lowerTranscript.includes("vind") ||
        lowerTranscript.includes("uitvaart") ||
        lowerTranscript.includes("overledene")
      ) {
        // Extract name from transcript
        const namePatterns = [
          /(?:zoek|vind|uitvaart)\s+(?:naar\s+)?([a-zA-Z\s]+?)(?:\s+uitvaart|\s+overledene|\s*$)/i,
          /(?:uitvaart|overledene)\s+([a-zA-Z\s]+?)(?:\s*$)/i,
          /(?:voor|van)\s+([a-zA-Z\s]+?)(?:\s*$)/i,
        ];

        for (const pattern of namePatterns) {
          const match = lowerTranscript.match(pattern);
          if (match) {
            const deceasedName = match[1].trim();
            if (deceasedName && deceasedName.length > 1) {
              return {
                name: "search_funeral_by_name",
                arguments: {
                  deceased_name: deceasedName,
                },
              };
            }
          }
        }
      }
      break;
  }

  return null;
}

// Import helper functions (these would be in the same module)
function extractCostFromTranscript(
  transcript: string
): { amount: number; description: string } | null {
  const lowerTranscript = transcript.toLowerCase();

  // Look for patterns like "€50", "50 euro", "50 euro's", etc.
  const amountMatch = lowerTranscript.match(
    /(?:€|euro|euro's?)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:€|euro|euro's?)/
  );

  if (!amountMatch) return null;

  const amount = parseFloat(
    (amountMatch[1] || amountMatch[2]).replace(",", ".")
  );

  // Extract description - look for "voor" or "for"
  const descriptionMatch = lowerTranscript.match(/(?:voor|for)\s+(.+)/);
  const description = descriptionMatch
    ? descriptionMatch[1].trim()
    : "Onbekende kosten";

  return { amount, description };
}

function extractContactFromTranscript(
  transcript: string
): { name: string; phone?: string; email?: string } | null {
  const lowerTranscript = transcript.toLowerCase();

  // Try multiple patterns for name extraction
  let name = null;

  // Pattern 1: "voeg contact toe: [naam]"
  const pattern1 = lowerTranscript.match(
    /voeg\s+contact\s+toe\s*:?\s*(.+?)(?:\s+telefoon|\s+email|\s+tel|\s*$)/i
  );
  if (pattern1) {
    name = pattern1[1].trim();
  }

  // Pattern 2: "contact: [naam]"
  if (!name) {
    const pattern2 = lowerTranscript.match(
      /contact\s*:?\s*(.+?)(?:\s+telefoon|\s+email|\s+tel|\s*$)/i
    );
    if (pattern2) {
      name = pattern2[1].trim();
    }
  }

  // Pattern 3: "naam [naam]"
  if (!name) {
    const pattern3 = lowerTranscript.match(
      /(?:naam|name)\s+([a-zA-Z\s]+?)(?:\s|$|telefoon|phone|email)/i
    );
    if (pattern3) {
      name = pattern3[1].trim();
    }
  }

  // Pattern 4: Just look for words that could be names (fallback)
  if (!name) {
    const words = transcript.split(/\s+/);
    // Take first 2-3 words as potential name
    if (words.length >= 1) {
      name = words.slice(0, Math.min(3, words.length)).join(" ").trim();
    }
  }

  if (!name) return null;

  // Look for phone patterns (multiple formats)
  const phonePatterns = [
    /(?:telefoon|phone|tel|mobiel|mobile)\s*:?\s*([0-9\s\-\+\(\)]+)/i,
    /(\+31\s*[0-9\s\-\(\)]+)/i, // Dutch phone numbers
    /(0[0-9]{1,2}\s*[0-9\s\-\(\)]{8,})/i, // Dutch phone numbers without country code
  ];

  let phone = undefined;
  for (const pattern of phonePatterns) {
    const phoneMatch = lowerTranscript.match(pattern);
    if (phoneMatch) {
      phone = phoneMatch[1].trim();
      break;
    }
  }

  // Look for email patterns
  const emailPatterns = [
    /(?:email|e-mail|mail)\s*:?\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i, // Just email pattern
  ];

  let email = undefined;
  for (const pattern of emailPatterns) {
    const emailMatch = lowerTranscript.match(pattern);
    if (emailMatch) {
      email = emailMatch[1].trim();
      break;
    }
  }

  return { name, phone, email };
}
