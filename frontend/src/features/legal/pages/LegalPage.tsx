import { useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { cn } from "@/shared/lib/cn";
import { LanguageSwitcher } from "@/shared/ui/LanguageSwitcher";
import { LinkedText } from "@/shared/ui/LinkedText";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Locale } from "@/lib/i18n/locales";
import { COMPANY, LEGAL_UPDATED_ON } from "../company";
import { legalEn } from "../content/en";
import { legalPtBR } from "../content/pt-BR";
import type { LegalBlock, LegalDocumentKind, LegalDocuments } from "../content/types";

const DOCUMENTS: Record<Locale, LegalDocuments> = { en: legalEn, "pt-BR": legalPtBR };

const KINDS: readonly LegalDocumentKind[] = ["terms", "privacy"];

const LINK_CLASS =
  "text-accent underline decoration-accent/40 underline-offset-[3px] hover:decoration-accent";

// Open to everyone, signed in or not: sign-up links here before there is an
// account. The text is 16px, i.e. 12pt, the smallest the consumer code (CDC,
// art. 54, § 3º) allows for contracts like these.
export function LegalPage({ kind }: { kind: LegalDocumentKind }) {
  const { locale, t } = useI18n();
  const { translationNotice, [kind]: doc } = DOCUMENTS[locale];
  const { hash } = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = `${doc.title} · Fecha Mês`;
    return () => {
      document.title = previous;
    };
  }, [doc.title]);

  // Moving between pages keeps the scroll where it was: start a document at
  // its top, or at the section the link points to.
  useEffect(() => {
    const section = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (section) section.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [kind, hash]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-divider">
        <div className="mx-auto flex max-w-[760px] flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link to="/" className="text-[17px] font-semibold text-ink no-underline">
            Fecha Mês
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-4 pt-6 pb-20 text-[16px] leading-[1.7] text-neutral-300 sm:px-6">
        <BackLink />

        <nav
          aria-label={t.legal.documents}
          className="mt-6 flex w-fit max-w-full rounded-md border border-divider p-0.5"
        >
          {KINDS.map((option) => (
            <NavLink
              key={option}
              to={`/${option}`}
              // Switching documents doesn't pile up history: Back still leaves.
              replace
              className={({ isActive }) =>
                cn(
                  "rounded-[6px] px-3 py-1.5 text-[14px] leading-tight font-medium no-underline",
                  isActive ? "bg-accent/16 text-ink" : "text-neutral-500 hover:text-ink",
                )
              }
            >
              {t.legal[option]}
            </NavLink>
          ))}
        </nav>

        <h1 className="mt-7 mb-1.5 text-[32px] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
          {doc.title}
        </h1>
        <p className="m-0 text-[14px] text-neutral-500">{t.legal.updatedOn(LEGAL_UPDATED_ON)}</p>

        {translationNotice && (
          <p className="mt-6 mb-0 rounded-md border border-divider px-4 py-3 text-[14px]">
            {translationNotice}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {doc.intro.map((block, index) => (
            <Block key={index} block={block} />
          ))}
        </div>

        <nav aria-labelledby="legal-contents" className="mt-8 rounded-md bg-surface px-5 py-4">
          <h2
            id="legal-contents"
            className="mb-2 text-[12px] font-semibold tracking-[0.1em] text-neutral-500 uppercase"
          >
            {t.legal.contents}
          </h2>
          <ol className="m-0 list-decimal pl-5 marker:text-neutral-600 sm:columns-2 sm:gap-x-10">
            {doc.sections.map((section) => (
              <li key={section.id} className="break-inside-avoid py-0.5">
                <a href={`#${section.id}`} className="text-neutral-300 no-underline hover:text-accent">
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {doc.sections.map((section, index) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="mt-10 scroll-mt-6"
          >
            <h2 id={`${section.id}-title`} className="mb-3 text-[20px] leading-snug font-semibold text-ink">
              {index + 1}. {section.title}
            </h2>
            <div className="flex flex-col gap-4">
              {section.blocks.map((block, blockIndex) => (
                <Block key={blockIndex} block={block} />
              ))}
            </div>
          </section>
        ))}

        <footer className="mt-14 border-t border-divider pt-5 text-[14px] text-neutral-500">
          {COMPANY.name} · CNPJ {COMPANY.cnpj} ·{" "}
          <a href={`mailto:${COMPANY.email}`} className="text-neutral-400 hover:text-accent">
            {COMPANY.email}
          </a>
        </footer>
      </main>
    </div>
  );
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === "string") {
    return (
      <p className="m-0">
        <LinkedText text={block} linkClassName={LINK_CLASS} />
      </p>
    );
  }

  if ("list" in block) {
    return (
      <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 marker:text-neutral-600">
        {block.list.map((item, index) => (
          <li key={index}>
            <LinkedText text={item} linkClassName={LINK_CLASS} />
          </li>
        ))}
      </ul>
    );
  }

  if ("terms" in block) {
    return (
      <dl className="m-0 flex flex-col gap-3.5">
        {block.terms.map(({ term, description }) => (
          <div key={term}>
            <dt className="font-semibold text-ink">{term}</dt>
            <dd className="m-0">
              <LinkedText text={description} linkClassName={LINK_CLASS} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return (
    <p className="m-0 rounded-r-md border-l-2 border-accent bg-accent/8 px-4 py-3 font-medium text-ink">
      <LinkedText text={block.highlight} linkClassName={LINK_CLASS} />
    </p>
  );
}

// Back to the page that opened this one. Opened from outside (a new tab, a
// link elsewhere) there is none, so it goes to the app's start instead.
function BackLink() {
  const { t } = useI18n();
  const navigate = useNavigate();
  // React Router numbers the history entries it makes; a visit starts at 0.
  const hasPrevious = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0;
  const className =
    "inline-flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 text-[14px] text-neutral-400 no-underline hover:text-ink";

  return hasPrevious ? (
    <button type="button" onClick={() => navigate(-1)} className={className}>
      <ArrowLeft size={14} />
      {t.common.back}
    </button>
  ) : (
    <Link to="/" className={className}>
      <ArrowLeft size={14} />
      {t.common.back}
    </Link>
  );
}
