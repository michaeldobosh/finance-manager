// @ts-check

const BaseModel = require('./BaseModel.cjs');
const objectionUnique = require('objection-unique');

const unique = objectionUnique({ fields: [['name', 'userId']] });

module.exports = class Asset extends unique(BaseModel) {
  static get tableName() {
    return 'assets';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'amount'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 2 },
        amount: { type: 'integer', minimum: 1 },
        closingDate: { type: 'string', format: 'date' },
        userId: { type: 'integer', minimum: 1 },
      },
    };
  }

  static get relationMappings() {
    const User = require('./User.cjs');

    return {
      Balance: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'assets.userId',
          to: 'users.id',
        },
      },
    };
  }
};
