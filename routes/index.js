require('dotenv').config()
const express = require('express');
const router = express.Router();
const axios = require('axios');

const db = require('../api/queries');

/* GET home page. */
router.get('/', function async(req, res, next) {

  const message_list = axios.get('http://localhost:3005/messages')
    .then((response) => {
      res.render('index', { 
        title: 'Mini Message Board',
        message_list: response.data
       },
      );
    }
    )
    .catch((error) => {
      console.log(error);

      res.render('error', { 
        title: 'Error Page',
        error: error
       },
      );
    })
});

// API ROUTES
router.get('/messages', db.getMessages);
router.get('/messages/:id', db.getMessageById);
router.post('/messages', db.createMessage);
router.put('/messages/:id', db.updateMessage);
router.delete('/messages/:id', db.deleteMessage);

router.get('/new', function(req, res, next) {
  res.render('form', { title: 'New Message' });
});

module.exports = router;
