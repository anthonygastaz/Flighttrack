interface AdminPageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({ title, description, children }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-normal tracking-tight text-white">{title}</h1>
        {description && <p className="mt-1 text-sm text-white/60">{description}</p>}
      </div>
      {children}
    </div>
  );
}
