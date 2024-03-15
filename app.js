'use strict'

// modules automatically imported by Express
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// my modules
const moment = require('moment');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const userDao = require('./models/user-dao.js');
const { Passport } = require('passport');

// const requirejs = require('requirejs');
// requirejs.config({
//   baseUrl: __dirname,
//   nodeRequire: require
// });

// page routers
const indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');

// app creation
const app = express();

// view engine setup (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// passport setup
passport.use(new LocalStrategy(
  function(username, password, done) {
    userDao.getUser(username, password).then(({user, check}) => {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!check) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    })
  }
));

// user serialization and deserialization
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  userDao.getUserByEmail(id).then(user => {
    done(null, user);
  });
});

// session management
app.use(session({
  secret: 'birds are dinosaurs',
  resave: false,
  saveUninitialized: false
}));

//passport initialization
app.use(passport.initialize());
app.use(passport.session());

// route management
app.use('/', indexRouter);
app.use('/login', loginRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
