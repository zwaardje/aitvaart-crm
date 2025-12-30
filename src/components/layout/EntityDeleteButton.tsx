"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RiDeleteBinLine } from "@remixicon/react";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGenericEntity } from "@/hooks/useGenericEntity";
import { useFuneralContacts } from "@/hooks/useFuneralContacts";
import { useDeleteScenario } from "@/hooks/useScenarios";

interface EntityDeleteButtonProps {
  pathname: string;
}

type EntityType = "funeral" | "contact" | "wishes" | null;

export function EntityDeleteButton({ pathname }: EntityDeleteButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract UUIDs from pathname
  const segments = pathname.split("/").filter(Boolean);
  const uuids = segments.filter((segment) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  );

  // Determine entity type and IDs
  const lastSegment = segments[segments.length - 1];
  const isLastSegmentUuid =
    uuids.length > 0 && lastSegment === uuids[uuids.length - 1];

  const funeralId = uuids[0] || null;
  const contactId =
    pathname.includes("/contacts/") && uuids.length > 1
      ? uuids[uuids.length - 1]
      : null;
  const wishesId =
    pathname.includes("/wishes/") && uuids.length > 1
      ? uuids[uuids.length - 1]
      : null;

  // Determine entity type based on which ID is present
  const getEntityType = (): EntityType => {
    if (contactId) return "contact";
    if (wishesId) return "wishes";
    if (funeralId) return "funeral";
    return null;
  };

  const entityType = getEntityType();

  // Get delete functions based on entity type
  // Use useGenericEntity with enabled: false to get delete function without fetching data
  // Hooks must be called unconditionally, before any early returns
  const { delete: deleteFuneral, isDeleting: isDeletingFuneral } =
    useGenericEntity({
      tableName: "funerals",
      enabled: false,
    });

  const { deleteContact } = useFuneralContacts(funeralId || null);

  const { mutateAsync: deleteScenario } = useDeleteScenario();

  // Early returns after all hooks
  if (!isLastSegmentUuid || uuids.length === 0) {
    return null;
  }

  if (!entityType) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      if (entityType === "funeral" && funeralId) {
        await deleteFuneral(funeralId);
        router.push("/funerals");
      } else if (entityType === "contact" && contactId && funeralId) {
        await deleteContact(contactId);
        router.push(`/funerals/${funeralId}/contacts`);
      }
      if (entityType === "wishes" && wishesId) {
        await deleteScenario(wishesId);
        router.push(`/funerals/${funeralId}/wishes`);
      }

      setIsOpen(false);
    } catch (error) {
      console.error("Error deleting entity:", error);
      // Keep dialog open on error so user can try again or cancel
    } finally {
      setIsDeleting(false);
    }
  };

  const getDialogTitle = () => {
    if (entityType === "funeral") {
      return "Verwijder uitvaart";
    }
    if (entityType === "contact") {
      return "Verwijder contactpersoon";
    }
    if (entityType === "wishes") {
      return "Verwijder wens";
    }
    return "Verwijder item";
  };

  const getDialogDescription = () => {
    if (entityType === "funeral") {
      return "Deze actie kan niet ongedaan worden gemaakt. Hiermee wordt de uitvaart definitief verwijderd.";
    }
    if (entityType === "contact") {
      return "Deze actie kan niet ongedaan worden gemaakt. Hiermee wordt de contactpersoon definitief verwijderd.";
    }
    if (entityType === "wishes") {
      return "Deze actie kan niet ongedaan worden gemaakt. Hiermee wordt de wens definitief verwijderd.";
    }
    return "Deze actie kan niet ongedaan worden gemaakt. Hiermee wordt het item definitief verwijderd.";
  };

  const isLoading = isDeleting || isDeletingFuneral;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-10 w-10 border border-gray-200 hover:border-gray-300"
        >
          <RiDeleteBinLine className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <div className="flex w-full flex-col gap-4 p-2">
          <div className="px-3">
            <p className="text-sm text-gray-500 mb-2">
              {getDialogDescription()}
            </p>
          </div>

          <DialogFooter className="flex flex-row justify-between">
            <DialogClose asChild>
              <Button
                variant="outline"
                disabled={isLoading}
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuleren
              </Button>
            </DialogClose>
            <Button
              onClick={handleDelete}
              variant="destructive"
              disabled={isLoading}
            >
              {isLoading ? "Verwijderen..." : "Verwijder"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
