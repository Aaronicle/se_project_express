const router = require("express").Router();
const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, createItem);

router.get("/", getItems);

router.put("/:itemId/likes", authMiddleware, likeItem);

router.delete("/:itemId", authMiddleware, deleteItem);
router.delete("/:itemId/likes", authMiddleware, dislikeItem);

module.exports = router;
