"use client";

import * as React from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useFuneralContacts } from "@/hooks";
import type { Database } from "@/types/database";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Skeleton,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import {
  FuneralContactForm,
  FuneralContactDeleteForm,
} from "@/components/forms";
import { SectionHeader } from "@/components/layout";
import { RiAddLine, RiEditLine, RiDeleteBinLine } from "@remixicon/react";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type FuneralContactRow =
  Database["public"]["Tables"]["funeral_contacts"]["Row"];
type ContactWithClient = FuneralContactRow & { client: ClientRow | null };

type CreateForm = {
  preferred_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  relation?: string;
  is_primary?: boolean;
};
type EditForm = CreateForm;

type Props = { funeralId: string };

export function FuneralContacts({ funeralId }: Props) {
  const { contacts, isLoading, createContact, updateContact, deleteContact } =
    useFuneralContacts(funeralId);
  const typedContacts = (contacts as unknown as ContactWithClient[]) ?? [];

  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ContactWithClient | null>(null);

  const onCreate = async (data: CreateForm) => {
    const supabase = getSupabaseBrowser();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Geen gebruiker aangemeld");

    if (data.is_primary) {
      await supabase
        .from("funeral_contacts")
        .update({ is_primary: false })
        .eq("funeral_id", funeralId);
    }

    const { data: client, error: cErr } = await supabase
      .from("clients")
      .insert({
        entrepreneur_id: user.id,
        preferred_name: data.preferred_name,
        last_name: data.last_name,
        email: data.email || null,
        phone_number: data.phone_number || null,
      })
      .select("id")
      .single();
    if (cErr) throw cErr;

    await createContact({
      funeral_id: funeralId,
      client_id: client.id,
      relation: data.relation || null,
      is_primary: !!data.is_primary,
      notes: null,
    });

    setAddOpen(false);
  };

  const onEdit = async (data: EditForm) => {
    if (!editing) return;
    const supabase = getSupabaseBrowser();

    if (data.is_primary) {
      await supabase
        .from("funeral_contacts")
        .update({ is_primary: false })
        .eq("funeral_id", funeralId)
        .neq("id", editing.id);
    }

    if (editing.client?.id) {
      const { error: uErr } = await supabase
        .from("clients")
        .update({
          preferred_name: data.preferred_name,
          last_name: data.last_name,
          email: data.email || null,
          phone_number: data.phone_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editing.client.id);
      if (uErr) throw uErr;
    }

    await updateContact({
      id: editing.id,
      updates: {
        relation: data.relation || null,
        is_primary: !!data.is_primary,
      },
    });

    setEditOpen(false);
    setEditing(null);
  };

  const onDelete = async (contact: ContactWithClient) => {
    const ok = window.confirm(
      `Contact “${contact.client?.preferred_name} ${contact.client?.last_name}” verwijderen?`
    );
    if (!ok) return;
    await deleteContact(contact.id);
  };

  return (
    <>
      <SectionHeader
        title="Nabestaanden"
        actions={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                aria-label="Toevoegen"
                title="Toevoegen"
              >
                <RiAddLine className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nieuw contact</DialogTitle>
              </DialogHeader>
              <FuneralContactForm onSubmit={onCreate} submitLabel="Toevoegen" />
            </DialogContent>
          </Dialog>
        }
      />
      <div className="mt-3">
        {isLoading && <Skeleton className="h-16 w-full" />}
        {!isLoading && typedContacts.length === 0 && (
          <span className="text-muted-foreground">
            Nog geen contactpersonen
          </span>
        )}
        {!isLoading && typedContacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {typedContacts.map((c) => (
              <Card key={c.id}>
                <CardContent className="pt-4">
                  <SectionHeader
                    title={
                      <div className="flex items-center gap-2">
                        <span className="truncate">
                          {c.client?.preferred_name} {c.client?.last_name}
                        </span>
                        {c.is_primary && (
                          <Badge className="ml-1">Primair</Badge>
                        )}
                      </div>
                    }
                    description={c.relation || "-"}
                    scale="xs"
                    actions={[
                      <Dialog
                        key="edit"
                        open={editOpen && editing?.id === c.id}
                        onOpenChange={(open) => {
                          setEditOpen(open);
                          if (!open) setEditing(null);
                        }}
                      >
                        <Button
                          variant="icon-outline"
                          size="icon"
                          aria-label="Bewerken"
                          title="Bewerken"
                          onClick={() => {
                            setEditing(c);
                            setEditOpen(true);
                          }}
                        >
                          <RiEditLine className="h-4 w-4" />
                        </Button>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Contact bewerken</DialogTitle>
                          </DialogHeader>
                          <FuneralContactForm
                            defaultValues={{
                              preferred_name: c.client?.preferred_name ?? "",
                              last_name: c.client?.last_name ?? "",
                              email: c.client?.email ?? "",
                              phone_number: c.client?.phone_number ?? "",
                              relation: c.relation ?? "",
                              is_primary: !!c.is_primary,
                            }}
                            onSubmit={onEdit}
                            submitLabel="Opslaan"
                          />
                        </DialogContent>
                      </Dialog>,
                      <Dialog key="delete">
                        <DialogTrigger asChild>
                          <Button
                            variant="icon-outline"
                            size="icon"
                            aria-label="Verwijderen"
                            title="Verwijderen"
                          >
                            <RiDeleteBinLine className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Weet je het zeker?</DialogTitle>
                          </DialogHeader>
                          <FuneralContactDeleteForm
                            contactFirstName={c.client?.preferred_name ?? ""}
                            onConfirm={() => onDelete(c)}
                          />
                        </DialogContent>
                      </Dialog>,
                    ]}
                  />

                  <div className="mt-3 text-sm">
                    <div className="truncate">{c.client?.email ?? "-"}</div>
                    <div className="text-muted-foreground">
                      {c.client?.phone_number ?? "-"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
