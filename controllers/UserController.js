const User = require('../models/User');
const PasswordToken = require('../models/PasswordToken');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

var secret = 'hauhauhuhauhauhuahuahuahuhau';

class UserController {
  async index(req, res) {
    let users = await User.findAll();
    res.json(users);
  }

  async findUser(req, res) {
    let id = req.params.id;
    let user = await User.findById(id);

    if (user == undefined) {
      res.status(404);
      res.json({});
    } else {
      res.json(user);
    }
  }

  async create(req, res) {
    let { email, name, password } = req.body;

    if (email == undefined) {
      res.status(400);
      res.json({ err: 'O e-mail é inválido!' });
      return;
    }

    if (name == undefined) {
      res.status(400);
      res.json({ err: 'O nome é inválido!' });
      return;
    }

    if (password == undefined) {
      res.status(400);
      res.json({ err: 'A senha é inválida!' });
      return;
    }

    let emailExists = await User.findEmail(email);

    if (emailExists) {
      res.status(406);
      res.json({ err: 'Email já cadastrado' });
    } else {
      await User.new(email, password, name);
      res.status(200);
      res.json({ msg: 'Usuário Cadastrado' });
    }
  }

  async edit(req, res) {
    let { id, name, email, role } = req.body;
    let result = await User.update(id, email, name, role);
    if (result.status) {
      res.json({ msg: 'Registro Atualizado' });
    } else {
      res.status(406);
      res.send(result.err);
    }
  }

  async deteleUser(req, res) {
    let id = req.params.id;

    let result = await User.delete(id);

    if (result.status) {
      res.status(200);
      res.json({ msg: 'Usuário deletado com sucesso' });
    } else {
      res.status(406);
      res.send(result.err);
    }
  }

  async recoveryPassword(req, res) {
    let email = req.body.email;

    let result = await PasswordToken.create(email);
    if (result.status) {
      res.status(200);
      res.send('' + result.token);
    } else {
      res.status(406);
      res.send(result.err);
    }
  }

  async changePassword(req, res) {
    let token = req.body.token;
    let password = req.body.password;

    let isTokenValid = await PasswordToken.validate(token);

    if (isTokenValid.status) {
      await User.changePassword(
        password,
        isTokenValid.token.user_id,
        isTokenValid.token.token
      );

      res.status(200);
      res.send('Senha Alterada');
    } else {
      res.status(406);
      res.send('Token inválido!');
    }
  }

  async login(req, res) {
    let { email, password } = req.body;

    var user = await User.findByEmail(email);

    if (user != undefined) {
      let result = await bcrypt.compare(password, user.password);

      if (result) {
        var token = jwt.sign({ email: user.email, role: user.role }, secret);
        res.status(200);
        res.json({ token: token });
      } else {
        res.status(406);
        res.send('Senha incorreta');
      }
    } else {
      res.json({ status: false });
    }
  }
}

module.exports = new UserController();
