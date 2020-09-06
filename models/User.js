const knex = require('../database/connection');
const bcrypt = require('bcrypt');
const PasswordToken = require('./PasswordToken');

// prettier-ignore
class User {

  async findAll() {
    try {
      let result = await knex.select(['id', 'name', 'email', 'role']).table('users');
      return result;

    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async findById(id) {
    try {
      let result = await knex.select(['id', 'name', 'email', 'role']).table('users').where({ id: id });

      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }

    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async findByEmail(email) {
    try {
      let result = await knex.select(['id', 'name', 'email', 'password','role']).table('users').where({ email: email });

      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }

    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async new(email, password, name) {
    try {
      let hash = bcrypt.hashSync(password, 10);

      await knex.insert({ email, password: hash, name, role: 0 }).table('users');
    } catch (err) {
      console.log(err);
    }
  }

  async findEmail(email) {
    try {
      let result = await knex.select().table('users').where({ email: email })

      if (result.length > 0) {
        return true;
      } else {
        return false;
      }

    } catch (err) {
      console.log(err)
    }
  }

  async update(id, email, name, role) {

    let user = await this.findById(id);

    if (user != undefined) {

      let editUser = {};

      if (user != undefined && email != user.email) {
        let result = await this.findEmail(email);
        if (!result) {
          editUser.email = email;
        }
        else {
          return { status: false, err: 'O email já está cadastrado' }
        }
      }

      if (name != undefined) {
        editUser.name = name;
      }

      if (role != undefined) {
        editUser.role = role;
      }

      try {
        await knex.update(editUser).where({ id: id }).table('users')
        return { status: true };
      } catch (err) {
        return { status: false, err: err }
      }

    } else {
      return { status: false, err: 'O usuário não existe!' }
    }
  }

  async delete(id) {
    let user = await this.findById(id);

    if (user != undefined) {
      try {
        await knex.delete().table('users').where({ id: id })
        return { status: true }
      } catch (err) {
        return { status: false, err: err }
      }
    } else {
      return { status: false, err: 'O usuário não existe' }
    }
  }

  async changePassword(newPassword, id, token ){
    let hash = bcrypt.hashSync(newPassword, 10);
    await knex.update({password: hash}).where({id: id}).table('users')
    await PasswordToken.setUsed(token)
  }
}

module.exports = new User();
