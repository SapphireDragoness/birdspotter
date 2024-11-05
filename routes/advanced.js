'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');
const postsDao = require('../models/posts-dao');

router.use(express.static(path.join(__dirname, '../public')));

router.get('/', async (req, res) => {
  try {
    if(req.user !== undefined) {
      res.render('advanced-search', { aut: true });
    }
    else {
      res.render('advanced-search', { aut: false });
    }
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});



module.exports = router;