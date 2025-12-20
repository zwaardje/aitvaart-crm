"use client";

import { useCallback } from "react";
import { Funerals } from "@/components/funerals/Funerals";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { RiCrossLine } from "@remixicon/react";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchResult } from "@/hooks/useSearch";
import { PageContent } from "@/components/layout/PageContent";
import { SearchResultCard } from "@/components/search/SearchResultCard";

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        className="mt-2"
        placeholder="Zoek in dashboard..."
        onResultsChange={setSearchResults}
        actions={searchActions()}
        searchContext={{
          entityTypes: ["funeral", "note", "contact"],
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
            filters={{
              status: ["planning", "active"],
            }}
            handleCreateFuneral={() => setIsDialogOpen(true)}
          />
        )}
      </PageContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe begeleiding</DialogTitle>
          </DialogHeader>
          <IntakeForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
