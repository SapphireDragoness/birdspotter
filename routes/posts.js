'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const postsDao = require('../models/posts-dao');
const {check, validationResult} = require('express-validator');

router.use(express.static(path.join(__dirname, '../public')));

/**
 * Gets and displays posts on search page
 */
router.get('/', async (req, res) => {
    const postsPerPage = 16;
    try {
      const events = await postsDao.getTrendingPosts();
      const page = parseInt(req.query.page) || 1;
      const startIndex = (page - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const postsOnPage = events.slice(startIndex, endIndex);
      const totalPages = Math.ceil(events.length / postsPerPage);

      res.render('posts.ejs', {currentPage: page, totalPages, postsOnPage, aut:true, type: req.user.type, username: req.user.username});
    }
    catch(error) {
      res.render('error.ejs', {message: error});
    }
});

/**
 * Gets and displays a single post
 */
router.get('/:postID', async (req, res) => {
  const postID = req.params.postID;

  try {
    const post = await postsDao.getPostByID(postID);
    const likes = await postsDao.getNumberOfLikes(postID);
    // TODO: get comments

    if(req.isAuthenticated()) {
      // if authenticated, check if user liked post
      const liked = await postsDao.isPostLikedByUser(req.user.username, postID);
      res.render('post-page.ejs', {likes, post, username: req.user.username, aut: true, type: req.user.type, liked});
    }
    else
      res.render('post-page.ejs', {likes, post, aut: false, type: false, liked: false});
  }
  catch(error) {
    console.log(error);
    res.render('error.ejs', {message: error.error});
  }
});

/**
 * Removes a post based on its ID
 */
router.post('/:postID/remove', async (req, res) => {
  try {
    await postsDao.removePost(req.params.postID);
  }
  catch(error) {
    res.render('error.ejs', {message: 'removal error'});
  }
});

module.exports = router;