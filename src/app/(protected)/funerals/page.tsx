"use client";
import { Content } from "@/components/layout";
import { Funerals } from "@/components/funerals/Funerals";
import { useCallback } from "react";
import {
  SmartSearchBarAction,
  SmartSearchBar,
} from "@/components/ui/SmartSearchBar";
import { RiSettings3Line } from "@remixicon/react";
import { IntakeForm } from "@/components/forms/IntakeForm";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FuneralsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const searchActions = useCallback(
    (): SmartSearchBarAction[] => [
      {
        id: "settings",
        label: "Nieuwe uitvaart",
        icon: <RiSettings3Line className="h-4 w-4" />,
        onClick: () => {
          setIsDialogOpen(true);
        },
      },
    ],
    []
  );
  return (
    <Content>
      <div className="p-2  w-full">
        <SmartSearchBar
          placeholder="Zoek in uitvaarten..."
          onResultsChange={() => {}}
          actions={searchActions()}
          entityTypes={["funeral", "note", "contact"]}
        />
        <Funerals filters={{}} />
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nieuwe uitvaart</DialogTitle>
          </DialogHeader>
          <IntakeForm />
        </DialogContent>
      </Dialog>
    </Content>
  );
}
