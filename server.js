const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require('ejs-mate');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const path = require('path');
const passportSocketIo = require('passport.socketio');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo')(session);
const fileUpload = require('express-fileupload');
const config = require('./config/secret');
const Category = require('./models/category');
const User = require('./models/user');
const cartLength = require('./middleware/middlewares');

const fs = require('fs');
const xml2js = require('xml2js');


const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


const sessionStore = new MongoStore({ url: config.database, autoReconnect: true})

//DB
mongoose.connection.on('open', function(ref) {
  console.log('Connected to Database');
});
mongoose.connection.on('error', function(err) {
  console.log('Could not connect to Database');
});

mongoose.connect(config.database,function(err) {
  if(err) console.log(err);
});

// Express fileUpload middleware
app.use(fileUpload());

//Middleware
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.secret,
  store: sessionStore
}));
app.use(flash());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,
  key: 'connect.sid',
  secret: config.secret,
  store: sessionStore,
  success: onAuthorizeSuccess,
  fail: onAuthorizeFail
}));

function onAuthorizeSuccess(data, accept) {
  console.log("successful connection");
  accept();
}

function onAuthorizeFail(data, message, error, accept) {
  console.log("failed connection");
  if (error) accept(new Error(message));
}

app.use(cartLength);

app.use(function(req, res, next) {
  Category.find({}, function(err, categories) {
    if (err) return next(err);
    res.locals.categories = categories;
    next();
  });
});

app.get('/sitemap.xml', function(req, res) {
  res.set('Content-Type', 'text/xml');
  res.send(fs.readFileSync('./sitemap.xml', {encoding: 'utf-8'}))
});

//require('./realtime/io')(io);

const mainRoutes = require('./routes/main');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const adminCategories = require('./routes/admin_categories');
const adminProducts = require('./routes/admin_products');


app.use(mainRoutes);
app.use(adminRoutes);
app.use(adminCategories);
app.use(adminProducts);
app.use(userRoutes);


const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || '127.0.0.1';


//Start server
http.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Server is running on port 8000");
  }
});
