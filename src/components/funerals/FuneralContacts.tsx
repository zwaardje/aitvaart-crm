"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { useFuneralContacts } from "@/hooks";
import type { Database } from "@/types/database";
import { Skeleton } from "@/components/ui";
import { ContactsCard } from "@/components/funerals/ContactsCard";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type FuneralContactRow =
  Database["public"]["Tables"]["funeral_contacts"]["Row"];
type ContactWithClient = FuneralContactRow & { client: ClientRow | null };

export type CreateForm = {
  preferred_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  relation?: string;
  is_primary?: boolean;
};
export type EditForm = CreateForm;

type Props = { funeralId: string };

export function FuneralContacts({ funeralId }: Props) {
  const { contacts, isLoading, updateContact, deleteContact } =
    useFuneralContacts(funeralId);

  const typedContacts = (contacts as unknown as ContactWithClient[]) ?? [];

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
            {typedContacts.map((c) => (
              <ContactsCard
                key={c.id}
                contact={c}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
