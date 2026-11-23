const { body, validationResult, matchedData } = require("express-validator");
const db = require("../db/queries");

const validateMessage = [
  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message content cannot be empty."),
];

exports.viewIndex = async (req, res) => {
  const messages = await db.getAllMessages();

  res.render("index", { messages, errors: {}, values: {} });
};

const renderIndex = async (req, res, errors = {}, values = {}) => {
  const messages = await db.getAllMessages();

  res.render("index", {
    user: req.user,
    messages,
    errors,
    values,
  });
};

exports.postBecomeMember = async (req, res, next) => {
  try {
    if (req.body.member_password !== process.env.MEMBER_PASSCODE) {
      return renderIndex(req, res, {
        member_password: { msg: "Incorrect password." },
        values: {},
      });
    }
    await db.setMember(req.user.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.postBecomeAdmin = async (req, res, next) => {
  try {
    if (req.body.admin_password !== process.env.ADMIN_PASSCODE) {
      return renderIndex(req, res, {
        admin_password: { msg: "Incorrect password." },
        values: {},
      });
    }
    await db.setAdmin(req.user.id);
    res.redirect("/");
  } catch (err) {
    next(err);
  }
};

exports.postNewMessage = [
  validateMessage,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return renderIndex(req, res, errors.mapped(), {
        message: req.body.message,
      });
    }

    try {
      const { message } = matchedData(req);
      await db.addMessage(req.user.id, message);
      res.redirect("/");
    } catch (error) {
      next(error);
    }
  },
];

exports.deleteMessage = async (req, res) => {
  const rowCount = await db.deleteMessage(req.params.id);

  if (rowCount === 0) {
    return res.status(404).renderIndex(req, res, errors.mapped(), values);
  } else {
    res.redirect("/");
  }
};
