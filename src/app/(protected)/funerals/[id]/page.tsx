"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { GenericCard } from "@/components/ui/GenericCard";
import { useCallback, useEffect, useState } from "react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { RiAddLine } from "@remixicon/react";
import { FuneralContactForm } from "@/components/forms/FuneralContactForm";
import { useFuneralContacts } from "@/hooks/useFuneralContacts";
import { useCosts } from "@/hooks/useCosts";
import { useDocuments } from "@/hooks/useDocuments";
import { useNotes } from "@/hooks/useNotes";
import { useScenarios } from "@/hooks/useScenarios";
import { format } from "date-fns";

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
  const { costs } = useCosts(id);
  const { documents } = useDocuments(id);
  const { notes } = useNotes(id);
  const { data: scenarios } = useScenarios(id);

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
                  subtitle={contact.relation || undefined}
                />
              ))}
            </div>
            {costs && costs.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Kosten</h3>
                {costs.slice(0, 3).map((cost) => (
                  <GenericCard
                    key={cost.id}
                    to={`/funerals/${id}/costs/${cost.id}`}
                    title={
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-medium">
                          {cost.product_name}
                        </h2>
                      </div>
                    }
                    subtitle={`Aantal: ${
                      cost.quantity
                    } - Stukprijs: €${cost.unit_price.toFixed(2)}`}
                    content={
                      cost.notes ? (
                        <p className="text-sm text-gray-600">{cost.notes}</p>
                      ) : undefined
                    }
                    footer={
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        €{cost.total_price?.toFixed(2)} incl. btw
                      </div>
                    }
                  />
                ))}
              </div>
            )}
            {documents && documents.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Documenten</h3>
                {documents.slice(0, 3).map((document) => (
                  <GenericCard
                    key={document.id}
                    to={`/funerals/${id}/documents/${document.id}`}
                    title={
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-medium">
                          {document.file_name}
                        </h2>
                      </div>
                    }
                    subtitle={
                      document.created_at
                        ? format(
                            new Date(document.created_at),
                            "dd MMM yyyy 'om' HH:mm"
                          )
                        : undefined
                    }
                    content={
                      document.description ? (
                        <p className="text-sm text-gray-600">
                          {document.description}
                        </p>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
            {notes && notes.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Notities</h3>
                {notes.slice(0, 3).map((note) => (
                  <GenericCard
                    key={note.id}
                    to={`/funerals/${id}/notes/${note.id}`}
                    title={
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-medium">{note.title}</h2>
                      </div>
                    }
                    subtitle={
                      note.created_at
                        ? format(
                            new Date(note.created_at),
                            "dd MMM yyyy 'om' HH:mm"
                          )
                        : undefined
                    }
                    content={
                      note.content ? (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {note.content}
                        </p>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
            {scenarios && scenarios.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-medium">Wensen</h3>
                {scenarios.slice(0, 3).map((scenario) => (
                  <GenericCard
                    key={scenario.id}
                    to={`/funerals/${id}/wishes/${scenario.id}`}
                    title={
                      <div className="flex items-center gap-4">
                        <h2 className="text-lg font-medium">
                          {scenario.title}
                        </h2>
                      </div>
                    }
                    subtitle={scenario.description || undefined}
                    content={
                      scenario.extra_field_label &&
                      scenario.extra_field_value ? (
                        <div className="text-sm">
                          <span className="text-gray-500">
                            {scenario.extra_field_label}:
                          </span>
                          <span className="ml-1 text-gray-900">
                            {scenario.extra_field_value}
                          </span>
                        </div>
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
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
