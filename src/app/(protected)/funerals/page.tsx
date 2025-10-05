"use client";
import { Content } from "@/components/layout";
import { Funerals } from "@/components/funerals/Funerals";

export default function FuneralsPage() {
  return (
    <Content>
      <div className="p-2 space-y-2 w-full">
        <Funerals filters={{}} />
      </div>
    </Content>
  );
}
