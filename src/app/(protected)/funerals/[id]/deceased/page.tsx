"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { useCallback, useEffect, useState } from "react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { RiAddLine, RiArrowLeftLine } from "@remixicon/react";
import { FuneralContactForm } from "@/components/forms/FuneralContactForm";
import { useFuneralContacts } from "@/hooks/useFuneralContacts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageContent } from "@/components/layout/PageContent";
import { Database } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalDataEditForm } from "@/components/forms/PersonalDataEditForm";
import { AddressDataEditForm } from "@/components/forms/AddressDataEditForm";
import { DeathDataEditForm } from "@/components/forms/DeathDataEditForm";
import { InsuranceDataEditForm } from "@/components/forms/InsuranceDataEditForm";
import { FuneralDataEditForm } from "@/components/forms/FuneralDataEditForm";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Group } from "@/components/ui/Group";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatTime } from "@/lib/format-helpers";
import { mapGender, mapMaritalStatus } from "@/lib/display-helpers";

type FuneralContact =
  Database["public"]["Tables"]["funeral_contacts"]["Row"] & {
    client: Database["public"]["Tables"]["clients"]["Row"] | null;
  };

export default function DeceasedPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [id, setId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<
    "funeral" | "share" | undefined
  >(undefined);

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);

  const { funeral } = useFuneral(id);
  const { contacts } = useFuneralContacts(id);

  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "settings",
        label: "Nabestaanden toevoegen",
        icon: <RiAddLine className="h-3 w-3" />,
        onClick: () => {
          setIsDialogOpen("funeral");
        },
      },
    ],
    []
  );

  if (!funeral || !contacts) {
    return null;
  }

  const deceased = funeral.deceased;

  return (
    <>
      <PageContent className="flex flex-col gap-4 mt-4">
        <div className="flex justify-between gap-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-medium">
              {deceased.preferred_name} {deceased.last_name}
            </h1>
          </div>
        </div>
        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Persoonsgegevens
              </CardTitle>
              <PersonalDataEditForm deceased={deceased} funeralId={id} />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Roepnaam
                  </div>
                  <div className="font-medium">
                    {deceased.preferred_name || "-"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Achternaam
                  </div>
                  <div className="font-medium">{deceased.last_name || "-"}</div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Voornamen
                  </div>
                  <div className="font-medium">
                    {deceased.first_names || "-"}
                  </div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Geboortedatum
                  </div>
                  <div className="font-medium">
                    {formatDate(deceased.date_of_birth)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Geboorteplaats
                  </div>
                  <div className="font-medium">
                    {deceased.place_of_birth || "-"}
                  </div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Geslacht
                  </div>
                  <div className="font-medium">
                    {mapGender(deceased.gender)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Burgerlijke staat
                  </div>
                  <div className="font-medium">
                    {mapMaritalStatus((deceased as any).marital_status)}
                  </div>
                </div>
              </Group>

              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">BSN</div>
                  <div className="font-medium">
                    {deceased.social_security_number || "-"}
                  </div>
                </div>
              </Group>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Adresgegevens
              </CardTitle>
              <AddressDataEditForm deceased={deceased} funeralId={id} />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Straat
                  </div>
                  <div className="font-medium">{deceased.street || "-"}</div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Nummer
                  </div>
                  <div className="font-medium">
                    {deceased.house_number || "-"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Toevoeging
                  </div>
                  <div className="font-medium">
                    {deceased.house_number_addition || "-"}
                  </div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Postcode
                  </div>
                  <div className="font-medium">
                    {deceased.postal_code || "-"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Woonplaats
                  </div>
                  <div className="font-medium">{deceased.city || "-"}</div>
                </div>
              </Group>
            </div>
          </CardContent>
        </Card>

        {/* Overlijdensgegevens Card */}
        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Overlijdensgegevens
              </CardTitle>
              <DeathDataEditForm deceased={deceased} funeralId={id} />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Datum overlijden
                  </div>
                  <div className="font-medium">
                    {formatDate(deceased.date_of_death)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">
                    Plaats van overlijden
                  </div>
                  <div className="font-medium">
                    {(deceased as any).place_of_death || "-"}
                  </div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Kistregistratienummer
                  </div>
                  <div className="font-medium">
                    {deceased.coffin_registration_number || "-"}
                  </div>
                </div>
              </Group>
            </div>
          </CardContent>
        </Card>

        {/* Verzekeringgegevens Card */}
        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Verzekeringgegevens
              </CardTitle>
              <InsuranceDataEditForm deceased={deceased} funeralId={id} />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Verzekeringsmaatschappij
                </div>
                <div className="font-medium">
                  {(deceased as any).insurance_company || "-"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Polisnummer
                </div>
                <div className="font-medium">
                  {(deceased as any).policy_number || "-"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Uitvaartgegevens Card */}
        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Uitvaartgegevens
              </CardTitle>
              <FuneralDataEditForm funeral={funeral} />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Uitvaartdatum
                  </div>
                  <div className="font-medium">
                    {formatDate(funeral.signing_date)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs mb-1">
                    Uitvaarttijd
                  </div>
                  <div className="font-medium">
                    {formatTime(
                      (funeral as any).funeral_time as string | null | undefined
                    )}
                  </div>
                </div>
              </Group>
              <div className="md:col-span-2">
                <div className="text-muted-foreground text-xs mb-1">
                  Uitvaartlocatie
                </div>
                <div className="font-medium">{funeral.location || "-"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContent>

      <Dialog
        open={isDialogOpen === "funeral"}
        onOpenChange={() => setIsDialogOpen(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuw contact</DialogTitle>
          </DialogHeader>
          <FuneralContactForm funeralId={id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
