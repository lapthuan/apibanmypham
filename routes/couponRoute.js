const express = require("express");
const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  updateCouponUser,
  getCouponUser,
  giveCoupon,
} = require("../controller/couponCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", getAllCoupons);
router.post("/checkuser", getCouponUser);
router.post("/givecoupon", giveCoupon);
router.post("/", authMiddleware, isAdmin, createCoupon);
router.get("/:id", authMiddleware, isAdmin, getAllCoupons);
router.put("/user/:id", updateCouponUser);
router.put("/:id", updateCoupon);
router.delete("/:id", authMiddleware, isAdmin, deleteCoupon);

module.exports = router;
