export type FuneralTabKey =
  | "gegevens"
  | "scenario"
  | "kosten"
  | "notities"
  | "documenten";

export interface FuneralTabDef {
  key: FuneralTabKey;
  label: string;
  segment: string; // appended to /funerals/[id]
}

export const FUNERAL_TABS: FuneralTabDef[] = [
  { key: "gegevens", label: "funerals.tabs.gegevens", segment: "" },
  { key: "scenario", label: "funerals.tabs.scenario", segment: "/scenario" },
  { key: "kosten", label: "funerals.tabs.kosten", segment: "/kosten" },
  { key: "notities", label: "funerals.tabs.notities", segment: "/notities" },
  {
    key: "documenten",
    label: "funerals.tabs.documenten",
    segment: "/documenten",
  },
];
