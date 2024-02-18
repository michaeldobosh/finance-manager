import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  const { models } = app.objection;
  const getCurrentUser = async (id) => models.user.query().findById(id);
  app
    .get('/expenses', { name: 'expenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const categoriesQuery = Object.keys(req.query)
        .filter((el) => el.includes('category'))
        .map((el) => Number(el.replace('category_', '')));
      const sourcesQuery = Object.keys(req.query)
        .filter((el) => el.includes('source'))
        .map((el) => Number(el.replace('source_', '')));
      const dateQuery = {
        begin: req.query.begin,
        end: req.query.end,
      };
      const categories = await models.user.relatedQuery('categories').for(user);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user);
      const expenses = await models.user.relatedQuery('expenses').for(user).orderBy('date', 'desc').skipUndefined()
        .where('date', '>=', dateQuery.begin)
        .where('date', '<=', dateQuery.end);
      reply.render('expenses/index', {
        categories, sourcesOfExpenses, expenses, categoriesQuery, sourcesQuery, dateQuery,
      });
      return reply;
    })
    .get('/reportMonth', { name: 'reportMonth', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const expenses = await models.user.relatedQuery('expenses').for(user);
      const data = expenses.reduce((acc, { date }) => {
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1;
        acc[year] = !acc[year] ? [month] : _.uniq([...acc[year], month]);
        return acc;
      }, {});
      const queryYear = req.query.date ?? new Date().getFullYear();
      const categories = await models.user.relatedQuery('categories').for(user);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user).orderBy('categoryId');
      if (!expenses.length) {
        req.flash('error', i18next.t('flash.expenses.create.non_exist_expenses'));
        reply.redirect(app.reverse('expenses'));
      } else {
        reply.render('expenses/reportMonth', {
          categories, sourcesOfExpenses, data, expenses, queryYear,
        });
      }
      return reply;
    })
    .get('/reportYear', { name: 'reportYear', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const expenses = await models.user.relatedQuery('expenses').for(user);
      const data = expenses.reduce((acc, { date }) => {
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1;
        acc[year] = !acc[year] ? [month] : _.uniq([...acc[year], month]);
        return acc;
      }, {});
      const years = Object.keys(data);
      const queryYears = {
        first: req.query.firstYear ?? years.at(-2) ?? years.at(-1),
        second: req.query.secondYear ?? years.at(-1),
      };
      const categories = await models.user.relatedQuery('categories').for(user);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user).orderBy('categoryId');
      if (!expenses.length) {
        req.flash('error', i18next.t('flash.expenses.create.non_exist_expenses'));
        reply.redirect(app.reverse('expenses'));
      } else {
        reply.render('expenses/reportYear', {
          categories, sourcesOfExpenses, data, expenses, years, queryYears,
        });
      }
      return reply;
    })
    .get('/reportCategory', { name: 'reportCategory', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const expenses = await models.user.relatedQuery('expenses').for(user).orderBy('date').skipUndefined()
        .where('date', '>=', req.query.begin)
        .where('date', '<=', req.query.end);
      const dateQuery = {
        begin: req.query.begin ?? expenses[0]?.date ?? new Date(`01-01-${new Date().getFullYear()}`).toLocaleDateString(),
        end: req.query.end ?? expenses.at(-1)?.date ?? new Date(`12-31-${new Date().getFullYear()}`).toLocaleDateString(),
      };
      const categories = await models.user.relatedQuery('categories').for(user);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user).orderBy('categoryId');
      const expensesByCategories = [];
      const amountByDate = categories.reduce((acc, cat) => {
        const idsSourcesExpenses = sourcesOfExpenses
          .filter((source) => source.categoryId === cat.id)
          .map((source) => source.id);
        const totalAmountByCategory = expenses
          .filter((exp) => idsSourcesExpenses.includes(exp.sourceExpensesId))
          .reduce((acc2, exp) => acc2 + exp.amount, 0);
        if (totalAmountByCategory) {
          expensesByCategories.push({ name: cat.name, totalAmountByCategory });
          acc.max = acc.max < totalAmountByCategory ? totalAmountByCategory : acc.max;
          acc.total += totalAmountByCategory;
        }
        return acc;
      }, { max: 0, total: 0 });
      expensesByCategories.sort((a, b) => b.totalAmountByCategory - a.totalAmountByCategory);
      if (!expenses.length) {
        req.flash('error', i18next.t('flash.expenses.create.non_exist_expenses'));
        reply.redirect(app.reverse('expenses'));
      } else {
        reply.render('expenses/reportCategory', {
          expenses, amountByDate, expensesByCategories, dateQuery,
        });
      }
      return reply;
    })
    .get('/reportSourcesOfExpenses', { name: 'reportSourcesOfExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const expenses = await models.user.relatedQuery('expenses').for(user).orderBy('date').skipUndefined()
        .where('date', '>=', req.query.begin)
        .where('date', '<=', req.query.end);
      const dateQuery = {
        begin: req.query.begin ?? expenses[0]?.date ?? new Date(`01-01-${new Date().getFullYear()}`).toLocaleDateString(),
        end: req.query.end ?? expenses.at(-1)?.date ?? new Date(`12-31-${new Date().getFullYear()}`).toLocaleDateString(),
      };
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user).orderBy('categoryId');
      const expensesBySources = [];
      const amountByDate = sourcesOfExpenses.reduce((acc, source) => {
        const totalAmountBySource = expenses
          .filter((exp) => exp.sourceExpensesId === source.id)
          .reduce((acc2, exp) => acc2 + exp.amount, 0);
        if (totalAmountBySource) {
          expensesBySources.push({ name: source.name, totalAmountBySource });
          acc.max = acc.max < totalAmountBySource ? totalAmountBySource : acc.max;
          acc.total += totalAmountBySource;
        }
        return acc;
      }, { max: 0, total: 0 });
      expensesBySources.sort((a, b) => b.totalAmountBySource - a.totalAmountBySource);
      if (!expenses.length) {
        req.flash('error', i18next.t('flash.expenses.create.non_exist_expenses'));
        reply.redirect(app.reverse('expenses'));
      } else {
        reply.render('expenses/reportSourcesOfExpenses', {
          expenses, amountByDate, expensesBySources, dateQuery,
        });
      }
      return reply;
    })
    .get('/expenses/new', { name: 'newExpense', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user);
      const expense = new models.expense();
      if (!sourcesOfExpenses.length) {
        req.flash('error', i18next.t('flash.expenses.create.non_exist_source'));
        reply.redirect(app.reverse('expenses'));
      } else {
        reply.render('expenses/new', { expense, sourcesOfExpenses });
      }
      return reply;
    })
    .post('/expenses', { name: 'createExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const expense = new models.expense();
      expense.$set(req.body.data);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user);
      const dataExpense = {
        ...req.body.data,
        sourceExpensesId: Number(req.body.data.sourceExpensesId) ?? 0,
        amount: Number(req.body.data.amount),
        userId: user.id,
      };

      try {
        const validExpense = await models.expense.fromJson(dataExpense);
        await models.expense.query().insert(validExpense);
        req.flash('info', i18next.t('flash.expenses.create.success'));
        reply.redirect(app.reverse('expenses'));
      } catch (error) {
        req.flash('error', i18next.t('flash.expenses.create.error'));
        reply.render('expenses/new', { expense, errors: error.data, sourcesOfExpenses });
      }
      return reply;
    })
    .get('/expenses/:id/edit', { name: 'editExpense', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const expenseId = Number(req.params.id);
      const selectedExpense = await models.expense.query().findById(expenseId);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user);
      const expense = new models.expense();
      await expense.$set(selectedExpense);
      reply.render('expenses/edit', { expense, sourcesOfExpenses });
      return reply;
    })
    .patch('/expenses/:id', { name: 'updateExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const expenseId = Number(req.params.id);
      const dataExpense = new models.expense();
      dataExpense.$set(req.body.data);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user);
      const expense = {
        id: expenseId,
        ...dataExpense,
        sourceExpensesId: Number(req.body.data.sourceExpensesId) ?? 0,
        amount: Number(req.body.data.amount),
      };

      try {
        const validExpense = await models.expense.fromJson(expense);
        const selectedExpense = await models.expense.query().findById(expenseId);
        await selectedExpense.$query().patch(validExpense);
        req.flash('info', i18next.t('flash.expenses.edit.success'));
        reply.redirect(app.reverse('expenses'));
      } catch (error) {
        req.flash('error', i18next.t('flash.expenses.edit.error'));
        reply.render('expenses/edit', { expense, errors: error.data, sourcesOfExpenses });
      }
      return reply;
    })
    .delete('/expenses/:id', { name: 'deleteExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const expenseId = Number(req.params.id);
      const expense = await models.expense.query().findById(expenseId);
      console.log(user.id, expense.userId);

      try {
        if (user.id !== expense.userId) {
          const error = new Error(i18next.t('flash.authError'));
          error.code = 'authError';
          throw error;
        }
        await models.expense.query().delete().where({ id: expenseId });
        req.flash('info', i18next.t('flash.expenses.delete.success'));
        reply.redirect(app.reverse('expenses'));
      } catch (error) {
        req.flash('error', i18next.t('flash.expenses.delete.error'));
        if (error.code === 'authError') req.flash('error', error.message);
        reply.redirect(app.reverse('expenses'));
      }
      return reply;
    });
};
