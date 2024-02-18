// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');

const unique = objectionUnique({ fields: [''] });

module.exports = class Expense extends unique(BaseModel) {
  static get tableName() {
    return 'expenses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'sourceExpensesId', 'amount', 'date'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 2 },
        amount: { type: 'integer', minimum: 1 },
        date: { type: 'string', format: 'date' },
        sourceExpensesId: { type: 'integer', minimum: 1 },
        userId: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get relationMappings() {
    const SourceOfExpenses = require('./SourceOfExpenses.cjs');
    const User = require('./User.cjs');

    return {
      sourcesOfExpenses: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: SourceOfExpenses,
        join: {
          from: 'expenses.sourceExpensesId',
          to: 'sources_of_expenses.id',
        },
      },
      users: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'expenses.userId',
          to: 'users.id',
        },
      },
    };
  }
};
