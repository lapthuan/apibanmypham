const Coupon = require("../models/couponModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const asynHandler = require("express-async-handler");
const sendEmail = require("./emailCtrl");
const { emailVoucher } = require("../constants/htmlGiveVoucher");

const createCoupon = asynHandler(async (req, res) => {
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);
  } catch (error) {
    throw new Error(error);
  }
});
const getAllCoupons = asynHandler(async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (error) {
    throw new Error(error);
  }
});
const updateCoupon = asynHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {

    const updatecoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatecoupon);
  } catch (error) {
    throw new Error(error);
  }
});
const getCouponUser = asynHandler(async (req, res) => {
  const { iduser, name } = req.body;
  try {
    const finduser = await Coupon.findOne({ name: name, "user.iduser": iduser });

    if (finduser)
      res.json({ status: "user already exists" });
    else {
      const findcoupon = await Coupon.findOne({ name: name });
      res.json({ status: "ok", coupons: findcoupon });
    }

  } catch (error) {
    throw new Error(error);
  }
});
const updateCouponUser = asynHandler(async (req, res) => {
  const { id } = req.params;
  const { iduser } = req.body;
  try {
    const finduser = await Coupon.findOne({ _id: id, "user.iduser": iduser });

    if (finduser)
      res.json({ status: "user already exists" });
    else {
      const updatecoupon = await Coupon.findByIdAndUpdate(
        id,
        { $push: { user: { iduser: iduser } } }
      );

      res.json(updatecoupon);
    }

  } catch (error) {
    throw new Error(error);
  }
});

const deleteCoupon = asynHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deletecoupon = await Coupon.findByIdAndDelete(id);
    res.json(deletecoupon);
  } catch (error) {
    throw new Error(error);
  }
});
const getCoupon = asynHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const getAcoupon = await Coupon.findById(id);
    res.json(getAcoupon);
  } catch (error) {
    throw new Error(error);
  }
});

const giveCoupon = asynHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const resetURL = emailVoucher()
    const data = {
      to: email,
      text: "Xin chào chúng tôi là Luxubu",
      subject: "Dành tặng cho bạn 1 voucher",
      htm: resetURL,
    };
    sendEmail(data);
    res.json({ status: "ok" })
  } catch (error) {
    throw new Error(error);
  }
})
module.exports = {
  getCouponUser,
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  getCoupon,
  updateCouponUser,
  giveCoupon,
};
