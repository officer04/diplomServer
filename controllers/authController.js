const User = require('../models/User');
const Role = require('../models/Role');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const crypto = require('crypto');
const { createHash } = require('crypto');
const nodemailer = require('nodemailer');
const ResetPasswordRequest = require('../models/ResetPasswordRequest');
const UserCours = require('../models/UserCours');

const generateAccessToken = (id, roles, username, email) => {
  const payload = {
    id,
    roles,
    username,
    email,
  };

  return jwt.sign(payload, secret, { expiresIn: '24h' });
};

class AuthController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при регистрации', errors });
      }
      const { username, password, email } = req.body;
      const candidate = await User.findOne({ email });
      if (candidate) {
        return res.status(400).json({ message: 'Пользователь с таким емайл уже существует' });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      const useRole = await Role.findOne({ value: 'USER' });
      const user = new User({ username, email, password: hashPassword, roles: [useRole.value] });
      await user.save();
      const token = generateAccessToken(user._id, user.roles, user.username, user.email);
      return res.json({ token });
    } catch (e) {
      res.status(400).json({ message: 'Registration error' });
    }
  }

  async login(req, res) {
    try {
      const { password, email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: `Пользователь c почтой ${email} не найден` });
      }
      const validPassword = bcrypt.compareSync(password, user.password);

      if (!validPassword) {
        return res.status(400).json({ message: `Введен не правильный пароль` });
      }

      const token = generateAccessToken(user._id, user.roles, user.username, user.email);
      return res.json({ token });
    } catch (e) {
      res.status(400).json({ message: 'Login error' });
    }
  }

  async change(req, res) {
    try {
      const { id } = req.user;
      const user = req.body;

      const updateUserModel = { email: user.email, username: user.username };

      if (user.password) {
        const oldPassword = await User.findOne({ _id: id });

        const validPassword = bcrypt.compareSync(user.password, oldPassword.password);

        if (!validPassword) {
          return res.status(400).json({ message: `Введен не правильный пароль` });
        }

        const hashNewPassword = bcrypt.hashSync(user.newPassword, 7);

        updateUserModel.password = hashNewPassword;
      }

      const userUpdate = await User.findOneAndUpdate(
        {
          _id: id,
        },
        updateUserModel,
        { new: true },
      );

      if (!userUpdate) {
        res.status(400).json({ message: 'Такого пользоватля нет' });
      }

      const token = generateAccessToken(
        userUpdate._id,
        userUpdate.roles,
        userUpdate.username,
        userUpdate.email,
      );
      return res.json({ token });
    } catch (e) {
      res.status(400).json({ message: 'Error change' });
    }
  }

  async addRequestPassword(req, res) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Пользователя с такой почтой нет' });
      }
      const time = new Date();
      const expiryDate = time.getHours() + 2;
      time.setHours(expiryDate);

      const doc = new ResetPasswordRequest({
        expiryAt: time,
        userId: user.id,
      });

      await doc.save();

      let transporter = nodemailer.createTransport(
        {
          host: 'smtp.mail.ru',
          port: 465,
          secure: true,
          auth: {
            user: 'kadet_2003@list.ru',
            pass: 'RPQZ1D9urSixcGZEhu3k',
          },
        },
        { from: '<kadet_2003@list.ru>' },
      );

      const emailObject = {
        // from: '"Node js" <nodejs@example.com>',
        to: user.email,
        subject: '"Кодемания" Письмо для сброса пароля',
        text: 'Смена пароля',
        html: ` <div style=" font-size: 20px;
        display: flex;
        justify-content: center;
        align-items: center">
        <div>
          <hr />
          <p><b style="font-size: 20px">Привет, ${user.username}</b></p>
          <p style="font-size: 16px">
            Ты получил это электронное письмо, потому что ты или кто-то еще запросил пароль для <br />
            твоей учетной записи. Его можно смело игнорировать, если ты не запрашивал сброс пароля.
          </p>
          <p style="font-size: 16px">Нажми <a href="http://localhost:3000/auth/reset-password/${doc._id}">на ссылку</a>,
          чтобы сбросить пароль</p>
          <hr />
        </div>
      </div>`,
      };

      await transporter.sendMail(emailObject);

      res.status(201).json('');
    } catch (e) {
      res.status(400).json({ message: 'Error change' });
    }
  }

  async reset(req, res) {
    try {
      const requestId = req.params.requestId;
      const body = req.body;
      const currentDate = new Date();

      const request = await ResetPasswordRequest.findOne({ _id: requestId });

      if (!request || currentDate > request.expiryAt) {
        return res.status(400).json('Устаревшая заяввка на сброс пароля');
      }

      const hashNewPassword = bcrypt.hashSync(body.newPassword, 7);
      await User.updateOne(
        {
          _id: request.userId,
        },
        {
          password: hashNewPassword,
        },
      );

      await ResetPasswordRequest.deleteOne({
        _id: requestId,
      });

      return res.status(201).json('');
    } catch (e) {
      res.status(400).json({ message: 'Error change' });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find();
      res.json(users);
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = new AuthController();
