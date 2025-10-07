export type FuneralTabKey =
  | "gegevens"
  | "scenario"
  | "kosten"
  | "notities"
  | "documenten"
  | "acties";

export interface FuneralTabDef {
  key: FuneralTabKey;
  label: string;
  segment: string; // appended to /funerals/[id]
}

export const FUNERAL_TABS: FuneralTabDef[] = [
  { key: "gegevens", label: "Gegevens", segment: "" },
  { key: "acties", label: "Acties", segment: "/actions" },
  { key: "scenario", label: "Wensen", segment: "/wishes" },
  { key: "kosten", label: "Kosten", segment: "/costs" },
  { key: "notities", label: "Notities", segment: "/notes" },
  {
    key: "documenten",
    label: "Documenten",
    segment: "/documents",
  },
];
