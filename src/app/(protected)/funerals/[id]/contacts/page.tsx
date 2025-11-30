"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { GenericCard } from "@/components/ui/GenericCard";
import { useEffect, useState } from "react";
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

  return (
    <>
      {funeral && contacts && (
        <>
          <PageContent className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-2">
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
