"use client";

import { useTranslations } from "next-intl";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { IntakeForm } from "@/components/forms";
import { z } from "zod";
import { schemas } from "@/lib/validation";
import { useMutation } from "@tanstack/react-query";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

const deceasedSchema = schemas.deceased.create;
const clientSchema = schemas.client.create;
const funeralSchema = schemas.funeral.create;

type DeceasedForm = z.infer<typeof deceasedSchema>;
type ClientForm = z.infer<typeof clientSchema>;
type FuneralForm = z.infer<typeof funeralSchema>;

export function IntakeWizard() {
  const t = useTranslations("intake");

  const createAllMutation = useMutation({
    mutationFn: async (payload: {
      deceased: DeceasedForm;
      client: ClientForm;
      funeral: Omit<FuneralForm, "deceased_id" | "client_id">;
    }) => {
      const supabase = getSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user session");

      const { data: deceased, error: dErr } = await supabase
        .from("deceased")
        .insert({ ...payload.deceased, entrepreneur_id: user.id })
        .select("id")
        .single();
      if (dErr) throw dErr;

      const { data: client, error: cErr } = await supabase
        .from("clients")
        .insert({ ...payload.client, entrepreneur_id: user.id })
        .select("id")
        .single();
      if (cErr) throw cErr;

      const { error: fErr } = await supabase.from("funerals").insert({
        deceased_id: deceased.id,
        client_id: client.id,
        entrepreneur_id: user.id,
        location: payload.funeral.location ?? null,
        signing_date: payload.funeral.signing_date ?? null,
        funeral_director: payload.funeral.funeral_director ?? null,
      });
      if (fErr) throw fErr;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title", { default: "Intake" })}</CardTitle>
        <CardDescription>
          {t("description", { default: "Vul de gegevens in voor de intake." })}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <IntakeForm />
      </CardContent>
    </Card>
  );
}
