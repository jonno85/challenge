import config from 'config';

import { Knex } from 'knex';
import path from 'path';

const { resolve } = path;

const connection: Knex.PgConnectionConfig = {
  host: config.get('db.host'),
  database: config.get('db.database'),
  user: config.get('db.user'),
  password: config.get('db.password'),
  port: config.get('db.port'),
};

const knexConfig: Knex.Config = {
  client: 'postgresql',
  connection,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    extension: 'ts',
    tableName: 'knex_migrations',
    schemaName: 'public',
    loadExtensions: config.get('knex.migrationExtension'),
    directory: [resolve(__dirname, './database/migrations')],
  },
};

export default knexConfig;
