export interface UserExpenseDBRecord {
  id: string;
  merchant_name: string;
  amount_in_cents: number;
  currency: string;
  user_id: string;
  date_created: Date;
  status: string;
  total_count: number;
}
export interface UserExpense {
  id: string;
  userId: string;
  merchantName: string;
  currency: string;
  status: string;
  amountInCents: bigint;
  dateCreated: Date;
}
export interface UserExpenseTrim {
  merchantName: string;
  currency: string;
  status: string;
  amountInCents: string;
  dateCreated: Date;
}
