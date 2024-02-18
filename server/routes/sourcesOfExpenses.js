import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  const getCurrentUser = async (id) => models.user.query().findById(id);
  app
    .get('/sourcesOfExpenses', { name: 'newSourceOfExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourceOfExpenses = new models.sourceOfExpenses();
      const categories = await models.user.relatedQuery('categories').for(user);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user);
      if (!categories.length) {
        req.flash('error', i18next.t('flash.expenses.create.non_exist_category'));
        reply.redirect(app.reverse('expenses'));
      } else {
        reply.render('sourcesOfExpenses/index', {
          sourceOfExpenses, categories, sourcesOfExpenses,
        });
      }
      return reply;
    })
    .post('/sourcesOfExpenses', { name: 'createSourcesOfExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourceOfExpenses = new models.sourceOfExpenses();
      sourceOfExpenses.$set(req.body.data);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user);
      const categories = await models.user.relatedQuery('categories').for(user);
      const dataSource = {
        ...req.body.data,
        categoryId: Number(req.body.data.categoryId),
        userId: user.id,
      };

      try {
        const validSourceOfExpenses = await models.sourceOfExpenses.fromJson(dataSource);
        await models.sourceOfExpenses.query().insert(validSourceOfExpenses);
        req.flash('info', i18next.t('flash.sourcesOfExpenses.create.success'));
        reply.redirect(app.reverse('newSourceOfExpenses'));
      } catch (error) {
        req.flash('error', i18next.t('flash.sourcesOfExpenses.create.error'));
        reply.render('sourcesOfExpenses/index', {
          sourceOfExpenses, errors: error.data, categories, sourcesOfExpenses,
        });
      }
      return reply;
    })
    .get('/sourcesOfExpenses/:id/edit', { name: 'editSourceOfExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourceId = Number(req.params.id);
      const sourceOfExpenses = await models.sourceOfExpenses.query().findById(sourceId);
      const categories = await models.user.relatedQuery('categories').for(user);

      reply.render('sourcesOfExpenses/edit', { sourceOfExpenses, categories });
      return reply;
    })
    .patch('/sourcesOfExpenses/:id', { name: 'updateSourceOfExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourceId = Number(req.params.id);
      const categories = await models.user.relatedQuery('categories').for(user);
      const dataSourceOfExpenses = new models.sourceOfExpenses();
      dataSourceOfExpenses.$set(req.body.data);
      const sourceOfExpenses = {
        id: sourceId,
        ...dataSourceOfExpenses,
        categoryId: Number(req.body.data.categoryId),
      };

      try {
        const validSource = await models.sourceOfExpenses.fromJson(sourceOfExpenses);
        const selectedSource = await models.sourceOfExpenses.query().findById(sourceId);
        await selectedSource.$query().patch(validSource);
        req.flash('info', i18next.t('flash.sourcesOfExpenses.edit.success'));
        reply.redirect(app.reverse('newSourceOfExpenses'));
      } catch (error) {
        req.flash('error', i18next.t('flash.sourcesOfExpenses.edit.error'));
        reply.render('sourcesOfExpenses/edit', {
          sourceOfExpenses, errors: error.data, categories,
        });
      }
      return reply;
    })
    .get('/sourcesOfExpenses/:id/delete', { name: 'warningDeleteSourceOfExpenses', preValidation: app.authenticate }, async (req, reply) => {
      req.flash('error', i18next.t('views.sourcesOfExpenses.actions.warning'));
      const sourceId = Number(req.params.id);
      const categories = await models.category.query();
      const sourcesOfExpenses = await models.sourceOfExpenses.query();
      const sourceOfExpenses = await models.sourceOfExpenses.query().findById(sourceId);

      reply.render('sourcesOfExpenses/delete', { sourceOfExpenses, sourcesOfExpenses, categories });
      return reply;
    })
    .delete('/sourcesOfExpenses/:id', { name: 'deleteSourceOfExpenses', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourceExpensesId = Number(req.params.id);
      const categories = await models.user.relatedQuery('categories').for(user);
      const sourcesOfExpenses = await models.user.relatedQuery('sourcesOfExpenses').for(user);
      const sourceOfExpenses = new models.sourceOfExpenses();

      try {
        await models.sourceOfExpenses.transaction(async (trx) => {
          await models.sourceOfExpenses.query(trx).delete().where({ id: sourceExpensesId });
          const expenses = await models.expense.query(trx).where({ sourceExpensesId }).delete();
          return expenses;
        });
        req.flash('info', i18next.t('flash.sourcesOfExpenses.delete.success'));
        reply.redirect(app.reverse('newSourceOfExpenses'));
      } catch (error) {
        req.flash('error', i18next.t('flash.sourcesOfExpenses.delete.error'));
        reply.render('sourcesOfExpenses/index', {
          sourceOfExpenses, errors: error.data, categories, sourcesOfExpenses,
        });
      }
      return reply;
    });
};
