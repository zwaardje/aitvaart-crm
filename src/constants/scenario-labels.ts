// Shared constants for scenario sections and item types
// Used across wishes page and scenario forms

export const SECTION_LABELS: Record<string, string> = {
  soort_uitvaart: "Soort uitvaart",
  verzorging_en_opbaring: "Verzorging en opbaring",
  ceremonie: "Ceremonie",
  kosten: "Kosten",
};

export const ITEM_TYPE_LABELS: Record<string, string> = {
  begrafenis: "Begrafenis",
  crematie: "Crematie",
  laatste_verzorging: "Laatste verzorging",
  thanatopraxie: "Thanatopraxie",
  opbaring: "Opbaring",
  ceremonie: "Ceremonie",
  muziek: "Muziek",
  bloemen: "Bloemen",
  transport: "Transport",
};

// Array format for form selects
export const SECTION_OPTIONS = [
  { value: "soort_uitvaart", label: "Soort uitvaart" },
  { value: "verzorging_en_opbaring", label: "Verzorging en opbaring" },
  { value: "ceremonie", label: "Ceremonie" },
  { value: "kosten", label: "Kosten" },
];

export const ITEM_TYPE_OPTIONS = [
  { value: "begrafenis", label: "Begrafenis" },
  { value: "crematie", label: "Crematie" },
  { value: "laatste_verzorging", label: "Laatste verzorging" },
  { value: "thanatopraxie", label: "Thanatopraxie" },
  { value: "opbaring", label: "Opbaring" },
  { value: "ceremonie", label: "Ceremonie" },
  { value: "muziek", label: "Muziek" },
  { value: "bloemen", label: "Bloemen" },
  { value: "transport", label: "Transport" },
];
