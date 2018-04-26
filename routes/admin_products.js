const router = require('express').Router();
const async = require('async');
//const crypto = require('crypto');
const mkdirp = require('mkdirp');
const fs = require('fs-extra');
const resizeImg = require('resize-img');
//const multer = require('multer');
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
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

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
        product.image = imageFile;

        product.save(function (err) {
          if (err) return next(err);
          mkdirp('public/product_images/' + product._id, function (err) {
            return console.log(err);
          });

          if (imageFile != "") {
            var productImage = req.files.image;
            var path = 'public/product_images/' + product._id + '/' + imageFile;

            productImage.mv(path, function (err) {
              return console.log(err);
            });
          }
        });
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
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    var title = req.body.title;
    var price = req.body.price;
    var desc = req.body.desc;
    var pimage = req.body.pimage;
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
          if (imageFile != "") {
            product.image = imageFile;
          }
          product.category = category;

          product.save(function(err) {
            if(err) return next(err);

            if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                                        var path = 'public/product_images/' + id + '/' + imageFile;

                                        productImage.mv(path, function (err) {
                                            return console.log(err);
                                        });

                                    }

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
