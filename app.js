require("dotenv").config();

const express = require("express");
const path = require("node:path");
const session = require("express-session");
const passport = require("passport");

require("./config/passport");

const { indexRouter } = require("./routes/indexRouter");
const authRouter = require("./routes/authRouter");
const { toSentenceCase, toTitleCase } = require("./utils/formatUtils");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.locals.toSentenceCase = toSentenceCase;
app.locals.toTitleCase = toTitleCase;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use("/", indexRouter);
app.use("/", authRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).send(err.message);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
