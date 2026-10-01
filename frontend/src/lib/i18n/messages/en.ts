import { parseYearMonth } from "@/shared/lib/dates";

// Every text of the interface. A message is a string, or a function of its
// parameters when it has any. Whatever depends on the language — month names,
// plurals, word order — is settled in here, so callers pass raw values ("YYYY-MM"
// months, ISO dates, counts); only money, written the same way in every
// language, arrives already formatted.
//
// This file is the reference: `Messages` is its shape, and every other
// language must provide exactly the same keys.

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "October 2026". */
function monthYear(yearMonth: string): string {
  const { year, month } = parseYearMonth(yearMonth);
  return `${MONTHS[month - 1]} ${year}`;
}

export const en = {
  dates: {
    months: MONTHS,
    /** A month on its own, as a title or a label: "October 2026". */
    yearMonth: monthYear,
    /** Under a chart's bar: "Oct". */
    monthShort: (yearMonth: string) => MONTHS_SHORT[parseYearMonth(yearMonth).month - 1]!,
  },

  common: {
    add: "Add",
    save: "Save",
    saving: "Saving…",
    saved: "Saved",
    cancel: "Cancel",
    close: "Close",
    back: "Back",
    continue: "Continue",
    loading: "Loading…",
    total: "Total",
    projection: "Projection",
    notInformed: "Not informed",
    edit: (name: string) => `Edit ${name}`,
    delete: (name: string) => `Delete ${name}`,
    remove: (name: string) => `Remove ${name}`,
    saveFailed: "Couldn't save. Please try again.",
    pickCategoryFirst: "Pick a category first — add one in Settings.",
  },

  fields: {
    name: "Name",
    fullName: "Full name",
    email: "Email",
    password: "Password",
    date: "Date",
    description: "Description",
    category: "Category",
    amount: "Amount",
    paidWith: "Paid with",
    card: "Card",
    account: "Account",
    day: "Day",
    month: "Month",
  },

  language: {
    label: "Language",
  },

  // Keyed by the `code` of the API's error responses.
  apiErrors: {
    NETWORK_ERROR: "Couldn't reach the server. Check your connection and try again.",
    BAD_REQUEST: "Some of the values aren't valid. Check them and try again.",
    UNAUTHORIZED: "Your session has expired. Sign out and sign in again.",
    INVALID_CREDENTIALS: "Wrong email or password.",
    INCORRECT_PASSWORD: "Incorrect password.",
    EMAIL_ALREADY_REGISTERED: "There's already an account with this email.",
    USERNAME_ALREADY_REGISTERED: "This username is already taken.",
    USER_NOT_FOUND: "This account no longer exists.",
    CATEGORY_ALREADY_EXISTS: "There's already a category with this name.",
    CATEGORY_NOT_FOUND: "This category no longer exists.",
    CARD_NOT_FOUND: "This card no longer exists.",
    TRANSACTION_NOT_FOUND: "This transaction no longer exists.",
    RECURRING_TRANSACTION_NOT_FOUND: "This recurring item no longer exists.",
    INVALID_RECURRING_PERIOD: "It can't end before it starts.",
    STATEMENT_ADJUSTMENT_NOT_FOUND: "This statement had nothing carried in.",
    STATEMENT_PAYMENT_NOT_FOUND: "This payment no longer exists.",
    CREDIT_PAYMENT_REQUIRES_CARD: "Pick the card it was charged to.",
    CREDIT_PAYMENT_NOT_ALLOWED: "Only spending can be charged to a credit card.",
    INSTALLMENTS_REQUIRE_CREDIT: "Only credit card purchases can be split into installments.",
  },
};

export type Messages = typeof en;
