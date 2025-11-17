import { GenericCard } from "@/components/ui/GenericCard";
import { NoteEditForm, NoteDeleteForm } from "@/components/forms";
import { format, isValid } from "date-fns";
import { RiAlertLine } from "@remixicon/react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database";

type FuneralNote = Database["public"]["Tables"]["funeral_notes"]["Row"] & {
  creator: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

export function NotesCard({ note }: { note: FuneralNote }) {
  return (
    <GenericCard
      key={note.id}
      title={note.title}
      subtitle={
        note.created_at && isValid(new Date(note.created_at))
          ? format(new Date(note.created_at), "dd MMM yyyy 'om' HH:mm")
          : "Onbekend"
      }
      content={
        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
      }
      actions={
        <>
          <NoteEditForm note={note} withDialog />
          <NoteDeleteForm note={note} withDialog />
        </>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <span>
            {note.creator && (
              <div className="flex items-center text-gray-500 text-xs">
                Notitie toegevoegd door:{" "}
                {note.creator.full_name || note.creator.company_name}
              </div>
            )}
          </span>
          {note.is_important && (
            <Badge variant="destructive" className="text-xs font-normal">
              <RiAlertLine className="h-3 w-3 mr-1" />
              Belangrijk
            </Badge>
          )}
        </div>
      }
    />
  );
}
