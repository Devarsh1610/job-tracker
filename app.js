require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var hbs = require('hbs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var session = require('express-session');
var { MongoStore } = require('connect-mongo');
var passport = require('passport');
var flash = require('connect-flash');

var connectDB = require('./config/database');

// Connect to MongoDB (credentials come from .env, not hardcoded here)
connectDB();

// Passport config
require('./config/passport')(passport);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var applicationsRouter = require('./routes/applications');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Small helpers used in the views
hbs.registerHelper('formatDate', function (date) {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
});
hbs.registerHelper('eq', function (a, b) {
  return a === b;
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method')); // lets HTML forms send PUT/DELETE

// Sessions (stored in MongoDB so login persists across restarts)
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI })
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Make user + flash messages available in every view
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.currentYear = new Date().getFullYear();
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/applications', applicationsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
