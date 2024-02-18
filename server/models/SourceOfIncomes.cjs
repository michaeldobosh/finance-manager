// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');

const unique = objectionUnique({ fields: [['name', 'userId']] });

module.exports = class SourceOfIncomes extends unique(BaseModel) {
  static get tableName() {
    return 'sources_of_incomes';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 2 },
        userId: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get relationMappings() {
    const Income = require('./Income.cjs');
    const User = require('./User.cjs');

    return {
      incomes: {
        relation: BaseModel.HasManyRelation,
        modelClass: Income,
        join: {
          from: 'sources_of_incomes.id',
          to: 'incomes.sourceIncomesId',
        },
      },
      users: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'sources_of_incomes.userId',
          to: 'users.id',
        },
      },
    };
  }
};
