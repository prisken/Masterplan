import type { FinanceItem } from '../types';

export interface FinanceTotals {
  income: number;
  expenses: number;
  donations: number;
  sponsorships: number;
  net: number;
}

export function computeFinanceTotals(items: FinanceItem[]): FinanceTotals {
  let income = 0;
  let expenses = 0;
  let donations = 0;
  let sponsorships = 0;

  for (const f of items) {
    const amt = f.amount || 0;
    switch (f.type) {
      case 'Income':
      case 'Investment':
        income += amt;
        break;
      case 'Expense':
        expenses += amt;
        break;
      case 'Donation':
        donations += amt;
        break;
      case 'Sponsorship':
        sponsorships += amt;
        break;
    }
  }

  return {
    income,
    expenses,
    donations,
    sponsorships,
    net: income + donations + sponsorships - expenses,
  };
}

export function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0,
  }).format(amount);
}
