const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    area: String,
    fname: String,
    lname: String,
    email: String,
    phone: Number,
    landmark: String,
    street: String,
  instruction: String,
  orderitems: {
    title: String,
    quantity: String,
    total: { type: Number, default: 0},
  }
});

module.exports = mongoose.model('Order', OrderSchema);
