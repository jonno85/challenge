import { Knex } from 'knex';
import { OutcomeFailure, OutcomeSuccess } from '@nc/utils/types';
import { User, UserDbRecord } from '@nc/domain-user/types';

export interface ReadUserSuccess extends OutcomeSuccess {
  data: { user: User };
}

export interface UserRepository {
  readUser(userId: string): Promise<ReadUserSuccess | OutcomeFailure>;
  saveUser(user: User): Promise<OutcomeSuccess | OutcomeFailure>;
}

export function buildUserRepository(db: Knex): UserRepository {
  async function readUser(userId): Promise<ReadUserSuccess | OutcomeFailure> {
    try {
      const result = await db.select('*').from<UserDbRecord>('users').where({ id: userId });

      if (result.length === 0) {
        return {
          outcome: 'FAILURE',
          error: {
            errorCode: 'USER_ID_NOT_FOUND',
            message: `No user found with id ${userId}`,
          },
        };
      }

      const { id, company_name: companyName, first_name: firstName, last_name: lastName, ssn } = result[0];

      return {
        outcome: 'SUCCESS',
        data: {
          user: {
            id,
            companyName,
            firstName,
            lastName,
            ssn: +ssn,
          },
        },
      };
    } catch (err: any) {
      return {
        outcome: 'FAILURE',
        error: {
          errorCode: 'DATABASE_ERROR',
          message: 'Unexpected error in readUser',
        },
      };
    }
    // return query('SELECT * FROM users WHERE id = $1', [userId]).then((response) => response.rows?.[0]);
  }

  async function saveUser(user: User): Promise<OutcomeSuccess | OutcomeFailure> {
    const dbTransaction = await db.transaction();
    try {
      const { id, firstName, lastName, companyName, ssn } = user;
      await dbTransaction('users').insert({
        id,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        ssn,
      });
      dbTransaction.commit();

      return {
        outcome: 'SUCCESS',
        data: {
          id,
        },
      };
    } catch (err: any) {
      await dbTransaction.rollback();
      return {
        outcome: 'FAILURE',
        error: {
          errorCode: 'DATABASE_ERROR',
          message: 'Unexpected error in readUser',
        },
      };
    }
  }

  return {
    readUser,
    saveUser,
  };
}
