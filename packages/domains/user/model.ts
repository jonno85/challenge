import { format } from './formatter';
import { User } from './types';
import { UserRepository } from './data/db-user';
import { BadRequest, InternalError, NotFound } from '@nc/utils/errors';

export const buildGetUserDetails = (dependencies: { userRepository: UserRepository }) => {
  const { userRepository } = dependencies;

  return async function getUserDetails(userId): Promise<User> {
    if (!userId) {
      throw BadRequest('userId property is missing.');
    }

    const rawUserResponse = await userRepository.readUser(userId);

    if (rawUserResponse.outcome === 'FAILURE') {
      if (rawUserResponse.error.errorCode === 'USER_ID_NOT_FOUND') {
        throw NotFound(`Could not find user expenses with id ${userId}`);
      }
      if (rawUserResponse.error.errorCode === 'DATABASE_ERROR') {
        throw InternalError(`Error fetching data from the DB: ${rawUserResponse.error.message}`);
      }
      throw InternalError('Unrecognized error');
    }

    return format(rawUserResponse.data.user);
  };
};
