import { Inbox, Construction } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <Inbox size={32} className="text-[var(--aws-text-secondary)] mb-3" />
      <h3 className="text-sm font-semibold text-[var(--aws-text)]">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--aws-text-secondary)] mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ComingSoon({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-6">
      <div className="w-14 h-14 rounded-full bg-[#fff3e6] flex items-center justify-center mb-4">
        <Construction size={26} className="text-[var(--aws-orange)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--aws-text)]">{feature} is coming soon</h3>
      <p className="text-sm text-[var(--aws-text-secondary)] mt-1.5 max-w-sm">
        This section isn&apos;t implemented yet. In the real Route53 console, this is where
        you&apos;d manage {feature.toLowerCase()}.
      </p>
    </div>
  );
}
