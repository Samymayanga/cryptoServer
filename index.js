const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");

dotenv.config({ path: "./config/config.env" });

const authRoute = require("./routes/Auth.js");
const controllerRoute = require("./controllers/Controller.js");

const app = express();

app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:5173", 
  "http://localhost:5000", // Local backend dev
  "https://your-frontend.vercel.app", // Replace with your actual Vercel URL
  "https://your-custom-domain.com", 
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.indexOf(origin) !== -1 ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

const dbConfig = require("./config/Database.js");

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening at port number ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

app.use("/cryptoApp", authRoute);
app.use("/cryptoApp", controllerRoute);

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      error: "CORS error: Origin not allowed",
      origin: req.headers.origin,
    });
  } else {
    next(err);
  }
});

