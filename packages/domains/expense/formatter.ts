import { capitalize } from '@nc/utils/capitalize';
import { UserExpense, UserExpenseTrim } from '@nc/domain-expense/types';

const trimmer = (expense: UserExpense): UserExpenseTrim => ({
  merchantName: expense.merchantName,
  currency: expense.currency,
  status: expense.status,
  amountInCents: expense.amountInCents.toString(),
  dateCreated: expense.dateCreated,
});

export function secureTrim(expenses: UserExpense[]): UserExpenseTrim[] {
  return expenses.map(trimmer);
}

export function format(rawExpenses: UserExpense[]): UserExpense[] {
  return rawExpenses.map((rawExpense) => ({
    id: rawExpense.id,
    merchantName: capitalize(rawExpense.merchantName),
    amountInCents: rawExpense.amountInCents,
    currency: rawExpense.currency,
    userId: rawExpense.userId,
    dateCreated: rawExpense.dateCreated,
    status: rawExpense.status,
  }));
}
