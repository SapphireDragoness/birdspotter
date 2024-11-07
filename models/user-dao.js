'use strict';

const db = require('../db.js');
const bcrypt = require('bcrypt');
const postsDao = require("../models/posts-dao");

function mapUser(user) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    username: user.username,
    type: user.type,
    banned: user.banned,
    picture: user.picture,
    about: user.about
  };
}

/**
 * Returns a list of all the users present in the database.
 *
 * @returns {Promise<unknown>}
 */
exports.getAllUsers = function() {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *
        FROM users
    `;

    db.all(sql, (err, row) => {
      if(err) reject(err);
      else {
        const users = row.map(mapUser);
        resolve(users);
      }
    });
  });
};

/**
 * Registers a user into the database.
 *
 * @param firstName
 * @param lastName
 * @param email
 * @param username
 * @param password
 * @param type
 * @returns {Promise<unknown>}
 */
exports.registerUser = function (firstName, lastName, email, username, password, type) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO users (firstName, lastName, email, username, password, type, banned, picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const hashedPassword = bcrypt.hashSync(password, 10);
    const values = [firstName, lastName, email, username, hashedPassword, "user", 0, "images/user_images/profile_pics/defaultpic.jpg"];

    db.run(sql, values, (err) => {
      if(err) reject('Username or email already taken');
      else resolve();
    });
  });
};

/**
 * Gets a user from the database.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.getUserByUsername = function(username) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE username = ?";

    db.get(sql, [username], (err, row) => {
      if(err) reject(err);
      else if(row === undefined) resolve(false);
      else {
        const user = mapUser(row);
        resolve(user);
      }
    });
  });
};

/**
 * Gets a user from the database, checking if the password is correct.
 *
 * @param username
 * @param password
 * @returns {Promise<unknown>}
 */
exports.getUser = function(username, password) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE username = ?";
    db.get(sql, [username], (err, row) => {
      if (err) reject(err);
      else if (!row) resolve({ error: "user not found" });
      else {
        bcrypt.compare(password, row.password, (err, isMatch) => {
          if (err) reject(err);
          else if (!isMatch) resolve({ user: true, check: false});
          else {
            const user = mapUser(row);
            const check = true;
            resolve({user, check});
          }
        });
      }
    });
  });
};

/**
 * Turns a user into an administrator.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.makeAdmin = function(username) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET type = ? WHERE username = ?";

    db.run(sql, ["admin", username], (err) => {
      if(err) reject(err);
      else resolve();
    });
  });
};

/**
 * Revokes administrator rights from a user.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.revokeAdmin = function(username) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE users SET type = ? WHERE username = ?`;

    db.run(sql, ["user", username], (err) => {
      if(err) reject(err);
      else resolve();
    });
  });
};

/**
 * Turns a user into a moderator.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.makeModerator = function makeModerator(username) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET type = ? WHERE username = ?";

    db.run(sql, ["moderator", username], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

/**
 * Revokes moderator rights from a user.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.revokeModerator = function(username) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET type = ? WHERE username = ?";

    db.run(sql, ["user", username], (err) => {
      if(err) reject(err);
      else resolve();
    });
  });
};

/**
 * Bans a user.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.banUser = function(username) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET banned = ? WHERE username = ?";

    db.run(sql, [1, username], (err) => {
      if(err) reject(err);
      else resolve();
    });
  });
};

/**
 * Unbans a user.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.unbanUser = function(username) {
  return new Promise((resolve, reject) => {
    const sql = "UPDATE users SET banned = ? WHERE username = ?";

    db.run(sql, [0, username], (err) => {
      if(err) reject(err);
      else resolve();
    });
  });
};

/**
 * Updates user profile.
 *
 * @param username
 * @param email
 * @param firstName
 * @param lastName
 * @param picture
 * @param bio
 * @returns {Promise<unknown>}
 */
