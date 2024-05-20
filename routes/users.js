'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const userDao = require('../models/user-dao.js');

router.use(express.static(path.join(__dirname, '../public')));
router.use(express.urlencoded({extended: false}));

// GET profile page
router.get('/:user', async(req, res) => {
  try {
    const username = req.user.username;
    const user = await userDao.getUserByUsername(username);
    if(req.isAuthenticated()) {
      console.log("req.user.username " + username)
      res.render('user-profile.ejs', {user, username: req.user.username, aut: true, type: req.user.type, page: 1});
    }
    else
      res.render('error.ejs', {message: error.error});
  }
  catch(error) {
    console.log(error);
    res.render('error.ejs', {message: error.error});
  }
});

router.get('/:user/myposts', async(req, res) => {
  const username = req.user.username;

  try {
    const user = await userDao.getUserByUsername(username);
    if(req.isAuthenticated())
      res.render('user-profile.ejs', {user, username: req.user.username, aut: true, type: req.user.type, page: 2});
    else
      res.render('error.ejs', {message: error.error});
  }
  catch(error) {
    console.log(error);
    res.render('error.ejs', {message: error.error});
  }
});
router.get('/:user/likedposts', async(req, res) => {
  const username = req.user.username;

  try {
    const user = await userDao.getUserByUsername(username);
    if(req.isAuthenticated())
      res.render('user-profile.ejs', {user, username: req.user.username, aut: true, type: req.user.type, page: 3});
    else
      res.render('error.ejs', {message: error.error});
  }
  catch(error) {
    console.log(error);
    res.render('error.ejs', {message: error.error});
  }
});
router.get('/:user/savedposts', async(req, res) => {
  const username = req.user.username;

  try {
    const user = await userDao.getUserByUsername(username);
    if(req.isAuthenticated())
      res.render('user-profile.ejs', {user, username: req.user.username, aut: true, type: req.user.type, page: 4});
    else
      res.render('error.ejs', {message: error.error});
  }
  catch(error) {
    console.log(error);
    res.render('error.ejs', {message: error.error});
  }
});

router.get('/:user/edit', async(req, res) => {
  const username = req.user.username;

  try {
    const user = await userDao.getUserByUsername(username);
    if(req.isAuthenticated())
      res.render('user-profile.ejs', {user, username: req.user.username, aut: true, type: req.user.type, page: 5});
    else
      res.render('error.ejs', {message: error.error});
  }
  catch(error) {
    console.log(error);
    res.render('error.ejs', {message: error.error});
  }
});

module.exports = router;