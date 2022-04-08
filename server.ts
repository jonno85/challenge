import { buildApp } from './app';

import config from 'config';
import { createConnectionPool } from './database/createConnectionPool';
import Logger from '@nc/utils/logging';

const db = createConnectionPool();
const server = buildApp({ db });
const logger = Logger('server');

server.listen(config.port, () => {
  server.set('ready', true);
  logger.log(`Server started on port ${config.port}`);
});

export default server;
