"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { RiAddLine, RiArrowLeftLine } from "@remixicon/react";
import { FuneralContactForm } from "@/components/forms/FuneralContactForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageContent } from "@/components/layout/PageContent";
import { Database } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactPersonalDataEditForm } from "@/components/forms/ContactPersonalDataEditForm";
import { ContactAddressDataEditForm } from "@/components/forms/ContactAddressDataEditForm";
import { ContactCommunicationEditForm } from "@/components/forms/ContactCommunicationEditForm";
import { Group } from "@/components/ui/Group";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

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

export default function ContactPage({
  params,
}: {
  params:
    | Promise<{ id: string; contactId: string }>
    | { id: string; contactId: string };
}) {
  const [funeralId, setFuneralId] = useState<string>("");
  const [contactId, setContactId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<
    "funeral" | "share" | undefined
  >(undefined);

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id, contactId: resolvedContactId }) => {
        setFuneralId(id);
        setContactId(resolvedContactId);
      });
    } else {
      setFuneralId(params.id);
      setContactId(params.contactId);
    }
  }, [params]);

  const { data: contact, isLoading } = useQuery({
    queryKey: ["funeral-contact", contactId],
    enabled: !!contactId,
    queryFn: async (): Promise<FuneralContact | null> => {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("funeral_contacts")
        .select("*, client:clients(*)")
        .eq("id", contactId)
        .single();

      if (error) throw error;
      return data as FuneralContact;
    },
  });

  if (isLoading || !contact || !contact.client) {
    return null;
  }

  const client = contact.client;

  return (
    <>
      <PageContent className="flex flex-col gap-4 mt-4">
        {/* Persoonsgegevens Card */}
        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Persoonsgegevens
              </CardTitle>
              <ContactPersonalDataEditForm
                client={client}
                funeralContact={contact}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Roepnaam
                  </div>
                  <div className="text-sm">{client.preferred_name || "-"}</div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Achternaam
                  </div>
                  <div className="text-sm">{client.last_name || "-"}</div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Voornamen
                  </div>
                  <div className="text-sm">
                    {(client as any).first_names || "-"}
                  </div>
                </div>
              </Group>

              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Geboortedatum
                  </div>
                  <div className="text-sm">
                    {formatDate(client.date_of_birth)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Geboorteplaats
                  </div>
                  <div className="text-sm">{client.place_of_birth || "-"}</div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Geslacht
                  </div>
                  <div className="text-sm">{mapGender(client.gender)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Burgerlijke staat
                  </div>
                  <div className="text-sm">
                    {mapMaritalStatus((client as any).marital_status)}
                  </div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Opdrachtgever
                  </div>
                  <div className="text-sm">
                    {contact.is_primary ? "Ja" : "Nee"}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Relatie tot overledene
                  </div>
                  <div className="text-sm">{contact.relation || "-"}</div>
                </div>
              </Group>
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
              <ContactAddressDataEditForm
                client={client}
                contactId={contactId}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Straat
                  </div>
                  <div className="text-sm">{client.street || "-"}</div>
                </div>
                <div className="flex-2">
                  <div className="text-muted-foreground text-xs mb-1">
                    Nummer
                  </div>
                  <div className="text-sm">{client.house_number || "-"}</div>
                </div>
                <div className="flex-2">
                  <div className="text-muted-foreground text-xs mb-1">
                    Toevoeging
                  </div>
                  <div className="text-sm">
                    {client.house_number_addition || "-"}
                  </div>
                </div>
              </Group>
              <Group>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Postcode
                  </div>
                  <div className="font-sm">{client.postal_code || "-"}</div>
                </div>
                <div className="flex-1">
                  <div className="text-muted-foreground text-xs mb-1">
                    Woonplaats
                  </div>
                  <div className="text-sm">{client.city || "-"}</div>
                </div>
              </Group>
            </div>
          </CardContent>
        </Card>

        {/* Communicatie Card */}
        <Card className="rounded-sm">
          <CardHeader className="pb-3 pl-3 pr-3 pt-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                Communicatie
              </CardTitle>
              <ContactCommunicationEditForm
                client={client}
                contactId={contactId}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0 pl-3 pr-3 pb-3">
            <Group>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Telefoonnummer
                </div>
                <div className="text-sm">{client.phone_number || "-"}</div>
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  E-mailadres
                </div>
                <div className="text-sm">{client.email || "-"}</div>
              </div>
            </Group>
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
          <FuneralContactForm funeralId={funeralId} />
        </DialogContent>
      </Dialog>
    </>
  );
}
