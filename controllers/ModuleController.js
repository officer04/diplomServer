const Module = require('../models/Module.js');

class ModuleController {
  async create(req, res) {
    try {
      const doc = new Module({
        title: req.body.title,
        coursId: req.body.coursId,
      });

      await doc.save();

      return res.status(201).end();
    } catch (err) {
      return res.status(500).json({
        message: 'Не удалось создать модуль',
      });
    }
  }

  async remove(req, res) {
    try {
      const postId = req.params.id;

      const module = await Module.findOneAndDelete({
        _id: postId,
      });

      if (!module) return res.status(404).json({ message: 'Нет такого модуля' });

      res.status(204).end();
    } catch (err) {
      return res.status(500).json({
        message: 'Не удалось удалить модуль',
      });
    }
  }

  // async update(req, res) {
  //   try {
  //     const postId = req.params.id;

  //     const post = await Cours.findOneAndUpdate(
  //       {
  //         _id: postId,
  //       },
  //       {
  //         title: req.body.title,
  //         price: req.body.price,
  //         description: req.body.description,
  //       },
  //       { new: true },
  //     );
  //     if (!post) return res.status(404).json({ message: 'Нет такой карты с ценой' });

  //     res.json(post);
  //   } catch (err) {
  //     console.log(err);
  //     return res.status(500).json({
  //       message: 'Не удалось получить карту с ценой',
  //     });
  //   }
  // }

  async getModule(req, res) {
    try {
      const coursId = req.params.id;
      const modules = await Module.find({ coursId: coursId });

      res.status(200).json(modules);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: 'Не удалось получить модули',
      });
    }
  }

  async getAll(req, res) {
    try {
      const modules = await Module.find({});

      res.status(200).json(modules);
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        message: 'Не удалось получить модули',
      });
    }
  }
}

module.exports = new ModuleController();
