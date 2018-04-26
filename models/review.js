const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'User'},
  item: { type: Schema.Types.ObjectId, ref: 'Product'},
  content: String,
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema)
