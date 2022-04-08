import { ApiError } from '@nc/utils/errors';
import { buildGetUserDetails } from '@nc/domain-user/model';
import { Router } from 'express';
import { secureTrim } from '../formatter';
import { to } from '@nc/utils/async';

export const buildUserDetailsRouter = ({ userRepository: UserRepository }) => {
  const router = Router();
  const getUserDetails = buildGetUserDetails({ userRepository: UserRepository });

  router.get('/user-details', async (req, res, next) => {
    const [userError, userDetails] = await to(getUserDetails(req.query?.userId));

    if (userError) {
      return next(
        new ApiError(userError, userError.status, `Could not get user details: ${userError}`, userError.title, req)
      );
    }

    return res.json(secureTrim(userDetails));
  });

  return router;
};
