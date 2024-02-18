// @ts-check

import i18next from 'i18next';

export default (app) => {
  const { models } = app.objection;
  app
    .get('/profile', { name: 'profile', preValidation: app.authenticate }, async (req, reply) => {
      reply.render('users/index', { user: req.user });
      return reply;
    })
    .get('/users/new', { name: 'newUser' }, (req, reply) => {
      const user = new models.user();
      reply.render('users/new', { user });
    })
    .post('/users', async (req, reply) => {
      const user = new models.user();
      const dataUser = {
        ...req.body.data,
        age: 0,
        gender: '',
      };
      user.$set(req.body.data);

      try {
        const validUser = await models.user.fromJson(dataUser);
        await models.user.query().insert(validUser);
        await req.logIn(validUser);
        req.flash('info', i18next.t('flash.users.create.success'));
        reply.redirect(app.reverse('root'));
      } catch (error) {
        req.flash('error', i18next.t('flash.users.create.error'));
        reply.render('users/new', { user, errors: error.data });
      }
      return reply;
    })
    .get('/users/:id/edit', { name: 'userEditForm', preValidation: app.authenticate }, (req, reply) => {
      const userId = Number(req.params.id);
      const currentUser = req.user;

      if (userId === currentUser.id) {
        reply.render('users/edit', { user: currentUser });
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .patch('/users/:id', { name: 'updateUser', preValidation: app.authenticate }, async (req, reply) => {
      const userId = Number(req.params.id);
      const dataUser = new models.user();
      const user = {
        id: userId,
        ...req.body.data,
        age: Number(req.body.data.age),

      };
      dataUser.$set(req.body.data);
      console.log(req.body.data)
      try {
        const validUser = await models.user.fromJson(user);
        const selectedUser = await models.user.query().findById(userId);
        await selectedUser.$query().patch(validUser);
        req.flash('info', i18next.t('flash.users.edit.success'));
        reply.redirect(app.reverse('profile'));
      } catch (error) {
        req.flash('error', i18next.t('flash.users.edit.error'));
        req.flash('error', error.message);
        reply.render('users/edit', { user, errors: error.data });
      }
      return reply;
    })
    .get('/users/:id/delete', { name: 'userDeleteForm', preValidation: app.authenticate }, (req, reply) => {
      const userId = Number(req.params.id);
      const currentUser = req.user;

      if (userId === currentUser.id) {
        reply.render('users/delete', { user: currentUser });
        req.flash('error', i18next.t('flash.users.delete.warning'));
      } else {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
      }
    })
    .delete('/users/:id', { name: 'deleteUser', preValidation: app.authenticate }, async (req, reply) => {
      const { id } = req.params;
      const currentUserId = req.user?.id;
      const selectedUser = await models.user.query().findById(id);

      const isCurrent = selectedUser.id === Number(currentUserId);

      if (!isCurrent) {
        req.flash('error', i18next.t('flash.authError'));
        reply.redirect(app.reverse('root'));
        return reply;
      }

      try {
        req.logOut();
        await models.user.query().delete().where({ id });
        req.flash('info', i18next.t('flash.users.delete.success'));
        reply.redirect(app.reverse('root'));
      } catch (error) {
        req.flash('error', i18next.t('flash.users.delete.error'));
        reply.redirect(app.reverse('root'));
      }
      return reply;
    });
};
