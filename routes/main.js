const router = require('express').Router();
const User = require('../models/user');
const Product = require('../models/product');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Review = require('../models/review');

const one = 200;
const two = 400;

function paginate(req, res, next) {

  const perPage = 8;
  const page = req.params.page;

  Product
    .find()
    .skip( perPage * page)
    .limit( perPage )
    .exec(function(err, products) {
      if (err) return next(err);
      Product.count().exec(function(err, count) {
        if (err) return next(err);
        res.render('main/shop', {
          pagetitle: "All Products",
          products: products,
          pages: count / perPage
        });
      });
    });
}

/* GET All Products*/
router.get('/shop', function(req, res, next) {
  paginate(req, res, next);
});

router.get('/page/:page', function(req, res, next) {
 paginate(req, res, next);
});

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

/* Post Search*/
router.post('/search', function(req, res, next) {
  res.redirect('/search?q=' + req.body.q);
});

/* Review Order */
router.get('/review-order', function(req, res) {
  User.findOne({ _id: req.user._id }, function(err, user) {
 res.render('main/review-order', {
   pagetitle: "Review"
 });
  });
});

/* GET Search*/
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

/* GET Homepage*/
router.get('/', function(req, res, next) {
  res.render('main/home');
});

/* GET Terms*/
router.get('/terms', function(req, res, next) {
  res.render('main/terms', {
    pagetitle: "Terms and Condition | Shoponfoods"
  });
});

/* GET Privacy*/
router.get('/privacy', function(req, res, next) {
  res.render('main/privacy', {
    pagetitle: "Shoponfoods | Privacy Policy"
  });
});

/* GET Checkout*/
router.route('/checkout')
 .get((req, res, next) => {
   Cart
     .findOne({ owner: req.user._id })
     .populate('items.item')
     .exec(function(err, foundCart) {
       if (foundCart.total == 0) {
         var totalPrice = 0;
         req.session.foundCart = foundCart;
         req.session.total = totalPrice;
       } else if (foundCart.total < 1000) {
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

/* GET Cart*/
router.get('/cart', function(req, res, next) {

  Cart
    .findOne({ owner: req.user._id })
    .populate('items.item')
    .exec(function(err, foundCart) {
      if (err) return next(err);
      res.render('main/cart', {
        foundCart: foundCart,
        message: req.flash('remove'),
        pagetitle: "Your Shopping"
      });
    });
});

/* Post to Cart/Basket*/
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

/* Remove Products from Cart/Basket*/
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

/* Post Review on Product*/
router.post('/review/:id', function(req, res, next) {
  Product.findById({ _id: req.params.id }, function(err, product) {
    User.findOne({  _id: req.user._id }, function(err, user) {
      if (user) {
        var review = new Review();
        review.owner = user._id;
        review.item = product._id;
        review.content = req.body.content;
        review.save(function(err) {
          if (err) return next(err);
          res.redirect('/shop');
        });
      }
    });
  });
});

/* GET Products By Category*/
router.get('/products/:id', function(req, res, next) {
  Product
    .find({ category: req.params.id })
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      res.render('main/category', {
        pagetitle: "Shopon Foods: Grocery and House Supplies",
        products: products
      });
    });
});

/* GET Each Product and Review By Product*/
router.get('/product/:id', function(req, res, next) {
  Product.findById({ _id: req.params.id }, function(err, product) {
      Review
        .find({ item: req.params.id })
        .sort('-created')
        .populate('owner')
        .exec(function(err, review) {
            if (err) return next(err);
            res.render('main/product', {
              pagetitle: product.title,
              product: product,
              message: req.flash('success'),
              review: review
            });
        });
  });
});



  module.exports = router;
