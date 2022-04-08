import { Api } from '../utils/api';
import { buildApp } from '../../../app';
import config from 'config';
import { createConnectionPool } from '../../../database/createConnectionPool';
import { createUser } from '../utils/helpers';
import { randomUUID } from 'crypto';
import { Server } from 'http';
import { truncateTable } from '../../../database/scripts/bootstrapDB';
import { buildUserRepository, UserRepository } from '@nc/domain-user/data/db-user';

describe('Given the get-user-details endpoint', () => {
  let server: Server;
  const db = createConnectionPool();
  let userRepository: UserRepository;

  beforeAll(() => {
    const app = buildApp({ db });
    userRepository = buildUserRepository(db);

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

  describe('with not existing userId property passed', () => {
    test('should return 404 and user not found', async () => {
      const userId = randomUUID();
      const result = await Api.get('/user/v1/user-details?userId=' + userId);
      expect(result.status).toBe(404);
      expect(result.body.message).toStrictEqual(
        `Could not get user details: Error: Could not find user expenses with id ${userId}`
      );
    });
  });

  describe('with no userId property passed', () => {
    test('should return 404 and user not found', async () => {
      const result = await Api.get('/user/v1/user-details');
      expect(result.status).toBe(400);
      expect(result.body.message).toStrictEqual('Could not get user details: Error: userId property is missing.');
    });
  });
  describe('with existing userId property passed', () => {
    test('should return 200 and user details', async () => {
      const userId = randomUUID();
      await userRepository.saveUser(createUser(userId));
      const result = await Api.get('/user/v1/user-details?userId=' + userId);

      expect(result.status).toBe(200);
      expect(result.body).toStrictEqual({
        companyName: 'ACME',
        firstName: 'John',
        lastName: 'Doe',
      });
    });
  });
});
