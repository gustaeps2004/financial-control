import { parseYearMonth } from "@/shared/lib/dates";
import type { Messages } from "./en";

// Brazilian Portuguese, in the spreadsheet's own words: Entradas, Contas
// fixas, Faturas, Guardado, Sobrou.

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const MONTHS_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

/** "Outubro de 2026", for a month standing alone: a title, a label. */
function monthYear(yearMonth: string): string {
  const { year, month } = parseYearMonth(yearMonth);
  return `${MONTHS[month - 1]} de ${year}`;
}

/** "outubro de 2026": months are lowercase mid-sentence. */
function inlineMonthYear(yearMonth: string): string {
  return monthYear(yearMonth).toLowerCase();
}

/** "06/10/2026". */
function fullDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export const ptBR: Messages = {
  dates: {
    months: MONTHS,
    yearMonth: monthYear,
    monthShort: (yearMonth) => MONTHS_SHORT[parseYearMonth(yearMonth).month - 1]!,
  },

  common: {
    add: "Adicionar",
    save: "Salvar",
    saving: "Salvando…",
    saved: "Salvo",
    cancel: "Cancelar",
    close: "Fechar",
    back: "Voltar",
    continue: "Continuar",
    loading: "Carregando…",
    total: "Total",
    projection: "Projeção",
    notInformed: "Não informado",
    edit: (name) => `Editar ${name}`,
    delete: (name) => `Excluir ${name}`,
    remove: (name) => `Remover ${name}`,
    saveFailed: "Não foi possível salvar. Tente de novo.",
    pickCategoryFirst: "Escolha uma categoria primeiro — crie uma em Configurações.",
  },

  fields: {
    name: "Nome",
    fullName: "Nome completo",
    email: "E-mail",
    password: "Senha",
    date: "Data",
    description: "Descrição",
    category: "Categoria",
    amount: "Valor",
    paidWith: "Forma de pagamento",
    card: "Cartão",
    account: "Conta",
    day: "Dia",
    month: "Mês",
  },

  language: {
    label: "Idioma",
  },

  nav: {
    dashboard: "Resumo",
    transactions: "Lançamentos",
    statements: "Faturas",
    recurring: "Recorrentes",
    year: "Ano",
    settings: "Configurações",
    signOut: "Sair",
  },

  paymentMethods: {
    CREDIT: "Cartão de crédito",
    PIX: "Pix",
    DEBIT: "Débito",
    CASH: "Dinheiro",
    BANK_TRANSFER: "Boleto / transferência",
  },

  categories: {
    kinds: {
      INCOME: "Entradas",
      FIXED_BILL: "Contas fixas",
      EXPENSE: "Dia a dia",
      SAVINGS: "Guardado",
    },
    kindHints: {
      INCOME: "Salário, freelas, coisas que você vendeu",
      FIXED_BILL: "A mesma conta todo mês: aluguel, internet, financiamento",
      EXPENSE: "Mercado, combustível, comer fora",
      SAVINGS: "Dinheiro guardado — negativo quando você tira de volta",
    },
    newPlaceholder: "Nova categoria",
    nameLabel: "Nome da categoria",
    kindLabel: "Tipo da categoria",
    kindOf: (name) => `Tipo de ${name}`,
    changeKind: "Mudar o tipo",
    done: "Pronto",
    addFailed: "Não foi possível adicionar a categoria. Tente de novo.",
    changeFailed: "Não foi possível alterar essa categoria. Tente de novo.",
    removeFailed: "Não foi possível remover a categoria. Tente de novo.",
    removed: "(removida)",
  },

  cards: {
    defaultNickname: (brand) => `Cartão ${brand}`,
    nickname: "Apelido",
    limit: "Limite",
    closingDay: "Dia de fechamento",
    dueDay: "Dia do vencimento",
    remove: "Remover",
    removed: "(removido)",
    none: "Nenhum cartão ainda.",
    add: "Adicionar cartão",
    updateFailed: "Não foi possível atualizar seus cartões. Tente de novo.",
    saveFailed: "Não foi possível salvar essa alteração. Tente de novo.",
    removeFailed: "Não foi possível remover esse cartão. Tente de novo.",
  },

  onboarding: {
    steps: {
      categories: "Categorias",
      cards: "Cartões",
      recurring: "Recorrentes e faturas",
    },
    categories: {
      title: "Como funciona o seu mês?",
      intro:
        "Dê nome às suas próprias categorias — tudo o que você gostaria de ver como uma linha do seu mês — e diga o que cada uma é: dinheiro que entra, uma conta que se repete, gasto do dia a dia ou dinheiro que você guarda. Dá para adicionar mais a qualquer momento.",
      placeholder: "ex.: Café, Cachorro, Projeto",
      count: (count) =>
        `${count} ${count === 1 ? "categoria" : "categorias"}. A maioria das pessoas fica entre oito e quinze.`,
      skip: "Pular por enquanto",
    },
    cards: {
      title: "Quais cartões você usa?",
      intro:
        "Escolha os bancos dos seus cartões e dê um nome a cada um. Eles viram as opções que aparecem quando você lança uma compra.",
      yourCards: "Seus cartões",
      statementRule:
        "Compras até o dia de fechamento caem na fatura daquele mês; as feitas depois vão para a próxima. Cada fatura leva o nome do mês em que vence — deixe o dia do vencimento vazio se a fatura vence no mesmo mês em que fecha.",
    },
    recurring: {
      title: "O que se repete todo mês?",
      intro:
        "Contas fixas, assinaturas e até o seu salário são lançados sozinhos todo mês — os meses futuros aparecem como projeção. Depois, conte o que a fatura atual de cada cartão já tem, para o seu primeiro mês já começar com os números certos.",
      heading: "Recorrentes",
      empty: "Nada ainda — aluguel, internet, financiamento, assinaturas…",
      removeFailed: "Não foi possível remover. Tente de novo.",
      monthlyTotal: (amount) => `${amount} por mês em recorrentes neste mês.`,
      cardsTitle: "O que seus cartões já têm",
      cardsIntro:
        "Parcelas de compras antigas e tudo o que já está na fatura atual. As próximas faturas você ajusta depois, em Faturas.",
      finish: "Concluir configuração",
    },
  },

  cashFlow: {
    income: "Entradas",
    fixedBills: "Contas fixas",
    cardBills: "Faturas",
    cashExpenses: "À vista",
    creditPurchases: "No crédito",
    savings: "Guardado",
    totalOut: "Total que saiu",
    leftover: "Sobrou",
  },

  dashboard: {
    periodModes: { MONTH: "Mês", YEAR: "Ano", ALL: "Tudo" },
    period: "Período",
    allTime: "Todo o período",
    monthIntro: "De onde veio o dinheiro do mês e para onde ele foi.",
    periodIntro: "Só o que já aconteceu — as projeções ficam fora destes totais.",
    projectedNotice: (month) =>
      `${monthYear(month)} ainda não chegou: as contas fixas e as faturas abaixo são projeções, e as faturas contam pelo valor previsto.`,
    loadFailed: "Não foi possível carregar este período.",
    yearByMonth: (year) => `${year} mês a mês`,
    yearByMonthHint: "Dinheiro que saiu da conta · escolha um mês para ver",
    shortBy: "Faltou",
    leftOver: "Sobrou",
    ofIncome: (income) => `de ${income} que entraram`,
    nothingCameIn: "Nada entrou neste período.",
    logTransaction: "Novo lançamento",
    nothingRecorded:
      "Nada registrado neste período ainda. Faça lançamentos ou cadastre o que se repete todo mês, e isto se preenche sozinho.",
    shareOfIncome: (share) => `${share} da renda`,
    kpis: {
      saved: "Guardado",
      takenFromSavings: (amount) => `${amount} tirados do guardado`,
      putAside: (amount) => `${amount} guardados`,
      committed: "Comprometido",
      leftTheAccount: (amount) => `${amount} saíram da conta`,
      chargedToCards: "Compras no crédito",
      chargedToCardsHint: "Saem da conta quando essas faturas forem pagas",
      billsToPay: "Faturas a pagar",
      billsToPayHint: "Nas faturas deste mês",
      nothingToPay: "Nada a pagar este mês",
    },
    breakdowns: {
      dayToDay: "Gastos do dia a dia",
      noDayToDay: "Nenhum gasto do dia a dia neste período.",
      cardStatements: "Faturas de cartão",
      fixedBills: "Contas fixas",
      noFixedBills: "Nenhuma conta fixa neste período.",
      bill: "Conta",
      ofIncome: "% da renda",
      incomeAndSavings: "Entradas e guardado",
      noIncomeOrSavings: "Nenhuma entrada ou dinheiro guardado neste período.",
      howPaid: "Como o dia a dia foi pago",
      method: "Forma",
      fromWhichAccount: "Em qual conta / cartão",
      cashAndNotInformed: "Dinheiro / não informado",
      debit: "No débito",
      credit: "No crédito",
    },
    bridgeLabel: "Para onde foi o dinheiro",
    cardStatement: {
      composition: (carried, newCharges) =>
        `${carried} em parcelamentos + ${newCharges} em compras`,
      paid: (amount) => `pago ${amount}`,
    },
    categorySplit: {
      both: (cash, credit) => `${cash} à vista · ${credit} no crédito`,
      allOnCards: "Tudo no crédito",
      allPaidNow: "Tudo à vista",
    },
    trend: {
      bar: (month, amount, projected) =>
        `${monthYear(month)}: saíram ${amount}${projected ? ", projeção" : ""}`,
      happened: "Realizado",
      projection: "Projeção",
      selected: "Mês selecionado",
    },
  },

  transactions: {
    title: "Lançamentos",
    summary: (count, moneyIn, spent) =>
      `${count} ${count === 1 ? "lançamento" : "lançamentos"} · ${moneyIn} de entradas · ${spent} de gastos`,
    allCategories: "Todas as categorias",
    logTitle: "Novo lançamento",
    deleteFailed: (title) => `Não foi possível excluir "${title}".`,
    loadFailed: (month) => `Não foi possível carregar ${inlineMonthYear(month)}.`,
    empty: (month) => `Nada em ${inlineMonthYear(month)} ainda. Faça o primeiro lançamento acima.`,
    adjustTitle: "Lançar o valor real",
    editTitle: "Editar lançamento",
    logIt: "Lançar",
    replacesAutomatic: (title, month) =>
      `Substitui o lançamento automático "${title}" de ${inlineMonthYear(month)}.`,
    form: {
      optional: "Opcional",
      installments: "Parcelas",
      pickDate: "Escolha a data.",
      typeAmount: "Digite o valor.",
      pickCard: "Escolha o cartão em que foi cobrado.",
      hints: {
        installments: (count, amount, month, card) =>
          `${count}× de cerca de ${amount}, a partir da fatura de ${inlineMonthYear(month)}${card ? ` do ${card}` : ""}.`,
        credit: (month, card) =>
          `Cai na fatura de ${inlineMonthYear(month)}${card ? ` do ${card}` : ""} — sai da sua conta quando essa fatura for paga.`,
        income: "Conta como entrada nesse dia.",
        savings: "Leva dinheiro para o guardado. Use um valor negativo para dinheiro tirado de volta.",
        spending: "Sai da sua conta nesse dia. Valores negativos são estornos.",
      },
    },
    ledger: {
      cardBill: "Fatura",
      cardBillOf: (card) => (card ? `Fatura do ${card}` : "Fatura do cartão"),
      paysStatement: (month) => `Paga a fatura de ${inlineMonthYear(month)}`,
      expected: "Previsto — se repete todo mês",
      postedAutomatically: "Lançado automaticamente todo mês",
      recurringValue: "Valor deste mês de um recorrente",
      installments: (count) => `em ${count}×`,
      onStatement: (month) => `na fatura de ${inlineMonthYear(month)}`,
      automatic: "Automático",
      logActual: "Lançar valor real",
    },
  },

  statements: {
    title: "Faturas",
    intro:
      "A fatura de cada cartão, mês a mês: o que cada uma já traz, as parcelas que caem nela e o que você comprou neste ciclo.",
    yearTotal: (total, year) => `${total} somando todos os cartões em ${year}.`,
    loadFailed: "Não foi possível carregar as faturas.",
    noCards: "Nenhum cartão ainda. Adicione os cartões que você usa para acompanhar as faturas.",
    dialogTitle: (card, month) => `${card} · fatura de ${inlineMonthYear(month)}`,
    status: {
      OPEN: "Aberta",
      CLOSED: "Fechada",
      OVERDUE: "Vencida",
      PAID: "Paga",
      UPCOMING: "Futura",
      EMPTY: "Vazia",
    },
    sentence: {
      open: (closing, due) =>
        `Recebendo compras até ${fullDate(closing)}${due ? `, vence em ${fullDate(due)}` : ""}.`,
      closed: (closing, due) =>
        `Fechou em ${fullDate(closing)}${due ? `, vence em ${fullDate(due)}` : ""}.`,
      overdue: (due) =>
        `Passou do vencimento${due ? ` (${fullDate(due)})` : ""} e não foi paga por completo.`,
      paid: "Paga.",
      upcoming: (closing, due) =>
        `Fecha em ${fullDate(closing)}${due ? `, vence em ${fullDate(due)}` : ""}. As compras novas começam a cair nela quando a fatura atual fechar.`,
      empty: "Nada cai nesta fatura.",
    },
    cardDays: (closingDay, dueDay) =>
      `fecha dia ${closingDay}${dueDay ? ` · vence dia ${dueDay}` : ""}`,
    cardYearTotal: (total) => `${total} neste ano`,
    cell: (card, month, total, status) =>
      `${card}, fatura de ${inlineMonthYear(month)}: ${total}, ${status}`,
    detail: {
      loadFailed: "Não foi possível carregar esta fatura.",
      olderInstallments: "Parcelas de compras antigas",
      purchases: "Compras nesta fatura",
      recurring: "Cobranças recorrentes",
      total: "Total da fatura",
      paid: "Pago",
      remaining: "Falta pagar",
      carriedLabel: "Valor inicial (parcelas, assinaturas, tarifas)",
      carriedHint: "Tudo o que já está nesta fatura e não foi lançado aqui.",
      carriedFailed: "Não foi possível salvar o valor inicial.",
      charges: "Nesta fatura",
      noCharges: "Nenhuma compra cai nela.",
      installmentShort: "Parc.",
      recurringTag: "recorrente",
      payments: "Pagamentos",
      paidOn: (date) => `Pago em ${fullDate(date)}`,
      deletePayment: (amount) => `Excluir pagamento de ${amount}`,
      paidOnLabel: "Pago em",
      register: "Registrar pagamento",
      typeAmountPaid: "Digite o valor pago.",
      registerFailed: "Não foi possível registrar o pagamento.",
      deleteFailed: "Não foi possível excluir o pagamento.",
      paymentNote:
        "O pagamento é o que sai da sua conta — as compras já contaram como gasto quando você as fez.",
    },
    carried: {
      label: (month) => `Já na fatura de ${inlineMonthYear(month)}`,
      failed: "Não foi possível salvar esse valor.",
    },
  },

  recurring: {
    title: "Recorrentes",
    intro: (activeCount, total) =>
      `Contas, assinaturas e entradas que se repetem todo mês são lançadas sozinhas — os meses à frente aparecem como projeção. ${activeCount} ${activeCount === 1 ? "ativo" : "ativos"} neste mês, ${total} no total.`,
    addTitle: "Adicionar algo que se repete",
    empty: "Nada se repete ainda. Adicione sua primeira conta fixa acima.",
    loadFailed: "Não foi possível carregar os recorrentes.",
    editTitle: "Editar recorrente",
    confirmDelete: (name) =>
      `Excluir "${name}"? Os lançamentos automáticos dele somem de todos os meses, inclusive dos passados. Para parar daqui para frente, use Encerrar.`,
    deleteFailed: (name) => `Não foi possível excluir "${name}".`,
    endFailed: (name) => `Não foi possível encerrar "${name}".`,
    form: {
      namePlaceholder: "Internet",
      monthlyAmount: "Valor mensal",
      starts: "Começa em",
      ends: "Termina em",
      noEnd: "Sem fim",
      giveName: "Dê um nome, como “Internet”.",
      typeMonthlyAmount: "Digite o valor mensal.",
      dayRange: "O dia precisa estar entre 1 e 31.",
      endBeforeStart: "Não pode terminar antes de começar.",
      explanation: (day, start, end, onCard) =>
        `Lançado automaticamente no dia ${day ?? "…"} de cada mês, ${
          end
            ? `de ${inlineMonthYear(start)} a ${inlineMonthYear(end)}`
            : `a partir de ${inlineMonthYear(start)}`
        }${onCard ? ", na fatura do cartão" : ""}. Quando o valor de um mês for diferente, lance o valor real em Lançamentos — ele substitui o automático.`,
    },
    table: {
      period: "Período",
      monthly: "Mensal",
      since: (month) => `Desde ${inlineMonthYear(month)}`,
      range: (start, end) => `${monthYear(start)} → ${monthYear(end)}`,
      ended: "encerrado",
      upcoming: "futuro",
      endHint: "Mantém os meses passados e para a partir do mês que vem",
      end: "Encerrar",
    },
  },

  controls: {
    previousMonth: "Mês anterior",
    nextMonth: "Próximo mês",
    thisMonth: "Este mês",
    previousYear: "Ano anterior",
    nextYear: "Próximo ano",
    thisYear: "Este ano",
    monthOf: (field) => `${field}: mês`,
    yearOf: (field) => `${field}: ano`,
  },

  auth: {
    login: {
      heroTitle: "Cada real,\nna ponta do lápis.",
      heroText:
        "Categorias com os nomes que você escolhe, os cartões que você usa de verdade e um mês que finalmente fecha.",
      privateByDefault: "Privado por padrão",
      noBankLinking: "Sem conexão com o banco",
      title: "Entrar",
      welcomeBack: (name) =>
        name ? `Que bom ver você de novo, ${name}.` : "Que bom ver você de novo.",
      keepSignedIn: "Lembrar de mim",
      forgot: "Esqueceu?",
      submit: "Entrar",
      submitting: "Entrando…",
      createAccount: "Criar uma conta",
      failed: "Não foi possível entrar. Tente de novo.",
    },
    signup: {
      heroTitle: "Três campos,\ne o controle é seu.",
      heroText:
        "A configuração leva dois minutos: dê nome às suas categorias, adicione seus cartões e defina o que se repete todo mês.",
      step: (step, total) => `Passo ${step} de ${total}`,
      title: "Crie sua conta",
      subtitle: "Grátis e sem pedir cartão.",
      namePlaceholder: "Ana Ferreira",
      emailPlaceholder: "voce@exemplo.com.br",
      passwordPlaceholder: "Pelo menos 8 caracteres",
      acceptTerms: "Concordo com os Termos de Uso e a Política de Privacidade",
      submit: "Criar conta",
      submitting: "Criando conta…",
      haveAccount: "Já tem uma conta?",
      signIn: "Entrar",
      failed: "Não foi possível criar sua conta. Tente de novo.",
    },
    passwordStrength: {
      tooShort: "Use pelo menos 8 caracteres.",
      weak: "Fraca — tente adicionar um número ou símbolo.",
      good: "Boa — mais alguns caracteres a deixam mais forte.",
      strong: "Senha forte.",
    },
  },

  apiErrors: {
    NETWORK_ERROR: "Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.",
    BAD_REQUEST: "Alguns valores não são válidos. Confira e tente de novo.",
    UNAUTHORIZED: "Sua sessão expirou. Saia e entre de novo.",
    INVALID_CREDENTIALS: "E-mail ou senha incorretos.",
    INCORRECT_PASSWORD: "Senha incorreta.",
    EMAIL_ALREADY_REGISTERED: "Já existe uma conta com este e-mail.",
    USERNAME_ALREADY_REGISTERED: "Este nome de usuário já está em uso.",
    USER_NOT_FOUND: "Esta conta não existe mais.",
    CATEGORY_ALREADY_EXISTS: "Já existe uma categoria com este nome.",
    CATEGORY_NOT_FOUND: "Esta categoria não existe mais.",
    CARD_NOT_FOUND: "Este cartão não existe mais.",
    TRANSACTION_NOT_FOUND: "Este lançamento não existe mais.",
    RECURRING_TRANSACTION_NOT_FOUND: "Este recorrente não existe mais.",
    INVALID_RECURRING_PERIOD: "Não pode terminar antes de começar.",
    STATEMENT_ADJUSTMENT_NOT_FOUND: "Esta fatura não tinha valor inicial.",
    STATEMENT_PAYMENT_NOT_FOUND: "Este pagamento não existe mais.",
    CREDIT_PAYMENT_REQUIRES_CARD: "Escolha o cartão em que foi cobrado.",
    CREDIT_PAYMENT_NOT_ALLOWED: "Só gastos podem ir para o cartão de crédito.",
    INSTALLMENTS_REQUIRE_CREDIT: "Só compras no cartão de crédito podem ser parceladas.",
  },
};
