"use client";

import { useNotes } from "@/hooks";
import { NoteForm, NoteEditForm, NoteDeleteForm } from "@/components/forms";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Badge,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { RiAlertLine, RiFileTextLine } from "@remixicon/react";
import type { Database } from "@/types/database";

type FuneralNote = Database["public"]["Tables"]["funeral_notes"]["Row"] & {
  creator: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

interface NotesProps {
  funeralId: string;
}

export function Notes({ funeralId }: NotesProps) {
  const { notes, isLoading } = useNotes(funeralId);
  const t = useTranslations("notes");

  const isEmpty = !notes || notes.length === 0;

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <NoteForm funeralId={funeralId} />
      </div>

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
          {notes.map((note: FuneralNote) => (
            <Card key={note.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {note.title}
                      {note.is_important && (
                        <Badge variant="destructive" className="text-xs">
                          <RiAlertLine className="h-3 w-3 mr-1" />
                          {t("important")}
                        </Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      <span>
                        {format(
                          new Date(note.created_at!),
                          "dd MMM yyyy 'om' HH:mm"
                        )}
                      </span>
                      {note.creator && (
                        <span>
                          {note.creator.full_name || note.creator.company_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <NoteEditForm note={note} />
                    <NoteDeleteForm note={note} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
