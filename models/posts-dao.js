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
                 LEFT JOIN (SELECT post, COUNT(*) AS like_count
                            FROM likes
                            GROUP BY post) AS like_counts ON p.id = like_counts.post
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
                 LEFT JOIN (SELECT post, COUNT(*) AS like_count
                            FROM likes
                            GROUP BY post) AS like_counts ON p.id = like_counts.post
        ORDER BY likeCount DESC
        LIMIT 16
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
 * @param offset
 * @param limit
 * @returns {Promise<unknown>}
 */
exports.getAllPostsGeneralSearch = function (searchString, limit, offset) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *
        FROM posts
        WHERE op LIKE ?
           OR bird LIKE ?
           OR location LIKE ?
           OR title LIKE ?
        LIMIT ? OFFSET ?
    `;
    db.all(sql, [`%${searchString}%`, `%${searchString}%`, `%${searchString}%`, `%${searchString}%`, limit, offset], (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(mapPost));
    });
  });
};

/**
 * Returns all posts that match the parameters given
 *
 * @param title
 * @param username
 * @param bird
 * @param location
 * @param startDate
 * @param endDate
 * @param limit
 * @param offset
 * @returns {Promise<unknown>}
 */
exports.advancedSearch = function (title, username, bird, location, startDate, endDate, limit, offset) {
  return new Promise((resolve, reject) => {
    let sql = `
        SELECT *
        FROM posts
        WHERE (op LIKE ? OR ? IS NULL)
          AND (title LIKE ? OR ? IS NULL)
          AND (bird LIKE ? OR ? IS NULL)
          AND (location LIKE ? OR ? IS NULL)
    `;

    const params = [
      `%${username || ''}%`, username,
      `%${title || ''}%`, title,
      `%${bird || ''}%`, bird,
      `%${location || ''}%`, location,
    ];

    if (startDate) {
      sql += ` AND date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND date <= ?`;
      params.push(endDate);
    }

    params.push(limit)
    params.push(offset)

    sql += `LIMIT ? OFFSET ?`

    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows.map(mapPost));
    });
  });
};

/**
 * Counts the number of posts returned for a query
 *
 * @param searchString
 * @returns {Promise<unknown>}
 */
exports.getTotalPostsCount = function (searchString) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT COUNT(*) AS count
        FROM posts
        WHERE op LIKE ?
           OR bird LIKE ?
           OR location LIKE ?
           OR title LIKE ?
    `;

    db.get(sql, [`%${searchString}%`, `%${searchString}%`, `%${searchString}%`, `%${searchString}%`], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });
};

/**
 * Counts the number of posts returned for a query... but advanced
 *
 * @returns {Promise<unknown>}
 * @param title
 * @param username
 * @param bird
 * @param location
 * @param startDate
 * @param endDate
 */
exports.getTotalPostsCountAdvanced = function (title, username, bird, location, startDate, endDate) {
  return new Promise((resolve, reject) => {
    let sql = `
        SELECT COUNT(*) AS count
        FROM posts
        WHERE (op LIKE ? OR ? IS NULL)
          AND (title LIKE ? OR ? IS NULL)
          AND (bird LIKE ? OR ? IS NULL)
          AND (location LIKE ? OR ? IS NULL)
    `;

    const params = [
      `%${username || ''}%`, username,
      `%${title || ''}%`, title,
      `%${bird || ''}%`, bird,
      `%${location || ''}%`, location
    ];

    if (startDate) {
      sql += ` AND date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND date <= ?`;
      params.push(endDate);
    }

    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
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
      } else resolve();
    });
  });
};

/**
 * Removes a post from the database. Rollbacks on error.
 *
 * @param id
 * @returns {Promise<unknown>}
 */
exports.removePost = function (id) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) {
          return reject(err);
        }

        db.run("DELETE FROM comments WHERE post = ?", [id], (err) => {
          if (err) {
            db.run("ROLLBACK", () => reject(err));
            return;
          }

          db.run("DELETE FROM likes WHERE post = ?", [id], (err) => {
            if (err) {
              db.run("ROLLBACK", () => reject(err));
              return;
            }

            db.run("DELETE FROM posts WHERE id = ?", [id], (err) => {
              if (err) {
                db.run("ROLLBACK", () => reject(err));
                return;
              }

              db.run("COMMIT", (err) => {
                if (err) {
                  return reject(err);
                }
                resolve();
              });
            });
          });
        });
      });
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
        FROM likes
                 JOIN users ON likes.user = users.username
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
 * Updates a post. For practical reasons, only title, comment, bird and location can be edited.
 *
 * @param postID
 * @param username
 * @param title
 * @param comment
 * @param bird
 * @param location
 * @returns {Promise<unknown>}
 */
