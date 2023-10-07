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

const messageValidation = [
  body('message')
    .escape()
    .notEmpty()
    .isLength({ min: 2, max: 255 })
    .withMessage('Message must be between 2 and 255 characters long')
    .trim()
];

const usernameValidation = [
  body('username')
    .escape()
    .notEmpty()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 2 and 255 characters long')
    .trim()
];

const createMessage = [
  messageValidation,
  usernameValidation,

  asyncHandler(async (req, res) => {
  const { message, username } = req.body;

  const messageErrors = validationResult(req).formatWith(({ msg }) => msg);

  if (!messageErrors.isEmpty()) {
    return res.status(400)
        .render('form', {
        title: 'New Message',
        errorHeader: 'Error on input',
        errors: messageErrors.array(),
      });
  }

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
  })
];

const updateMessage = [
  messageValidation,

  asyncHandler(async (req, res) => {

    const messageErrors = validationResult(req).formatWith(({ msg }) => msg);
    if (!messageErrors.isEmpty()) {
      return res.status(400).json({ errors: messageErrors.array() });
    };

    const { id } = req.params;
    const { message, password } = req.body;

    if (password !== process.env.PASSWORD) {
      return res.status(401).json({ message: 'Incorrect password' });
    } {
        console.log('Password correct');
        const updatedMessage = await pool.query(
          'UPDATE messages SET message = $1 WHERE messages_id = $2',
          [message, id]
        );
      res.status(200).json(updatedMessage.rows[0]);
    }
  })
];

const deleteMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  if (password !== process.env.PASSWORD) {
    return res.status(401).json({ message: 'Incorrect password' });
  } else {
    console.log('Password correct');
    await pool.query('DELETE FROM messages WHERE messages_id = $1', [id]);
    res.status(200).json({ message: `Message ${id} removed` });
  }
});

module.exports = {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};