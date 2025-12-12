"use client";

import { useNote } from "@/hooks/useNotes";
import { useEffect, useState } from "react";
import { PageContent } from "@/components/layout/PageContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoteEditForm, NoteDeleteForm } from "@/components/forms";
import { Group } from "@/components/ui/Group";
import { Badge } from "@/components/ui/badge";
import { RiAlertLine } from "@remixicon/react";
import { format, isValid } from "date-fns";

export default function NotePage({
  params,
}: {
  params:
    | Promise<{ id: string; noteId: string }>
    | { id: string; noteId: string };
}) {
  const [funeralId, setFuneralId] = useState<string>("");
  const [noteId, setNoteId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id, noteId: resolvedNoteId }) => {
        setFuneralId(id);
        setNoteId(resolvedNoteId);
      });
    } else {
      setFuneralId(params.id);
      setNoteId(params.noteId);
    }
  }, [params]);

  const { note, isLoading } = useNote(noteId);

  if (isLoading) {
    return null;
  }

  if (!note) {
    return null;
  }

  return (
    <PageContent className="flex flex-col gap-4 mt-4">
      {/* Notitie Card */}
      <Card className="rounded-sm">
        <CardHeader className="pb-3 pl-3 pr-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex flex-col text-base font-medium flex items-center gap-2">
              {note.title}
              <span className="text-xs text-muted-foreground">
                {(note.creator &&
                  (note.creator.full_name ||
                    note.creator.company_name ||
                    "-")) ||
                  "-"}{" "}
                op
                {note.created_at && isValid(new Date(note.created_at))
                  ? format(new Date(note.created_at), "dd MMM yyyy 'om' HH:mm")
                  : "-"}{" "}
              </span>
              {note.is_important && (
                <Badge variant="destructive" className="text-xs font-normal">
                  <RiAlertLine className="h-3 w-3 mr-1" />
                  Belangrijk
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <NoteEditForm note={note} withDialog={true} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pl-3 pr-3 pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-3">
              {note.creator && (
                <div className="flex flex-col gap-3">
                  <div className="flex-1">
                    <div className="text-muted-foreground text-xs mb-1">
                      Aangemaakt door
                    </div>
                    <div className="text-sm">
                      {note.creator.full_name ||
                        note.creator.company_name ||
                        "-"}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Aangemaakt op
                </div>
                <div className="text-sm">
                  {note.created_at && isValid(new Date(note.created_at))
                    ? format(
                        new Date(note.created_at),
                        "dd MMM yyyy 'om' HH:mm"
                      )
                    : "-"}
                </div>
              </div>
            </div>

            {note.content && (
              <div className="col-span-2">
                <div className="text-muted-foreground text-xs mb-1">Inhoud</div>
                <div className="text-sm whitespace-pre-wrap">
                  {note.content}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
