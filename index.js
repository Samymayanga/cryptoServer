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
  "http://localhost:5000",
  "https://crypto-client-8ud9.onrender.com",
  "https://crypto-client-8ud9.onrender.com/", // Added trailing slash version
  "https://your-custom-domain.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Log for debugging (remove in production)
    console.log('CORS Request from origin:', origin);
    
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    
    // Check if origin is allowed
    if (
      allowedOrigins.includes(origin) || 
      allowedOrigins.includes(normalizedOrigin) ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
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

// Error handling
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    res.status(403).json({
      error: "CORS error: Origin not allowed",
      origin: req.headers.origin,
    });
  } else {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint
app.get("/cryptoApp/test", (req, res) => {
  res.json({ 
    message: "Server is running!",
    cors: "Configured correctly",
    origin: req.headers.origin || "No origin",
    environment: process.env.NODE_ENV
  });
});
    





