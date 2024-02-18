import i18next from 'i18next';
import _ from 'lodash';

export default (app) => {
  const { models } = app.objection;
  const getCurrentUser = async (id) => models.user.query().findById(id);
  app
    .get('/incomes', { name: 'incomes', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourcesQueryIds = Object.keys(req.query)
        .filter((el) => el.includes('source'))
        .map((el) => Number(el.replace('source_', '')));
      const dateQuery = {
        begin: req.query.begin,
        end: req.query.end,
      };
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      const incomes = await models.user.relatedQuery('incomes').for(user).orderBy('date', 'desc').skipUndefined()
        .where('date', '>=', dateQuery.begin)
        .where('date', '<=', dateQuery.end);
      reply.render('incomes/index', {
        sourcesOfIncomes, incomes, sourcesQueryIds, dateQuery,
      });
      return reply;
    })
    .get('/monthlyIncomeReport', { name: 'monthlyIncomeReport', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const incomes = await models.user.relatedQuery('incomes').for(user);
      const data = incomes.reduce((acc, { date }) => {
        const year = new Date(date).getFullYear();
        const month = new Date(date).getMonth() + 1;
        acc[year] = !acc[year] ? [month] : _.uniq([...acc[year], month]);
        return acc;
      }, {});
      const queryYear = req.query.date ?? new Date().getFullYear();
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);

      if (!incomes.length) {
        req.flash('error', i18next.t('flash.incomes.create.non_exist_incomes'));
        reply.redirect(app.reverse('incomes'));
      } else {
        reply.render('incomes/monthlyIncomeReport', {
          sourcesOfIncomes, data, incomes, queryYear,
        });
      }
      return reply;
    })
    .get('/annualIncomeReport', { name: 'annualIncomeReport', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const incomes = await models.user.relatedQuery('incomes').for(user);
      const data = incomes.reduce((acc, { date }) => {
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
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      if (!incomes.length) {
        req.flash('error', i18next.t('flash.incomes.create.non_exist_incomes'));
        reply.redirect(app.reverse('incomes'));
      } else {
        reply.render('incomes/annualIncomeReport', {
          sourcesOfIncomes, data, incomes, years, queryYears,
        });
      }
      return reply;
    })
    .get('/reportSourcesOfIncomes', { name: 'reportSourcesOfIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const incomes = await models.user.relatedQuery('incomes').for(user).orderBy('date').skipUndefined()
        .where('date', '>=', req.query.begin)
        .where('date', '<=', req.query.end);
      const dateQuery = {
        begin: req.query.begin ?? incomes[0]?.date,
        end: req.query.end ?? incomes.at(-1)?.date,
      };
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      const incomesBySources = [];
      const amountByDate = sourcesOfIncomes.reduce((acc, source) => {
        const totalAmountBySource = incomes
          .filter((income) => income.sourceIncomesId === source.id)
          .reduce((acc2, exp) => acc2 + exp.amount, 0);
        if (totalAmountBySource) {
          incomesBySources.push({ name: source.name, totalAmountBySource });
          acc.max = acc.max < totalAmountBySource ? totalAmountBySource : acc.max;
          acc.total += totalAmountBySource;
        }
        return acc;
      }, { max: 0, total: 0 });
      incomesBySources.sort((a, b) => b.totalAmountBySource - a.totalAmountBySource);
      if (!incomes.length) {
        req.flash('error', i18next.t('flash.incomes.create.non_exist_incomes'));
        reply.redirect(app.reverse('incomes'));
      } else {
        reply.render('incomes/reportSourcesOfIncomes', {
          incomes, amountByDate, incomesBySources, dateQuery,
        });
      }
      return reply;
    })
    .get('/incomes/new', { name: 'newIncome', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      const incomes = await models.user.relatedQuery('incomes').for(user).orderBy('date');
      const income = new models.income();
      if (!sourcesOfIncomes.length) {
        req.flash('error', i18next.t('flash.incomes.create.non_exist_source'));
        reply.redirect(app.reverse('incomes'));
      } else {
        reply.render('incomes/new', {
          incomes, income, sourcesOfIncomes,
        });
      }
      return reply;
    })
    .post('/incomes', { name: 'createIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const income = new models.income();
      const incomes = await models.user.relatedQuery('incomes').for(user).orderBy('date');
      income.$set(req.body.data);
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      const dataIncome = {
        ...req.body.data,
        sourceIncomesId: Number(req.body.data.sourceIncomesId) ?? 0,
        amount: Number(req.body.data.amount),
        userId: user.id,
      };

      try {
        const validIncome = await models.income.fromJson(dataIncome);
        await models.income.query().insert(validIncome);
        req.flash('info', i18next.t('flash.incomes.create.success'));
        reply.redirect(app.reverse('incomes'));
      } catch (error) {
        req.flash('error', i18next.t('flash.incomes.create.error'));
        reply.render('incomes/new', {
          incomes, income, errors: error.data, sourcesOfIncomes,
        });
      }
      return reply;
    })
    .get('/incomes/:id/edit', { name: 'editIncome', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const incomeId = Number(req.params.id);
      const selectedIncome = await models.income.query().findById(incomeId);
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      const incomes = await models.user.relatedQuery('incomes').for(user).orderBy('date');
      const income = new models.expense();
      await income.$set(selectedIncome);
      reply.render('incomes/edit', {
        incomes, income, sourcesOfIncomes,
      });
      return reply;
    })
    .patch('/incomes/:id', { name: 'updateIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const incomeId = Number(req.params.id);
      const incomes = await models.user.relatedQuery('incomes').for(user).orderBy('date');
      const dataIncome = new models.income();
      dataIncome.$set(req.body.data);
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      const income = {
        id: incomeId,
        ...dataIncome,
        sourceIncomesId: Number(req.body.data.sourceIncomesId) ?? 0,
        amount: Number(req.body.data.amount),
      };

      try {
        const validIncome = await models.income.fromJson(income);
        const selectedIncome = await models.income.query().findById(incomeId);
        await selectedIncome.$query().patch(validIncome);
        req.flash('info', i18next.t('flash.incomes.edit.success'));
        reply.redirect(app.reverse('incomes'));
      } catch (error) {
        req.flash('error', i18next.t('flash.incomes.edit.error'));
        reply.render('incomes/edit', {
          incomes, income, errors: error.data, sourcesOfIncomes,
        });
      }
      return reply;
    })
    .delete('/incomes/:id', { name: 'deleteIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const incomeId = Number(req.params.id);
      const income = new models.income();
      const incomes = await models.user.relatedQuery('incomes').for(user).orderBy('date');
      income.$set(req.body.data);
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);

      try {
        await models.income.query().delete().where({ id: incomeId });
        req.flash('info', i18next.t('flash.incomes.delete.success'));
        reply.redirect(app.reverse('incomes'));
      } catch (error) {
        req.flash('error', i18next.t('flash.incomes.delete.error'));
        reply.render('incomes/new', {
          incomes, income, errors: error.data, sourcesOfIncomes,
        });
      }
      return reply;
    });
};
