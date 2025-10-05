"use client";

import { useTranslations } from "next-intl";
import { useFuneral } from "@/hooks/useFunerals";
import { useDocuments } from "@/hooks/useDocuments";
import { useEffect, useState } from "react";
import { Skeleton, Card } from "@/components/ui";
import { Button } from "@/components/ui";
import {
  RiAddLine,
  RiFileLine,
  RiDownloadLine,
  RiDeleteBinLine,
  RiEditLine,
} from "@remixicon/react";
import { DocumentsUploadForm } from "@/components/forms/DocumentsUploadForm";
import { DocumentsEditForm } from "@/components/forms/DocumentsEditForm";
import { DocumentsDeleteForm } from "@/components/forms/DocumentsDeleteForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui";
import { Database } from "@/types/database";

type Document = Database["public"]["Tables"]["documents"]["Row"];

export default function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const t = useTranslations();
  const [id, setId] = useState<string>("");

  useEffect(() => {
    if (params instanceof Promise) {
      params.then(({ id: resolvedId }) => {
        setId(resolvedId);
      });
    } else {
      setId(params.id);
    }
  }, [params]);
  const { funeral, isLoading: funeralLoading } = useFuneral(id);
  const {
    documents,
    isLoading: documentsLoading,
    deleteDocument,
  } = useDocuments(id);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

  const handleEdit = (document: Document) => {
    setSelectedDocument(document);
    setEditDialogOpen(true);
  };

  const handleDelete = (document: Document) => {
    setSelectedDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleDownload = async (doc: Document) => {
    try {
      // Create a signed URL for download
      const { getSupabaseBrowser } = await import("@/lib/supabase/browser");
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.storage
        .from("funeral-documents")
        .createSignedUrl(doc.storage_path, 3600); // 1 hour expiry

      if (data?.signedUrl) {
        const link = document.createElement("a");
        link.href = data.signedUrl;
        link.download = doc.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nl-NL", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (funeralLoading) {
    return (
      <div className="p-6 space-y-6 w-full">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documenten</h1>
          <p className="text-gray-600 mt-1">
            Beheer alle documenten voor deze uitvaart
          </p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <RiAddLine className="h-4 w-4 mr-2" />
              Document uploaden
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Document uploaden</DialogTitle>
            </DialogHeader>
            <DocumentsUploadForm
              funeralId={id}
              onSuccess={() => setUploadDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {documentsLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-8 text-center">
          <RiFileLine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nog geen documenten
          </h3>
          <p className="text-gray-600 mb-4">
            Upload uw eerste document voor deze uitvaart.
          </p>
          <Button onClick={() => setUploadDialogOpen(true)}>
            <RiAddLine className="h-4 w-4 mr-2" />
            Document uploaden
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <RiFileLine className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {document.file_name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{formatFileSize(document.file_size || 0)}</span>
                      <span>
                        {formatDate(
                          document.created_at || new Date().toISOString()
                        )}
                      </span>
                      {document.description && (
                        <span className="truncate">{document.description}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <RiDownloadLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(document)}
                    className="text-gray-600 hover:text-gray-700"
                  >
                    <RiEditLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(document)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document bewerken</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <DocumentsEditForm
              document={selectedDocument}
              onSuccess={() => {
                setEditDialogOpen(false);
                setSelectedDocument(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weet je het zeker?</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <DocumentsDeleteForm
              document={selectedDocument}
              onSuccess={() => {
                setDeleteDialogOpen(false);
                setSelectedDocument(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
