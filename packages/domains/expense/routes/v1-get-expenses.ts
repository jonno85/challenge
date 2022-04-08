import { ApiError } from '@nc/utils/errors';
import { buildGetUserExpenses } from '../model';
import { secureTrim } from '../formatter';
import { toPaginated } from '@nc/utils/async';
import { UserExpensesRepository } from '@nc/domain-expense/data/db-expenses';
import { NextFunction, Request, Response, Router } from 'express';

export const buildUserExpensesRouter = (dependencies: { userExpensesRepository: UserExpensesRepository }) => {
  const router = Router();
  const getUserExpenses = buildGetUserExpenses(dependencies);

  router.get('/user-expenses', async (req: Request, res: Response, next: NextFunction) => {
    const paginate = req.paginate;

    const [userError, userExpensesPagedResult] = await toPaginated(getUserExpenses(paginate));

    if (userError) {
      return next(
        new ApiError(userError, userError.status, `Could not get user expenses: ${userError}`, userError.title, req)
      );
    }

    return res.json({
      paginate: {
        ...paginate,
        pagination: { ...userExpensesPagedResult.paginate },
      },

      data: secureTrim(userExpensesPagedResult.data),
    });
  });
  return router;
};
