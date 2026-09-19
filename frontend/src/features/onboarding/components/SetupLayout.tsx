import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { SETUP_STEPS } from "../constants";

export function SetupLayout() {
  return (
    <div className="mx-auto max-w-[1000px] px-8 pt-10 pb-18">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        {SETUP_STEPS.map((step, index) => (
          <div key={step.n} className="contents">
            <NavLink to={step.path} className="flex items-center gap-2">
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid size-[22px] place-items-center rounded-full border text-[11px] font-semibold",
                      isActive
                        ? "border-accent bg-accent/18 text-ink"
                        : "border-neutral-800 text-neutral-600",
                    )}
                  >
                    {step.n}
                  </span>
                  <span
                    className={cn(
                      "text-[13px] whitespace-nowrap",
                      isActive ? "text-ink" : "text-neutral-600",
                    )}
                  >
                    {step.label}
                  </span>
                </>
              )}
            </NavLink>
            {index < SETUP_STEPS.length - 1 && (
              <span
                className="h-px flex-1 basis-5"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(233,233,237,.14) 16px, rgba(233,233,237,.14) calc(100% - 16px), transparent)",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
