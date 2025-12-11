"use client";

import { useDocument } from "@/hooks/useDocuments";
import { useEffect, useState } from "react";
import { PageContent } from "@/components/layout/PageContent";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentsEditForm, DocumentsDeleteForm } from "@/components/forms";
import { Group } from "@/components/ui/Group";
import { Button } from "@/components/ui/Button";
import { RiDownloadLine } from "@remixicon/react";
import { format } from "date-fns";

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function DocumentPage({
  params,
}: {
  params:
    | Promise<{ id: string; documentId: string }>
    | { id: string; documentId: string };
}) {
  const [funeralId, setFuneralId] = useState<string>("");
  const [documentId, setDocumentId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id, documentId: resolvedDocumentId }) => {
        setFuneralId(id);
        setDocumentId(resolvedDocumentId);
      });
    } else {
      setFuneralId(params.id);
      setDocumentId(params.documentId);
    }
  }, [params]);

  const { document: doc, isLoading, getDownloadUrl } = useDocument(documentId);

  const handleDownload = async () => {
    try {
      const url = await getDownloadUrl();
      if (url && doc) {
        const link = document.createElement("a");
        link.href = url;
        link.download = doc.file_name || "document";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!doc) {
    return null;
  }

  return (
    <PageContent className="flex flex-col gap-4 mt-4">
      {/* Documentinformatie Card */}
      <Card className="rounded-sm">
        <CardHeader className="pb-3 pl-3 pr-3 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium">Documentinformatie</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="text-blue-600 hover:text-blue-700"
              >
                <RiDownloadLine className="h-4 w-4 mr-1" />
                Downloaden
              </Button>
              <DocumentsEditForm document={doc} withDialog={true} />
              <DocumentsDeleteForm document={doc} withDialog={true} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pl-3 pr-3 pb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Group>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Bestandsnaam
                </div>
                <div className="text-sm">{doc.file_name || "-"}</div>
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Bestandstype
                </div>
                <div className="text-sm">{doc.file_type || "-"}</div>
              </div>
            </Group>

            <Group>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Bestandsgrootte
                </div>
                <div className="text-sm">
                  {doc.file_size
                    ? formatFileSize(doc.file_size)
                    : "-"}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-muted-foreground text-xs mb-1">
                  Geüpload op
                </div>
                <div className="text-sm">
                  {doc.created_at
                    ? format(new Date(doc.created_at), "dd MMM yyyy 'om' HH:mm")
                    : "-"}
                </div>
              </div>
            </Group>

            {doc.description && (
              <div className="col-span-2">
                <div className="text-muted-foreground text-xs mb-1">
                  Beschrijving
                </div>
                <div className="text-sm">{doc.description}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}

