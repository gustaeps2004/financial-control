import type { ReactNode } from "react";
import { Link } from "react-router-dom";

// The one markup copy may carry: [label](href), for a link inside a sentence.
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

interface LinkedTextProps {
  text: string;
  linkClassName?: string;
  // Opens the app's own pages in a new tab too, so a half-filled form stays put.
  newTab?: boolean;
}

/**
 * `text` with each [label](href) turned into a link: to a page of the app
 * ("/privacy"), a spot on this page ("#rights"), an e-mail address
 * ("mailto:…") or another site, which opens in a new tab.
 */
export function LinkedText({ text, linkClassName, newTab = false }: LinkedTextProps) {
  const parts: ReactNode[] = [];
  let end = 0;
  for (const match of text.matchAll(LINK)) {
    parts.push(text.slice(end, match.index));
    parts.push(
      <TextLink key={match.index} href={match[2]!} className={linkClassName} newTab={newTab}>
        {match[1]}
      </TextLink>,
    );
    end = match.index + match[0].length;
  }
  parts.push(text.slice(end));

  return <>{parts}</>;
}

interface TextLinkProps {
  href: string;
  className?: string;
  newTab: boolean;
  children: ReactNode;
}

function TextLink({ href, className, newTab, children }: TextLinkProps) {
  const isPage = href.startsWith("/");
  if (isPage && !newTab) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  const opensTab = isPage || /^https?:/.test(href);
  return (
    <a
      href={href}
      className={className}
      target={opensTab ? "_blank" : undefined}
      rel={opensTab ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