exports.updatePost = function (postID, username, title, comment, bird, location) {
  return new Promise((resolve, reject) => {
    const sql = `
        UPDATE posts
        SET title    = ?,
            comment  = ?,
            bird     = ?,
            location = ?
        WHERE id = ?
          AND op = ?
    `;

    db.run(sql, [title, comment, bird, location, postID, username], function (err) {
      if (err) reject(err);
      else resolve(this.changes);
    });
  });
};


/**
 * Adds a like to a post.
 *
 * @param username
 * @param postID
 * @returns {Promise<unknown>}
 */
exports.addLike = function (username, postID) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT OR IGNORE INTO likes (user, post)
                 VALUES (?, ?)`;
    db.run(sql, [username, postID], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Removes a like from a post.
 *
 * @param username
 * @param postID
 * @returns {Promise<unknown>}
 */
exports.removeLike = function (username, postID) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE
                 FROM likes
                 WHERE user = ?
                   AND post = ?`;
    db.run(sql, [username, postID], function (err) {
      if (err) reject(err);
      else resolve();
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
        let birds = rows.map((e) => ({
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
        let locations = rows.map((e) => ({
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
exports.isPostLikedByUser = function (username, postID) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *
        FROM likes
        WHERE likes.post = ?
          AND likes.user = ?
    `;

    db.get(sql, [postID, username], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve(false);
      else
        resolve(true);
    });
  });
};

/**
 * Checks if a user saved a post.
 *
 * @param username
 * @param postID
 * @returns {Promise<unknown>}
 */
exports.isPostSavedByUser = function (username, postID) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *
        FROM saved
        WHERE saved.post = ?
          AND saved.user = ?
    `;

    db.get(sql, [postID, username], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve(false);
      else
        resolve(true);
    });
  });
};

/**
 * Gets all posts liked by a specific user.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.getPostsLikedByUser = function (username) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT posts.*
        FROM likes
                 JOIN posts ON likes.post = posts.id
        WHERE likes.user = ?;
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
 * Gets all comments on a post and relative usernames.
 *
 * @param postID
 * @returns {Promise<unknown>}
 */
exports.getCommentsByPostID = function (postID) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT comments.id, comments.comment, comments.user, users.username
        FROM comments
                 JOIN users ON comments.user = users.username
        WHERE comments.post = ?;
    `;

    db.all(sql, [postID], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

/**
 * Adds a comment to the database.
 *
 * @param postID
 * @param username
 * @param content
 * @param userPicture
 * @returns {Promise<unknown>}
 */
exports.addComment = function (postID, username, content, userPicture) {
  return new Promise((resolve, reject) => {
    const sql = `
        INSERT INTO comments (post, user, comment, userPicture)
        VALUES (?, ?, ?, ?);
    `;
    db.run(sql, [postID, username, content, userPicture], function (err) {
      if (err) reject(err);
      else resolve({
        id: this.lastID,
        post: postID,
        user: username,
        comment: content,
        picture: userPicture
      });
    });
  });
};

/**
 * Removes a comment from the database.
 *
 * @param commentID
 * @returns {Promise<unknown>}
 */
exports.removeComment = function (commentID) {
  return new Promise((resolve, reject) => {
    const sql = `
        DELETE
        FROM comments
        WHERE id = ?;
    `;
    db.run(sql, [commentID], function (err) {
      if (err) reject(err);
      else resolve({message: 'Comment deleted successfully.', commentID});
    });
  });
};

/**
 * Gets all posts saved by user.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.getSavedPosts = function (username) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT posts.*
        FROM saved
                 JOIN posts ON saved.post = posts.id
        WHERE saved.user = ?`;
    db.all(sql, [username], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

/**
 * Saves a post for a user.
 *
 * @param username
 * @param postID
 * @returns {Promise<unknown>}
 */
exports.addSave = function (username, postID) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT OR IGNORE INTO saved (user, post)
                 VALUES (?, ?)`;
    db.run(sql, [username, postID], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Removes a saved post for a user.
 *
 * @param username
 * @param postID
 * @returns {Promise<unknown>}
 */
exports.removeSave = function (username, postID) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE
                 FROM saved
                 WHERE user = ?
                   AND post = ?`;
    db.run(sql, [username, postID], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

// admin thingies

exports.getDailyPostCount = function () {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT DATE(date) as postDate, COUNT(*) as count
      FROM posts
      GROUP BY postDate
      ORDER BY postDate DESC
      LIMIT 30`;

    db.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

