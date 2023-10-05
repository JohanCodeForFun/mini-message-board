const asyncHandler = require('express-async-handler')

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
});

const { DateTime } = require("luxon");
const dt = DateTime.local().toLocaleString(DateTime.DATETIME_MED);

exports.message_list = asyncHandler(async (req, res) => {
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
  console.log(messages.rows)

  return messages.rows;

  // res.render('index', { 
  //   title: 'Mini Message Board',
  //   messages: messages.rows
  //  },
  // );

  res.render('message_list', { 
    title: 'message List', 
    messages: messages.rows
  });
});