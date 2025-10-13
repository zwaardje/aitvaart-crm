import {
  RiBuildingLine,
  RiMapLine,
  RiUserLine,
  RiFileLine,
  RiSettingsLine,
  RiNotificationLine,
} from "@remixicon/react";
import React from "react";

export type SettingsMenuItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

export const COMPANY_SETTINGS_MENU: SettingsMenuItem[] = [
  {
    label: "Bedrijsinformatie",
    href: "/settings/company/details",
    icon: <RiBuildingLine className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Bedrijfscontext",
    href: "/settings/company/context",
    icon: <RiMapLine className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Prijslijst",
    href: "/settings/company/pricing",
    icon: <RiUserLine className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Leveranciers",
    href: "/settings/company/suppliers",
    icon: <RiUserLine className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Teamleden en permissies",
    href: "/settings/company/members",
    icon: <RiUserLine className="h-4 w-4 text-muted-foreground" />,
  },
  {
    label: "Betaalinstellingen",
    href: "/settings/company/payments",
    icon: <RiFileLine className="h-4 w-4 text-muted-foreground" />,
  },
];

export const ACCOUNT_SETTINGS_MENU: SettingsMenuItem[] = [
  {
    label: "Profiel",
    href: "/settings/account/profile",
    icon: <RiUserLine />,
  },
  {
    label: "Security",
    href: "/settings/account/security",
    icon: <RiSettingsLine />,
  },
  {
    label: "Gebruikerscontext",
    href: "/settings/account/notifications",
    icon: <RiNotificationLine />,
  },
];
