export type FuneralTabKey =
  | "gegevens"
  | "scenario"
  | "kosten"
  | "notities"
  | "documenten"
  | "acties";

export type SettingsChildTabKey =
  | "context"
  | "pricing"
  | "suppliers"
  | "members"
  | "payments"
  | "details";

export type SettingsTabKey = "company" | "account";

export interface SubmenuItemDef {
  key: SettingsTabKey | FuneralTabKey | SettingsChildTabKey;
  label: string;
  segment: string;
}

export const SETTINGS_TABS: SubmenuItemDef[] = [
  { key: "company", label: "Bedrijfsinstellingen", segment: "/company" },
  { key: "account", label: "Accountinstellingen", segment: "/account" },
];

export const SETTINGS_CHILD_TABS: SubmenuItemDef[] = [
  { key: "details", label: "Details", segment: "/details" },
  { key: "context", label: "Context", segment: "/context" },
  { key: "pricing", label: "Prijslijst", segment: "/pricing" },
  { key: "suppliers", label: "Leveranciers", segment: "/suppliers" },
  { key: "members", label: "Teamleden en permissies", segment: "/members" },
  { key: "payments", label: "Betaalinstellingen", segment: "/payments" },
];

export const FUNERAL_TABS: SubmenuItemDef[] = [
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
