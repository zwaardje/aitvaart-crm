// Categorieën en subcategorieën voor prijslijstitems
// Gebaseerd op screenshots en gebruikersvereisten

export const CATEGORY_OPTIONS = [
  { value: "omhulsel", label: "Omhulsel" },
  { value: "verzorging", label: "Verzorging" },
  { value: "techniek", label: "Techniek" },
  { value: "transport", label: "Transport" },
  { value: "ceremonie", label: "Ceremonie" },
  { value: "bloemen", label: "Bloemen" },
  { value: "overig", label: "Overig" },
];

export const SUBCATEGORY_OPTIONS: Record<string, { value: string; label: string }[]> = {
  omhulsel: [
    { value: "uitvaartkist", label: "Uitvaartkist" },
    { value: "urn", label: "Urn" },
    { value: "linnenkist", label: "Linnenkist" },
    { value: "wade", label: "Wade" },
  ],
  verzorging: [
    { value: "laatste_verzorging", label: "Laatste verzorging" },
    { value: "thanatopraxie", label: "Thanatopraxie" },
    { value: "opbaring", label: "Opbaring" },
    { value: "aankleden", label: "Aankleden" },
  ],
  techniek: [
    { value: "geluid", label: "Geluid" },
    { value: "beeld", label: "Beeld" },
    { value: "verlichting", label: "Verlichting" },
    { value: "spreekgestoelte", label: "Spreekgestoelte" },
  ],
  transport: [
    { value: "rouwauto", label: "Rouwauto" },
    { value: "bestelwagen", label: "Bestelwagen" },
    { value: "dragers", label: "Dragers" },
  ],
  ceremonie: [
    { value: "ceremoniemeester", label: "Ceremoniemeester" },
    { value: "locatie", label: "Locatie" },
    { value: "catering", label: "Catering" },
  ],
  bloemen: [
    { value: "boeket", label: "Boeket" },
    { value: "krans", label: "Krans" },
    { value: "stuk", label: "Stuk" },
  ],
  overig: [
    { value: "drukwerk", label: "Drukwerk" },
    { value: "obductie", label: "Obductie" },
    { value: "andere", label: "Andere" },
  ],
};

export function getSubcategoryOptions(category: string | null | undefined) {
  if (!category) return [];
  return SUBCATEGORY_OPTIONS[category] || [];
}

