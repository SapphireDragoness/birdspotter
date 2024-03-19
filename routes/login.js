'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const passport = require('passport');

router.use(express.static(path.join(__dirname, '../public')));

// GET login page
router.get('/', (req, res) => {
  if(req.isAuthenticated()) res.redirect('/');
  else res.render('login-register.ejs', {failure: false, type: null, login: true, aut: false});
});

router.post('/', function (req, res, next) {
  passport.authenticate('user', function (err, user, info) {
    if(err) return next(err);
    // user not found
    if(!user) {
      res.render('login-register.ejs', {
        failure: true,
        login: true,
        type: null,
        message: info.message,
        aut: false,
        insertedUsername: req.body.username,
        insertedPassword: req.body.password
      });
    }
    else {
      console.log('user ' + user.username + ' authenticated')
      req.login(user, function (err) {
        if (err) return next(err);
        res.redirect('/');
      });
    }
  })(req, res, next);
});

module.exports = router;

