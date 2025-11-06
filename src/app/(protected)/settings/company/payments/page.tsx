"use client";

import React from "react";
import { GenericCard } from "@/components/ui/GenericCard";
import { Button } from "@/components/ui/Button";

export default function PaymentsSettingsPage() {
  const mock = {
    plan: { name: "Pro", price: 34, term: "Jaarlijks" },
    payment: { method: "Creditcard", masked: "***023" },
    invoices: [{ date: "6 Aug, 2025", status: "Betaald" }],
  };

  return (
    <div className="flex flex-col gap-4">
      <GenericCard
        title="Abonnement"
        content={
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-gray-500 text-xs mb-1">Plan</div>
              <div className="underline">{mock.plan.name}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Prijs</div>
              <div>€ {mock.plan.price}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Termijn</div>
              <div>{mock.plan.term}</div>
            </div>
          </div>
        }
        actions={
          <Button variant="outline" size="sm">
            Wijzigen
          </Button>
        }
      />

      <GenericCard
        title="Betalingen"
        content={
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <div className="text-gray-500 text-xs mb-1">Betaalmethode</div>
              <div>{mock.payment.method}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Creditcardnummer</div>
              <div>Endigend op {mock.payment.masked}</div>
            </div>
          </div>
        }
        actions={
          <Button variant="outline" size="sm">
            Wijzigen
          </Button>
        }
      />

      <GenericCard
        title="Facturen"
        content={
          <div className="grid grid-cols-2 text-sm">
            <div className="text-gray-500 px-2 py-1">Datum</div>
            <div className="text-gray-500 px-2 py-1">Status</div>
            {mock.invoices.map((i, idx) => (
              <React.Fragment key={idx}>
                <div className="px-2 py-2 border-t">{i.date}</div>
                <div className="px-2 py-2 border-t">{i.status}</div>
              </React.Fragment>
            ))}
          </div>
        }
      />
    </div>
  );
}
