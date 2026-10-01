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

/** "6 Oct 2026". */
function fullDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${MONTHS_SHORT[month! - 1]} ${year}`;
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
    removed: "(removed)",
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

  // The spreadsheet's panorama: how money came in and left the account.
  cashFlow: {
    income: "Money in",
    fixedBills: "Fixed bills",
    cardBills: "Card bills",
    cashExpenses: "Paid now",
    creditPurchases: "On cards",
    savings: "Savings",
    totalOut: "Total out",
    leftover: "Left over",
  },

  dashboard: {
    periodModes: { MONTH: "Month", YEAR: "Year", ALL: "All time" },
    period: "Period",
    allTime: "All time",
    monthIntro: "Where the month's money came from and where it went.",
    periodIntro: "Only what already happened — projections stay out of these totals.",
    projectedNotice: (month: string) =>
      `${monthYear(month)} hasn't happened yet: fixed bills and card statements below are projections, and card bills count at their expected value.`,
    loadFailed: "Couldn't load this period.",
    yearByMonth: (year: number) => `${year} month by month`,
    yearByMonthHint: "Money that left the account · pick a month to see it",
    shortBy: "Short by",
    leftOver: "Left over",
    ofIncome: (income: string) => `of ${income} that came in`,
    nothingCameIn: "Nothing came in during this period.",
    logTransaction: "Log a transaction",
    nothingRecorded:
      "Nothing recorded in this period yet. Log transactions or add what repeats every month, and this fills itself in.",
    shareOfIncome: (share: string) => `${share} of money in`,
    kpis: {
      saved: "Saved",
      takenFromSavings: (amount: string) => `${amount} taken back out of savings`,
      putAside: (amount: string) => `${amount} put aside`,
      committed: "Committed",
      leftTheAccount: (amount: string) => `${amount} left the account`,
      chargedToCards: "Charged to cards",
      chargedToCardsHint: "Leaves the account when those statements are paid",
      billsToPay: "Card bills still to pay",
      billsToPayHint: "On this month's statements",
      nothingToPay: "Nothing left to pay this month",
    },
    breakdowns: {
      dayToDay: "Day-to-day spending",
      noDayToDay: "No day-to-day spending in this period.",
      cardStatements: "Card statements",
      fixedBills: "Fixed bills",
      noFixedBills: "No fixed bills in this period.",
      bill: "Bill",
      ofIncome: "Of money in",
      incomeAndSavings: "Money in & savings",
      noIncomeOrSavings: "No income or savings in this period.",
      howPaid: "How day-to-day was paid",
      method: "Method",
      fromWhichAccount: "From which account",
      cashAndNotInformed: "Cash & not informed",
      debit: "Debit",
      credit: "Credit",
    },
    bridgeLabel: "Where the money went",
    cardStatement: {
      composition: (carried: string, newCharges: string) =>
        `${carried} carried in + ${newCharges} new`,
      paid: (amount: string) => `paid ${amount}`,
    },
    categorySplit: {
      both: (cash: string, credit: string) => `${cash} paid now · ${credit} on cards`,
      allOnCards: "All on cards",
      allPaidNow: "All paid now",
    },
    trend: {
      bar: (month: string, amount: string, projected: boolean) =>
        `${monthYear(month)}: ${amount} out${projected ? ", projected" : ""}`,
      happened: "Happened",
      projection: "Projection",
      selected: "Selected month",
    },
  },

  transactions: {
    title: "Transactions",
    summary: (count: number, moneyIn: string, spent: string) =>
      `${count} ${count === 1 ? "entry" : "entries"} · ${moneyIn} in · ${spent} spent`,
    allCategories: "All categories",
    logTitle: "Log a transaction",
    deleteFailed: (title: string) => `Couldn't delete "${title}".`,
    loadFailed: (month: string) => `Couldn't load ${monthYear(month)}.`,
    empty: (month: string) => `Nothing in ${monthYear(month)} yet. Log the first one above.`,
    adjustTitle: "Log the actual value",
    editTitle: "Edit transaction",
    logIt: "Log it",
    replacesAutomatic: (title: string, month: string) =>
      `Replaces the automatic "${title}" of ${monthYear(month)}.`,
    form: {
      optional: "Optional",
      installments: "Installments",
      pickDate: "Pick the date.",
      typeAmount: "Type the amount.",
      pickCard: "Pick the card it was charged to.",
      hints: {
        installments: (count: number, amount: string, month: string, card?: string) =>
          `${count}× of about ${amount}, starting on the ${monthYear(month)} statement${card ? ` of ${card}` : ""}.`,
        credit: (month: string, card?: string) =>
          `Lands on the ${monthYear(month)} statement${card ? ` of ${card}` : ""} — it leaves your account when that bill is paid.`,
        income: "Counts as money in on that day.",
        savings: "Moves money into savings. Use a negative amount for money taken back out.",
        spending: "Leaves your account on that day. Negative amounts are refunds.",
      },
    },
    ledger: {
      cardBill: "Card bill",
      cardBillOf: (card: string | null) => (card ? `${card} bill` : "Card bill"),
      paysStatement: (month: string) => `Pays the ${monthYear(month)} statement`,
      expected: "Expected — repeats every month",
      postedAutomatically: "Posted automatically every month",
      recurringValue: "This month's value of a recurring item",
      installments: (count: number) => `${count}× installments`,
      onStatement: (month: string) => `on the ${monthYear(month)} statement`,
      automatic: "Automatic",
      logActual: "Log actual",
    },
  },

  statements: {
    title: "Statements",
    intro:
      "Every card's statement, month by month: what each one already carries, the installments landing on it and what you bought this cycle.",
    yearTotal: (total: string, year: number) => `${total} across all cards in ${year}.`,
    loadFailed: "Couldn't load the statements.",
    noCards: "No cards yet. Add the cards you carry to follow their statements.",
    dialogTitle: (card: string, month: string) => `${card} · ${monthYear(month)} statement`,
    status: {
      OPEN: "Open",
      CLOSED: "Closed",
      OVERDUE: "Overdue",
      PAID: "Paid",
      UPCOMING: "Upcoming",
      EMPTY: "Nothing on it",
    },
    sentence: {
      open: (closing: string, due: string | null) =>
        `Taking purchases until ${fullDate(closing)}${due ? `, due ${fullDate(due)}` : ""}.`,
      closed: (closing: string, due: string | null) =>
        `Closed on ${fullDate(closing)}${due ? `, due ${fullDate(due)}` : ""}.`,
      overdue: (due: string | null) =>
        `Past the due date${due ? ` (${fullDate(due)})` : ""} and not fully paid.`,
      paid: "Paid.",
      upcoming: (closing: string, due: string | null) =>
        `Closes on ${fullDate(closing)}${due ? `, due ${fullDate(due)}` : ""}. New purchases start landing on it once the current statement closes.`,
      empty: "Nothing lands on this statement.",
    },
    cardDays: (closingDay: number, dueDay: number | null) =>
      `closes day ${closingDay}${dueDay ? ` · due day ${dueDay}` : ""}`,
    cardYearTotal: (total: string) => `${total} this year`,
    cell: (card: string, month: string, total: string, status: string) =>
      `${card}, ${monthYear(month)} statement: ${total}, ${status}`,
    detail: {
      loadFailed: "Couldn't load this statement.",
      olderInstallments: "Installments of older purchases",
      purchases: "Purchases this cycle",
      recurring: "Recurring charges",
      total: "Statement total",
      paid: "Paid",
      remaining: "Still to pay",
      carriedLabel: "Carried in (installments, subscriptions, fees)",
      carriedHint: "Anything already on this statement that wasn't logged here.",
      carriedFailed: "Couldn't save the carried amount.",
      charges: "On this statement",
      noCharges: "No purchases land on it.",
      installmentShort: "Inst.",
      recurringTag: "recurring",
      payments: "Payments",
      paidOn: (date: string) => `Paid on ${fullDate(date)}`,
      deletePayment: (amount: string) => `Delete payment of ${amount}`,
      paidOnLabel: "Paid on",
      register: "Register payment",
      typeAmountPaid: "Type the amount paid.",
      registerFailed: "Couldn't register the payment.",
      deleteFailed: "Couldn't delete the payment.",
      paymentNote:
        "The payment is what leaves your account — the purchases were already counted as spending when you made them.",
    },
    carried: {
      label: (month: string) => `Already on the ${monthYear(month)} statement`,
      failed: "Couldn't save that amount.",
    },
  },

  recurring: {
    title: "Recurring",
    intro: (activeCount: number, total: string) =>
      `Bills, subscriptions and income that repeat every month post themselves — months ahead show up as projections. ${activeCount} active this month, ${total} in total.`,
    addTitle: "Add something that repeats",
    empty: "Nothing repeats yet. Add your first fixed bill above.",
    loadFailed: "Couldn't load the recurring items.",
    editTitle: "Edit recurring",
    confirmDelete: (name: string) =>
      `Delete "${name}"? Its automatic entries disappear from every month, past ones included. To stop it from now on, use End instead.`,
    deleteFailed: (name: string) => `Couldn't delete "${name}".`,
    endFailed: (name: string) => `Couldn't end "${name}".`,
    form: {
      namePlaceholder: "Internet",
      monthlyAmount: "Monthly amount",
      starts: "Starts",
      ends: "Ends",
      noEnd: "No end",
      giveName: "Give it a name, like “Internet”.",
      typeMonthlyAmount: "Type the monthly amount.",
      dayRange: "The day must be between 1 and 31.",
      endBeforeStart: "It can't end before it starts.",
      // `day` is null while the field doesn't hold a valid day.
      explanation: (day: number | null, start: string, end: string | null, onCard: boolean) =>
        `Posted automatically on day ${day ?? "…"} of every month ${
          end ? `from ${monthYear(start)} to ${monthYear(end)}` : `from ${monthYear(start)} on`
        }${onCard ? ", on the card's statement" : ""}. When a month's value differs, log the actual one from Transactions — it replaces the automatic one.`,
    },
    table: {
      period: "Period",
      monthly: "Monthly",
      since: (month: string) => `Since ${monthYear(month)}`,
      range: (start: string, end: string) => `${monthYear(start)} → ${monthYear(end)}`,
      ended: "ended",
      upcoming: "upcoming",
      endHint: "Keep it in the past, stop it from next month on",
      end: "End",
    },
  },

  annual: {
    title: "Year overview",
    intro:
      "Month by month. Months still to come are projections: recurring items post themselves and card bills count at their statements' value.",
    loadFailed: "Couldn't load this year.",
    leftoverByMonth: "Left over, month by month",
    realized: "Happened so far",
    withProjection: "Whole year, with projections",
    footnote:
      'Total out = fixed bills + card bills + paid now. "On cards" is what was charged to cards that month — it leaves the account later, inside the card bills.',
    chart: {
      bar: (month: string, amount: string, projected: boolean) =>
        `${monthYear(month)}: ${amount} left over${projected ? ", projected" : ""}`,
      tooltip: (month: string, projected: boolean) =>
        `${monthYear(month)}${projected ? " · projection" : ""}`,
      moneyLeft: "Money left",
      overspent: "Spent more than came in",
    },
  },

  settings: {
    title: "Settings",
    account: {
      title: "Account",
      updateFailed: "Couldn't update your name.",
    },
    preferences: {
      title: "Preferences",
      currency: "Currency",
      monthStartsOn: "Month starts on",
      calendarMonth: "Day 1 (calendar month)",
      cardClosingDay: "Card closing day",
    },
    categoriesTitle: "Categories",
    cardsTitle: "Cards",
    recurring: {
      title: "Recurring",
      none: "Nothing repeating this month.",
      day: (day: number) => `day ${day}`,
      manage: "Manage recurring",
    },
    dangerZone: {
      title: "Danger zone",
      warning:
        "Deleting your account erases every transaction, card, category, recurring item and statement you recorded.",
      cannotUndo: "This cannot be undone.",
      confirmLabel: "Type your password to confirm",
      deleting: "Deleting…",
      deleteEverything: "Delete everything",
      deleteAccount: "Delete account",
      failed: "Couldn't delete your account.",
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
    showPassword: "Show password",
    hidePassword: "Hide password",
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
