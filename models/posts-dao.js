'use strict'

const db = require('../db.js');

/**
 * Function to map database rows to values.
 *
 * @param post
 * @returns {{date: *, op, photoPath, bird, location, comment: (boolean|*), id, title}}
 */
function mapPost(post) {
  return {
    id: post.id,
    photoPath: post.photoPath,
    op: post.op,
    bird: post.bird,
    location: post.location,
    date: post.date,
    time: post.time,
    title: post.title,
    comment: post.comment,
    likes: post.likeCount
  };
}

/**
 * Returns a post with a certain id.
 *
 * @param id
 * @returns {Promise<unknown>}
 */
exports.getPostByID = function (id) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT p.*, COALESCE(like_count, 0) AS likeCount
        FROM posts p
        LEFT JOIN (
            SELECT post, COUNT(*) AS like_count
            FROM likes
            GROUP BY post
        ) AS like_counts ON p.id = like_counts.post
      WHERE id = ?
    `;

    db.get(sql, [id], (err, row) => {
      if (err)
        reject(err);
      else {
        const post = {
          id: row.id,
          photoPath: row.photoPath,
          op: row.op,
          bird: row.bird,
          location: row.location,
          date: row.date,
          time: row.time,
          title: row.title,
          comment: row.comment,
          likes: row.likeCount
        };
        resolve(post);
      }
    });
  });
};

/**
 * Returns trending posts, enough (16) to fill the homepage.
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
      LIMIT 16
    `;

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        console.log(posts)
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

/**
 * Returns all posts made by a certain user.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.getAllPostsByUser = function (username) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM posts 
      WHERE op = ?
    `;

    db.all(sql, [username], (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

/**
 * Returns all posts picturing a certain bird.
 *
 * @param bird
 * @returns {Promise<unknown>}
 */
exports.getAllPostsByBird = function (bird) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM posts 
      WHERE bird = ?
    `;

    db.all(sql, [bird], (err, rows) => {
      if (err) reject(err);
      else {
        let posts = rows.map(mapPost);
        resolve(posts);
      }
    });
  });
};

/**
 * Returns all posts made in a certain location.
 *
 * @param location
 * @returns {Promise<unknown>}
 */
exports.getAllPostsByLocation = function (location) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM posts 
      WHERE location = ?
    `;

    db.all(sql, [location], (err, row) => {
      if (err) reject(err);
      else {
        let posts = row.map(mapPost);
        resolve(posts);
      }
    });
  });
};

/**
 * Adds a post to the database.
 *
 * @param filename
 * @param op
 * @param bird
 * @param location
 * @param title
 * @param comment
 * @returns {Promise<unknown>}
 */
exports.addPost = function (filename, op, bird, location, title, comment) {
  return new Promise((resolve, reject) => {
    const sql = `
    INSERT INTO posts (id, photoPath, op, bird, location, date, time, title, comment)
    VALUES (null, ?, ?, ?, ?, CURRENT_DATE, CURRENT_TIME, ?, ?)
    `;

    db.run(sql, ["images/user_images/" + filename, op, bird, location, title, comment], (err) => {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      else resolve();
    });
  });
};

/**
 * Removes a post from the database.
 *
 * @param id
 * @returns {Promise<unknown>}
 */
exports.removePost = function (id) {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM posts
      WHERE posts.id = ?
    `;

    db.run(sql, [id], (err, rows) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
};

/**
 * Returns the number of likes on a post.
 *
 * @param id
 * @returns {Promise<unknown>}
 */
exports.getNumberOfLikes = function (id) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) AS total
      FROM likes JOIN users ON likes.user = users.username 
      WHERE post = ?
    `;

    db.get(sql, [id], (err, row) => {
      if (err) reject(err);
      else
        resolve(row.total);
    });
  });
};

/**
 * Updates an existing post.
 *
 * @param bird
 * @param location
 * @param title
 * @param comment
 * @returns {Promise<unknown>}
 */
exports.updatePost = function (bird, location, title, comment) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE posts SET bird = ?, location = ?, title = ?, comment = ? 
      WHERE id = ?
    `;

    db.run(sql, [bird, location, title, comment], (err) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
};

/**
 * Adds a like to a post.
 *
 * @param user
 * @param post
 * @returns {Promise<unknown>}
 */
exports.addLike = function (user, post) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO likes (user, post) 
      VALUES (?, ?)
    `;

    db.run(sql, [user, post], (err) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
};

/**
 * Removes a like from a post.
 *
 * @param user
 * @param post
 * @returns {Promise<unknown>}
 */
exports.removeLike = function (user, post) {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM likes
      WHERE likes.user = ? AND likes.post = ?
    `;

    db.run(sql, [user, post], (err) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
};

/**
 * Adds a comment to a post.
 *
 * @param user
 * @param comment
 * @returns {Promise<unknown>}
 */
exports.addComment = function (user, comment) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO comments (user, post)
      VALUES (?, ?)
    `;

    db.run(sql, [user, comment], (err) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
};

/**
 * Removes a comment from a post.
 *
 * @param user
 * @param comment
 * @returns {Promise<unknown>}
 */
exports.removeComment = function (user, comment) {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM comments
      WHERE comments.user = ? AND comments.post = ?
    `;

    db.run(sql, [user, comment], (err) => {
      if (err)
        reject(err);
      else
        resolve();
    });
  });
};

/**
 * Returns all birds present in the database.
 *
 * @returns {Promise<unknown>}
 */
exports.getBirds = function () {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT speciesName
      FROM birds
    `;

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let birds = rows.map((e) =>({
            bird: e.speciesName
          }
        ));
        resolve(birds);
      }
    });
  });
};

/**
 * Returns all parks present in the database.
 *
 * @returns {Promise<unknown>}
 */
exports.getLocations = function () {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT name
      FROM parks
    `;

    db.all(sql, (err, rows) => {
      if (err) reject(err);
      else {
        let locations = rows.map((e) =>({
            location: e.name
          }
        ));
        resolve(locations);
      }
    });
  });
};

/**
 * Checks if a user liked a post.
 *
 * @param username
 * @param postID
 * @returns {Promise<unknown>}
 */
exports.isPostLikedByUser = function(username, postID) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT *
      FROM likes
      WHERE likes.post = ? AND likes.user = ?
    `;

    db.get(sql, [username, postID], (err, row) => {
      if(err)
        reject(err);
      else if(row === undefined)
        resolve(false);
      else
        resolve(true);
    });
  });
};