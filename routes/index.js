var express = require('express');
var router = express.Router();

const messages = [
  {
    text: "Hi there!",
    user: "Amanda",
    added: new Date()
  },
  {
    text: "Hey, how are you?",
    user: "Becky",
    added: new Date()
  }
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Mini Message Board',
    messages: messages
   },
  );
});

module.exports = router;
