const async = require('async');
const Product = require('../models/product');
const Review = require('../models/review');
const User = require('../models/user');


module.exports = function(io) {

  io.on('connection', function(socket) {
    console.log("Connected");
    var user = socket.request.user;
    //var product = socket.request.product._id;
    console.log(user.profile.fname);

    socket.on('review', (data) => {
      console.log(data)
      async.parallel([
        function(callback) {
          io.emit('incomingReviews', { data, user });
        },

        function(callback) {
          async.waterfall([
            function(callback) {
             var review = new Review();
             review.owner = user._id;
             //review.item = product._id;
             review.content = data.content;
             review.save(function(err, count) {
               callback(err, count)
             });
            }
          ]);
        }

      ]);
    });
  });

}
