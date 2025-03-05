const router = require("express").Router();
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");
const authMiddleware = require("../middlewares/auth");

router.post("/", createItem);

router.get("/", authMiddleware, getItems);

router.put("/:itemId/likes", likeItem);

router.delete("/:itemId", deleteItem);
router.delete("/:itemId/likes", dislikeItem);

module.exports = router;
