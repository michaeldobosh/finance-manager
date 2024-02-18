// @ts-check

const BaseModel = require('./BaseModel.cjs');
const Category = require('./Category.cjs');
const SourceOfExpenses = require('./SourceOfExpenses.cjs');
const SourceOfIncomes = require('./SourceOfIncomes.cjs');
const Expense = require('./Expense.cjs');
const Income = require('./Income.cjs');
const Debt = require('./Debt.cjs');
const Asset = require('./Asset.cjs');

const objectionUnique = require('objection-unique');
const encrypt = require('../lib/secure.cjs');

const unique = objectionUnique({ fields: ['email', 'nickName'] });

module.exports = class User extends unique(BaseModel) {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['nickName', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        nickName: { type: 'string', minLength: 3 },
        age: { type: 'integer' },
        gender: { type: 'string' },
        email: { type: 'string', minLength: 1 },
        password: { type: 'string', minLength: 3 },
      },
    };
  }

  static relationMappings = {
    categories: {
      relation: BaseModel.HasManyRelation,
      modelClass: Category,
      join: {
        from: 'users.id',
        to: 'categories.userId',
      },
    },
    sourcesOfExpenses: {
      relation: BaseModel.HasManyRelation,
      modelClass: SourceOfExpenses,
      join: {
        from: 'users.id',
        to: 'sources_of_expenses.userId',
      },
    },
    sourcesOfIncomes: {
      relation: BaseModel.HasManyRelation,
      modelClass: SourceOfIncomes,
      join: {
        from: 'users.id',
        to: 'sources_of_incomes.userId',
      },
    },
    expenses: {
      relation: BaseModel.HasManyRelation,
      modelClass: Expense,
      join: {
        from: 'users.id',
        to: 'expenses.userId',
      },
    },
    incomes: {
      relation: BaseModel.HasManyRelation,
      modelClass: Income,
      join: {
        from: 'users.id',
        to: 'incomes.userId',
      },
    },
    assets: {
      relation: BaseModel.HasManyRelation,
      modelClass: Asset,
      join: {
        from: 'users.id',
        to: 'assets.userId',
      },
    },
    debts: {
      relation: BaseModel.HasManyRelation,
      modelClass: Debt,
      join: {
        from: 'users.id',
        to: 'debts.userId',
      },
    },
  };

  set password(value) {
    this.passwordDigest = encrypt(value);
  }

  verifyPassword(password) {
    return encrypt(password) === this.passwordDigest;
  }
};
