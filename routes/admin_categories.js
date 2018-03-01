const router = require('express').Router();
const Category = require('../models/category');
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;


/* Get Categories */
router.route('/admin/categories', isAdmin)
  .get((req, res, next) => {
    Category.find({}, function(err, categories) {
      if (err) return next(err);
      res.render('admin/categories', {
        categories: categories
      });
    });
  });


/* Get and Post Add-Category */
router.route('/admin/categories/add-category', isAdmin)
  .get((req, res, next) => {
    res.render('admin/add_category', { message: req.flash('success'), pagetitle: 'Add-Category'});
  })
  .post((req, res, next) => {
    var category = new Category();
    category.title= req.body.title;

    category.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Successfully added a Category');
      return res.redirect('/admin/categories');
    });
  });

/* Edit Category */
router.route('/admin/categories/edit-category/:id', isAdmin)
  .get((req, res, next) => {
    Category.findById(req.params.id, function(err, category) {
      if (err) return console.log(err);
      res.render('admin/edit_category', {
        message: req.flash('success'),
        pagetitle: "Edit Category",
        title: category.title,
        id: category._id
      });
    });
  })
  .post((req, res, next) => {
    const title = req.body.title;
    const id = req.params.id;

    Category.findOne({ title: title, _id: {'$ne': id}}, function(err, category) {
      if (category) {
        req.flash('error', 'Category with that title exists');
        return res.render('/admin/edit_category', {
          pagetitle: "Edit Category",
          id: id
        });
      } else {
        Category.findById(id, function(err, category) {
          if(err)
            return console.log(err);

            category.title = req.body.title;

            category.save(function(err) {
              if(err) return next(err);

              Category.find(function (err, categories) {
                if(err) {
                  console.log(err);
                } else {
                  req.res.locals.categories = categories;
                }
              });

              req.flash('success', 'Category Edited');
              res.redirect('/admin/categories/edit-category/' + id);
            });
        });

      }
    });
  });

  /* Delete Category */
  router.get('/delete-category/:id', isAdmin, function(req, res) {
    Category.findByIdAndRemove(req.params.id, function(err) {
      if (err) return console.log(err);

      Category.find(function(err, categories) {
        if (err) {
          console.log(err);
        } else {
          req.res.locals.categories = categories;
        }
      });

      req.flash('success', 'Category deleted');
      res.redirect('/admin/categories');
    });
  });


module.exports = router;
