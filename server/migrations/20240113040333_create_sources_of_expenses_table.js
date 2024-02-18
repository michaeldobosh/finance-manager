/*  eslint linebreak-style: ["error", "windows"]  */
// @ts-check

export const up = (knex) => (
  knex.schema.createTable('sources_of_expenses', (table) => {
    table.increments('id').primary();
    table.string('name');
    table.integer('category_id').references('id').inTable('categories');
    table.integer('user_id').references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('sources_of_expenses');
