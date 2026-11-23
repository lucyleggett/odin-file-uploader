const { Router } = require("express");
const indexController = require("../controllers/indexController");
const indexRouter = Router();

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

const ensureAdmin = (req, res, next) => {
  if (req.user?.admin) return next();
  res.status(403).send("Forbidden");
};

indexRouter.get("/", indexController.viewIndex);
indexRouter.post(
  "/become-member",
  ensureAuth,
  indexController.postBecomeMember,
);
indexRouter.post("/become-admin", ensureAuth, indexController.postBecomeAdmin);
indexRouter.post("/new-message", ensureAuth, indexController.postNewMessage);
indexRouter.post(
  "/:id/delete",
  ensureAuth,
  ensureAdmin,
  indexController.deleteMessage,
);

module.exports = { indexRouter, ensureAuth };
