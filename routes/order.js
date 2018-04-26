const router = require('express').Router();
const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');

const one = 200;
const two = 600;


/* GET Checkout*/
router.route('/checkout')
 .get((req, res, next) => {
   Cart
     .findOne({ owner: req.user._id })
     .populate('items.item')
     .exec(function(err, foundCart) {
       if (foundCart.total < 1000) {
         var totalPrice = foundCart.total + one;
         req.session.foundCart = foundCart;
         req.session.total = totalPrice;
       } else {
         var totalPrice = foundCart.total + two;
         req.session.foundCart = foundCart;
         req.session.total = totalPrice;
       }
       if (err) return next(err);
       res.render('main/checkout', {
         foundCart: foundCart,
         totalPrice: totalPrice,
         pagetitle: "Checkout Process"
       });
     });
 });

module.exports = router;
