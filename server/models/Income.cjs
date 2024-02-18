// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');

const unique = objectionUnique({ fields: [''] });

module.exports = class Income extends unique(BaseModel) {
  static get tableName() {
    return 'incomes';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'sourceIncomesId', 'amount', 'date'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 2 },
        amount: { type: 'integer', minimum: 1 },
        date: { type: 'string', format: 'date' },
        sourceIncomesId: { type: 'integer', minimum: 1 },
        userId: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get relationMappings() {
    const SourceOfIncomes = require('./SourceOfIncomes.cjs');
    const User = require('./User.cjs');

    return {
      sourcesOfExpenses: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: SourceOfIncomes,
        join: {
          from: 'incomes.sourceIncomesId',
          to: 'sources_of_incomes.id',
        },
      },
      users: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'incomes.userId',
          to: 'users.id',
        },
      },
    };
  }
};
