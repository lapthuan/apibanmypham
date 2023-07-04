const express = require("express");
const {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  findProduct,
} = require("../controller/productCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const router = express.Router();
router.get("/findproduct", findProduct);
router.post("/", createProduct);
// router.post("/", authMiddleware, isAdmin, createProduct);
router.put("/:id", updateProduct);
router.get("/:id", getaProduct);
router.put("/wishlist", authMiddleware, addToWishlist);
router.put("/rating", authMiddleware, rating);
// router.put("/:id", authMiddleware, isAdmin, updateProduct);
// router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.delete("/:id", deleteProduct);
router.get("/", getAllProduct);
module.exports = router;
