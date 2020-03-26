require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");

const plansRoutes = require("./routes/plan.routes");
const usersRoutes = require("./routes/user.routes");
const sessionsRoutes = require("./routes/session.routes");

//Configs

const keys = require("./configs/keys");
const cors = require("./configs/cors.config");
require("./configs/db.config");
require("./configs/passport.config").setup(passport);

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors);
app.use(
  session({
    secret: keys.cookieSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1000
    }
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.session = req.user;
  next();
});

// Routes
app.use("/plans", plansRoutes);
app.use("/users", usersRoutes);
app.use(sessionsRoutes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({ message: error.message || "" });
});

app.listen(PORT, (req, res) => console.log(`App listening on port ${PORT}!`));
