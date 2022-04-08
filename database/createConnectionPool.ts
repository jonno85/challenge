import knexConfig from '../knexfile';
import { types } from 'pg';
import { Knex, knex } from 'knex';

/* Knex automatically returns a js date object, which is not what we want. Here's a trick to return the date only https://github.com/knex/knex/issues/3071 */
const DATE_OID = 1082;
const parseDate = (value: unknown): unknown => value;

export function createConnectionPool(): Knex {
  types.setTypeParser(DATE_OID, parseDate);
  return knex(knexConfig);
}
