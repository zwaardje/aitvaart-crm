"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { SectionHeader } from "@/components/layout";
import { DeceasedForm } from "@/components/forms";
import { RiEditLine } from "@remixicon/react";
import type { Database } from "@/types/database";
import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

type Deceased = Database["public"]["Tables"]["deceased"]["Row"];

interface DeceasedCardProps {
  deceased: Deceased | null | undefined;
}

export function DeceasedCard({ deceased }: DeceasedCardProps) {
  const [open, setOpen] = React.useState(false);

  if (!deceased) return null;

  return (
    <Card className="rounded-sm">
      <CardContent className="p-3">
        <SectionHeader
          title={
            <div className="truncate">
              {deceased.first_names} {deceased.last_name}
            </div>
          }
          description={deceased.preferred_name || undefined}
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <Button
                variant="outline"
                size="sm"
                aria-label="Bewerken"
                title="Bewerken"
                onClick={() => setOpen(true)}
              >
                <RiEditLine className="h-3 w-3" />
              </Button>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Overledene bewerken</DialogTitle>
                </DialogHeader>
                <DeceasedForm
                  deceased={deceased}
                  submitLabel="Opslaan"
                  onSaved={() => setOpen(false)}
                />
              </DialogContent>
            </Dialog>
          }
        />

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Geboortedatum</div>
            <div>
              {deceased.date_of_birth
                ? new Date(deceased.date_of_birth).toLocaleDateString("nl-NL")
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Overlijdensdatum</div>
            <div>
              {deceased.date_of_death
                ? new Date(deceased.date_of_death).toLocaleDateString("nl-NL")
                : "-"}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="text-muted-foreground">Adres</div>
            <div>
              {deceased.street} {deceased.house_number}
              {deceased.house_number_addition
                ? ` ${deceased.house_number_addition}`
                : ""}
              {", "}
              {deceased.postal_code} {deceased.city}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
