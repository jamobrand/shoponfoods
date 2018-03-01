const router = require('express').Router();
const async = require('async');
const Product = require('../models/product');
const Category = require('../models/category');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;


/* Get Products*/
router.get('/admin/view-products', isAdmin, function(req, res) {
  var count;

  Product.count(function(err, c) {
    count = c;
  });

  Product
    .find({})
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      res.render('admin/view_products', {
        products: products,
        count: count
      });
    });
});


/* Add Products*/
router.route('/admin/:title', isAdmin)
  .get((req, res, next) => {
    res.render('admin/add_products', { message: req.flash('success'), pagetitle:"Add Product" });
  })
  .post((req, res, next) => {
    async.waterfall([
      function(callback) {
        Category.findOne({ title: req.params.title }, function(err, category) {
          if (err) return next(err);
          callback(null, category);
        });
      },

      function(category, callback) {
        var product = new Product();
        product.category = category._id;
        product.title = req.body.title;
        product.desc = req.body.desc;
        product.price = req.body.price;
        product.image = req.body.image;

        product.save();
      }
    ]);
    req.flash('success', 'Product Added');
    res.redirect('/admin/view-products');
  });


/*Edit Products*/
router.route('/admin/products/edit-product/:id', isAdmin)
  .get((req, res, next) => {
      Product.findById(req.params.id, function(err, product) {
        if (err) return console.log(err);
        res.render('admin/edit_product', {
          message: req.flash('success'),
          pagetitle: "Edit Product",
          title: product.title,
          price: product.price,
          //categories: categories,
          desc: product.desc,
          category: product.category,
          image: product.image,
          id: product._id
        });
    });
  })
  .post((req, res) => {
    var title = req.body.title;
    var price = req.body.price;
    var desc = req.body.desc;
    var image = req.body.image;
    var category = req.body.category;
    var id = req.params.id;

    Product.findOne({ title: title, _id: {'$ne': id}}, function(err, product) {
      if(err) return next(err);

      if (product) {
        req.flash('error', 'Product with that title exists');
        res.redirect('/admin/products/edit-product/' + id);
      } else {
        Product.findById(id, function(err, product) {
          if(err) return next(err);

          product.title = title;
          product.price = price;
          product.desc = desc;
          product.image = image;
          product.category = category;

          product.save(function(err) {
            if(err) return next(err);

            req.flash('success', 'Product Edited');
            res.redirect('/admin/products/edit-product/' + id);
          });
        });
      }
    });
  });

router.get('/delete-product/:id', isAdmin, function(req, res) {

   Product.findByIdAndRemove(req.params.id, function(err) {
     if (err) return console.log(err);
   });

   req.flash('success', 'Product Deleted');
   res.redirect('/admin/view-products');
});


module.exports = router;
