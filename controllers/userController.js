const asyncHandler = require('express-async-handler')

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const { DateTime } = require("luxon");
const dt = DateTime.local().toLocaleString(DateTime.DATETIME_MED);

exports.user_list = asyncHandler(async (req, res) => {
  const users = await pool.query(`
    SELECT username,
          added
      FROM users ORDER BY id ASC`);

  for (const user of users.rows) {
    user.added = DateTime.fromJSDate(user.added).toLocaleString(DateTime.DATE_MED)
  }

  res.render('user_list', { 
    title: 'User List', 
    users: users.rows
  });
});