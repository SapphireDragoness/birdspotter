'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const userDao = require('../models/user-dao.js');
const postsDao = require("../models/posts-dao");

router.get('/dashboard', async(req, res) => {
  try {
    const currentUser = req.user;
    const userProfile = await userDao.getUserByUsername(currentUser.username);
    const dailyPosts = await postsDao.getDailyPostCount();
    const topPosts = await postsDao.getTrendingPosts();
    const mostFollowedUsers = await userDao.getTopFollowedUsers();

    if(req.isAuthenticated() && userProfile.username === currentUser.username && currentUser.type === 'admin') {
      res.render('admin-dashboard', { userProfile, currentUser, aut:true, page: 1, dailyPosts, topPosts, mostFollowedUsers });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/user-list', async(req, res) => {
  try {
    const currentUser = req.user;
    const userProfile = await userDao.getUserByUsername(currentUser.username);

    if(req.isAuthenticated() && userProfile.username === currentUser.username && (currentUser.type === 'admin' || currentUser.type === 'moderator')) {
      const users = await userDao.getAllUsers()
      res.render('admin-dashboard', { userProfile, currentUser, aut:true, page: 2, users });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/post-list', async(req, res) => {
  try {
    const currentUser = req.user;
    const userProfile = await userDao.getUserByUsername(currentUser.username);

    if(req.isAuthenticated() && userProfile.username === currentUser.username && (currentUser.type === 'admin' || currentUser.type === 'moderator')) {
      const posts = await postsDao.getAllPosts()
      res.render('admin-dashboard', { userProfile, currentUser, aut:true, page: 3, posts });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/comment-list', async(req, res) => {
  try {
    const currentUser = req.user;
    const userProfile = await userDao.getUserByUsername(currentUser.username);

    if(req.isAuthenticated() && userProfile.username === currentUser.username && (currentUser.type === 'admin' || currentUser.type === 'moderator')) {
      const comments = await postsDao.getAllComments()
      res.render('admin-dashboard', { userProfile, currentUser, aut:true, page: 4, comments });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.post('/ban-user', async (req, res) => {
  try {
    console.log(req.body.username)
    await userDao.banUser(req.body.username);
    res.json({ message: 'User banned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error banning user' });
  }
});

router.post('/unban-user', async (req, res) => {
  try {
    await userDao.unbanUser(req.body.username);
    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error unbanning user' });
  }
});

router.post('/make-admin', async (req, res) => {
  try {
    await userDao.makeAdmin(req.body.username);
    res.json({ message: 'User successfully promoted to admin' });
  } catch (error) {
    res.status(500).json({ message: 'Error promoting user' });
  }
});


router.post('/revoke-admin', async (req, res) => {
  try {
    await userDao.revokeAdmin(req.body.username);
    res.json({ message: 'Role revoked' });
  } catch (error) {
    res.status(500).json({ message: 'Error revoking role' });
  }
});

router.post('/make-moderator', async (req, res) => {
  try {
    await userDao.makeModerator(req.body.username);
    res.json({ message: 'User successfully promoted to moderator' });
  } catch (error) {
    res.status(500).json({ message: 'Error promoting user' });
  }
});


router.post('/revoke-moderator', async (req, res) => {
  try {
    await userDao.revokeModerator(req.body.username);
    res.json({ message: 'Role revoked' });
  } catch (error) {
    res.status(500).json({ message: 'Error revoking role' });
  }
});

router.post('/delete-user', async(req, res) => {
  try {
    // await userDao.deleteUser(req.body.username);
    console.log('deleting user ' + req.body.username)
    res.json({ message: 'User successfully deleted (WARNING: check console.log, code might be commented out for testing)' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

router.delete('/delete-post/:postID', async (req, res) => {
  try {
    await postsDao.removePost(req.params.postID);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;