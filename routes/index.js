const router = require("express").Router();
const { login, createUser } = require("../controllers/users");
const { NotFoundError } = require("../utils/errors");
const clothingItem = require("./clothingItem");
const userRouter = require("./users");
const {
  validateUserBody,
  validateAuthentication,
} = require("../middlewares/validation");

router.use("/users", userRouter);
router.use("/items", clothingItem);
router.post("/signin", validateAuthentication, login);
router.post("/signup", validateUserBody, createUser);

router.use(() => {
  throw new NotFoundError("Router not found");
});

module.exports = router;
