const express = require("express");
const path = require("path");
const connectDB = require("./config/db");

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const chalk = require("chalk");

const app = express();

connectDB();

// MIDDLEWARES
// => SECURITY
app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 100 requetes par IP par heure max
  message: "Too many requests for this IP. Please try again in one hour!",
});

app.use("/api", limiter);

// => ENABLE JSON
app.use(express.json({ extended: false, limit: "10kb" }));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data sanitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(hpp());

// serving static files // TEST
app.use(express.static(`${__dirname}/public`));

// MODELS
require("./models/User");

// ROUTES

// all
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/friends", require("./routes/friendRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/images", require("./routes/imageRoutes"));
app.use("/api/comments", require("./routes/commentRoutes"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  // set static folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}
// PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(chalk.green(`Server online on port ${PORT}`));
});
