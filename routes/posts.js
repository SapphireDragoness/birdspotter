'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const postsDao = require('../models/posts-dao');
const {check, validationResult} = require('express-validator');

router.use(express.static(path.join(__dirname, '../public')));

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

    if (req.isAuthenticated()) {
      // if authenticated, check if user liked and saved post
      const liked = await postsDao.isPostLikedByUser(req.user.username, postID);
      const saved = await postsDao.isPostSavedByUser(req.user.username, postID);

      res.render('post-page.ejs', {
        likes,
        post,
        comments,
        posts,
        liked,
        saved,
        currentUser: req.user,
        aut: true
      });
    } else
      res.render('post-page.ejs', {likes, post, comments, posts, aut: false, currentUser: false});
  } catch (error) {
    res.render('error.ejs', {message: error});
  }
});

/**
 * Removes a post based on its ID
 */
router.post('/:postID/remove', async (req, res) => {
  try {
    await postsDao.removePost(req.params.postID);
  } catch (error) {
    res.render('error.ejs', {message: 'removal error'});
  }
});

/**
 * Likes a post
 */
router.post('/:postID/like', async (req, res) => {
  try {
    const {username} = req.body;
    await postsDao.addLike(username, req.params.postID);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error adding like (at posts.js)'});
  }
});

/**
 * Removes like from a post
 */
router.post('/:postID/unlike', async (req, res) => {
  try {
    const {username} = req.body;
    await postsDao.removeLike(username, req.params.postID);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error removing like (at posts.js)'});
  }
});

/**
 * Saves a post for a user
 */
router.post('/:postID/save', async (req, res) => {
  try {
    const {username} = req.body;
    await postsDao.addSave(username, req.params.postID);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error adding saved post (at posts.js)'});
  }
});

/**
 * Removes a saved post
 */
router.post('/:postID/unsave', async (req, res) => {
  try {
    const {username} = req.body;
    await postsDao.removeSave(username, req.params.postID);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error removing saved post (at posts.js)'});
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
  } catch (error) {
    res.status(500).json({message: 'Error fetching comments'});
  }
});

/**
 * Adds a new comment to a post
 */
router.post('/:postID/comments', async (req, res) => {
  const postID = req.params.postID;
  const username = req.user.username;
  const userPicture = req.user.picture;
  const {content} = req.body;

  console.log(userPicture)
  try {
    const newComment = await postsDao.addComment(postID, username, content, userPicture);
    res.json(newComment);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error adding comment'});
  }
});

/**
 * Gets edit page
 */
router.get('/:postID/edit', async (req, res) => {
  const postID = req.params.postID;
  const username = req.user.username;

  try {
    const post = await postsDao.getPostByID(postID);

    if (post.op === username || req.user.type === 'admin' || req.user.type === 'moderator') {
      return res.render('edit-post.ejs', {postID, aut: true, currentUser: req.user, failure: false});
    } else
      res.status(403).render('error.ejs', {message: 'You can\'t edit this post.'});
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error fetching post.'});
  }
});

/**
 * Updates a post
 */
router.post('/:postID/edit', [
  check('title').notEmpty().withMessage('Please enter a title'),
  check('bird').notEmpty().withMessage('Please select a bird'),
  check('location').notEmpty().withMessage('Please select a location')
], async (req, res) => {
  const errors = validationResult(req);
  const postID = req.params.postID;
  const username = req.user.username;

  if (req.isAuthenticated()) {
    const post = await postsDao.getPostByID(postID);

    if (post.op === username || req.user.type === 'admin' || req.user.type === 'moderator') {
      if (!errors.isEmpty()) {
        return res.render('edit-post.ejs', {
          failure: true,
          message: errors.errors[0].msg,
          aut: true,
          currentUser: req.user,
          postID: postID
        });
      }
      try {
        await postsDao.updatePost(postID, post.op, req.body.title, req.body.description, req.body.bird, req.body.location);
        return res.redirect(`/posts/${postID}`);
      } catch (error) {
        return res.render('error.ejs', {message: error.message, error: error.message});
      }
    } else
      return res.render('error.ejs', {message: 'Cannot edit this post.'});
  } else {
    return res.redirect('/');
  }
});

/**
 * Deletes a post when on a post
 */
router.post('/:postID/delete', async (req, res) => {
  const postID = req.params.postID;
  const username = req.user.username;

  if (req.isAuthenticated()) {
    try {
      const post = await postsDao.getPostByID(postID);

      if (post.op === username || req.user.type === 'admin' || req.user.type === 'moderator') {
        await postsDao.removePost(postID);
        res.redirect('/');
      } else {
        return res.status(403).render('error.ejs', {message: 'You can\'t delete this post.'});
      }
    } catch (error) {
      res.render('error.ejs', {message: 'Error deleting post.'});
    }
  } else {
    res.redirect('/');
  }
});

/**
 * Deletes a post from admin panel
 */
router.delete('/:postID', async (req, res) => {
  const postID = req.params.postID;
  const username = req.user.username;

  try {
    const post = await postsDao.getPostByID(postID);
    if (post.op === username || req.user.type === 'admin' || req.user.type === 'moderator') {
      await postsDao.removePost(postID);
      res.sendStatus(200);
    } else {
      res.status(403).json({message: 'You don\'t have permission to delete this post.'});
    }
  } catch (error) {
    res.status(500).json({message: 'Error deleting comment.'});
  }
});

/**
 * Deletes a comment
 */
router.delete('/:postID/comments/:commentID', async (req, res) => {
  try {
    await postsDao.removeComment(req.params.commentID);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({message: 'Error deleting comment.'});
  }
});

module.exports = router;