/*  eslint linebreak-style: ["error", "windows"]  */
// @ts-check

export const up = (knex) => (
  knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('nick_name');
    table.string('email');
    table.integer('age');
    table.integer('gender');
    table.string('password_digest');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  })
);

export const down = (knex) => knex.schema.dropTable('users');
