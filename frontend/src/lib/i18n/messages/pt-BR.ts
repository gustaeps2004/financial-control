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
