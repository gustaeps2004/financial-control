import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  CalendarBlank,
  CreditCard,
  Gear,
  ListBullets,
  Repeat,
  SignOut,
  SquaresFour,
} from "@phosphor-icons/react";
import { cn } from "@/shared/lib/cn";
import { useI18n } from "@/lib/i18n/i18n-context";
import { useAuth, useInitials } from "@/features/auth/context/AuthContext";

const NAV_ITEMS = [
  { to: "/app/dashboard", key: "dashboard", Icon: SquaresFour },
  { to: "/app/transactions", key: "transactions", Icon: ListBullets },
  { to: "/app/statements", key: "statements", Icon: CreditCard },
  { to: "/app/recurring", key: "recurring", Icon: Repeat },
  { to: "/app/year", key: "year", Icon: CalendarBlank },
  { to: "/app/settings", key: "settings", Icon: Gear },
] as const;

function UserChip({ className }: { className?: string }) {
  const { displayName, logout } = useAuth();
  const { t } = useI18n();
  const initials = useInitials();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className={cn("items-center gap-2 rounded-md bg-ink/3 p-2", className)}>
      <span className="grid size-[26px] flex-none place-items-center rounded-full bg-accent-800 text-[11px] font-semibold">
        {initials}
      </span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-neutral-400">{displayName}</span>
      <button
        type="button"
        onClick={handleSignOut}
        aria-label={t.nav.signOut}
        className="cursor-pointer border-0 bg-transparent p-0 text-neutral-600 hover:text-ink"
      >
        <SignOut size={15} />
      </button>
    </div>
  );
}

// A sidebar from md up; on phones it folds into a top bar whose nav scrolls
// sideways, so the page content starts right below it.
export function AppShell() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex flex-none flex-col gap-2.5 bg-sidebar p-3 md:sticky md:top-0 md:h-screen md:w-50 md:gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="px-2 py-0.5 text-[17px] font-semibold">Tally</div>
          <UserChip className="flex max-w-[60%] md:hidden" />
        </div>

        <nav className="-mx-3 flex gap-0.5 overflow-x-auto px-3 md:mx-0 md:flex-col md:overflow-visible md:px-0">
          {NAV_ITEMS.map(({ to, key, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex flex-none items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap no-underline",
                  "hover:bg-ink/7",
                  isActive ? "bg-accent/16 text-ink" : "text-neutral-500",
                )
              }
            >
              <Icon size={16} />
              {t.nav[key]}
            </NavLink>
          ))}
        </nav>

        <UserChip className="mt-auto hidden md:flex" />
      </aside>

      <main className="min-w-0 flex-1 px-4 pt-5 pb-14 md:px-6.5 md:pt-5.5">
        <Outlet />
      </main>
    </div>
  );
}
