"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { GenericCard } from "@/components/ui/GenericCard";

import { DeceasedCard } from "@/components/funerals/DeceasedCard";
import { useCallback, useEffect, useState } from "react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { RiAddLine } from "@remixicon/react";
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
import { Badge } from "@/components/ui/badge";

type FuneralContact =
  Database["public"]["Tables"]["funeral_contacts"]["Row"] & {
    client: Database["public"]["Tables"]["clients"]["Row"] | null;
  };

export default function FuneralDetailsPage({
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

  return (
    <>
      {funeral && contacts && (
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
            <GenericCard
              to={`/funerals/${id}/deceased`}
              title={
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-medium">
                    {funeral.deceased.preferred_name}{" "}
                    {funeral.deceased.last_name}
                  </h2>
                </div>
              }
              content={
                <div className="text-sm text-gray-500 flex justify-between w-full">
                  <div className="flex flex-1 flex-col items-start">
                    <span className="text-muted-foreground text-xs">
                      Overlijdensdatum
                    </span>
                    <span className="text-sm">
                      {funeral.deceased.date_of_death
                        ? new Date(
                            funeral.deceased.date_of_death
                          ).toLocaleDateString("nl-NL")
                        : "-"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col items-end">
                    <span className="text-muted-foreground text-xs">
                      Geboorteplaats
                    </span>
                    <span className="text-sm">
                      {funeral.deceased.place_of_birth
                        ? funeral.deceased.place_of_birth
                        : "-"}
                    </span>
                  </div>
                </div>
              }
            />
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium">Nabestaanden</h3>
              {contacts.map((contact: FuneralContact, index: number) => (
                <GenericCard
                  key={contact.id || index}
                  to={`/funerals/${id}/contacts/${contact.id}`}
                  title={
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg font-medium">
                        {contact.client?.preferred_name}
                      </h2>
                      {contact.is_primary && (
                        <Badge size="sm" className="font-normal">
                          Opdrachtgever
                        </Badge>
                      )}
                    </div>
                  }
                  subtitle={contact.relation ?? undefined}
                />
              ))}
            </div>
          </PageContent>
        </>
      )}

      <Dialog
        open={isDialogOpen === "share"}
        onOpenChange={() => setIsDialogOpen(undefined)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voeg medewerker toe</DialogTitle>
          </DialogHeader>
          Sharing is caring
        </DialogContent>
      </Dialog>
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
