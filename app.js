'use strict'

// modules automatically imported by Express
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const nodemailer = require('nodemailer');

// my modules
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const userDao = require('./models/user-dao.js');
const postsDao = require('./models/posts-dao.js');
// for various secrets
require('dotenv').config();

const requirejs = require('requirejs');
requirejs.config({
  baseUrl: __dirname,
  nodeRequire: require
});

// page routers
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const newPostRouter = require('./routes/new-post');
const postRouter = require('./routes/posts')
const profileRouter = require('./routes/users');
const passwordResetRouter = require('./routes/password-reset')
const passwordUpdateRouter = require('./routes/password-update')
const searchRouter = require('./routes/search')
const advancedRouter = require('./routes/advanced')
const adminRouter = require('./routes/admin')

// app creation
const app = express();


// view engine setup (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.static(path.join(__dirname, 'public')));

// session management
app.use(session({
  secret: process.env.SESSION_SECRET, // gets secret from .env file
  resave: false,
  saveUninitialized: false
}));

//passport initialization
app.use(passport.session());
app.use(flash());

// passport setup
passport.use(new LocalStrategy({usernameField: 'username', passwordField: 'password'}, (username, password, done) => {
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
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  userDao.getUserByUsername(user.username)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

// route management
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/new-post', newPostRouter);
app.use('/posts', postRouter);
app.use('/users', profileRouter);
app.use('/password-reset', passwordResetRouter);
app.use('/password-update', passwordUpdateRouter);
app.use('/search', searchRouter);
app.use('/advanced', advancedRouter);
app.use('/admin', adminRouter);

// homepage
app.get('/', async(req, res) => {
  const posts = await postsDao.getTrendingPosts();

  if(req.isAuthenticated())
    res.render('index.ejs', {aut: true, type: req.user.type, currentUser: req.user, posts});
  else
    res.render('index.ejs', {aut: false, type: false, currentUser: false, posts});
});

// donation route
app.get('/donate', async(req, res) => {
  if(req.isAuthenticated())
    res.render('donation.ejs', {aut: true, type: req.user.type, currentUser: req.user});
  else
    res.render('donation.ejs', {aut: false, type: false, currentUser: false});
});

/**
 * Sends email through nodemailer
 *
 * @param userEmail
 * @param message
 * @returns {Promise<*>}
 */
async function sendEmail(userEmail, message) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: userEmail,
    to: process.env.EMAIL_USER,
    subject: 'User wants to contact us!',
    html: `<p>${message}</p>`
  };

  return transporter.sendMail(mailOptions);
}

// contact routes
app.get('/contact', async(req, res) => {
  if(req.isAuthenticated())
    res.render('contact.ejs', {aut: true, type: req.user.type, currentUser: req.user});
  else
    res.render('contact.ejs', {aut: false, type: false, currentUser: false});
});

app.post('/contact', async (req, res) => {
  try {
    const { email, messageType, message } = req.body;
    const toSend = messageType + ': ' + message
    await sendEmail(email, toSend)
    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message' });
  }
});

// logout
app.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if(err) return next(err);
    res.redirect('/');
  });
});

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
