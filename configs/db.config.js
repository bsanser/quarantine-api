const mongoose = require("mongoose");
const DB_NAME = "quarantine-db";
const keys = require("./keys");

mongoose.Promise = Promise;
mongoose
  .connect(keys.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.info(`Connect to db ${DB_NAME}`);
  })
  .catch(error => {
    console.error(`Unable to connect to db ${DB_NAME}: ${error}`);
  });
