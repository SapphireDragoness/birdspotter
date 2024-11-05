'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const userDao = require('../models/user-dao.js');
const {check, validationResult} = require('express-validator');

router.use(express.static(path.join(__dirname, '../public')));
router.use(express.urlencoded({extended: false}));

// validators for pretty much everything, I don't trust my users
const validateNames = [
  check('firstName')
    .notEmpty()
    .withMessage('First name required')
    .isLength({ max: 32 })
    .withMessage('First name must be less than 32 characters long.')
    .not()
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('First name cannot contain special characters.'),
  check('lastName')
    .notEmpty()
    .withMessage('Last name required')
    .isLength({ max: 32 })
    .withMessage('Last name must be less than 32 characters long.')
    .not()
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Last name cannot contain special characters.')
]

const validateEmail = [
  check('email')
    .isEmail()
    .withMessage('Email required.')
    .isLength({ max: 32 })
    .withMessage('Email must be less than 32 characters long.')
    .normalizeEmail()
]

const validateUsername = [
  check('username')
    .notEmpty()
    .withMessage('Username required')
    .isLength({ max: 16 })
    .withMessage('Username must be less than 16 characters long.')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long.')
    .not()
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Username cannot contain special characters.')
]

const validatePassword = [
  check('password')
    .notEmpty()
    .withMessage('Password required.')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .isLength({ max: 32 })
    .withMessage('Password must be less than 32 characters long.')
    .matches(/[A-Z]/g)
    .withMessage('Password must contain an upper case letter.')
    .matches(/[a-z]/g)
    .withMessage('Password must contain a lower case letter.')
    .matches(/[0-9]/g)
    .withMessage('Password must contain a number.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character.')
    .not()
    .matches(/\s/g)
    .withMessage('Password must not contain spaces.')
    .custom((value, { req }) => {
      if (value !== req.body.confirmPassword) {
        throw new Error('Passwords don\'t match.');
      }
      return true;
    })
]

// GET register page
router.get('/', (req, res) => {
  if(req.isAuthenticated()) res.redirect('/');
  else res.render('login-register.ejs', {failure: false, type: null, login: false, aut: false, formData: false});
});

// user registration
router.post('/', [
  validateNames,
  validateUsername,
  validateEmail,
  validatePassword
  ], async (req, res) => {
  const error = validationResult(req);
  const { firstName, lastName, username, email } = req.body;
    if (!error.isEmpty()) {
      res.render('login-register.ejs',
        {
          type: null,
          failure: true,
          message: error.errors[0].msg,
          login: false,
          aut: false,
          formData: { firstName, lastName, username, email }
        });
    }
    else {
      try {
        await userDao.registerUser(req.body.firstName, req.body.lastName, req.body.email, req.body.username, req.body.password, 'user');
        console.log('created user: ' + req.body.firstName + ' ' + req.body.lastName + ' ' + req.body.email + ' ' + req.body.username + ' ' + req.body.password)
        req.flash('successMessage', 'Registration successful! You can now log in.');
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
            formData: { firstName, lastName, username, email }
          });
      }
    }
  }
);

module.exports = router;