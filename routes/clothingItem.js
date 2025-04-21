const router = require("express").Router();
const {
  validateClothingItem,
  validateId,
} = require("../middlewares/validation");

const {
  createItem,
  getItems,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItem");
const authMiddleware = require("../middlewares/auth");

router.post("/", authMiddleware, validateClothingItem, createItem);

router.get("/", getItems);

router.put("/:itemId/likes", authMiddleware, validateId, likeItem);

router.delete("/:itemId", authMiddleware, validateId, deleteItem);
router.delete("/:itemId/likes", authMiddleware, validateId, dislikeItem);

module.exports = router;
