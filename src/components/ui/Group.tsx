import { cn } from "@/lib/utils";

interface GroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}
export function Group({
  title,
  children,
  className,
  border = false,
}: GroupProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 bg-slate-50/2 py-3",
        border && "border border-slate-200 rounded-sm px-3",
        className
      )}
    >
      <div className="space-y-4">
        {title && (
          <h3 className="col-span-full text-xs font-semibold">{title}</h3>
        )}
        <div className="flex flex-row gap-3 space-evenly">{children}</div>
      </div>
    </div>
  );
}
