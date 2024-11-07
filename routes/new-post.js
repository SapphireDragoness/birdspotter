const express = require('express');
const router = express.Router();
const path = require('path');
const postsDao = require('../models/posts-dao');
const multer = require('multer');
const sharp = require('sharp');
const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

router.use(express.static(path.join(__dirname, '../public')));

// multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'), false);
    }
  }
});

// get route for post page
router.get('/', async (req, res) => {
  if (req.isAuthenticated()) {
    res.render('new-post.ejs', { failure: false, aut: true, type: req.user.type, currentUser: req.user });
  } else {
    res.render('index.ejs', { aut: false, type: false, currentUser: false });
  }
});

// post route to post a post (what)
router.post(
  '/',
  upload.single('image'),
  [
    check('title').notEmpty().withMessage('Please enter a title'),
    check('bird').notEmpty().withMessage('Please select a bird'),
    check('location').notEmpty().withMessage('Please select a location')
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (req.isAuthenticated()) {
      if (!errors.isEmpty()) {
        return res.render('new-post.ejs', {
          failure: true,
          message: errors.errors[0].msg,
          insert: true,
          aut: true,
          type: req.user.type,
          currentUser: req.user
        });
      }

      if (!req.file) {
        return res.render('new-post.ejs', {
          failure: true,
          message: 'Please upload a picture',
          insert: true,
          aut: true,
          type: req.user.type,
          currentUser: req.user
        });
      }

      try {
        // image resizing
        const filename = uuidv4() + path.extname(req.file.originalname);
        const outputPath = path.join('public', 'images', 'user_images', filename);

        await sharp(req.file.buffer)
          .resize(1000, 1000, { fit: 'cover' })
          .toFile(outputPath);

        await postsDao.addPost(
          filename,
          req.user.username,
          req.body.bird,
          req.body.location,
          req.body.title,
          req.body.description
        );

        res.redirect('/');
      } catch (error) {
        console.error(error);
        res.render('error.ejs', { message: 'Error saving post', error: error.message });
      }
    } else {
      res.redirect('/');
    }
  }
);

module.exports = router;
