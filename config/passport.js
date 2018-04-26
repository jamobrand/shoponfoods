const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const secret = require('../config/secret');
const User = require('../models/user');
const async = require('async');
const request = require('request');

const Cart = require('../models/cart');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  User.findOne({ email: email}, function(err, user) {
    if (err) return done(err);

    if (!user) {
    return done(null, false, req.flash('loginMessage', 'No user has been found'));
    }

    if (!user.comparePassword(password)) {
    return done(null, false, req.flash('loginMessage', 'Oops! wrong Password Pal'));
    }
    return done(null, user);
  });
}));

passport.use(new GoogleStrategy(secret.google, function(accessToken, refreshToken, profile, done) {
  User.findOne({ googleId: profile.id }, function(err, user) {
    if (err) return done(err);

    if (user) {
      return done(null, user);
    } else {
      async.waterfall([
        function(callback) {
          var newUser = new User();
          newUser.email = profile.emails[0].value;
          newUser.googleId = profile.id;
          newUser.profile.fname = profile.displayName;
          newUser.admin = 0;
          newUser.profile.photo = profile.photos[0].value;

          newUser.save(function(err) {
            if (err) throw err;

            callback(err, newUser);
          });
        },

        function(newUser) {
          const cart = new Cart();
          cart.owner = newUser._id;
          cart.save(function(err) {
            if (err) return done(err);
            return done(err, newUser);
          });
        }
      ]);
    }
  });
}));

passport.use(new FacebookStrategy(secret.facebook, function(accessToken, refreshToken, profile, done) {
  User.findOne({ facebookId: profile.id }, function(err, user) {
    if (err) return done(err);

    if (user) {
      return done(null, user);
    } else {
      async.waterfall([
        function(callback) {
          var newUser = new User();
          newUser.email = profile._json.email;
          newUser.facebookId = profile.id;
          newUser.profile.fname = profile.displayName;
          newUser.admin = 0;
          newUser.profile.photo = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';

          newUser.save(function(err) {
            if (err) throw err;

            callback(err, newUser);
          });
        },

        function(newUser) {
          const cart = new Cart();
          cart.owner = newUser._id;
          cart.save(function(err) {
            if (err) return done(err);
            return done(err, newUser);
          });
        }
      ]);
    }
  });
}));

//custom function to validate
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
