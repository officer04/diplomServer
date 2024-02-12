const { Schema, model } = require('mongoose');

const Cours = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  imgUrl: { type: String, require: true },
});

module.exports = model('Cours', Cours);
