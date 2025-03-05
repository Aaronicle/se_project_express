const router = require("express").Router();
const {
  getUsers,
  createUser,
  getCurrentUser,
} = require("../controllers/users");
const authMiddleware = require("../middlewares/auth");

// router.get("/me", getUsers);
router.get("/me", authMiddleware, getCurrentUser);
// router.post("/", createUser);

module.exports = router;
