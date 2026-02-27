const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

//connecting to db
mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection;

db.on("connected", () => {
  console.log("db connection successful");
});

db.on("err", () => {
  console.log("error connecting db...");
});

module.exports = db;
