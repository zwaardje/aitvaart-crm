"use client";

import { useTranslations } from "next-intl";
import { useFuneral } from "@/hooks/useFunerals";
import { useEffect, useState, useCallback } from "react";
import { Skeleton } from "@/components/ui";
import { RiAddLine } from "@remixicon/react";
import { DocumentsUploadForm } from "@/components/forms/DocumentsUploadForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { Documents } from "@/components/funerals/Documents";

export default function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const t = useTranslations();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);
  const { funeral, isLoading: funeralLoading } = useFuneral(id);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "upload-document",
        label: "Document uploaden",
        icon: <RiAddLine className="h-3 w-3" />,
        onClick: () => {
          setUploadDialogOpen(true);
        },
      },
    ],
    []
  );

  if (funeralLoading) {
    return (
      <div className="p-6 space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 w-full">
        <SmartSearchBar
          placeholder="Zoek in documenten..."
          onResultsChange={() => {}}
          actions={searchActions()}
          searchContext={{
            entityTypes: [
              "document" as
                | "note"
                | "cost"
                | "contact"
                | "funeral"
                | "scenario",
            ],
            filters: {
              funeralId: id,
            },
          }}
          sticky
          aiContext={{
            page: "documents",
            funeralId: id,
            scope: "manage",
          }}
        />
        <Documents funeralId={id} />
      </div>

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document uploaden</DialogTitle>
          </DialogHeader>
          <DocumentsUploadForm
            funeralId={id}
            onSuccess={() => setUploadDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
