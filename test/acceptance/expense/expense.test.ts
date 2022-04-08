import { Api } from '../utils/api';
import { buildApp } from '../../../app';
import config from 'config';
import { createConnectionPool } from '../../../database/createConnectionPool';
import { createUserExpense } from '../utils/helpers';
import { randomUUID } from 'crypto';
import { Server } from 'http';
import { truncateTable } from '../../../database/scripts/bootstrapDB';
import {
  buildUserExpensesRepository,
  UserExpensesRepository,
} from '../../../packages/domains/expense/data/db-expenses';

describe('Given the user-expense endpoint', () => {
  let server: Server;
  const db = createConnectionPool();
  let userExpensesRepository: UserExpensesRepository;

  beforeAll(() => {
    const app = buildApp({ db });
    userExpensesRepository = buildUserExpensesRepository(db);

    server = app.listen(config.port, () => {
      app.set('ready', true);
    });

    server.on('close', () => {});
  });

  afterAll(() => {
    server.close();
  });

  afterEach(async () => {
    await truncateTable();
  });

  describe('And no userId property passed', () => {
    test('should return failure with details userId property is missing ', async () => {
      const result = await Api.get('/user/v1/user-expenses');
      expect(result.status).toBe(400);
      expect(result.body.message).toBe('Could not get user expenses: Error: userId property is missing.');
    });
  });
  describe('with not existing userId property passed', () => {
    test('should return empty list expenses and paginate default data structure ', async () => {
      const userId = randomUUID();
      const result = await Api.get('/user/v1/user-expenses?userId=' + userId);
      expect(result.status).toBe(200);
      expect(result.body).toStrictEqual({
        paginate: {
          pagination: { page: 0, offset: 0, pageSize: 10, totalCount: 0, lastPage: 0 },
          sort: { by: [], direction: [] },
          filters: {
            userId,
          },
        },
        data: [],
      });
    });
  });
  describe('with existing userId property passed', () => {
    test('should return the existing entry and paginate default data structure', async () => {
      const userId = randomUUID();
      await userExpensesRepository.saveUserExpense({
        id: randomUUID(),
        userId,
        merchantName: 'merchantName',
        currency: 'EUR',
        status: 'done',
        amountInCents: BigInt(10000),
        dateCreated: new Date(),
      });
      const result = await Api.get('/user/v1/user-expenses?userId=' + userId);
      expect(result.status).toBe(200);
      expect(result.body).toStrictEqual({
        paginate: {
          pagination: { page: 0, offset: 0, pageSize: 10, totalCount: 1, lastPage: 0 },
          sort: { by: [], direction: [] },
          filters: {
            userId,
          },
        },
        data: [
          {
            amountInCents: '10000',
            currency: 'EUR',
            dateCreated: expect.any(String),
            merchantName: 'MerchantName',
            status: 'done',
          },
        ],
      });
    });
  });

  describe('with existing userId property passed', () => {
    describe('with a filter on status done', () => {
      describe('with a SORT on amountInCents and currency DESC', () => {
        test('should return the entries sorted as per the property and paginate default data structure', async () => {
          const userId = randomUUID();
          await userExpensesRepository.saveUserExpense(createUserExpense(userId, 12200n));
          await userExpensesRepository.saveUserExpense(createUserExpense(userId, 12200n, 'EUR', 'PENDING'));
          await userExpensesRepository.saveUserExpense(createUserExpense(userId, 100n, 'DKK'));
          await userExpensesRepository.saveUserExpense(createUserExpense(userId));
          await userExpensesRepository.saveUserExpense(createUserExpense(userId, 100n, 'EUR'));

          const result = await Api.get(
            `/user/v1/user-expenses?userId=${userId}&sortBy=[amount_in_cents,currency]&direction=DESC&status=done`
          );
          expect(result.status).toBe(200);
          expect(result.body).toStrictEqual({
            paginate: {
              pagination: { page: 0, offset: 0, pageSize: 10, totalCount: 4, lastPage: 0 },
              sort: {
                direction: ['DESC'],
                by: ['amount_in_cents', 'currency'],
              },
              filters: {
                userId,
                status: 'done',
              },
            },
            data: [
              {
                amountInCents: '12200',
                currency: 'EUR',
                dateCreated: expect.any(String),
                merchantName: 'MerchantName',
                status: 'done',
              },
              {
                amountInCents: '10000',
                currency: 'EUR',
                dateCreated: expect.any(String),
                merchantName: 'MerchantName',
                status: 'done',
              },
              {
                amountInCents: '100',
                currency: 'DKK',
                dateCreated: expect.any(String),
                merchantName: 'MerchantName',
                status: 'done',
              },
              {
                amountInCents: '100',
                currency: 'EUR',
                dateCreated: expect.any(String),
                merchantName: 'MerchantName',
                status: 'done',
              },
            ],
          });
        });
      });
    });
    describe('with a filter on currency EUR', () => {
      test('should return the entries that correspond to the filter and paginate default data structure', async () => {
        const userId = randomUUID();
        await userExpensesRepository.saveUserExpense(createUserExpense(userId));
        await userExpensesRepository.saveUserExpense(createUserExpense(userId, 100n, 'DKK'));
        await userExpensesRepository.saveUserExpense(createUserExpense(userId));

        const result = await Api.get(`/user/v1/user-expenses?userId=${userId}&currency=EUR`);
        expect(result.status).toBe(200);
        expect(result.body).toStrictEqual({
          paginate: {
            pagination: { page: 0, offset: 0, pageSize: 10, totalCount: 2, lastPage: 0 },
            sort: { by: [], direction: [] },
            filters: {
              userId,
              currency: 'EUR',
            },
          },
          data: [
            {
              amountInCents: '10000',
              currency: 'EUR',
              dateCreated: expect.any(String),
              merchantName: 'MerchantName',
              status: 'done',
            },
            {
              amountInCents: '10000',
              currency: 'EUR',
              dateCreated: expect.any(String),
              merchantName: 'MerchantName',
              status: 'done',
            },
          ],
        });
      });
      describe('with a second filter on status PENDING', () => {
        test('should return the entries that correspond to the filter and paginate default data structure', async () => {
          const userId = randomUUID();
          await userExpensesRepository.saveUserExpense(createUserExpense(userId));
          await userExpensesRepository.saveUserExpense(createUserExpense(userId, 100n, 'DKK'));
          await userExpensesRepository.saveUserExpense(createUserExpense(userId));
          await userExpensesRepository.saveUserExpense(createUserExpense(userId, 10000n, 'EUR', 'PENDING'));

          const result = await Api.get(`/user/v1/user-expenses?userId=${userId}&currency=EUR&status=PENDING`);
          expect(result.status).toBe(200);
          expect(result.body).toStrictEqual({
            paginate: {
              pagination: { page: 0, offset: 0, pageSize: 10, totalCount: 1, lastPage: 0 },
              sort: { by: [], direction: [] },
              filters: {
                userId,
                currency: 'EUR',
                status: 'PENDING',
              },
            },
            data: [
              {
                amountInCents: '10000',
                currency: 'EUR',
                dateCreated: expect.any(String),
                merchantName: 'MerchantName',
                status: 'PENDING',
              },
            ],
          });
        });
      });
    });
  });
  describe('with a page 1 and pageSize 2', () => {
    test('should return 2 entries from the second page and paginate default data structure', async () => {
      const userId = randomUUID();
      await userExpensesRepository.saveUserExpense(createUserExpense(userId, 100n));
      await userExpensesRepository.saveUserExpense(createUserExpense(userId, 101n));
      await userExpensesRepository.saveUserExpense(createUserExpense(userId, 102n));
      await userExpensesRepository.saveUserExpense(createUserExpense(userId, 103n));
      await userExpensesRepository.saveUserExpense(createUserExpense(userId, 104n));
      await userExpensesRepository.saveUserExpense(createUserExpense(userId, 105n));

      const result = await Api.get(
        `/user/v1/user-expenses?userId=${userId}&sortBy=amount_in_cents&page=1&size=2&offset=1`
      );
      expect(result.status).toBe(200);
      expect(result.body).toStrictEqual({
        paginate: {
          pagination: { page: 1, offset: 1, pageSize: 2, totalCount: 6, lastPage: 3 },
          sort: {
            direction: [],
            by: ['amount_in_cents'],
          },
          filters: {
            userId,
          },
        },
        data: [
          {
            amountInCents: '103',
            currency: 'EUR',
            dateCreated: expect.any(String),
            merchantName: 'MerchantName',
            status: 'done',
          },
          {
            amountInCents: '104',
            currency: 'EUR',
            dateCreated: expect.any(String),
            merchantName: 'MerchantName',
            status: 'done',
          },
        ],
      });
    });
  });
});
