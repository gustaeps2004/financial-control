import type { ReactNode } from "react";

interface AuthLayoutProps {
  hero: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ hero, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-wrap">
      <div
        className="flex min-h-[540px] flex-1 basis-[400px] flex-col justify-between gap-12 p-11"
        style={{
          background:
            "radial-gradient(130% 100% at 0% 0%, var(--color-hero-from) 0%, var(--color-hero-via) 48%, var(--color-canvas) 100%)",
        }}
      >
        {hero}
      </div>
      <div className="flex flex-1 basis-[400px] items-center bg-canvas p-11">
        <div className="w-full max-w-[330px]">{children}</div>
      </div>
    </div>
  );
}

export function AuthBrand() {
  return <div className="text-[19px] leading-none font-semibold tracking-[-0.01em]">Tally</div>;
}
