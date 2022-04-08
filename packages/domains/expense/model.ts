import { format } from './formatter';
import { UserExpense } from './types';
import { UserExpensesRepository } from './data/db-expenses';
import { BadRequest, InternalError, NotFound } from '@nc/utils/errors';
import { PagedResult, PaginateArgs } from '@nc/utils/pagination';

export const buildGetUserExpenses = (dependencies: { userExpensesRepository: UserExpensesRepository }) => {
  const { userExpensesRepository } = dependencies;
  return async function getUserExpenses(paginate: PaginateArgs): Promise<PagedResult<UserExpense>> {
    const userId = paginate.filters.userId ?? undefined;
    if (!userId) {
      throw BadRequest('userId property is missing.');
    }

    const userExpensesResponse = await userExpensesRepository.readUserExpenses(paginate);

    if (userExpensesResponse.outcome === 'FAILURE') {
      if (userExpensesResponse.error.errorCode === 'USER_ID_NOT_FOUND') {
        throw NotFound(`Could not find user expenses with id ${userId}`);
      }
      if (userExpensesResponse.error.errorCode === 'DATABASE_ERROR') {
        throw InternalError(`Error fetching data from the DB: ${userExpensesResponse.error.message}`);
      }
      throw InternalError('Unrecognized error');
    }

    const totalCount = userExpensesResponse.data.totalRows;

    return {
      data: format(userExpensesResponse.data.expenses),
      paginate: {
        ...paginate.pagination,
        totalCount,
        lastPage: Math.floor(totalCount / paginate.pagination.pageSize),
      },
    };
  };
};
