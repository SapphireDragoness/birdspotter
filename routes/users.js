'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const userDao = require('../models/user-dao.js');
const postsDao = require("../models/posts-dao");
const multer = require('multer');
const {v4: uuidv4} = require('uuid');

router.use(express.static(path.join(__dirname, '../public')));
router.use(express.urlencoded({extended: false}));

// set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images/user_images/profile_pics');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({storage: storage, fileFilter: fileFilter});

// "public" routes

router.get('/', async(req, res) => {
  try {
    const currentUser = req.user;

    if(req.isAuthenticated() && (currentUser.type === 'admin' || currentUser.type === 'moderator')) {
      const users = userDao.getAllUsers();
      res.status(200).json(users);
    }
    else res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/:user/posts', async(req, res) => {
  try {
    // constant checks, I know. paranoid
    const userProfile = await userDao.getUserByUsername(req.params.user); // this is the user whose profile I'm looking at
    const currentUser = req.user;
    const posts = await postsDao.getAllPostsByUser(userProfile.username);
    if(!userProfile)
      res.render('error', {message: 'User not found.'})
    // if user is authenticated, show follow button
    if(req.isAuthenticated()) {
      const followed = await userDao.isFollowed(req.user.username, req.params.user)
      res.render('user-profile', { userProfile, aut: true, currentUser, posts, followed });
    }
    // else don't :)
    else
      res.render('user-profile', { userProfile, aut: false, posts });
  }
  catch(error) {
    console.log(error)
    res.render('error', { message: error });
  }
});

router.get('/:user/likedposts', async(req, res) => {
  try {
    const userProfile = await userDao.getUserByUsername(req.params.user);
    const currentUser = req.user;
    const posts = await postsDao.getPostsLikedByUser(userProfile.username);
    if(req.isAuthenticated()) {
      const followed = await userDao.isFollowed(req.user.username, req.params.user)
      res.render('user-profile', { posts, userProfile, currentUser, aut:true, followed });
    }
    else
      res.render('user-profile', { posts, userProfile, currentUser, aut:false });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/:user/savedposts', async(req, res) => {
  try {
    const userProfile = await userDao.getUserByUsername(req.params.user);
    const currentUser = req.user;
    const posts = await postsDao.getPostsSavedByUser(userProfile.username);
    if(req.isAuthenticated()) {
      const followed = await userDao.isFollowed(req.user.username, req.params.user)
      res.render('user-profile', { posts, userProfile, currentUser, aut:true, followed });
    }
    else
      res.render('user-profile', { posts, userProfile, currentUser, aut:false });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.post('/:user/follow', async (req, res) => {
  try {
    const username = req.user.username;
    await userDao.addFollow(username, req.params.user);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error adding follower (at users.js)'});
  }
});

router.post('/:user/unfollow', async (req, res) => {
  try {
    const username = req.user.username;
    await userDao.removeFollow(username, req.params.user);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).json({message: 'Error removing follower (at uesers.js)'});
  }
});

// "private" routes

router.get('/:user/private', async(req, res) => {
  try {
    const currentUser = req.user;
    const userProfile = await userDao.getUserByUsername(currentUser.username);

    if(req.isAuthenticated() && userProfile.username === currentUser.username) {
      res.render('user-profile-private', { userProfile, currentUser, aut:true, page: 1 });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/:user/edit', async(req, res) => {
  if(req.user === undefined || req.user.username !== req.params.user) {
    res.render('error', {message: 'Never should have come here.'})
  }
  try {
    const user = await userDao.getUserByUsername(req.user.username);
    if(req.isAuthenticated())
      res.render('user-profile-private', {user, currentUser:req.user, aut: true, type: req.user.type, page: 2});
    else
      res.render('error', {message: error.error});
  }
  catch(error) {
    console.log(error);
    res.render('error', {message: error.error});
  }
});

router.post('/:user/edit', upload.single('image'), async (req, res) => {
  const { firstName, lastName, email, bio } = req.body;

  try {
    await userDao.updateUserProfile(req.user.username, email, firstName, lastName, req.file.filename, bio);
    res.redirect(`/users/${req.user.username}/private`);
  } catch (error) {
    res.status(500).render('error', { message: 'Profile update failed' });
  }
});

router.get('/:user/followers', async(req, res) => {
  try {
    const userProfile = await userDao.getUserByUsername(req.params.user);
    const currentUser = req.user;

    if(req.isAuthenticated() && userProfile.username === currentUser.username) {
      const followers = await userDao.getFollowers(currentUser.username)
      console.log(followers)
      res.render('user-profile-private', { userProfile, currentUser, aut:true, page: 3, followers });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/:user/followed', async(req, res) => {
  try {
    const userProfile = await userDao.getUserByUsername(req.params.user);
    const currentUser = req.user;

    if(req.isAuthenticated() && userProfile.username === currentUser.username) {
      const followed = await userDao.getFollowed(currentUser.username)
      console.log(followed)
      res.render('user-profile-private', { userProfile, currentUser, aut:true, page: 4, followed });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/:user/change-password', async(req, res) => {
  try {
    const userProfile = await userDao.getUserByUsername(req.params.user);
    const currentUser = req.user;

    if(req.isAuthenticated() && userProfile.username === currentUser.username) {
      res.render('user-profile-private', { userProfile, currentUser, aut:true, page: 5 });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.get('/:user/delete', async(req, res) => {
  try {
    const userProfile = await userDao.getUserByUsername(req.params.user);
    const currentUser = req.user;

    if(req.isAuthenticated() && userProfile.username === currentUser.username) {
      res.render('user-profile-private', { userProfile, currentUser, aut:true, page: 6 });
    }
    else
      res.status(403).render('error', { message: 'Never should have come here.' });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {message: error});
  }
});

router.post('/:user/delete', async(req, res) => {
  try {
    await userDao.deleteUser(req.user.username);
    res.redirect(`/`);
  } catch (error) {
    res.status(500).render('error', { message: 'Profile deletion failed: ' + error });
  }
});

module.exports = router;