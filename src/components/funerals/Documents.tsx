"use client";

import { useDocuments } from "@/hooks/useDocuments";
import { Skeleton, Button, EmptyState } from "@/components/ui";
import { RiFileLine, RiDownloadLine } from "@remixicon/react";
import type { Database } from "@/types/database";
import { useState, useMemo } from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { DocumentsEditForm } from "@/components/forms/DocumentsEditForm";
import { DocumentsDeleteForm } from "@/components/forms/DocumentsDeleteForm";
import type { SearchResult } from "@/hooks/useSearch";
import { formatFileSize, formatDateTime } from "@/lib/format-helpers";

type Document = Database["public"]["Tables"]["documents"]["Row"];

interface DocumentsProps {
  funeralId: string;
}

export function Documents({ funeralId }: DocumentsProps) {
  const { documents, isLoading } = useDocuments(funeralId);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Show search results if available, otherwise show all documents
  // Note: document search is not yet implemented in the database search function
  const displayDocuments = useMemo(() => {
    if (searchResults.length > 0) {
      // Filter for document results (when search supports it)
      const documentResults = searchResults
        .filter((result) => (result.entity_type as string) === "document")
        .map((result) =>
          documents?.find((document) => document.id === result.entity_id)
        )
        .filter(Boolean) as Document[];

      return documentResults.length > 0 ? documentResults : documents || [];
    }
    return documents || [];
  }, [searchResults, documents]);

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

  const isEmpty = !displayDocuments || displayDocuments.length === 0;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Documenten</h3>
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
    <div className="px-4">
      {isEmpty ? (
        <EmptyState
          icon={<RiFileLine className="h-6 w-6 text-gray-400" />}
          title="Nog geen documenten"
          description="Upload uw eerste document voor deze uitvaart"
        />
      ) : (
        <div className="space-y-3">
          {displayDocuments.map((document: Document) => (
            <GenericCard
              key={document.id}
              to={`/funerals/${funeralId}/documents/${document.id}`}
              title={document.file_name}
              subtitle={`${formatFileSize(
                document.file_size || 0
              )} • ${formatDateTime(
                document.created_at || new Date().toISOString()
              )}`}
              actions={
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDownload(document);
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <RiDownloadLine className="h-4 w-4" />
                  </Button>
                  <DocumentsEditForm document={document} withDialog={true} />
                  <DocumentsDeleteForm document={document} withDialog={true} />
                </div>
              }
              content={
                document.description ? (
                  <p className="text-sm text-gray-600">
                    {document.description}
                  </p>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
