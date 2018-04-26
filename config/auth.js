exports.isAdmin = function(req, res, next) {
  if (req.isAuthenticated() && res.locals.user.admin == 1) {
    next();
  } else {
    req.flash('error', 'Please log in as admin');
    res.redirect('/login');
  }
}
