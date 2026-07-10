import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  breadcrumbs?: Crumb[];
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ breadcrumbs, title, description, actions }: PageHeaderProps) {
  return (
    <div className="px-6 pt-4 pb-3 border-b border-[var(--aws-border)] bg-white">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-[var(--aws-text-secondary)] mb-1.5">
          {breadcrumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {c.href ? (
                <Link href={c.href} className="hover:underline text-[var(--aws-blue)]">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
              {i < breadcrumbs.length - 1 && <ChevronRight size={12} />}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--aws-text)]">{title}</h1>
          {description && (
            <p className="text-sm text-[var(--aws-text-secondary)] mt-0.5 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
