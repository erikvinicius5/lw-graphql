import BaseController, { route } from '~/src/schema/base/controller';
import { noAuth } from '~/src/utils/auth';
import config from '~/src/config';

import UserDAO from './dao';

export default class UserController extends BaseController {
  _controller = UserController;
  _dao = UserDAO;

  @route('get', '/login', noAuth)
  getLogin(req, res) {
    return res.render('users/login.html');
  }

  @route('post', '/login', noAuth)
  async postLogin(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).render('users/login.html', { error: 'Form.UNFILLED' });
    }

    const user = await this._dao.authenticate(username, password);
    if (!user) {
      return res.status(422).render('users/login.html', { error: 'User.WRONG_CREDENTIALS' });
    }

    res.jwt({ id: user.id, name: user.name });
    res.redirect('/');
  }

  @route('get', '/usuarios')
  async index(req, res) {
    const users = await this._dao.find({ username: { $ne: 'admin' } });
    return res.render('users/index.html', { users });
  }

  @route('get', '/usuarios/novo')
  async new(req, res) {
    return res.render('users/new.html');
  }

  @route('post', '/usuarios')
  async create(req, res) {
    const { name, email, username, password } = req.body;

    try {
      await this._dao.create(name, email, username, password);
    } catch(e) {
      return res.status(400).render('users/new.html', {
        error: e.message,
        ...req.body,
      });
    }

    res.redirect('/usuarios');
  }

  @route('get', '/usuarios/:id/editar')
  async edit(req, res) {
    const user = await this._dao.findOne({ id: req.params.id });
    return res.render('users/edit.html', user);
  }

  @route('patch', '/usuarios/:id')
  async update(req, res) {
    await this._dao.update(req.params.id, req.body)
    return res.send('Ok');
  }

  @route('delete', '/usuarios/:id')
  async delete(req, res) {
    console.log('will delete', req.params.id);
    await this._dao.remove({ id: req.params.id });
    console.log('success');
    return res.redirect('/usuarios');
  }
}
