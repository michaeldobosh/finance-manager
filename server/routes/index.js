// @ts-check

import welcome from './welcome.js';
import users from './users.js';
import session from './session.js';
// import balance from './balance.js';
import expenses from './expenses.js';
import incomes from './incomes.js';
import sourcesOfExpenses from './sourcesOfExpenses.js';
import sourcesOfIncomes from './sourcesOfIncomes.js';
import categories from './categories.js';

const controllers = [
  welcome,
  users,
  session,
  // balance,
  expenses,
  incomes,
  sourcesOfExpenses,
  sourcesOfIncomes,
  categories,
];

export default (app) => controllers.forEach((f) => f(app));
