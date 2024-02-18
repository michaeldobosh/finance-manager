/*  eslint linebreak-style: ["error", "windows"]  */
// @ts-check

export const up = (knex) => (
  knex.schema.createTable('incomes', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.integer('amount');
    table.date('date');
    table.integer('source_incomes_id').references('id').inTable('sources_of_incomes');
    table.integer('user_id').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('incomes');
