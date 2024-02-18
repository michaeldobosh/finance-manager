import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  const getCurrentUser = async (id) => models.user.query().findById(id);
  app
    .get('/sourcesOfIncomes', { name: 'newSourceOfIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourceOfIncomes = new models.sourceOfIncomes();
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);

      reply.render('sourcesOfIncomes/index', {
        sourceOfIncomes, sourcesOfIncomes,
      });
      return reply;
    })
    .post('/sourcesOfIncomes', { name: 'createSourcesOfIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourceOfIncomes = new models.sourceOfIncomes();
      sourceOfIncomes.$set(req.body.data);
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      const dataSource = {
        ...req.body.data,
        userId: user.id,
      };

      try {
        const validSourceOfIncomes = await models.sourceOfIncomes.fromJson(dataSource);
        await models.sourceOfIncomes.query().insert(validSourceOfIncomes);
        req.flash('info', i18next.t('flash.sourcesOfIncomes.create.success'));
        reply.redirect(app.reverse('newSourceOfIncomes'));
      } catch (error) {
        req.flash('error', i18next.t('flash.sourcesOfIncomes.create.error'));
        reply.render('sourcesOfIncomes/index', {
          sourceOfIncomes, errors: error.data, sourcesOfIncomes,
        });
      }
      return reply;
    })
    .get('/sourcesOfIncomes/:id/edit', { name: 'editSourceOfIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const sourceId = Number(req.params.id);
      const sourceOfIncomes = await models.sourceOfIncomes.query().findById(sourceId);

      reply.render('sourcesOfIncomes/edit', { sourceOfIncomes });
      return reply;
    })
    .patch('/sourcesOfIncomes/:id', { name: 'updateSourceOfIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const sourceId = Number(req.params.id);
      const dataSourceOfIncomes = new models.sourceOfIncomes();
      dataSourceOfIncomes.$set(req.body.data);
      const sourceOfIncomes = {
        id: sourceId,
        ...dataSourceOfIncomes,
      };

      try {
        const validSource = await models.sourceOfIncomes.fromJson(sourceOfIncomes);
        const selectedSource = await models.sourceOfIncomes.query().findById(sourceId);
        await selectedSource.$query().patch(validSource);
        req.flash('info', i18next.t('flash.sourcesOfIncomes.edit.success'));
        reply.redirect(app.reverse('newSourceOfIncomes'));
      } catch (error) {
        req.flash('error', i18next.t('flash.sourcesOfIncomes.edit.error'));
        reply.render('sourcesOfIncomes/edit', {
          sourceOfIncomes, errors: error.data,
        });
      }
      return reply;
    })
    .get('/sourcesOfIncomes/:id/delete', { name: 'warningDeleteSourceOfIncomes', preValidation: app.authenticate }, async (req, reply) => {
      req.flash('error', i18next.t('views.sourcesOfIncomes.actions.warning'));
      const sourceId = Number(req.params.id);
      const sourcesOfIncomes = await models.sourceOfIncomes.query();
      const sourceOfIncomes = await models.sourceOfIncomes.query().findById(sourceId);

      reply.render('sourcesOfIncomes/delete', { sourceOfIncomes, sourcesOfIncomes });
      return reply;
    })
    .delete('/sourcesOfIncomes/:id', { name: 'deleteSourceOfIncomes', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const sourceIncomesId = Number(req.params.id);
      const sourcesOfIncomes = await models.user.relatedQuery('sourcesOfIncomes').for(user);
      const sourceOfIncomes = new models.sourceOfIncomes();

      try {
        await models.sourceOfIncomes.transaction(async (trx) => {
          await models.sourceOfIncomes.query(trx).delete().where({ id: sourceIncomesId });
          const incomes = await models.income.query(trx).where({ sourceIncomesId }).delete();
          return incomes;
        });
        req.flash('info', i18next.t('flash.sourcesOfIncomes.delete.success'));
        reply.redirect(app.reverse('newSourceOfIncomes'));
      } catch (error) {
        req.flash('error', i18next.t('flash.sourcesOfIncomes.delete.error'));
        req.flash('error', error.message);
        reply.render('sourcesOfIncomes/index', {
          sourceOfIncomes, errors: error.data, sourcesOfIncomes,
        });
      }
      return reply;
    });
};
