const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  title: { type: String, unique: true, lowercase: false}
});

module.exports = mongoose.model('Category', CategorySchema);
