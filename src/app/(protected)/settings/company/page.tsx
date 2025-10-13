"use client";

import React from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { RiLogoutBoxLine } from "@remixicon/react";

import { COMPANY_SETTINGS_MENU } from "@/constants/settings-menu";

export default function SettingsPage() {
  const { signOut } = useAuth();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {COMPANY_SETTINGS_MENU.map((item) => (
          <GenericCard
            key={item.label}
            to={item.href}
            title={item.label}
            icon={item.icon}
          />
        ))}
      </div>
      <Button variant="default" onClick={() => signOut()}>
        <RiLogoutBoxLine className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
