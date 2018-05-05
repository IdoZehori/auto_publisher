const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const Joi = require('joi');
const Snoowrap = require('snoowrap');
const Snoostorm = require('snoostorm');
const index = require('./routes/index');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Public folder
app.use(express.static(__dirname + '/public'));

const r = new Snoowrap({
    userAgent: 'autoPublisher',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    username: process.env.REDDIT_USER,
    password: process.env.REDDIT_PASS
});
const client = new Snoostorm(r);

app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/', index);

app.post('/publish', (req, res) =>{
  const schema = Joi.object().keys({
    title: Joi.string().alphanum().max(300).required(),
    subreddits: Joi.string().min(1).regex(/^[-\w\s]+(?:,[-\w\s]*)+$/).required()
});

const result = Joi.validate(req.body, schema);
if (result.error){
    res.send(result.error.details[0].message)
};

const subredditList = req.body.subreddits.split(",")
console.log(subredditList);

let subredditExists = new Promise((resolve, reject) => {
  let exists = r.getSubreddit(subredditList[0]).fetch();
  console.log(exists);

  if (exists) {
    resolve();
  }
  else {
    reject();
  }
});
subredditExists.then(console.log('OK!')).catch('NO!');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(3000, () => console.log('app listening on port 3000..'))
