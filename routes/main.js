const router = require('express').Router();
const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Review = require('../models/review');

Product.createMapping(function(err, mapping) {
  if (err) {
    console.log("error creating mapping");
    console.log(err);
  } else {
    console.log("Mapping created");
    console.log(mapping);
  }
});

var stream = Product.synchronize();
var count = 0;

stream.on('data', function() {
  count++;
});

stream.on('close', function() {
  console.log("Indexed " + count + " documents");
});

stream.on('error', function(err) {
  console.log(err);
});


router.post('/search', function(req, res, next) {
  res.redirect('/search?q=' + req.body.q);
});

router.get('/search', function(req, res, next) {
  if (req.query.q) {
    Product.search({
      query_string: { query: req.query.q}
    }, function(err, results) {
      if (err) return next(err);
      var data = results.hits.hits.map(function(hit) {
        return hit;
      });
      res.render('main/search-result', {
        query: req.query.q,
        pagetitle: "Search results",
        data: data
      });
    });
  }
});


router.get('/', function(req, res, next) {
  res.render('main/home');
});

router.get('/order', function(req, res, next) {
  Cart
    .findOne({ owner: req.user._id })
    .populate('items.item')
    .exec(function(err, foundCart) {
      if (err) return next(err);
      res.render('main/order', {
        foundCart: foundCart,
        message: req.flash('remove'),
        pagetitle: "Order Details"
      });
    });
});


router.get('/review', function(req, res) {
  User.findOne({ _id: req.user._id }, function(err, user) {
 res.render('main/review', {
   pagetitle: "Review"
 });
  });
});


router.route('/checkout')
 .get((req, res, next) => {
   Cart
     .findOne({ owner: req.user._id })
     .populate('items.item')
     .exec(function(err, foundCart) {
       if (err) return next(err);
       res.render('main/checkout', {
         foundCart: foundCart,
         pagetitle: "Checkout"
       });
     });
 });

router.get('/cart', function(req, res, next) {
  Cart
    .findOne({ owner: req.user._id })
    .populate('items.item')
    .exec(function(err, foundCart) {
      if (err) return next(err);
      res.render('main/cart', {
        foundCart: foundCart,
        message: req.flash('remove'),
        pagetitle: "Cart Page"
      });
    });
});

router.post('/product/:product_id', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, cart) {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });

    cart.total = (cart.total + parseFloat(req.body.priceValue));

    cart.save(function(err) {
      if (err) return next(err);
      return res.redirect('/cart');
    });
  });
});

router.post('/remove', function(req, res, next) {
  Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price));
    foundCart.save(function(err, found) {
      if (err) return next(err);
      req.flash('remove', "Successfully Removed");
      res.redirect('/cart');
    });
  });
});

router.get('/shop', function(req, res, next) {
  Product.find(function(err, products) {
    if (err) return next(err);
    res.render('main/shop', {
      pagetitle: "All Products",
      products: products
    });
  });
});


router.get('/products/:id', function(req, res, next) {
  Product
    .find({ category: req.params.id })
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      res.render('main/category', {
        pagetitle: "products",
        products: products
      });
    });
});

router.get('/product/:id', function(req, res, next) {
  Product.findById({ _id: req.params.id }, function(err, product) {
    Review
      .find({})
      .sort('-created')
      .populate('owner')
      .exec(function(err, reviews) {
        if (err) return next(err);
        res.render('main/product', {
          pagetitle: product.title,
          product: product,
          reviews: reviews
        });
      })
  });
});



  module.exports = router;
