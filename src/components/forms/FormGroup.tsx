import { cn } from "@/lib/utils";

interface FormGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}
export function FormGroup({ title, children, className }: FormGroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 bg-slate-50/2 border border-slate-200 rounded-sm p-3",
        className
      )}
    >
      <div className="space-y-4">
        <h3 className="col-span-full text-xs font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  );
}
