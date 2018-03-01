const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  title: String,
  desc: String,
  price: Number,
  image: String,
  review: [{
      owner: { type: Schema.Types.ObjectId, ref: 'User'},
      content: String,
      created: { type: Date, default: Date.now }
  }]
});

ProductSchema.plugin(mongoosastic, {
  hosts: [
    'localhost:9200'
  ]
});

module.exports = mongoose.model('Product', ProductSchema);
