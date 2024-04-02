'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const postsDao = require('../models/posts-dao');
const multer = require('multer');
const {check, validationResult} = require('express-validator');
const { v4: uuidv4 } = require('uuid');

router.use(express.static(path.join(__dirname, '../public')));

// set up storage for multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/images/user_images');
  },
  filename: function(req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

router.get('/', async(req, res) => {
  if(req.isAuthenticated())
    res.render('new-post.ejs', {failure: false, aut: true, type: req.user.type, username: req.user.username});
  else
    res.render('index', {aut: false, type: false, username: false});
});

router.post('/', upload.single('image'), [
  check('title').notEmpty().withMessage('Please enter a title'),
  check('bird').notEmpty().withMessage('Please select a bird'),
  check('location').notEmpty().withMessage('Please select a location')
], async (req, res) => {
  const errors = validationResult(req);

  console.log(req.file.filename);

  if(req.isAuthenticated()) {
    if (!errors.isEmpty())
      res.render('new-post.ejs', {failure: true, message: errors.errors[0].msg, insert: true, aut: true, type: req.user.type, username: req.user.username});
    else {
      try {
        await postsDao.addPost(req.file.filename, req.user.username, req.body.bird, req.body.location, req.body.title, req.body.description);
        res.redirect('/');
      }
      catch(error) {
        res.render('error.ejs', {message: error.message, error: error.message});
      }
    }
  }
  else res.redirect('/');
});

module.exports = router;
