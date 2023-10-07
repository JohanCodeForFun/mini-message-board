const asyncHandler = require('express-async-handler')
const { body, validationResult } = require('express-validator');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
});

const { DateTime } = require("luxon");
const dt = DateTime.local().toLocaleString(DateTime.DATETIME_MED);

const getMessages = asyncHandler(async (req, res) => {
  const messages = await pool.query(`
        SELECT messages.message,
                messages.added,
                users.username 
          FROM users
    INNER JOIN messages
            ON messages.message_usernameid = users.username_id
      ORDER BY messages.added ASC;`);

  for (const message of messages.rows) {
    message.added = DateTime.fromJSDate(message.added).toLocaleString(DateTime.DATETIME_SHORT)
  }

  res.status(200).json(messages.rows);
});

const getMessageById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const message = await pool.query('SELECT * FROM messages WHERE message_id = $1', [id]);
  res.status(200).json(message.rows);
});

const createMessage = asyncHandler(async (req, res) => {

  const { message, username } = req.body;

  const user = await pool.query(`SELECT username_id FROM users WHERE username = $1`, [username]);

  if (user.rows.length > 0) {
    const user_id = user.rows[0].username_id;

    const newMessage = await pool.query(`
      INSERT INTO messages (message_usernameid, message)
      VALUES ($1, $2)`, [user_id, message]);

      res.status(200).redirect('/');
  } else {

    const newUser = await pool.query(`
      INSERT INTO users (username)
      VALUES ($1)`, [username]);

    const newUserId = await pool.query(`SELECT username_id FROM users WHERE username = $1`, [username]);

    const newMessage = await pool.query(`
      INSERT INTO messages (message_usernameid, message)
      VALUES ($1, $2)`, [newUserId.rows[0].username_id, message]);

      res.status(200).redirect('/');
    }

});

const updateMessage = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const { message, message_usernameid } = req.body;
  const updatedMessage = await pool.query(
    'UPDATE messages SET message = $1, message_usernameid = $2 WHERE message_id = $3 RETURNING *',
    [message, message_usernameid, id]
  );
  res.status(200).json(updatedMessage.rows[0]);
});

const deleteMessage = asyncHandler(async (req, res) => {
  const id = req.params.id;
  await pool.query('DELETE FROM messages WHERE message_id = $1', [id]);
  res.status(200).json({ message: `Message ${id} removed` });
});

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};