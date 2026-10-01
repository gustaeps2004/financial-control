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

  nav: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    statements: "Statements",
    recurring: "Recurring",
    year: "Year",
    settings: "Settings",
    signOut: "Sign out",
  },

  paymentMethods: {
    CREDIT: "Credit card",
    PIX: "Pix",
    DEBIT: "Debit",
    CASH: "Cash",
    BANK_TRANSFER: "Boleto / transfer",
  },

  categories: {
    // In the order the month is read: what comes in, what is committed,
    // what gets spent, what is put aside.
    kinds: {
      INCOME: "Money in",
      FIXED_BILL: "Fixed bills",
      EXPENSE: "Day-to-day",
      SAVINGS: "Savings",
    },
    kindHints: {
      INCOME: "Salary, freelance work, things you sold",
      FIXED_BILL: "The same bill every month: rent, internet, financing",
      EXPENSE: "Groceries, fuel, eating out",
      SAVINGS: "Money put aside — negative when you take some back",
    },
    newPlaceholder: "New category",
    nameLabel: "Category name",
    kindLabel: "Category kind",
    kindOf: (name: string) => `Kind of ${name}`,
    changeKind: "Change kind",
    done: "Done",
    addFailed: "Couldn't add category. Please try again.",
    changeFailed: "Couldn't change that category. Please try again.",
    removeFailed: "Couldn't remove category. Please try again.",
  },

  cards: {
    defaultNickname: (brand: string) => `${brand} card`,
    nickname: "Nickname",
    limit: "Limit",
    closingDay: "Closes day",
    dueDay: "Due day",
    remove: "Remove",
    removed: "(removed)",
    none: "No cards yet.",
    add: "Add a card",
    updateFailed: "Couldn't update your cards. Please try again.",
    saveFailed: "Couldn't save that change. Please try again.",
    removeFailed: "Couldn't remove that card. Please try again.",
  },

  onboarding: {
    steps: {
      categories: "Categories",
      cards: "Cards",
      recurring: "Recurring & balances",
    },
    categories: {
      title: "How does your month work?",
      intro:
        "Name your own categories — anything you'd want to see as a line on your month — and say what each one is: money coming in, a bill that repeats, day-to-day spending, or money you put aside. Add more any time.",
      placeholder: "e.g. Coffee, Dog, Side project",
      count: (count: number) =>
        `${count} ${count === 1 ? "category" : "categories"}. Most people land between eight and fifteen.`,
      skip: "Skip for now",
    },
    cards: {
      title: "Which cards do you carry?",
      intro:
        "Pick the brands you own, then name each one. These become the options you see when logging a purchase.",
      yourCards: "Your cards",
      statementRule:
        "Purchases up to the closing day land on that month's statement; later ones roll to the next. Statements are named after the month they're due — leave the due day empty if the bill is due in the same month it closes.",
    },
    recurring: {
      title: "What repeats every month?",
      intro:
        "Fixed bills, subscriptions and even your salary post themselves every month — future months show up as projections. Then tell us what each card's current statement already carries, so your first month starts from the truth.",
      heading: "Recurring",
      empty: "Nothing yet — rent, internet, financing, subscriptions…",
      removeFailed: "Couldn't remove it. Please try again.",
      monthlyTotal: (amount: string) => `${amount} a month in recurring items this month.`,
      cardsTitle: "What your cards already carry",
      cardsIntro:
        "Installments of older purchases and anything else already on the current statement. You can set the next statements later, in Statements.",
      finish: "Finish setup",
    },
  },

  controls: {
    previousMonth: "Previous month",
    nextMonth: "Next month",
    thisMonth: "This month",
    previousYear: "Previous year",
    nextYear: "Next year",
    thisYear: "This year",
    // The two halves of a month picker, named after its field.
    monthOf: (field: string) => `${field}: month`,
    yearOf: (field: string) => `${field}: year`,
  },

  auth: {
    login: {
      heroTitle: "Every real,\naccounted for.",
      heroText:
        "Categories you name yourself, the cards you actually carry, and a month that finally adds up.",
      privateByDefault: "Private by default",
      noBankLinking: "No bank linking",
      title: "Sign in",
      welcomeBack: (name: string | null) => (name ? `Welcome back, ${name}.` : "Welcome back."),
      keepSignedIn: "Keep me signed in",
      forgot: "Forgot?",
      submit: "Sign in",
      submitting: "Signing in…",
      createAccount: "Create an account",
      failed: "Couldn't sign in. Please try again.",
    },
    signup: {
      heroTitle: "Three fields,\nthen you're tracking.",
      heroText:
        "Setup takes two minutes: name your categories, add your cards, set what repeats every month.",
      step: (step: number, total: number) => `Step ${step} of ${total}`,
      title: "Create your account",
      subtitle: "Free, and no card required.",
      namePlaceholder: "Ana Ferreira",
      emailPlaceholder: "you@example.com",
      passwordPlaceholder: "At least 8 characters",
      acceptTerms: "I agree to the Terms of Use and Privacy Policy",
      submit: "Create account",
      submitting: "Creating account…",
      haveAccount: "Already have one?",
      signIn: "Sign in",
      failed: "Couldn't create your account. Please try again.",
    },
    passwordStrength: {
      tooShort: "At least 8 characters required.",
      weak: "Weak — try adding a number or symbol.",
      good: "Good — a few more characters makes it stronger.",
      strong: "Strong password.",
    },
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
