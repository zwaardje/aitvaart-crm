"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useDocuments } from "@/hooks/useDocuments";
import { Button, DialogClose, DialogFooter } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RiUploadLine, RiFileLine } from "@remixicon/react";

interface DocumentsUploadFormProps {
  funeralId: string;
  onSuccess?: () => void;
  withDialog?: boolean;
}

export function DocumentsUploadForm({
  funeralId,
  onSuccess,
  withDialog = false,
}: DocumentsUploadFormProps) {
  const t = useTranslations();
  const { uploadDocument, isUploading } = useDocuments(funeralId);
  const [isOpen, setIsOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return;

    try {
      await uploadDocument({ file, description: description || undefined });
      setFile(null);
      setDescription("");
      if (withDialog) setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error uploading document:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="file">Bestand</Label>
        <div
          className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {file ? (
            <div className="space-y-2">
              <RiFileLine className="h-8 w-8 text-blue-500 mx-auto" />
              <div className="text-sm text-gray-900 font-medium">
                {file.name}
              </div>
              <div className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFile(null)}
                className="mt-2"
              >
                Verwijder bestand
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <RiUploadLine className="h-8 w-8 text-gray-400 mx-auto" />
              <div className="text-sm text-gray-600">
                Sleep een bestand hierheen of klik om te selecteren
              </div>
              <div className="text-xs text-gray-500">
                PDF, DOC, DOCX, JPG, PNG (max. 10MB)
              </div>
            </div>
          )}
        </div>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          className="mt-2"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
      </div>

      <div>
        <Label htmlFor="description">Beschrijving (optioneel)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Voeg een beschrijving toe aan dit document..."
          rows={3}
          className="mt-2"
        />
      </div>

      {withDialog ? (
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Annuleren
            </Button>
          </DialogClose>
          <Button type="submit" disabled={!file || isUploading}>
            {isUploading ? "Uploaden..." : "Uploaden"}
          </Button>
        </DialogFooter>
      ) : (
        <div className="flex justify-end space-x-3">
          <Button type="submit" disabled={!file || isUploading}>
            {isUploading ? "Uploaden..." : "Uploaden"}
          </Button>
        </div>
      )}
    </form>
  );

  if (withDialog) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Uploaden
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Document uploaden</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
