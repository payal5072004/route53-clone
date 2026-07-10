"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Signpost,
  HeartPulse,
  Waypoints,
  UserCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/hosted-zones", label: "Hosted zones", icon: Globe },
  { href: "/traffic-policies", label: "Traffic policies", icon: Signpost },
  { href: "/health-checks", label: "Health checks", icon: HeartPulse },
  { href: "/resolver", label: "Resolver", icon: Waypoints },
  { href: "/profiles", label: "Profiles", icon: UserCircle },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 bg-white border-r border-[var(--aws-border)] h-full overflow-y-auto py-2">
      <div className="px-4 py-2 text-xs font-semibold text-[var(--aws-text-secondary)] uppercase tracking-wide">
        Route 53
      </div>
      <ul>
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 px-4 py-2 text-sm border-l-[3px] transition-colors ${
                  active
                    ? "border-[var(--aws-orange)] bg-[#f0f7ff] text-[var(--aws-blue)] font-medium"
                    : "border-transparent text-[var(--aws-text)] hover:bg-gray-50"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
