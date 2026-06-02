import { Link, useLocation } from "@tanstack/react-router";
import { MapPin, Flag } from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isReport = pathname === "/report";

  return (
    <div className="min-h-screen bg-surface flex justify-center">
      <div className="w-full max-w-[420px] bg-background min-h-screen shadow-2xl shadow-black/5 flex flex-col relative">
        <main className="flex-1 pb-24">{children}</main>

        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] bg-background/85 backdrop-blur-xl border-t border-border">
          <ul className="flex justify-around py-3">
            <NavItem to="/" label="Nearby" icon={<MapPin className="size-4" />} active={isHome} />
            <NavItem
              to="/report"
              label="Report"
              icon={<Flag className="size-4" />}
              active={isReport}
            />
          </ul>
        </nav>
      </div>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon,
  active,
}: {
  to: "/" | "/report";
  label: string;
  icon: ReactNode;
  active?: boolean;
}) {
  const cls = active ? "text-primary" : "text-muted-foreground";
  const content = (
    <div className={`flex flex-col items-center gap-1 ${cls}`}>
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
  return (
    <li>
      <Link to={to}>{content}</Link>
    </li>
  );
}
