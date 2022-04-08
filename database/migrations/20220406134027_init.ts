import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx.schema.createTable('expenses', function (table) {
      table.uuid('id').notNullable();
      table.uuid('user_id').notNullable();
      table.text('merchant_name').notNullable();
      table.text('currency').notNullable();
      table.text('status').notNullable();
      table.bigint('amount_in_cents').notNullable();
      table.datetime('date_created').notNullable();
    });
    await trx.schema.createTable('users', function (table) {
      table.uuid('id').notNullable();
      table.text('first_name').notNullable();
      table.text('last_name').notNullable();
      table.text('company_name').notNullable();
      table.text('ssn').notNullable();
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.transaction(async (trx) => {
    await trx.schema.dropTableIfExists('expenses');
    await trx.schema.dropTableIfExists('users');
  });
}
