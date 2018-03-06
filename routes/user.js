const router = require('express').Router();
const User = require('../models/user');
const Cart = require('../models/cart');
const Order = require('../models/order');
const async = require('async');
const passport = require('passport');
const passportConfig = require('../config/passport');


router.get('/profile', passportConfig.isAuthenticated, function(req, res, next) {
  User
    .findOne({ _id: req.user._id })
    .populate('history.item')
    .exec(function(err, foundUser) {
      if (err) return next(err);

      res.render('accounts/profile', {
        user: foundUser,
        pagetitle: "Your Profile"
      });
    });
});

router.route('/signup/')
.get((req, res, next) => {
  res.render('accounts/signup', {
    message: req.flash('errors'),
    pagetitle: "Shopon Foods:Grocery and House Supplies"
  });
})
.post((req, res, next) => {

   async.waterfall([
     function(callback) {
       User.findOne({ email: req.body.email }, function(err, existingUser) {
         if (existingUser) {
           req.flash('errors', 'Account with that email exists');
           res.redirect('/signup');
         } else {
           var user = new User();
           user.email = req.body.email;
           user.password = req.body.password;
           user.profile.fname = req.body.fname;
           user.profile.lname = req.body.lname;
           user.profile.photo = user.gravatar();
           user.admin = 0;
           user.save(function(err) {
             if (err) return next(err);
             callback(null, user);
           });
         }
       });
     },

     function(user) {
      const cart = new Cart();
      cart.owner = user._id
      cart.save(function(err) {
        if (err) return next(err);
        req.logIn(user, function(err) {
        if (err) return next(err);
        res.redirect('/')
        });
      });
     }
   ]);
});

router.post('/checkout', function(req, res, next) {
   async.waterfall([
     function(callback) {
       var order = new Order();
       order.area = req.body.area;
       order.fname = req.body.fname;
       order.lname = req.body.lname;
       order.email = req.body.email;
       order.phone = req.body.phone;
       order.landmark = req.body.landmark;
       order.street = req.body.street;
       order.instruction = req.body.instruction;
       order.orderitems.title = req.body.title;
       order.orderitems.quantity = req.body.quantity;
       order.orderitems.total = req.body.total;
        order.save(function(err, order) {
          if(err) return next(err);
          callback(err, order);
        });
     },

     function(order, callback) {
       Cart.findOne({ owner: req.user._id }, function(err, cart) {
         callback(err, cart);
       });
     },
     function(cart, callback) {
       User.findOne({ _id: req.user._id }, function(err, user) {
         if (user) {
           for (var i = 0; i < cart.items.length; i++) {
             user.history.push({
               item: cart.items[i].item,
               paid: cart.items[i].price
             })
           }

           user.save(function(err, user) {
             if (err) return next(err);
             callback(err, user);
           });
         }
       });
     },
     function(user, callback) {
       Cart.update({ owner: user._id }, { $set: { items: [], total: 0 }}, function(err, updated) {
         if (updated) {
           res.redirect('/review');
         }
       });
     }
   ])
})

router.route('/login')
.get((req, res, next) => {
  if (req.user) res.redirect('/');
  res.render('accounts/login', {
    message: req.flash('loginMessage'),
    pagetitle: "Shopon Foods:Grocery and House Supplies"
  });
})
.post(passport.authenticate('local-login', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/auth/facebook',
  passport.authenticate('facebook', {scope: 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  }));


router.route('/edit-profile/:id')
.get((req, res, next) => {
  User.findById(req.params.id, function(err, user) {
    if (err) return console.log(err);
    res.render('accounts/edit_profile', {
      message: req.flash('success'),
      pagetitle: "Edit Profile",
      fname: user.profile.fname,
      lname: user.profile.lname,
      email: user.email,
      id: user._id
    });
  });
})
.post((req, res, next) => {
  var fname = req.body.fname;
  var lname = req.body.lname;
  var email = req.body.email;
  var phone = req.body.phone;
  var id = req.params.id;

  User.findOne({ email: email, _id: {'$ne': id}}, function(err, user) {
    if (err) return next(err);

    if (user) {
      req.flash('error', 'User with that email exists, choose another');
      res.redirect('/edit-profile/' + id);
    } else {
      User.findById(id, function(err, user) {
        if (err) return next(err);

        user.profile.fname = fname;
        user.profile.lname = lname;
        user.email = email;
        user.profile.phone = phone;

        user.save(function(err) {
          if (err) return next(err);

          req.flash('success', 'User Edited');
          res.redirect('/edit-profile/' + id);
        });
      });
    }
  });
});

router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/');
});


module.exports = router;
