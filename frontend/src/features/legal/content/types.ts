export type LegalDocumentKind = "terms" | "privacy";

/** A piece of a section. Its text may link with [label](href): see LinkedText. */
export type LegalBlock =
  | string
  | { list: readonly string[] }
  | { terms: readonly { term: string; description: string }[] }
  // A clause that limits the reader's rights: the consumer code (CDC, art. 54,
  // § 4º) requires it to stand out from the rest.
  | { highlight: string };

export interface LegalSection {
  // The section's anchor. The same in every language, so a link to it
  // ("/privacy#rights") works whichever language is on.
  id: string;
  title: string;
  blocks: readonly LegalBlock[];
}

export interface LegalDocument {
  title: string;
  intro: readonly LegalBlock[];
  sections: readonly LegalSection[];
}

export interface LegalDocuments {
  terms: LegalDocument;
  privacy: LegalDocument;
  // Above a translation: which version applies.
  translationNotice: string | null;
}
