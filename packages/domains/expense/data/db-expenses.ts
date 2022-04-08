import { Knex } from 'knex';
import { PaginateArgs } from '@nc/utils/pagination';
import { OutcomeFailure, OutcomeSuccess } from '@nc/utils/types';
import { UserExpense, UserExpenseDBRecord } from '../types';
export interface ReadUserExpensesSuccess extends OutcomeSuccess {
  data: { expenses: UserExpense[]; totalRows: number };
}

export interface UserExpensesRepository {
  readUserExpenses(paginate: PaginateArgs): Promise<ReadUserExpensesSuccess | OutcomeFailure>;
  saveUserExpense(userExpense: UserExpense): Promise<OutcomeSuccess | OutcomeFailure>;
}
export function buildUserExpensesRepository(db: Knex): UserExpensesRepository {
  async function readUserExpenses(paginate: PaginateArgs): Promise<ReadUserExpensesSuccess | OutcomeFailure> {
    const {
      pagination: { pageSize, page, offset },
      sort,
      filters,
    } = paginate;

    const { userId, ...rest } = filters;

    const computedOffset = pageSize * page + offset;
    const queryBuilder = db.from<UserExpenseDBRecord>('expenses').where({ user_id: userId });

    if (rest) {
      for (const [key, value] of Object.entries(rest)) {
        queryBuilder.andWhere({ [key]: value });
      }
    }

    const queryBuilderCount = queryBuilder.clone();

    if (sort.by?.length > 0) {
      const orderByClause = [];

      sort.by.forEach((element, index) => {
        orderByClause.push({ column: element, order: sort.direction[index] ?? 'ASC' });
      });
      queryBuilder.orderBy(orderByClause);
    }

    const result = await queryBuilder.clone().select('*').limit(pageSize).offset(computedOffset);

    const rowCount = await queryBuilderCount.count('id');

    const totalRows = +rowCount[0]?.count ?? -1;

    const mappedResult: UserExpense[] = result.map((entry) => ({
      id: entry.id,
      userId: entry.user_id,
      merchantName: entry.merchant_name,
      currency: entry.currency,
      status: entry.status,
      amountInCents: BigInt(entry.amount_in_cents),
      dateCreated: entry.date_created,
    }));
    return {
      outcome: 'SUCCESS',
      data: {
        expenses: mappedResult,
        totalRows,
      },
    };
  }

  async function saveUserExpense(userExpense: UserExpense): Promise<OutcomeSuccess | OutcomeFailure> {
    const dbTransaction = await db.transaction();
    try {
      const { id, amountInCents, currency, dateCreated, merchantName, status, userId } = userExpense;

      await dbTransaction('expenses').insert({
        id,
        user_id: userId,
        currency,
        amount_in_cents: amountInCents,
        date_created: dateCreated,
        merchant_name: merchantName,
        status,
      });

      dbTransaction.commit();
      return {
        outcome: 'SUCCESS',
        data: { id },
      };
    } catch (err: any) {
      await dbTransaction.rollback();
      return { outcome: 'FAILURE', error: { errorCode: 'DB_ERROR', message: err } };
    }
  }

  return { readUserExpenses, saveUserExpense };
}
