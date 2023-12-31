const express = require("express");
const passport = require("passport");
const {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  unblockUser,
  handleRefreshToken,
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart,
  emptyCart,
  applyCoupon,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllOrders,
  editUser,
  findAUser,
  blockUserEmail,
  findOrderUser,
  updateOrderCancel,
  deleteOrder,
  getOrderByUserId,
} = require("../controller/userCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const middlewareController = require("./middlewareController");
const router = express.Router();
router.post("/ordercancel", updateOrderCancel);
router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken);
router.put("/reset-password/:token", resetPassword);
router.put("/password", authMiddleware, updatePassword);
router.post("/login", loginUserCtrl);
router.post("/admin-login", loginAdmin);
router.post("/cart", authMiddleware, userCart);
router.post("/cart/applycoupon", authMiddleware, applyCoupon);
router.post("/cart/cash-order", authMiddleware, createOrder);
router.post("/createorder", createOrder);
router.post("/findorder", findOrderUser);
router.get("/all-users", getallUser);
// router.get("/get-orders", authMiddleware, getOrders);
// router.get("/get-orders", authMiddleware, getOrders);
router.get("/get-orders/:id", getOrders);
router.get("/getallorders", getAllOrders);
// router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.post("/getorderbyuser/:id", getAllOrders);
router.post("/getorderbyuserId/:id", getOrderByUserId);
// router.post("/getorderbyuser/:id", authMiddleware, isAdmin, getAllOrders);
router.get("/get-orders", getOrders);
router.get("/getallorders", authMiddleware, isAdmin, getAllOrders);
router.post("/getorderbyuser/:id", getAllOrders);
router.get("/refresh", handleRefreshToken);
router.get("/logout", logout);
router.get("/wishlist", authMiddleware, getWishlist);
router.get("/cart", authMiddleware, getUserCart);
router.get("/:id", authMiddleware, isAdmin, getaUser);
router.get("/find/:gmail", findAUser);
router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteaUser);
// router.put(
//   "/order/update-order/:id",
//   authMiddleware,
//   isAdmin,
//   updateOrderStatus
// );
router.put(
  "/order/update-order/:id",
  // authMiddleware,
  // isAdmin,
  updateOrderStatus
);
router.put("/save-address/:id", saveAddress);

router.delete("delete-order/:id", deleteOrder);
// router.put("/edit-user", authMiddleware, updatedUser);
// router.put("/edit-user", updatedUser);
router.put("/edit-user/:id", editUser);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.post("/block-user/:email", blockUserEmail);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unblockUser);

module.exports = router;
