import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, className, children }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-brand-dark">{title}</h1>
        {description && <p className="text-zinc-500">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
