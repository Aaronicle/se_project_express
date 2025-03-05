const { UNATHORIZED, BAD_REQUEST } = require("../utils/errors");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");

const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers;
  console.log("req.headers", req.headers);
  console.log("authorization", authorization);
  if (!authorization || !authorization.startsWith("Bearer")) {
    res.status(BAD_REQUEST).send({ message: "Authotization required" });
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
