var express = require('express');
var router = express.Router();
const { DateTime } = require("luxon");
const dt = DateTime.local().toLocaleString(DateTime.DATETIME_MED);

const messages = [
  {
    text: "Hi there!",
    user: "Amanda",
    added: DateTime.fromJSDate(new Date()).toLocaleString(DateTime.DATE_MED)

  },
  {
    text: "Hey, how are you?",
    user: "Becky",
    added: DateTime.fromJSDate(new Date()).toLocaleString(DateTime.DATE_MED)
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

router.get('/new', function(req, res, next) {
  res.render('form', { title: 'New Message' });
});

router.post('/new', (req, res) => {
  console.log(req.body)

  const { user, text } = req.body

  messages.push({ user, text, added: DateTime.fromJSDate(new Date()).toLocaleString(DateTime.DATE_MED) })
  
  res.redirect('/')
})

module.exports = router;
