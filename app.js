const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require("body-parser");

const plansRoutes = require("./routes/plans.routes");
const usersRoutes = require("./routes/users.routes");

require("./configs/db.config");

app.get("/", (req, res) => res.send("Hello World!"));

//Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes
app.use("/plans", plansRoutes);
app.use("/users", usersRoutes);

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
