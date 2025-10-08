"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { Skeleton } from "@/components/ui";
import { FuneralContacts } from "@/components/funerals/FuneralContacts";
import { DeceasedCard } from "@/components/funerals/DeceasedCard";
import { useCallback, useEffect, useState } from "react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { RiAddLine, RiShare2Line } from "@remixicon/react";
import { FuneralContactForm } from "@/components/forms/FuneralContactForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const { funeral, isLoading } = useFuneral(id);

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
      {
        id: "share",
        label: "Voeg medewerker toe",
        icon: <RiShare2Line className="h-3 w-3" />,
        onClick: () => {
          setIsDialogOpen("share");
        },
      },
    ],
    []
  );

  return (
    <>
      {isLoading && (
        <div className="space-y-4 w-full">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}

      {!isLoading && funeral && (
        <div className="space-y-4 w-full">
          <SmartSearchBar
            placeholder="Zoek in dashboard..."
            actions={searchActions()}
            entityTypes={["funeral", "contact"]}
            sticky
            aiContext={{
              page: "general",
              funeralId: id,
              scope: "manage",
            }}
          />
          <DeceasedCard deceased={funeral.deceased as any} />

          <FuneralContacts funeralId={id} />
        </div>
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
