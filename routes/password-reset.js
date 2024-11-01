'use strict'

const express = require('express');
const router = express.Router();
const userDao = require('../models/user-dao')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require("path");
const {check, validationResult} = require('express-validator');

router.use(express.static(path.join(__dirname, '../public')));
router.use(express.urlencoded({extended: false}));

// password reset functionality
/**
 * Generates a JWT token for password reset from user email
 *
 * @param userEmail
 * @returns {*}
 */
function generateToken(userEmail) {
  return jwt.sign({ email: userEmail }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
}

/**
 * Sends an email for password reset through nodemailer
 *
 * @param userEmail
 * @param resetLink
 * @returns {Promise<*>}
 */
async function sendPasswordResetEmail(userEmail, resetLink) {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Reset Password for Birdspotter',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  };

  console.log("Sending email to " + userEmail + " with link " + resetLink)
  return transporter.sendMail(mailOptions);
}

router.get('/', (req, res) => {
  res.render('password-reset', { failure: false, sent: false });
});

router.post('/', [
  check('email')
    .notEmpty()
    .withMessage('Email required.')
  ], async (req, res) => {
  const email = req.body.email;
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.render('password-reset', { failure: true, sent: false, message: error });
  }

  //check if email is present in the database
  const user = await userDao.getUserByEmail(email);

  if (!user) {
    return res.render('password-reset', { failure: true, sent: false, message: 'Email not found' });
  }

  // generate reset token
  const token = generateToken(email);

  // password reset link
  const resetLink = `${req.protocol}://${req.get('host')}/password-reset/${token}`;

  // send reset link
  await sendPasswordResetEmail(email, resetLink);

  res.render('password-reset', { sent: true });
});

router.get('/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    console.log('token is ' + token + ' decoded.email is ' + decoded.email)
    res.render('password-change', { token, failure: false });  // passes token to form
  } catch (error) {
    console.log(error);
    res.render('password-reset', { failure: true, message: 'Invalid or expired token', sent: false });
  }
});

module.exports = router;