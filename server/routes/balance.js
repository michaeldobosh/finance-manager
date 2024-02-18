import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  const getCurrentUser = async (id) => models.user.query().findById(id);
  app
    .get('/balance', { name: 'balance', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const assets = await models.user.relatedQuery('assets').for(user);
      const debts = await models.user.relatedQuery('debts').for(user);
      reply.render('balance/index', { assets, debts });
      return reply;
    })
    .get('/assets', { name: 'newAsset', preValidation: app.authenticate }, async (req, reply) => {
      const asset = new models.asset();
      reply.render('assets/new', { asset });
      return reply;
    })
    .post('/assets', { name: 'createAsset', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const asset = new models.asset();
      asset.$set(req.body.data);
      const dataAsset = {
        ...req.body.data,
        userId: user.id,
        amount: Number(req.body.data.amount),
      };

      try {
        const validAsset = await models.asset.fromJson(dataAsset);
        await models.asset.query().insert(validAsset);
        req.flash('info', i18next.t('flash.assets.create.success'));
        reply.redirect(app.reverse('balance'));
      } catch (error) {
        req.flash('error', i18next.t('flash.assets.create.error'));
        reply.render('assets/new', { asset, errors: error.data });
      }
      return reply;
    })
    .get('/assets/:id/edit', { name: 'editAsset', preValidation: app.authenticate }, async (req, reply) => {
      const assetId = Number(req.params.id);
      const asset = await models.asset.query().findById(assetId);

      reply.render('assets/edit', { asset });
      return reply;
    })
    .patch('/assets/:id', { name: 'updateAsset', preValidation: app.authenticate }, async (req, reply) => {
      const assetId = Number(req.params.id);
      const dataAsset = new models.asset();
      dataAsset.$set(req.body.data);
      const asset = {
        id: assetId,
        ...dataAsset,
        amount: Number(req.body.data.amount),
      };

      try {
        const validAsset = await models.asset.fromJson(asset);
        const selectedAsset = await models.asset.query().findById(assetId);
        await selectedAsset.$query().patch(validAsset);
        req.flash('info', i18next.t('flash.assets.edit.success'));
        reply.redirect(app.reverse('balance'));
      } catch (error) {
        req.flash('error', i18next.t('flash.assets.edit.error'));
        reply.render('assets/edit', { asset, errors: error.data });
      }
      return reply;
    })
    .delete('/assets/:id', { name: 'deleteAsset', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const assetId = Number(req.params.id);
      const selectedAsset = await models.asset.query().findById(assetId);

      try {
        await models.asset.query().delete().where({ id: assetId });
        req.flash('info', i18next.t('flash.assets.delete.success'));
        reply.redirect(app.reverse('balance'));
      } catch (error) {
        req.flash('error', i18next.t('flash.assets.delete.error'));
        reply.render('assets/index', { selectedAsset, errors: error.data });
      }
      return reply;
    })
    .get('/debts', { name: 'newDebt', preValidation: app.authenticate }, async (req, reply) => {
      const debt = new models.debt();
      reply.render('debts/new', { debt });
      return reply;
    })
    .post('/debts', { name: 'createDebt', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const debt = new models.debt();
      debt.$set(req.body.data);
      const dataDebt = {
        ...req.body.data,
        userId: user.id,
        amount: Number(req.body.data.amount),
      };

      try {
        const validAsset = await models.debt.fromJson(dataDebt);
        await models.debt.query().insert(validAsset);
        req.flash('info', i18next.t('flash.debts.create.success'));
        reply.redirect(app.reverse('balance'));
      } catch (error) {
        req.flash('error', i18next.t('flash.debts.create.error'));
        reply.render('debts/new', { debt, errors: error.data });
      }
      return reply;
    })
    .get('/debts/:id/edit', { name: 'editDebt', preValidation: app.authenticate }, async (req, reply) => {
      const debtId = Number(req.params.id);
      const debt = await models.debt.query().findById(debtId);

      reply.render('debts/edit', { debt });
      return reply;
    })
    .patch('/debts/:id', { name: 'updateDebt', preValidation: app.authenticate }, async (req, reply) => {
      const debtId = Number(req.params.id);
      const dataDebt = new models.debt();
      dataDebt.$set(req.body.data);
      const debt = {
        id: debtId,
        ...dataDebt,
        amount: Number(req.body.data.amount),
      };

      try {
        const validAsset = await models.debt.fromJson(debt);
        const selectedAsset = await models.debt.query().findById(debtId);
        await selectedAsset.$query().patch(validAsset);
        req.flash('info', i18next.t('flash.debts.edit.success'));
        reply.redirect(app.reverse('balance'));
      } catch (error) {
        req.flash('error', i18next.t('flash.debts.edit.error'));
        reply.render('debts/edit', { debt, errors: error.data });
      }
      return reply;
    })
    .delete('/debts/:id', { name: 'deleteDebt', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const debtId = Number(req.params.id);
      const selectedDebt = await models.debt.query().findById(debtId);

      try {
        await models.debt.query().delete().where({ id: debtId });
        req.flash('info', i18next.t('flash.debts.delete.success'));
        reply.redirect(app.reverse('balance'));
      } catch (error) {
        req.flash('error', i18next.t('flash.debts.delete.error'));
        reply.render('debts/index', { selectedDebt, errors: error.data });
      }
      return reply;
    });
};
