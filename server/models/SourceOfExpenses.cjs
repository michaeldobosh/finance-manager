// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');

const unique = objectionUnique({ fields: [['name', 'userId']] });

module.exports = class SourceOfExpenses extends unique(BaseModel) {
  static get tableName() {
    return 'sources_of_expenses';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 2 },
        categoryId: { type: 'integer', minimum: 1 },
        userId: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get relationMappings() {
    const Category = require('./Category.cjs');
    const Expense = require('./Expense.cjs');
    const User = require('./User.cjs');

    return {
      categories: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Category,
        join: {
          from: 'sources_of_expenses.categoryId',
          to: 'categories.id',
        },
      },
      expenses: {
        relation: BaseModel.HasManyRelation,
        modelClass: Expense,
        join: {
          from: 'sources_of_expenses.id',
          to: 'expenses.sourceExpensesId',
        },
      },
      users: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'sources_of_expenses.userId',
          to: 'users.id',
        },
      },
    };
  }
};
