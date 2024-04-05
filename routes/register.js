'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const userDao = require('../models/user-dao.js');
const {check, validationResult} = require('express-validator');

router.use(express.static(path.join(__dirname, '../public')));
router.use(express.urlencoded({extended: false}));

// GET register page
router.get('/', (req, res) => {
  if(req.isAuthenticated()) res.redirect('/');
  else res.render('login-register.ejs', {failure: false, type: null, login: false, aut: false});
});

// user registration
router.post('/', [
  check('firstName').notEmpty().withMessage('First name required'),
  check('lastName').notEmpty().withMessage('Last name required'),
  check('email').notEmpty().withMessage('Email required'),
  // TODO check if username is already in use
  check('username').notEmpty().withMessage('Username required'),
  check('password').notEmpty().withMessage('Password required')
  ], async (req, res) => {
  const error = validationResult(req);
    if (!error.isEmpty()) {
      res.render('login-register.ejs',
        {
          type: null,
          failure: true,
          message: error.errors[0].msg,
          login: false,
          aut: false,
          insertedFirstName: req.body.firstName,
          insertedLastName: req.body.lastName,
          insertedEmail: req.body.email,
          insertedUsername: req.body.username
        });
    }
    else {
      try {
        await userDao.registerUser(req.body.firstName, req.body.lastName, req.body.email, req.body.username, req.body.password, "user");
        res.redirect('/login');
      }
      catch (error) {
        res.render('login-register.ejs',
          {
            type: null,
            failure: true,
            message: error,
            login: false,
            aut: false,
            insertedFirstName: req.body.firstName,
            insertedLastName: req.body.lastName,
            insertedEmail: req.body.email,
            insertedUsername: req.body.username
          });
      }
    }
  }
);

module.exports = router;