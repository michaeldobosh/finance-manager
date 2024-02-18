/*  eslint linebreak-style: ["error", "windows"]  */
// @ts-check

export const up = (knex) => (
  knex.schema.createTable('expenses', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.integer('amount');
    table.date('date');
    table.integer('source_expenses_id').references('id').inTable('sources_of_expenses');
    table.integer('user_id').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('expenses');