exports.updateUserProfile = function(username, email, firstName, lastName, picture, bio) {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    // only adds nonempty fields
    if (email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (firstName) {
      fields.push("firstName = ?");
      values.push(firstName);
    }
    if (lastName) {
      fields.push("lastName = ?");
      values.push(lastName);
    }
    if (picture) {
      fields.push("picture = ?");
      values.push("images/user_images/profile_pics/" + picture);
    }
    if (bio) {
      fields.push("about = ?");
      values.push(bio);
    }

    if (fields.length === 0) {
      return resolve(0);
    }

    const sql = `
        UPDATE users
        SET ${fields.join(", ")}
        WHERE username = ?`;
    values.push(username);

    db.run(sql, values, function(err) {
      if (err) reject(err);
      else {
        if (picture) {
          // updates all pictures in user comments as well
          const updateCommentsSQL = `
            UPDATE comments 
            SET userPicture = ? 
            WHERE user = ?`;
          db.run(updateCommentsSQL, ["images/user_images/profile_pics/" + picture, username], (err) => {
            if (err) reject(err);
            else resolve(this.changes);
          });
        } else {
          resolve(this.changes);
        }
      }
    });
  });
};


/**
 * Gets a user from the database using their email.
 *
 * @param email
 * @returns {Promise<unknown>}
 */
exports.getUserByEmail = function(email) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM users WHERE email = ?";

    db.get(sql, [email], (err, row) => {
      if(err) reject(err);
      else if(row === undefined) resolve(false);
      else {
        const user = mapUser(row);
        resolve(user);
      }
    });
  });
};

/**
 * Changes user password upon reset.
 *
 * @param email
 * @param password
 * @returns {Promise<unknown>}
 */
exports.resetUserPassword = function (email, password) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE users 
      SET password = ? 
      WHERE email = ?`;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const values = [hashedPassword, email];

    db.run(sql, values, (err) => {
      if(err) reject(err);
      else {
        resolve();
        console.log('From userDao.resetUserPassword: password changed!')
      }
    });
  });
};

/**
 * Removes a user and all associated data.
 *
 * @param username
 * @returns {Promise<unknown>}
 */
exports.deleteUser = async function(username) {
  try {
    const userPosts = await postsDao.getAllPostsByUser(username);

    for (const post of userPosts) {
      await postsDao.removePost(post.id);
    }
    await db.run("BEGIN TRANSACTION");
    await db.run("DELETE FROM likes WHERE user = ?", [username]);
    await db.run("DELETE FROM saved WHERE user = ?", [username]);
    await db.run("DELETE FROM comments WHERE user = ?", [username]);

    await db.run("DELETE FROM users WHERE username = ?", [username]);

    await db.run("COMMIT");

    return true;
  } catch (error) {
    await db.run("ROLLBACK");
    throw error;
  }
};

exports.getTopFollowedUsers = function() {
  return new Promise((resolve, reject) => {
    const sql = `
    SELECT followed AS username, COUNT(follower) AS followers_count
    FROM follow
    GROUP BY followed
    ORDER BY followers_count DESC
    LIMIT 10;
  `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};


/**
 * Adds a follow to a user.
 *
 * @param follower
 * @param followed
 * @returns {Promise<unknown>}
 */
exports.addFollow = function (follower, followed) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT OR IGNORE INTO follow (follower, followed)
                 VALUES (?, ?)`;
    db.run(sql, [follower, followed], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

/**
 * Removes a follow from a user.
 *
 * @param follower
 * @param followed
 * @returns {Promise<unknown>}
 */
exports.removeFollow = function (follower, followed) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE
                 FROM follow
                 WHERE follower = ?
                   AND followed = ?`;
    db.run(sql, [follower, followed], function (err) {
      if (err) reject(err);
      else resolve();
    });
  });
};

exports.isFollowed = function(follower, followed) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT *
        FROM follow
        WHERE follow.follower = ?
          AND follow.followed = ?
    `;

    db.get(sql, [follower, followed], (err, row) => {
      if (err)
        reject(err);
      else if (row === undefined)
        resolve(false);
      else
        resolve(true);
    });
  });
}

exports.getFollowers = function (username) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT u.username, u.picture, u.about, u.banned
        FROM follow AS f
                 JOIN users AS u ON f.follower = u.username
        WHERE f.followed = ?`;
    db.all(sql, [username], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

exports.getFollowed = function (username) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT u.username, u.picture, u.about, u.banned
        FROM follow AS f
                 JOIN users AS u ON f.followed = u.username
        WHERE f.follower = ?`;
    db.all(sql, [username], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};


