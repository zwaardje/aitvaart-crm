import { GenericCard } from "@/components/ui/GenericCard";
import { Badge } from "@/components/ui/badge";
import {
  FuneralContactEditForm,
  FuneralContactDeleteForm,
} from "@/components/forms";
import type { Database } from "@/types/database";
import type { EditForm } from "@/components/funerals/FuneralContacts";

type FuneralContact =
  Database["public"]["Tables"]["funeral_contacts"]["Row"] & {
    client: Database["public"]["Tables"]["clients"]["Row"] | null;
  };

export function ContactsCard({
  contact,
  onEdit,
  onDelete,
}: {
  contact: FuneralContact;
  onEdit: (contact: FuneralContact, data: EditForm) => void;
  onDelete: (contact: FuneralContact) => void;
}) {
  return (
    <GenericCard
      key={contact.id}
      title={`${contact.client?.preferred_name} ${contact.client?.last_name}`}
      subtitle={contact.relation || "-"}
      content={
        contact.client?.email ||
        (contact.client?.phone_number && (
          <div className="text-sm">
            <div className="truncate">{contact.client?.email}</div>
            <div className="text-muted-foreground">
              {contact.client?.phone_number}
            </div>
          </div>
        ))
      }
      actions={
        <>
          {contact.is_primary && (
            <Badge className="text-xs font-normal">Opdrachtgever</Badge>
          )}
          <FuneralContactEditForm contact={contact} onEdit={onEdit} />
          <FuneralContactDeleteForm
            contactFirstName={contact.client?.preferred_name ?? ""}
            onConfirm={() => onDelete(contact)}
          />
        </>
      }
    />
  );
}
