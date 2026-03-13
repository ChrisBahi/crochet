"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const links = [
    { href: "/app", label: "Tableau de bord" },
    { href: "/app/opportunities", label: "Projets" },
    { href: "/app/matches", label: "Correspondances" },
    { href: "/app/rooms", label: "Salons" },
    { href: "/app/settings", label: "Paramètres" },
  ];

  return (
    <nav className="w-60 border-r border-white/10 p-4">
      <div className="mb-4 text-sm font-semibold text-white/70">Navigation</div>
      <div className="space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                isActive ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
