$(function() {

   var socket = io();

   $('#sendReview').submit(function() {
     var content = $('#review').val();
     socket.emit('review', { content: content });
     $('#review').val('');
     return false;
   });

   socket.on('incomingReviews', function(data) {
     console.log(data);
     var html = '';
     html += '<p>' + data.data.content + '</p>';
     html += '<small class="text-muted">Posted by ' + data.user.profile.fname + ' </small>';
     html += '<hr>';

     $('#reviews').prepend(html);
   });

});
