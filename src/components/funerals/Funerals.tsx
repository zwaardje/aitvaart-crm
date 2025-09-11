"use client";

import { useFunerals } from "@/hooks/useFunerals";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  SideSheet,
} from "@/components/ui";
import { useTranslations } from "next-intl";
import { RiAddLine } from "@remixicon/react";
import { SectionHeader } from "@/components/layout";
import { IntakeForm } from "@/components/forms";
import { useState } from "react";
import { format } from "date-fns";
import { Link } from "@/components/ui";

export function Funerals() {
  const { funerals, isLoading } = useFunerals();
  const t = useTranslations("funerals");
  const ti = useTranslations("intake");
  const [open, setOpen] = useState(false);

  const isEmpty = !funerals || funerals.length === 0;

  return (
    <section className="space-y-4 w-full border rounded-md p-4 bg-white">
      <SectionHeader
        title={t("section.title", { default: "Funerals" })}
        description={t("section.description", {
          default: "Overview of recent funerals",
        })}
      />

      <div className={"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"}>
        {isLoading &&
          isEmpty &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 p-6 rounded-sm" />
          ))}
        {!isLoading && isEmpty && (
          <Card
            className="h-52 rounded-sm cursor-pointer hover:border-primary/40 transition-colorss"
            onClick={() => setOpen(true)}
          >
            <CardContent className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-muted-foreground/30">
                  <RiAddLine className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="max-w-xs text-sm text-muted-foreground">
                  {t("empty.description")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isEmpty &&
          funerals!.map((f, i) => (
            <Link key={f.id} href={`/funerals/${f.id}`} className="block">
              <Card
                className="h-52 rounded-sm transform-gpu transition-all duration-300 opacity-0 translate-y-1 hover:border-primary/40"
                style={{
                  transitionDelay: `${i * 50}ms`,
                  opacity: isLoading ? 0 : (1 as any),
                }}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-1">
                    {f.deceased?.first_names} {f.deceased?.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex text-sm text-muted-foreground gap-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs">
                        {t("card.dateOfBirth")}
                      </span>
                      <span className="text-sm text-foreground">
                        {f.deceased?.date_of_birth
                          ? format(
                              new Date(f.deceased.date_of_birth),
                              "dd-MM-yyyy"
                            )
                          : "-"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground text-xs">
                        {t("card.dateOfDeath")}
                      </span>
                      <span className="text-sm text-foreground">
                        {f.deceased?.date_of_death
                          ? format(
                              new Date(f.deceased.date_of_death),
                              "dd-MM-yyyy"
                            )
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs">
                      {t("card.adress")}
                    </span>
                    <span className="text-sm text-foreground">
                      {f.deceased?.street} {f.deceased?.house_number}{" "}
                    </span>
                    <span className="text-sm text-foreground">
                      {f.deceased?.house_number_addition}{" "}
                      {f.deceased?.postal_code}
                      {f.deceased?.city}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
      </div>
      <SideSheet
        open={open}
        onOpenChange={setOpen}
        title={ti("title", { default: "Intake" })}
        description={ti("description", {
          default: "Vul de gegevens in voor de intake.",
        })}
      >
        <IntakeForm />
      </SideSheet>
    </section>
  );
}
