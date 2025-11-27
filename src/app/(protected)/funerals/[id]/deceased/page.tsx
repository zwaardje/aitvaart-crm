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

type FuneralContact =
  Database["public"]["Tables"]["funeral_contacts"]["Row"] & {
    client: Database["public"]["Tables"]["clients"]["Row"] | null;
  };

// Helper function to format dates
const formatDate = (date: string | null | undefined): string => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("nl-NL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

// Helper function to format time
const formatTime = (time: string | null | undefined): string => {
  if (!time) return "-";
  // If time is in HH:MM:SS format, extract HH:MM
  if (time.includes(":")) {
    const parts = time.split(":");
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
};

// Helper function to map gender
const mapGender = (gender: string | null | undefined): string => {
  switch (gender) {
    case "male":
      return "Man";
    case "female":
      return "Vrouw";
    case "other":
      return "Anders";
    default:
      return "-";
  }
};

// Helper function to map marital status
const mapMaritalStatus = (status: string | null | undefined): string => {
  switch (status) {
    case "single":
      return "Ongehuwd";
    case "married":
      return "Getrouwd";
    case "divorced":
      return "Gescheiden";
    case "widowed":
      return "Weduwe/Weduwnaar";
    case "registered_partnership":
      return "Geregistreerd partnerschap";
    default:
      return "-";
  }
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
      <SmartSearchBar
        placeholder="Zoek in dashboard..."
        actions={searchActions()}
        searchContext={{
          entityTypes: ["funeral", "contact"],
          filters: {
            funeralId: id,
          },
        }}
        sticky
        aiContext={{
          page: "general",
          funeralId: id,
          scope: "manage",
        }}
      />
      <PageContent className="flex flex-col gap-4">
        {/* Header with back button and name */}
        <div className="flex items-center gap-4">
          <Link href={`/funerals/${id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <RiArrowLeftLine className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-semibold">
            {deceased.preferred_name || deceased.first_names}{" "}
            {deceased.last_name}
          </h1>
        </div>

        {/* Persoonsgegevens Card */}
        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Persoonsgegevens
              </CardTitle>
              <PersonalDataEditForm deceased={deceased} />
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
                <div>
                  <div className="text-muted-foreground text-xs mb-1">
                    Voornamen
                  </div>
                  <div className="font-medium">
                    {deceased.first_names || "-"}
                  </div>
                </div>
              </Group>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Geslacht
                </div>
                <div className="font-medium">{mapGender(deceased.gender)}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Geboortedatum
                </div>
                <div className="font-medium">
                  {formatDate(deceased.date_of_birth)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Geboorteplaats
                </div>
                <div className="font-medium">
                  {deceased.place_of_birth || "-"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">BSN</div>
                <div className="font-medium">
                  {deceased.social_security_number || "-"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Burgerlijke staat
                </div>
                <div className="font-medium">
                  {mapMaritalStatus((deceased as any).marital_status)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Adresgegevens Card */}
        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Adresgegevens
              </CardTitle>
              <AddressDataEditForm deceased={deceased} />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="md:col-span-2">
                <div className="text-muted-foreground text-xs mb-1">Straat</div>
                <div className="font-medium">{deceased.street || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">Nummer</div>
                <div className="font-medium">
                  {deceased.house_number || "-"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Toevoeging
                </div>
                <div className="font-medium">
                  {deceased.house_number_addition || "-"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Postcode
                </div>
                <div className="font-medium">{deceased.postal_code || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Woonplaats
                </div>
                <div className="font-medium">{deceased.city || "-"}</div>
              </div>
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
              <DeathDataEditForm deceased={deceased} />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
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
              <div>
                <div className="text-muted-foreground text-xs mb-1">
                  Kistregistratienummer
                </div>
                <div className="font-medium">
                  {deceased.coffin_registration_number || "-"}
                </div>
              </div>
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
              <InsuranceDataEditForm deceased={deceased} />
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
              <div>
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
