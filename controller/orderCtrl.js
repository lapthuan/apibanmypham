const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");
const validateMongoDbId = require("../utils/validateMongodbId");

const getOrderByUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userOrder = await Order.findOne({ _id: id })
      .populate({
        path: "products.product",
        select: "title description price images qty",
      })
      .exec();
    const userOrderInfo = await Order.findOne({ _id: id })
      .populate({
        path: "orderby",
        select: "lastname email mobile address",
      })
      .exec();
    return res.json({ userOrder, userOrderInfo });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrderRecent = asyncHandler(async (req, res) => {
  try {
    const userorders = await Order.find({ orderStatus: "Đã nhận hàng" })
      .populate({
        path: "products.product",
        // select: "title",
      })
      .populate({
        path: "orderby",
        // select: "address firstname email",
      })
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  getOrderRecent,
  getOrderByUser,
};
