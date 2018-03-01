const router = require('express').Router();
const async = require('async');
const User = require('../models/user');
const Order = require('../models/order');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;


router.get('/admin', isAdmin, function(req, res) {
  res.render('admin/admin');
});


router.get('/admin/view-users', isAdmin, function(req, res, next) {
  User
    .find()
    .populate('users')
    .exec(function(err, users) {
      if (err) return next(err);
      res.render('admin/view_users', {
        pagetitle: "Users",
        users: users
      });
    });
});

router.get('/admin/view-orders', isAdmin, function(req, res, next) {
  Order
    .find({})
    //.populate('orders')
    .exec(function(err, orders) {
      if (err) return next(err);
      res.render('admin/view_orders', {
        pagetitle: "Orders",
        orders: orders
      });
    });
});

router.get('/admin/orders', isAdmin, function(req, res, next) {
Order
    .find({})
    //.populate('orderitems')
    .exec(function(err, orderitems) {
      if (err) return next(err);
      res.render('admin/orders', {
        pagetitle: "Orders",
        orderitems: orderitems
      });
    });
});




module.exports = router;
