// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');

const unique = objectionUnique({ fields: [['name', 'userId']] });

module.exports = class Category extends unique(BaseModel) {
  static get tableName() {
    return 'categories';
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
    const SourceOfExpenses = require('./SourceOfExpenses.cjs');
    const User = require('./User.cjs');

    return {
      sourcesOfExpenses: {
        relation: BaseModel.HasManyRelation,
        modelClass: SourceOfExpenses,
        join: {
          from: 'categories.id',
          to: 'sources_of_expenses.categoryId',
        },
      },
      users: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'categories.userId',
          to: 'users.id',
        },
      },
    };
  }
};
