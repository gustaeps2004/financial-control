export interface BrandOption {
  name: string;
  mark: string;
  swatch: string;
}

export const CARD_BRANDS: BrandOption[] = [
  { name: "Nubank", mark: "NU", swatch: "#423a6a" },
  { name: "Itaú", mark: "IT", swatch: "#52404a" },
  { name: "Bradesco", mark: "BR", swatch: "#3d4a52" },
  { name: "Santander", mark: "SA", swatch: "#46503d" },
  { name: "Banco do Brasil", mark: "BB", swatch: "#3f424d" },
  { name: "Inter", mark: "IN", swatch: "#5d5294" },
  { name: "C6 Bank", mark: "C6", swatch: "#4a3b52" },
  { name: "Caixa", mark: "CX", swatch: "#2b2741" },
];

export const SETUP_STEPS = [
  { n: 1, label: "Categories", path: "/setup/categories" },
  { n: 2, label: "Cards", path: "/setup/cards" },
  { n: 3, label: "Recurring & balances", path: "/setup/recurring" },
];
