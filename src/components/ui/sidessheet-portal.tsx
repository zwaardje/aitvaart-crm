import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

export const SidesheetPortal = ({
  children,
  selector = "[data-slot=main]",
}: {
  children?: React.ReactNode;
  selector?: string;
}) => {
  const [mountNode, setMountNode] = useState<Element | null>(null);

  useLayoutEffect(() => {
    const el = document.querySelector(selector);
    if (!el) return;
    setMountNode(el);
  }, [selector]);

  if (!mountNode) return null;

  return createPortal(children, mountNode);
};
