"use client";

import { SearchResult } from "@/hooks/useSearch";
import { FuneralContacts } from "@/components/funerals/FuneralContacts";
import { useCallback, useEffect, useState } from "react";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { RiAddLine } from "@remixicon/react";
import { FuneralContactForm } from "@/components/forms/FuneralContactForm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageContent } from "@/components/layout/PageContent";
import { SearchResultCard } from "@/components/search/SearchResultCard";

export default function FuneralDetailsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

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
      <SmartSearchBar
        placeholder="Zoek in contacten..."
        actions={searchActions()}
        onResultsChange={setSearchResults}
        sticky
        searchContext={{
          entityTypes: ["contact"],
          filters: {
            funeralId: id,
          },
        }}
        aiContext={{
          page: "general",
          funeralId: id,
          scope: "manage",
        }}
      />
      <PageContent>
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result) => (
              <SearchResultCard key={result.entity_id} result={result} />
            ))}
          </div>
        ) : (
          <FuneralContacts funeralId={id} />
        )}
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
