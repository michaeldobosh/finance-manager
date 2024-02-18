import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  const getCurrentUser = async (id) => models.user.query().findById(id);
  app
    .get('/categories', { name: 'newCategory', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const category = new models.category();
      const categories = await models.user.relatedQuery('categories').for(user);

      reply.render('categories/index', { category, categories });
      return reply;
    })
    .post('/categories', { name: 'createCategory', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const categories = await models.user.relatedQuery('categories').for(user);
      const category = new models.category();
      category.$set(req.body.data);
      const dataCategory = {
        ...req.body.data,
        userId: user.id,
      };

      try {
        const validCategory = await models.category.fromJson(dataCategory);
        await models.category.query().insert(validCategory);
        req.flash('info', i18next.t('flash.categories.create.success'));
        reply.redirect(app.reverse('newCategory'));
      } catch (error) {
        req.flash('error', i18next.t('flash.categories.create.error'));
        reply.render('categories/index', { category, errors: error.data, categories });
      }
      return reply;
    })
    .get('/categories/:id/edit', { name: 'editCategory', preValidation: app.authenticate }, async (req, reply) => {
      const categoryId = Number(req.params.id);
      const category = await models.category.query().findById(categoryId);
      const categories = await models.category.query();

      reply.render('categories/edit', { category, categories });
      return reply;
    })
    .patch('/categories/:id', { name: 'updateCategory', preValidation: app.authenticate }, async (req, reply) => {
      const categoryId = Number(req.params.id);
      const dataCategory = new models.category();
      dataCategory.$set(req.body.data);
      const category = {
        id: categoryId,
        ...dataCategory,
      };

      try {
        const validCategory = await models.category.fromJson(category);
        const selectedCategory = await models.category.query().findById(categoryId);
        await selectedCategory.$query().patch(validCategory);
        req.flash('info', i18next.t('flash.categories.edit.success'));
        reply.redirect(app.reverse('newCategory'));
      } catch (error) {
        req.flash('error', i18next.t('flash.categories.edit.error'));
        reply.render('categories/edit', { category, errors: error.data });
      }
      return reply;
    })
    .get('/categories/:id/delete', { name: 'warningDeleteCategory', preValidation: app.authenticate }, async (req, reply) => {
      req.flash('error', i18next.t('views.categories.actions.warning'));
      const categoryId = Number(req.params.id);
      const category = await models.category.query().findById(categoryId);
      const categories = await models.category.query();

      reply.render('categories/delete', { category, categories });
      return reply;
    })
    .delete('/categories/:id', { name: 'deleteCategory', preValidation: app.authenticate }, async (req, reply) => {
      const user = await getCurrentUser(req.user.id);
      const categoryId = Number(req.params.id);
      const category = new models.category();
      const categories = await models.user.relatedQuery('categories').for(user);

      try {
        await models.category.transaction(async (trx) => {
          await models.category.query(trx).delete().where({ id: categoryId });
          const sources = await models.sourceOfExpenses.query(trx).where({ categoryId });
          await models.sourceOfExpenses.query(trx).where({ categoryId }).delete();
          const expenses = models.sourceOfExpenses.relatedQuery('expenses', trx).for(sources).delete();
          return expenses;
        });
        req.flash('info', i18next.t('flash.categories.delete.success'));
        reply.redirect(app.reverse('newCategory'));
      } catch (error) {
        req.flash('error', i18next.t('flash.categories.delete.error'));
        reply.render('categories/index', { category, errors: error.data, categories });
      }
      return reply;
    });
};
