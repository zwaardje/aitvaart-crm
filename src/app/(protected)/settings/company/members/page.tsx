"use client";

import React from "react";
import {
  useCurrentUserOrganization,
  useOrganizationMembers,
  useInviteMember,
  useUpdateMember,
  useRemoveMember,
} from "@/hooks/useOrganizations";
import { GenericCard } from "@/components/ui/GenericCard";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/forms/Form";
import { FormInput } from "@/components/forms/FormInput";
import { SubmitButton } from "@/components/forms/SubmitButton";
import { z } from "zod";
import { DialogClose, DialogFooter } from "@/components/ui";
import { RiEditLine, RiDeleteBinLine, RiAddLine } from "@remixicon/react";

export default function MembersSettingsPage() {
  const { data } = useCurrentUserOrganization();
  const organizationId = data?.organization?.id as string | undefined;
  const members = useOrganizationMembers(organizationId || "");
  const invite = useInviteMember();
  const update = useUpdateMember();
  const remove = useRemoveMember();

  const inviteSchema = z.object({
    email: z.string().email(),
    role: z.string().default("member"),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="text-2xl font-semibold">Teamleden en permissies</div>
        <div className="flex-1" />
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <RiAddLine className="h-4 w-4" />
              Toevoegen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Teamlid uitnodigen</DialogTitle>
            </DialogHeader>
            <Form
              schema={inviteSchema}
              onSubmit={(values) =>
                invite.mutate(
                  {
                    organizationId: organizationId!,
                    email: values.email,
                    role: values.role,
                    permissions: {},
                  },
                  { onSuccess: () => members.refetch() }
                )
              }
            >
              <div className="space-y-4">
                <FormInput name="email" label="E-mail" type="email" required />
                <FormInput name="role" label="Rol" placeholder="member" />
                <DialogFooter className="mt-2 flex flex-row justify-between">
                  <DialogClose asChild>
                    <Button variant="outline">Annuleren</Button>
                  </DialogClose>
                  <SubmitButton isLoading={invite.isPending}>
                    Uitnodigen
                  </SubmitButton>
                </DialogFooter>
              </div>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {(members.data || []).map((m: any) => (
          <GenericCard
            key={m.id}
            title={m.user?.full_name || "Onbekend"}
            subtitle={m.role === "owner" ? "Eigenaar" : m.role}
            content={<div className="text-sm">Toegang: alle dossiers</div>}
            actions={
              <div className="flex items-center gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <RiEditLine className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Teamrol aanpassen</DialogTitle>
                    </DialogHeader>
                    <Form
                      schema={z.object({ role: z.string() })}
                      onSubmit={(values) =>
                        update.mutate(
                          { id: m.id, role: values.role },
                          { onSuccess: () => members.refetch() }
                        )
                      }
                      defaultValues={{ role: m.role }}
                    >
                      <div className="space-y-4">
                        <FormInput name="role" label="Rol" />
                        <DialogFooter className="mt-2 flex flex-row justify-between">
                          <DialogClose asChild>
                            <Button variant="outline">Annuleren</Button>
                          </DialogClose>
                          <SubmitButton isLoading={update.isPending}>
                            Opslaan
                          </SubmitButton>
                        </DialogFooter>
                      </div>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    remove.mutate(m.id, { onSuccess: () => members.refetch() })
                  }
                >
                  <RiDeleteBinLine className="h-4 w-4" />
                </Button>
              </div>
            }
          />
        ))}
      </div>
    </div>
  );
}
