import { buildUserDetailsRouter } from './packages/domains/user/routes/v1-get-user';
import { buildUserExpensesRepository } from './packages/domains/expense/data/db-expenses';
import { buildUserExpensesRouter } from './packages/domains/expense/routes/v1-get-expenses';
import { buildUserRepository } from './packages/domains/user/data/db-user';
import config from 'config';
import context from './middleware/context';
import express from 'express';
import gracefulShutdown from '@nc/utils/graceful-shutdown';
import helmet from 'helmet';
import { Knex } from 'knex';
import paginationAndFilters from './middleware/paginationAndFilters';
import security from './middleware/security';
import { createServer as createHTTPServer, Server } from 'http';
import { createServer as createHTTPSServer, Server as SecureServer } from 'https';

export function buildApp(dependencies: { db: Knex }): express.Express {
  const { db } = dependencies;
  const app = express();
  const server: Server | SecureServer =
    config.https.enabled === true ? createHTTPSServer(config.https, app as any) : createHTTPServer(app as any);
  app.set('ready', false);

  gracefulShutdown(server);

  app.use(helmet());
  app.get('/readycheck', function readinessEndpoint(req, res) {
    const status = app.get('ready') === true ? 200 : 503;
    res.status(status).send(status === 200 ? 'OK' : 'NOT OK');
  });

  app.get('/healthcheck', function healthcheckEndpoint(req, res) {
    res.status(200).send('OK');
  });

  app.use(context);
  app.use(security);
  app.use(paginationAndFilters);

  const userRepository = buildUserRepository(db);
  const userExpensesRepository = buildUserExpensesRepository(db);
  const userDetailsRoutes = buildUserDetailsRouter({ userRepository });
  const userExpensesRoutes = buildUserExpensesRouter({ userExpensesRepository });

  app.use('/user/v1', userDetailsRoutes);
  app.use('/user/v1', userExpensesRoutes);

  app.use((err, req, res, next) => {
    const status = err?.status ?? 500;

    res.status(status).json(err);
  });

  return app;
}
