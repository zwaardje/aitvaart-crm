"use client";
import { useCallback, useState } from "react";
import { SearchResult } from "@/hooks/useSearch";
import { SearchResultCard } from "@/components/search/SearchResultCard";

import {
  SmartSearchBarAction,
  SmartSearchBar,
} from "@/components/ui/SmartSearchBar";
import { RiCrossLine } from "@remixicon/react";
import { IntakeForm } from "@/components/forms/IntakeForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageContent } from "@/components/layout/PageContent";
import { Funerals } from "@/components/funerals/Funerals";

export default function FuneralsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "settings",
        label: "Nieuwe uitvaart",
        icon: <RiCrossLine className="h-4 w-4" />,
        onClick: () => {
          setIsDialogOpen(true);
        },
      },
    ],
    []
  );

  return (
    <>
      <SmartSearchBar
        placeholder="Zoek in uitvaarten..."
        onResultsChange={setSearchResults}
        actions={searchActions()}
        searchContext={{
          filters: {
            entityTypes: ["funeral"],
          },
        }}
        aiContext={{
          page: "funerals",
          scope: "manage",
        }}
      />

      <PageContent className="mt-4">
        {searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map((result) => (
              <SearchResultCard key={result.entity_id} result={result} />
            ))}
          </div>
        ) : (
          <Funerals
            filters={{}}
            handleCreateFuneral={() => setIsDialogOpen(true)}
          />
        )}
      </PageContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe uitvaart</DialogTitle>
          </DialogHeader>
          <IntakeForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
