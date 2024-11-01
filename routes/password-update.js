'use strict'

const express = require('express');
const router = express.Router();
const userDao = require('../models/user-dao')
const jwt = require('jsonwebtoken');
const path = require("path");
const {check, validationResult} = require('express-validator');

router.use(express.static(path.join(__dirname, '../public')));
router.use(express.urlencoded({extended: false}));

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

router.post('/', [
  validatePassword
], async (req, res) => {

  const { token, password } = req.body;
  const error = validationResult(req);

  if(!error.isEmpty()) {
    res.render('password-change', { failure: true, message: error.errors[0].msg, token })
  }
  else {
    try {
      const decoded = jwt.decode(token);

      await userDao.resetUserPassword(decoded.email, password);

      req.flash('successMessage', 'Password changed successfully! You can now log in.');
      res.redirect('/login');
    } catch (error) {
      res.render('password-reset', { failure: true, message: error, sent: false });
    }
  }
});

module.exports = router;