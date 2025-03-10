const jwt = require("jsonwebtoken");
const { UNATHORIZED } = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith("Bearer")) {
    res.status(UNATHORIZED).send({ message: "Authorization required" });
  }
  const token = authorization.replace("Bearer ", "");
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(UNATHORIZED).send({ message: "Authorization required" });
  }
  req.user = payload;
  return next();
};

module.exports = authMiddleware;
