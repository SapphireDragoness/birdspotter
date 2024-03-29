'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const postsDao = require('../models/posts-dao');
const multer = require('multer');
const fs = require('fs');
const {check, validationResult} = require("express-validator");

router.use(express.static(path.join(__dirname, '../public')));

// set up storage for multer
const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, 'public/images/user_images');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname);
  }
});

let upload = multer({ storage: storage });

router.get('/', async(req, res) => {
  if(req.isAuthenticated())
    res.render('new-post.ejs', {failure: false, aut: true, type: req.user.type, username: req.user.username});
  else
    res.render('index', {aut: false, type: false, username: false});
});

router.post('/', [
  check('title').notEmpty().withMessage('Please enter a title'),
  check('bird').notEmpty().withMessage('Please select a bird'),
  check('location').notEmpty().withMessage('Please select a location')
], async (req, res) => {
  const errors = validationResult(req);

  if(req.isAuthenticated()) {
    if (!errors.isEmpty())
      res.render('new-post.ejs', {failure: true, message: errors.errors[0].msg, insert: true, aut: true, type: req.user.type, username: req.user.email});
    else {
      try {
        await postsDao.addPost(req.user.username, req.body.bird, req.body.location, req.body.title, req.body.description);
        res.redirect('/');
      }
      catch(error) {
        res.render('error.ejs', {error: 'Post error'});
      }
    }
  }
  else res.redirect('/');
});

module.exports = router;
