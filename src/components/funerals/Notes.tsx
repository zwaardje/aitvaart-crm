"use client";

import { useNotes } from "@/hooks";
import { NoteForm, NoteEditForm, NoteDeleteForm } from "@/components/forms";
import {
  Card,
  CardContent,
  Skeleton,
  Badge,
  GenericCard,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { RiAlertLine, RiFileTextLine } from "@remixicon/react";
import type { Database } from "@/types/database";
import { SearchBar } from "@/components/ui/SearchBar";
import { useState, useCallback, useMemo } from "react";
import type { SearchResult } from "@/hooks/useSearch";
type FuneralNote = Database["public"]["Tables"]["funeral_notes"]["Row"] & {
  creator: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

interface NotesProps {
  funeralId: string;
}

export function Notes({ funeralId }: NotesProps) {
  const { notes, isLoading } = useNotes(funeralId);
  const t = useTranslations("notes");
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

  const isEmpty = !displayNotes || displayNotes.length === 0;

  const handleResultsChange = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
  }, []);

  // Memoize entityTypes to prevent infinite re-renders
  const entityTypes = useMemo(
    () => ["note"] as ("funeral" | "note" | "cost" | "contact")[],
    []
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t("title")}</h3>
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isEmpty ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <RiFileTextLine className="h-6 w-6 text-gray-400" />
            </div>
            <h4 className="mt-4 text-lg font-medium text-gray-900">
              {t("empty.title")}
            </h4>
            <p className="mt-2 text-sm text-gray-500 text-center">
              {t("empty.description")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayNotes.map((note: FuneralNote) => (
            <GenericCard
              key={note.id}
              title={note.title}
              subtitle={format(
                new Date(note.created_at!),
                "dd MMM yyyy 'om' HH:mm"
              )}
              content={
                <p className="text-gray-700 whitespace-pre-wrap">
                  {note.content}
                </p>
              }
              actions={
                <>
                  <NoteEditForm note={note} />
                  <NoteDeleteForm note={note} />
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
                    <Badge
                      variant="destructive"
                      className="text-xs font-normal"
                    >
                      <RiAlertLine className="h-3 w-3 mr-1" />
                      Belangrijk
                    </Badge>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
