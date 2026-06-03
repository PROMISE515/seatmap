import { Link, useLocation } from "@tanstack/react-router";
import { Bookmark, MapPin } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import {
  HOME_SCROLL_ROOT_ID,
  readHomeScrollY,
  requestHomeScrollRestore,
  restoreHomeScrollY,
} from "@/lib/home-scroll";
import { useT } from "@/lib/i18n";

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { t } = useT();
  const isHome = pathname === "/";
  const isSaved = pathname === "/saved";

  useEffect(() => {
    if (!isHome || typeof window === "undefined") return;
    const scrollY = readHomeScrollY();
    if (scrollY <= 0) return;

    const restore = () => restoreHomeScrollY(scrollY);
    window.requestAnimationFrame(() => window.requestAnimationFrame(restore));
    const timers = [
      window.setTimeout(restore, 80),
      window.setTimeout(restore, 180),
      window.setTimeout(restore, 380),
      window.setTimeout(restore, 760),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isHome, pathname]);

  return (
    <div className="h-[100dvh] overflow-hidden bg-surface flex justify-center">
      <div className="w-full max-w-[420px] bg-background h-[100dvh] shadow-2xl shadow-black/5 flex flex-col relative overflow-hidden">
        <main id={HOME_SCROLL_ROOT_ID} className="flex-1 overflow-y-auto pb-24">
          {children}
        </main>

        <nav className="absolute bottom-0 left-0 w-full bg-background/85 backdrop-blur-xl border-t border-border">
          <ul className="flex justify-around py-3">
            <NavItem
              to="/"
              label={t("nav.nearby")}
              icon={<MapPin className="size-4" />}
              active={isHome}
            />
            <NavItem
              to="/saved"
              label={t("home.saved")}
              icon={<Bookmark className="size-4" />}
              active={isSaved}
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
  to: "/" | "/saved";
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
      <Link
        to={to}
        onClick={() => {
          if (to === "/") requestHomeScrollRestore();
        }}
      >
        {content}
      </Link>
    </li>
  );
}
