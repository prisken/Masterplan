interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500 md:text-base">{subtitle}</p>}
    </header>
  );
}
