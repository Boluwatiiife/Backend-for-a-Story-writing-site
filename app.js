const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { engine } = require("express-handlebars");
const passport = require("passport");
const router = require("./routes/index");
const auth = require("./routes/auth");
const stories = require("./routes/stories");
const path = require("path");
const expressSession = require("express-session");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");

const sessionStore = MongoStore.create({
  mongoUrl: "mongodb://127.0.0.1:27017/story-books",
  collectionName: "sessions",
});

// load config
dotenv.config({ path: "./config/config.env" });

// passport config
require("./config/passport");
connectDB();

const app = express();

// body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// handlebars Helpers
const { formatDate, stripTags, truncate, editIcon } = require("./helpers/hbs");

// Handlebars
app.engine(
  ".hbs",
  engine({
    helpers: {
      formatDate,
      stripTags,
      truncate,
      editIcon,
    },
    defaultLayout: "main",
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
  })
);
app.set("view engine", ".hbs");
app.set("views", "./views");

// sessions
app.use(
  expressSession({
    secret: "qwert1234",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// set global variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", router);
app.use("/auth", auth);
app.use("/stories", stories);

const PORT = process.env.PORT || 3005;

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
