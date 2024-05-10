'use strict';

const db = require('../db.js');
const bcrypt = require('bcrypt');

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
    const sql = "INSERT INTO users (firstName, lastName, email, username, password, type, banned) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const hashedPassword = bcrypt.hashSync(password, 10);
    const values = [firstName, lastName, email, username, hashedPassword, "user", 0];

    db.run(sql, values, (err) => {
      if(err) reject(err);
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
      if(err)
        reject(err);
      else if(row === undefined)
        resolve({error: "user not found"});
      else {
        const user = {
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          username: row.username,
          type: row.type,
          picture: row.picture
        };
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
            const user = {
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              username: row.username,
              type: row.type
            };
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
    const sql = "UPDATE user SET type = ? WHERE username = ?";

    db.run(sql, ["admin", username]), (err) => {
      if(err) reject(err);
      else resolve();
    }
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
    const sql = `UPDATE user SET type = ? WHERE username = ?`;

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
    const sql = "UPDATE user SET type = ? WHERE username = ?";

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
    const sql = "UPDATE user SET type = ? WHERE username = ?";

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
    const sql = "UPDATE user SET banned = ? WHERE username = ?";

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
    const sql = "UPDATE user SET banned = ? WHERE username = ?";

    db.run(sql, [0, username], (err) => {
      if(err) reject(err);
      else resolve();
    });
  });
};