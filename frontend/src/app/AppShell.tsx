import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Gear, ListBullets, SignOut, SquaresFour } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/cn";
import { useAuth, useInitials } from "@/features/auth/context/AuthContext";

const NAV_ITEMS = [
  { to: "/app/dashboard", label: "Dashboard", Icon: SquaresFour },
  { to: "/app/transactions", label: "Transactions", Icon: ListBullets },
  { to: "/app/settings", label: "Settings", Icon: Gear },
];

export function AppShell() {
  const { displayName, logout } = useAuth();
  const initials = useInitials();
  const navigate = useNavigate();

  function handleSignOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen flex-wrap items-stretch">
      <aside className="flex min-w-[180px] flex-1 basis-[196px] flex-col gap-5 bg-sidebar p-3">
        <div className="px-2 py-0.5 text-[17px] font-semibold">Tally</div>

        <nav className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-0.5">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] font-medium no-underline",
                  "hover:bg-ink/7",
                  isActive ? "bg-accent/16 text-ink" : "text-neutral-500",
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-2 rounded-md bg-ink/3 p-2">
          <span className="grid size-[26px] flex-none place-items-center rounded-full bg-accent-800 text-[11px] font-semibold">
            {initials}
          </span>
          <span className="min-w-0 flex-1 truncate text-[12px] text-neutral-400">
            {displayName}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="cursor-pointer border-0 bg-transparent p-0 text-neutral-600 hover:text-ink"
          >
            <SignOut size={15} />
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 basis-[460px] px-6.5 pt-5.5 pb-14">
        <Outlet />
      </main>
    </div>
  );
}
