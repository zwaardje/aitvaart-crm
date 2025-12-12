"use client";

import { useNotes } from "@/hooks";
import type { Database } from "@/types/database";
import { useState, useMemo } from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { format, isValid } from "date-fns";
import type { SearchResult } from "@/hooks/useSearch";

type FuneralNote = Database["public"]["Tables"]["funeral_notes"]["Row"] & {
  creator: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

interface NotesProps {
  funeralId: string;
}

export function Notes({ funeralId }: NotesProps) {
  const { notes } = useNotes(funeralId);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Show search results if available, otherwise show all notes
  const displayNotes = useMemo(() => {
    return searchResults.length > 0
      ? (searchResults
          .filter((result) => result.entity_type === "note")
          .map((result) => notes?.find((note) => note.id === result.entity_id))
          .filter(Boolean) as FuneralNote[])
      : notes || [];
  }, [searchResults, notes]);

  return (
    <div className="px-4">
      <div className="space-y-3">
        {displayNotes.map((note: FuneralNote) => (
          <GenericCard
            key={note.id}
            to={`/funerals/${funeralId}/notes/${note.id}`}
            title={note.title}
            subtitle={
              note.created_at && isValid(new Date(note.created_at))
                ? format(new Date(note.created_at), "dd MMM yyyy 'om' HH:mm")
                : "Onbekend"
            }
          />
        ))}
      </div>
    </div>
  );
}
