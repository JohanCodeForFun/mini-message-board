const asyncHandler = require('express-async-handler')

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
});

const { DateTime } = require("luxon");
const dt = DateTime.local().toLocaleString(DateTime.DATETIME_MED);

const getMessages = asyncHandler(async (req, res) => {
  // const messages = await pool.query('SELECT * FROM users');
  const messages = await pool.query(`
        SELECT messages.message,
                messages.added,
                users.username 
          FROM users
    INNER JOIN messages
            ON messages.message_usernameid = users.username_id;`);

  for (const message of messages.rows) {
    message.added = DateTime.fromJSDate(message.added).toLocaleString(DateTime.DATE_MED)
  }

  res.status(200).json(messages.rows);
});

const getMessageById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const message = await pool.query('SELECT * FROM messages WHERE message_id = $1', [id]);
  res.status(200).json(message.rows);
});

const createMessage = asyncHandler(async (req, res) => {
  // Work in progress

  // TODO:
  // if username exists, get username_id from users table
  // if username doesn't exist, create username and get username_id from users table
  // create message with username_id in messages table with username from users table
  // return message

  const { message, username } = req.body;

  const user = await pool.query('SELECT * FROM users WHERE username_id = $1', [username]);

  if (user) {
    console.log("user", user.rows[0].username_id)
  }
  // const newMessage = await pool.query(
  //   'INSERT INTO messages (message, message_usernameid) VALUES ($1, $2) RETURNING *',
  //   [message, username]
  // );

  res.status(201).json({ message: "message created" });
  // res.status(201).json(newMessage.rows[0]);
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