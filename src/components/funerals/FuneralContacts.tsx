"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useFuneralContacts } from "@/hooks";
import type { Database } from "@/types/database";
import { Badge, Skeleton, GenericCard } from "@/components/ui";
import {
  FuneralContactForm,
  FuneralContactEditForm,
  FuneralContactDeleteForm,
} from "@/components/forms";
import { SectionHeader } from "@/components/layout";
import { useMemo } from "react";

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
  const { contacts, isLoading, updateContact, deleteContact } =
    useFuneralContacts(funeralId);
  const typedContacts = (contacts as unknown as ContactWithClient[]) ?? [];

  const sortedContacts = useMemo(
    () =>
      typedContacts.sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return 0;
      }),
    [typedContacts]
  );

  const onEdit = async (contact: ContactWithClient, data: EditForm) => {
    const supabase = getSupabaseBrowser();

    if (data.is_primary) {
      await supabase
        .from("funeral_contacts")
        .update({ is_primary: false })
        .eq("funeral_id", funeralId)
        .neq("id", contact.id);
    }

    if (contact.client?.id) {
      const { error: uErr } = await supabase
        .from("clients")
        .update({
          preferred_name: data.preferred_name,
          last_name: data.last_name,
          email: data.email || null,
          phone_number: data.phone_number || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contact.client.id);
      if (uErr) throw uErr;
    }

    await updateContact({
      id: contact.id,
      updates: {
        relation: data.relation || null,
        is_primary: !!data.is_primary,
      },
    });
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
      <div className="mt-3">
        {isLoading && <Skeleton className="h-16 w-full" />}
        {!isLoading && typedContacts.length === 0 && (
          <span className="text-muted-foreground">
            Nog geen contactpersonen
          </span>
        )}
        {!isLoading && typedContacts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedContacts.map((c) => (
              <GenericCard
                key={c.id}
                title={`${c.client?.preferred_name} ${c.client?.last_name}`}
                subtitle={c.relation || "-"}
                content={
                  <div className="text-sm">
                    <div className="truncate">{c.client?.email ?? "-"}</div>
                    <div className="text-muted-foreground">
                      {c.client?.phone_number ?? "-"}
                    </div>
                  </div>
                }
                actions={
                  <>
                    {c.is_primary && (
                      <Badge className="text-xs font-normal">
                        Opdrachtgever
                      </Badge>
                    )}
                    <FuneralContactEditForm contact={c} onEdit={onEdit} />
                    <FuneralContactDeleteForm
                      contactFirstName={c.client?.preferred_name ?? ""}
                      onConfirm={() => onDelete(c)}
                    />
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
