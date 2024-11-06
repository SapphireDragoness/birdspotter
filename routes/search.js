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
  const searchString = req.query.q || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 16;
  const offset = (page - 1) * limit;
  const params = {}
  let posts, totalPosts;

  try {
    if(searchString.includes(':')) {
      searchString.split(' ').forEach(pair => {
        const [key, value] = pair.split(':');
        if (key && value) {
          params[key] = decodeURIComponent(value);
        }
      });

      const title = params.title || '';
      const user = params.user || '';
      const bird = params.bird || '';
      const location = params.location || '';
      const startDate = params.startDate || null;
      const endDate = params.endDate || null;

      posts = await postsDao.advancedSearch(title, user, bird, location, startDate, endDate, limit, offset);
      totalPosts = await postsDao.getTotalPostsCountAdvanced(title, user, bird, location, startDate, endDate)
    }
    else {
      posts = await postsDao.getAllPostsGeneralSearch(searchString, limit, offset);
      totalPosts = await postsDao.getTotalPostsCount(searchString)
    }
    const totalPages = Math.ceil(totalPosts / limit);

    if(req.user !== undefined) {
      res.render('search-results', { posts, currentPage: page, totalPages, searchString, aut: true, currentUser: req.user });
    }
    else {
      res.render('search-results', { posts, currentPage: page, totalPages, searchString, aut: false });
    }
  } catch (error) {
    console.log(error);
    res.render('error', { message: 'Error loading search results.' });
  }
});

module.exports = router;