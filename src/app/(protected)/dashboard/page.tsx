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

export default function DashboardPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // Stable callback for search results
  const handleSearchResultsChange = useCallback((results: any[]) => {
    console.log(results);
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full">
      <SmartSearchBar
        placeholder="Zoek in dashboard..."
        onResultsChange={handleSearchResultsChange}
        actions={searchActions()}
        entityTypes={["funeral", "note", "contact"]}
      />

      <Funerals
        filters={{
          status: "active",
        }}
        handleCreateFuneral={() => setIsDialogOpen(true)}
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe uitvaart</DialogTitle>
          </DialogHeader>
          <IntakeForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
