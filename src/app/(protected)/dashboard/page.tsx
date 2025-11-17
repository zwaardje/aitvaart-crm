"use client";

import { useCallback } from "react";
import { Funerals } from "@/components/funerals/Funerals";
import {
  SmartSearchBar,
  SmartSearchBarAction,
} from "@/components/ui/SmartSearchBar";
import { RiAddLine } from "@remixicon/react";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchResult } from "@/hooks/useSearch";
import { FuneralCard } from "@/components/funerals/FuneralsCard";
import { NotesCard } from "@/components/funerals/NotesCard";
import { ContactsCard } from "@/components/funerals/ContactsCard";

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "settings",
        label: "Nieuwe uitvaart",
        icon: <RiAddLine className="h-4 w-4" />,
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
        placeholder="Zoek in dashboard..."
        onResultsChange={setSearchResults}
        actions={searchActions()}
        entityTypes={["funeral", "note", "contact"]}
      />

      {searchResults.length > 0 ? (
        <div className="space-y-4">
          {searchResults.map((result) =>
            result.entity_type === "funeral" ? (
              <FuneralCard key={result.entity_id} funeral={result.content} />
            ) : result.entity_type === "note" ? (
              <NotesCard key={result.entity_id} note={result} />
            ) : result.entity_type === "contact" ? (
              <ContactsCard key={result.entity_id} contact={result.content} />
            ) : null
          )}
        </div>
      ) : (
        <Funerals
          filters={{
            status: ["planning", "active"],
          }}
          handleCreateFuneral={() => setIsDialogOpen(true)}
        />
      )}

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
