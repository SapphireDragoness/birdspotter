'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const postsDao = require('../models/posts-dao');

router.use(express.static(path.join(__dirname, '../public')));

/**
 * Gets and displays posts on search page
 */
router.get('/', async (req, res) => {
    const postsPerPage = 16;
    try {
      const posts = await postsDao.getTrendingPosts();
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
    const comments = await postsDao.getCommentsByPostID(postID);
    const posts = await postsDao.getTrendingPosts();

    if(req.isAuthenticated()) {
      // if authenticated, check if user liked and saved post
      const liked = await postsDao.isPostLikedByUser(req.user.username, postID);
      const saved = await postsDao.isPostSavedByUser(req.user.username, postID);

      res.render('post-page.ejs', {likes, post, comments, posts, liked, saved, username: req.user.username, aut: true, type: req.user.type});
    }
    else
      res.render('post-page.ejs', {likes, post, comments, posts, aut: false, type: false, username: false});
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

router.post('/:postID/like', async (req, res) => {
  try {
    const { username } = req.body;
    await postsDao.addLike(username, req.params.postID);
    res.sendStatus(200);
  }
  catch(error) {
    console.log(error);
    res.status(500).json({ message: 'Error adding like (at posts.js)' });
  }
});

router.post('/:postID/unlike', async (req, res) => {
  try {
    const { username } = req.body;
    await postsDao.removeLike(username, req.params.postID);
    res.sendStatus(200);
  }
  catch(error) {
    console.log(error);
    res.status(500).json({ message: 'Error removing like (at posts.js)' });
  }
});

router.post('/:postID/save', async (req, res) => {
  try {
    const { username } = req.body;
    await postsDao.addSave(username, req.params.postID);
    res.sendStatus(200);
  }
  catch(error) {
    console.log(error);
    res.status(500).json({ message: 'Error adding saved post (at posts.js)' });
  }
});

router.post('/:postID/unsave', async (req, res) => {
  try {
    const { username } = req.body;
    await postsDao.removeSave(username, req.params.postID);
    res.sendStatus(200);
  }
  catch(error) {
    console.log(error);
    res.status(500).json({ message: 'Error removing saved post (at posts.js)' });
  }
});

/**
 * Gets and displays comments for a specific post
 */
router.get('/:postID/comments', async (req, res) => {
  const postID = req.params.postID;
  try {
    const comments = await postsDao.getCommentsByPostID(postID);
    res.json(comments);
  }
  catch(error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

/**
 * Adds a new comment to a post
 */
router.post('/:postID/comments', async (req, res) => {
  const postID = req.params.postID;
  const { username, content } = req.body;

  try {
    const newComment = await postsDao.addComment(postID, username, content);
    res.json(newComment);
  }
  catch(error) {
    console.log(error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

router.get('/posts/:postID/edit', async (req, res) => {
  const postID = req.params.postID;
  const username = req.user.username;

  try {
    const post = await postsDao.getPostByID(postID);

    if (post.op !== username) {
      return res.status(403).json({ message: 'Cannot edit this post.' });
    }

    res.render('edit-post.ejs', { post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching post.' });
  }
});

router.post('/posts/:postID/edit', async (req, res) => {
  const postID = req.params.postID;
  const username = req.user.username;
  const { title, comment, bird, location } = req.body;

  try {
    const post = await postsDao.getPostByID(postID);

    if (post.op !== username) {
      return res.status(403).json({ message: 'Cannot edit this post.' });
    }

    await postsDao.updatePost(postID, username, title, comment, bird, location);
    res.redirect(`/posts/${postID}`);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating post.' });
  }
});

router.post('/posts/:postID/delete', async (req, res) => {
  const postID = req.params.postID;
  const username = req.user.username;

  try {
    const post = await postsDao.getPostByID(postID);

    if (post.op !== username) {
      return res.status(403).json({ message: 'Cannot edit this post.' });
    }

    await postsDao.removePost(postID);
    res.redirect('/users/' + username + '/myposts');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating post.' });
  }
});


module.exports = router;