const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

require('./configs/db.config');

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(PORT, (req, res) => console.log(`App listening on port ${PORT}!`));
