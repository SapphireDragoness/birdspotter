'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');

router.use(express.static(path.join(__dirname, '../public')));

// GET login page
router.get('/', (req, res) => {
  if(req.isAuthenticated()) res.redirect('/');
  else {
    res.render('login-register.ejs', {failure: false, type: null, login: true, aut: false, successMessage: false});
  }
});

router.post('/', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if(err) return next(err);
    // user not found
    if(!user) {
      return res.render('login-register.ejs', {
        failure: true,
        login: true,
        type: null,
        message: info.message,
        successMessage: false,
        aut: false
      });
    }
    // user banned
    if(user.banned) {
      return res.render('login-register.ejs', {
        failure: true,
        login: true,
        type: null,
        message: 'Can\'t log in, you are banned!',
        successMessage: false,
        aut: false
      });
    }
    else {
      req.login(user, function (err) {
        if (err) return next(err);
        res.redirect('/');
      });
    }
  })(req, res, next);
});

module.exports = router;

