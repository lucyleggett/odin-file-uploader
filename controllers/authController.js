const { body, validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");
const passport = require("../config/passport");
const { passwordErrors } = require("../utils/validationUtils");
const bcrypt = require("bcryptjs");

const validateSignUp = [
  body("username")
    .trim()
    .custom(async (value) => {
      const user = await db.findUser(value);
      if (user) throw new Error("This username is already taken.");
    })
    .isAlphanumeric("en-US")
    .withMessage(`Username ${passwordErrors.alphanumeric}`)
    .isLength({ max: 10 })
    .withMessage("Username cannot contain more than 10 characters."),
  body("first_name")
    .trim()
    .isAlpha("en-US")
    .withMessage(`First name ${passwordErrors.alpha}`),
  body("surname")
    .trim()
    .isAlpha("en-US")
    .withMessage(`Surname ${passwordErrors.alpha}`),
  body("create_password")
    .trim()
    .isLength({ min: 8, max: 64 })
    .withMessage("Password must be at least 8 characters long."),
  body("confirm_password")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.create_password) {
        throw new Error("Passwords don't match.");
      }
      return true;
    }),
];

exports.getLogin = async (req, res) => {
  const messages = req.session.messages || [];
  const error = messages[messages.length - 1];
  const username = req.session.lastUsername || "";

  req.session.messages = [];
  delete req.session.lastUsername;

  res.render("access", {
    title: "Log in",
    route: "login",
    errors: error ? { msg: error } : {},
    values: { username },
  });
};

const authenticate = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login",
  failureMessage: true,
});

exports.postLogin = (req, res, next) => {
  req.session.lastUsername = req.body?.username || "";
  authenticate(req, res, next);
};

exports.getLogOut = async (req, res) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/login");
  });
};

exports.getSignUp = async (req, res) => {
  res.render("access", {
    route: "sign-up",
    title: "Sign up",
    errors: {},
    values: {},
  });
};

exports.postSignUp = [
  validateSignUp,
  async (req, res) => {
    const errors = validationResult(req);

    const renderForm = (status, errs) => {
      res.status(status).render("access", {
        route: "sign-up",
        title: "Sign up",
        errors: errs,
        values: {
          username: req.body.username,
          first_name: req.body.first_name,
          surname: req.body.surname,
        },
      });
    };

    if (!errors.isEmpty()) {
      return renderForm(400, errors.mapped());
    }

    try {
      const { username, first_name, surname } = matchedData(req);
      const password = await bcrypt.hash(req.body.create_password, 10);

      await db.addUser({ username, password, first_name, surname });

      return res.redirect("/login");
    } catch (error) {
      if (error.code === "23505") {
        return renderForm(409, {
          username: { msg: "Username already taken." },
        });
      }
      console.error(error);
      return res.status(500).send("Something went wrong. Please try again.");
    }
  },
];
