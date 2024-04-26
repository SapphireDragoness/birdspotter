'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const postsDao = require('../models/posts-dao');
const {check, validationResult} = require('express-validator');

router.use(express.static(path.join(__dirname, '../public')));

/**
 * Gets and displays posts on home page and search page
 */
router.get('/', async (req, res) => {
  if(req.isAuthenticated()){
    const user = req.user;
    const postsPerPage = 9;
    try{
      // TODO: not a fan of this one
      const events = await postsDao.getAllPostsByUser(user.username);
      const page = parseInt(req.query.page) || 1;
      const startIndex = (page - 1) * postsPerPage;
      const endIndex = startIndex + postsPerPage;
      const postsOnPage = events.slice(startIndex, endIndex);
      const totalPages = Math.ceil(events.length / postsPerPage);

      res.render('posts.ejs', {currentPage: page, totalPages, postsOnPage, aut:true, type: req.user.type, username: req.user.username});
    }catch(error){
      res.render('error.ejs', {message: error});
    }

  }
  else {
    res.redirect('/login');
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

    if(req.isAuthenticated())
      res.render('post-page.ejs', {likes, post, username: req.user.username, aut: true, type: req.user.type});
    // if user isn't authenticated, hide like and comment options
    else
      res.render('post-page.ejs', {likes, post, aut: false});
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