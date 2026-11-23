const { param } = require("express-validator");
const validateId = param("id").isInt({ min: 1 }).toInt();

const passwordErrors = {
  alpha: "must only contain letters.",
  alphanumeric: "must only contain letters and numbers.",
};

module.exports = { validateId, passwordErrors };