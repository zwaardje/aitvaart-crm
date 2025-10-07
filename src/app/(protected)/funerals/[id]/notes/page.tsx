"use client";

import { useFuneral } from "@/hooks/useFunerals";
import { Notes } from "@/components/funerals/Notes";
import { Skeleton } from "@/components/ui";
import { useCallback, useEffect, useState } from "react";
import { RiBookLine } from "@remixicon/react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { NoteForm } from "@/components/forms/NoteForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FuneralNotesPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [id, setId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

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
        label: "Notitie toevoegen",
        icon: <RiBookLine className="h-3 w-3" />,
        onClick: () => {
          setIsDialogOpen(true);
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
            placeholder="Zoek in notities..."
            onResultsChange={() => {}}
            actions={searchActions()}
            entityTypes={["funeral", "note", "contact"]}
            sticky
          />
          <Notes funeralId={id} />
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe notitie</DialogTitle>
          </DialogHeader>
          <NoteForm funeralId={id} />
        </DialogContent>
      </Dialog>
    </>
  );
}
