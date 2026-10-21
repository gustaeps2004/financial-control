import { COMPANY } from "../company";
import type { LegalDocuments } from "./types";

// A courtesy translation of pt-BR.ts, which is the text that applies: keep the
// two in step, section by section.

const EMAIL = `[${COMPANY.email}](mailto:${COMPANY.email})`;
const GOOGLE_PRIVACY = "[Google's Privacy Policy](https://policies.google.com/privacy?hl=en)";

export const legalEn: LegalDocuments = {
  translationNotice:
    "These documents are governed by Brazilian law and were written in Portuguese. This English version is a courtesy translation: if the two differ, the Portuguese version prevails.",

  terms: {
    title: "Terms of Use",
    intro: [
      `These Terms of Use govern your use of Fecha Mês, a personal finance web app offered by ${COMPANY.name}, registered under CNPJ ${COMPANY.cnpj} (“we”). By creating an account, you confirm that you have read and agree to these Terms and that you are aware of our [Privacy Policy](/privacy), which explains how we handle your personal data.`,
    ],
    sections: [
      {
        id: "service",
        title: "What Fecha Mês is",
        blocks: [
          "Fecha Mês helps you organize your money: you record income, fixed bills, purchases paid upfront or on credit, card statements and entries that repeat every month, and the app works out totals, balances and monthly and yearly summaries from what you entered.",
          "Fecha Mês is free to use. If paid features are ever offered, they will be optional, their price and conditions will be stated clearly before you sign up for them, and nothing will be charged without your express agreement.",
          {
            highlight:
              "Fecha Mês is not a bank, a payment institution or a financial advisor. It does not connect to your bank accounts, move money or pay bills, and it gives no investment, credit or tax advice. Marking a bill as paid is only a note for yourself: you still make the payment, through your bank or payment app.",
          },
        ],
      },
      {
        id: "eligibility",
        title: "Who can use it",
        blocks: [
          "To create an account, you must be at least 18 years old and legally able to take on the obligations in these Terms.",
          "Your account is personal and non-transferable: use it to organize your own finances, and give truthful information when you sign up.",
        ],
      },
      {
        id: "account",
        title: "Your account and access",
        blocks: [
          "You can sign in with an email and password or with your Google account. Either way, you are responsible for keeping your credentials secret and for what is done with them.",
          {
            list: [
              "Use a strong password that you don't use for other services.",
              "On shared computers, don't tick “Keep me signed in”, and sign out when you're done.",
              `If you suspect someone else has accessed your account, contact us right away at ${EMAIL}.`,
            ],
          },
        ],
      },
      {
        id: "acceptable-use",
        title: "Acceptable use",
        blocks: [
          "Use Fecha Mês in good faith and within the law. You may not:",
          {
            list: [
              "access, or try to access, accounts, data or systems that are not yours;",
              "bypass, probe or exploit the service's security measures without our permission;",
              "overload or disrupt the service, including through mass automated access;",
              "use the service for unlawful activities or to impersonate someone else.",
            ],
          },
        ],
      },
      {
        id: "your-records",
        title: "Your records",
        blocks: [
          "The information you record in Fecha Mês is yours. We use it only to provide the service to you, as described in the [Privacy Policy](/privacy), and we neither sell it nor use it for advertising.",
          "You are responsible for the accuracy of what you record. Totals, balances and summaries reflect the amounts, dates and categories you entered.",
        ],
      },
      {
        id: "availability",
        title: "Availability and changes to the service",
        blocks: [
          "We work to keep Fecha Mês available and running well, but the service may be temporarily unavailable for maintenance or updates, because of failures at suppliers or on the internet, or due to unforeseeable events or force majeure.",
          "We may change, add or remove features to improve the service. Changes that significantly affect how you use it will be announced in advance whenever possible.",
          "If we decide to shut Fecha Mês down, we will give at least 30 days' notice, and you will be able to request a copy of your data before it closes.",
        ],
      },
      {
        id: "liability",
        title: "Responsibilities",
        blocks: [
          "We are responsible for the service we provide as set out by law, including Brazil's Consumer Protection Code (Law No. 8,078/1990). Nothing in these Terms excludes or limits rights the law grants you.",
          {
            highlight:
              "Because Fecha Mês works out its figures from what you record, we are not responsible for results of incorrect, incomplete or outdated information you entered, nor for financial decisions you make based on it.",
          },
          {
            highlight:
              "Nor are we responsible for harm caused by third parties using your account when that results from your failure to keep your credentials secret.",
          },
        ],
      },
      {
        id: "intellectual-property",
        title: "Intellectual property",
        blocks: [
          `Fecha Mês's software, name, brand, look and texts belong to ${COMPANY.name} and are protected by copyright, software and industrial property laws. While you have an account, we grant you a personal, free, non-exclusive and non-transferable license to use the service under these Terms.`,
          "This license does not include copying, modifying, distributing or commercially exploiting Fecha Mês or any part of it.",
        ],
      },
      {
        id: "termination",
        title: "Closing your account",
        blocks: [
          "You can stop using Fecha Mês whenever you like, and delete your account at any time in Settings → Danger zone → Delete account.",
          {
            highlight:
              "Deletion is permanent: the account and every record tied to it are erased and cannot be recovered.",
          },
          "We may suspend or close accounts used in breach of these Terms or the law. Whenever possible and permitted, we will tell you beforehand and explain why.",
        ],
      },
      {
        id: "changes",
        title: "Changes to these Terms",
        blocks: [
          "We may update these Terms to reflect changes to the service or the law. The version in force is always on this page, with the date it was last updated.",
          "We will announce significant changes in advance, in Fecha Mês itself. If you don't agree with a new version, you can delete your account before it takes effect, at no cost. Where the law requires it, we will ask for your express agreement.",
        ],
      },
      {
        id: "law",
        title: "Governing law and jurisdiction",
        blocks: [
          "These Terms are governed by Brazilian law. Any dispute will be settled in the courts of your place of residence, as the Consumer Protection Code guarantees.",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        blocks: [
          `Questions, suggestions or complaints about these Terms: ${EMAIL}. We'll do our best to sort everything out quickly.`,
          `${COMPANY.name} — CNPJ ${COMPANY.cnpj}`,
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    intro: [
      "This Policy explains, in plain words, what personal data Fecha Mês processes, why, who it is shared with and how you exercise your rights, under Brazil's General Data Protection Law (LGPD — Law No. 13,709/2018) and Brazil's Internet Civil Rights Framework (Marco Civil da Internet — Law No. 12,965/2014).",
      "In short: we use your data only to make Fecha Mês work for you. We don't sell data, we don't show ads and we don't connect to your bank.",
    ],
    sections: [
      {
        id: "controller",
        title: "Who is responsible for your data",
        blocks: [
          `The controller of your personal data — who decides how and why it is processed — is ${COMPANY.name}, registered under CNPJ ${COMPANY.cnpj}.`,
          `To exercise your rights or raise anything about your personal data, write to ${EMAIL}. This is Fecha Mês's official channel for data subjects.`,
        ],
      },
      {
        id: "data",
        title: "What data we process",
        blocks: [
          {
            terms: [
              {
                term: "Sign-up data",
                description:
                  "Your name, email and password. Your password is never stored as you type it: we keep only an irreversible code derived from it (a hash, made with the argon2 algorithm).",
              },
              {
                term: "Google data, if you sign in with Google",
                description:
                  "Your Google account's identifier, your email, Google's confirmation that the email is verified, and your name. We never receive your Google password, nor access to your emails, contacts, files or any other data in your Google account.",
              },
              {
                term: "Your financial records",
                description:
                  "Everything you enter in the app: categories; cards (bank or brand, nickname, color, limit, closing and due days, and opening balance); transactions (date, description, amount, category, payment method and card); recurring entries; statement payments and adjustments; and the bills you mark as paid.",
              },
              {
                term: "Sign-in and acceptance records",
                description:
                  "The date and time of each sign-in to your account and when that session expires, plus the record that you accepted these documents when you created your account.",
              },
              {
                term: "Technical data",
                description:
                  "To run and protect the service, our hosting providers log technical data about requests, such as IP address, date and time, the address requested and browser details. Fecha Mês itself does not store your IP address.",
              },
            ],
          },
          "We never ask for or store card numbers, bank passwords, CPF or other ID documents, location or contacts.",
        ],
      },
      {
        id: "purposes",
        title: "Why we use data, and on what legal basis",
        blocks: [
          "Each use relies on a legal basis from article 7 of the LGPD:",
          {
            terms: [
              {
                term: "Creating and keeping your account, and letting you sign in",
                description:
                  "Sign-up data and, where applicable, Google data. Legal basis: performance of a contract (art. 7, V).",
              },
              {
                term: "Storing your records and working out totals, balances and summaries",
                description: "Financial records. Legal basis: performance of a contract (art. 7, V).",
              },
              {
                term: "Protecting your account and the service from unauthorized access, abuse and failures",
                description:
                  "Sign-in records and technical data. Legal basis: legitimate interest (art. 7, IX), always respecting your rights and expectations.",
              },
              {
                term: "Proving that you accepted the Terms of Use and this Policy",
                description: "Acceptance record. Legal basis: regular exercise of rights (art. 7, VI).",
              },
              {
                term: "Answering your requests and questions",
                description:
                  "The data your request needs. Legal basis: compliance with a legal obligation (art. 7, II) for requests about your rights, and performance of a contract (art. 7, V) for the rest.",
              },
              {
                term: "Complying with legal obligations and orders from authorities",
                description:
                  "The data required in each case. Legal basis: compliance with a legal or regulatory obligation (art. 7, II).",
              },
            ],
          },
          "We don't use your data for advertising, we don't build behavioral profiles and we don't make automated decisions that affect your interests. The app's calculations only add up and organize what you recorded.",
        ],
      },
      {
        id: "sharing",
        title: "Who we share data with",
        blocks: [
          "We don't sell or rent your data. It is shared only with:",
          {
            terms: [
              { term: "Vercel Inc.", description: "Hosts Fecha Mês's website and API." },
              {
                term: "BorkCloud",
                description: "Hosts the database that holds your account and your records.",
              },
              {
                term: "Google LLC",
                description: `Only if you choose to sign in with Google: Google confirms your identity to us. What happens on Google's side is governed by ${GOOGLE_PRIVACY}.`,
              },
              {
                term: "Public authorities",
                description:
                  "When there is a legal obligation, a court order or a request from a competent authority, within the limits of the law.",
              },
            ],
          },
          "Infrastructure providers act as processors: they handle data only to provide the service we hired them for, following our instructions.",
          "If Fecha Mês goes through a corporate reorganization, such as a merger or a sale, data may be transferred to the successor company, which will remain bound by this Policy.",
        ],
      },
      {
        id: "international-transfer",
        title: "International transfers",
        blocks: [
          "Part of our infrastructure is outside Brazil: Vercel, for example, processes data in the United States. These transfers are necessary to provide the service you signed up for (LGPD, art. 33, IX) and are made with providers that adopt security and data protection measures compatible with the LGPD.",
        ],
      },
      {
        id: "retention",
        title: "How long we keep data",
        blocks: [
          "We keep your data for as long as your account exists.",
          "When you delete your account in Settings → Danger zone → Delete account, we immediately and permanently erase the account and every record tied to it: transactions, cards, categories, recurring entries, statements and sign-in records. Nothing is kept after that, unless the law or a court order requires a specific piece of data to be retained (LGPD, art. 16).",
          "Backups and technical logs kept by our providers may contain your data for a limited time, until each provider's cycle deletes them automatically. They are not used for any other purpose.",
        ],
      },
      {
        id: "device-storage",
        title: "Cookies and storage in your browser",
        blocks: [
          "Fecha Mês uses no advertising or analytics cookies. To work, it keeps the following in your browser's local storage:",
          {
            terms: [
              {
                term: "Your session",
                description:
                  "Keeps you signed in. If you tick “Keep me signed in”, it lasts until you sign out or the session expires; otherwise it is erased when you close the tab or the browser.",
              },
              {
                term: "Your language",
                description: "Remembers whether you prefer the app in Portuguese or English.",
              },
              {
                term: "Your name and preferences",
                description:
                  "Let the sign-in page greet you by name and remember the preferences you chose in Settings, on this device.",
              },
            ],
          },
          "This information stays on your device, is needed for the service to work, and is erased if you clear your browsing data (which also signs you out). Deleting your account erases the name and preferences stored on the device you deleted it from.",
          `On screens with the “Sign in with Google” button, your browser loads a script from Google, which may use its own cookies under ${GOOGLE_PRIVACY}.`,
        ],
      },
      {
        id: "security",
        title: "Security",
        blocks: [
          "We take technical and administrative measures to protect your data, including:",
          {
            list: [
              "an encrypted connection (HTTPS) between your browser and our servers;",
              "passwords stored only as argon2 hashes, an algorithm made for passwords;",
              "sessions that expire, and access to each record limited to the account that owns it;",
              "access to the infrastructure restricted to authorized people.",
            ],
          },
          "No system is entirely immune to failures. If a security incident could bring you significant risk or harm, we will notify you and Brazil's National Data Protection Authority (ANPD), as article 48 of the LGPD and the ANPD's regulations require.",
        ],
      },
      {
        id: "rights",
        title: "Your rights",
        blocks: [
          "The LGPD (art. 18) gives you, at any time and free of charge, the right to:",
          {
            list: [
              "confirm whether we process your data, and access it;",
              "correct incomplete, inaccurate or outdated data;",
              "request the anonymization, blocking or deletion of data that is unnecessary, excessive or processed unlawfully;",
              "request the portability of your data to another provider;",
              "request the deletion of data processed on the basis of your consent;",
              "know which public and private entities we share your data with;",
              "be told that you may refuse consent, and what happens if you do;",
              "withdraw your consent, where consent is the basis for processing;",
              "object to processing carried out on another legal basis, if it breaches the LGPD;",
              "request a review of decisions made solely by automated processing (art. 20) — something Fecha Mês does not do today.",
            ],
          },
          `You can do a lot directly in the app: edit your name in Settings, correct or delete any record, and delete your account with everything in it. For anything else — such as getting a copy of your data — write to ${EMAIL} from the email registered to your account, so we can confirm the request is yours.`,
          "We will reply immediately, in a simplified format where possible, or within 15 days with a complete statement (LGPD, art. 19).",
          "If you feel your rights were not respected, you may also petition the [ANPD](https://www.gov.br/anpd/pt-br) and turn to consumer protection bodies.",
        ],
      },
      {
        id: "children",
        title: "Children and teenagers",
        blocks: [
          "Fecha Mês is meant for people aged 18 and over. We don't knowingly collect data from children or teenagers; if we learn that an account belongs to someone under 18, it will be deleted.",
        ],
      },
      {
        id: "sensitive-data",
        title: "Sensitive data",
        blocks: [
          "We don't ask for sensitive personal data, such as data about health, religion, political opinions or racial origin (LGPD, art. 5, II). Since transaction descriptions are free text, avoid putting that kind of information in them; if you do, it will be used only to show your records to you.",
        ],
      },
      {
        id: "changes",
        title: "Changes to this Policy",
        blocks: [
          "We may update this Policy to reflect changes to the service or the law. The version in force is always on this page, with the date it was last updated, and we will announce significant changes in advance, in Fecha Mês itself.",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        blocks: [
          `Questions, requests or complaints about privacy: ${EMAIL}.`,
          `${COMPANY.name} — CNPJ ${COMPANY.cnpj}`,
        ],
      },
    ],
  },
};
