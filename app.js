var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require("express-session");
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require('passport');
const connectionDb = require("./db/dbConnection");
const flash = require("connect-flash");
const dotenv = require("dotenv");
const flag  = 1;
var app = express();
const arr = 2;
const port = process.env.PORT || 3000;
console.log(process.env.PORT)

// view engine setup
dotenv.config();
connectionDb();
//console.log(process.env.MONGO_URI)
console.log(process.env.PORT)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
   resave:false,
   saveUninitialized:false,
   secret:"pushparaj sohnalfakeerkjasdnfkasndkjfnaswkenkaw"
}))
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());
app.use(express.urlencoded({extended:true}));
app.use(flash());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

app.listen(port,()=>{
  console.log("connected to server");
})
