'use strict'

const db = require('../db.js');

/**
 * Function to map database rows to values.
 *
 * @param e
 * @returns {{date: *, op, photoPath, bird, location, comment: (boolean|*), id, title}}
 */
function mapPost(e) {
  return {
    id: e.id,
    photoPath: e.photoPath,
    op: e.op,
    bird: e.bird,
    location: e.location,
    date: e.date,
    title: e.title,
    comment: e.comment
  };
}

/**
 * Returns trending posts, enough (9) to fill the homepage.
 *
 * @returns {Promise<unknown>}
 */
exports.getTrendingPosts = function () {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT p.*, COALESCE(like_count, 0) AS likeCount
      FROM posts p
      LEFT JOIN (
          SELECT post, COUNT(*) AS like_count
          FROM likes
          GROUP BY post
      ) AS like_counts ON p.id = like_counts.post
      ORDER BY likeCount DESC
      LIMIT 9
    `;

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

/**
 * Returns all posts that somehow match the search string (using the LIKE sql function).
 *
 * @param searchString
 * @returns {Promise<unknown>}
 */
exports.getAllPostsGeneralSearch = function (searchString) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM posts
      WHERE op LIKE ?
          OR bird LIKE ?
          OR location LIKE ?
    `;

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.getAllPostsByUser = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.getAllPostsByBird = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.getAllPostsByLocation = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

/**
 * Adds a post to the database.
 *
 * @param op
 * @param bird
 * @param location
 * @param title
 * @param comment
 * @returns {Promise<unknown>}
 */
exports.addPost = function (op, bird, location, title, comment) {
  return new Promise((resolve, reject) => {
    const photoPath = "public/images/user_images/" + op + "_" + Date.now();
    const sql = `
    INSERT INTO posts (op, photoPath, bird, location, date, time, title, comment)
    VALUES (?, photoPath, ?, ?, CURRENT_DATE, CURRENT_TIME, ?, ?)
    `;

    db.run(sql, [op, bird, location, title, comment], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

exports.removePost = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.getNumberOfLikes = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.updatePost = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.addLike = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.removeLike = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.addComment = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

exports.removeComment = function () {
  return new Promise((resolve, reject) => {
    const sql = "";

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};