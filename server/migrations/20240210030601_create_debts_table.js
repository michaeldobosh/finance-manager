/*  eslint linebreak-style: ["error", "windows"]  */
// @ts-check

export const up = (knex) => (
  knex.schema.createTable('debts', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('class');
    table.integer('amount');
    table.date('closing_date');
    table.integer('user_id').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('debts');
