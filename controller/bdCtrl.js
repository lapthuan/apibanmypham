const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const Blog = require("../models/blogModel");
const Brand = require("../models/brandModel");
const Contact = require("../models/contactModel");
const Review = require("../models/review");
const Category = require("../models/prodcategoryModel.js");
const expressAsyncHandler = require("express-async-handler");
const moment = require("moment");
const { CART_ITEM_STATUS } = require("../constants");
const getNumAll = expressAsyncHandler(async (req, res) => {
  try {
    const usersNum = await User.countDocuments();
    const productNum = await Product.countDocuments();
    const cartNum = await Cart.countDocuments();
    const orderNum = await Order.countDocuments();
    const couponNum = await Coupon.countDocuments();
    const blogNum = await Blog.countDocuments();
    const brandNum = await Brand.countDocuments();
    const contactNum = await Contact.countDocuments();
    const categoryNum = await Category.countDocuments();
    const reviewNum = await Review.countDocuments();
    const orders = await Order.find({ orderStatus: "Đã xử lý" });

    const pipeline = [
      {
        $match: {
          orderStatus: CART_ITEM_STATUS.Delivered,
        },
      },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: "$totalPrice" },
        },
      },
    ];
    const result = await Order.aggregate(pipeline);
    const totalPrice = result.length > 0 ? result[0].totalPrice : 0;
    return res.json({
      usersNum,
      productNum,
      cartNum,
      orderNum,
      couponNum,
      blogNum,
      brandNum,
      contactNum,
      categoryNum,
      reviewNum,
      totalPrice,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const getTotalDate = expressAsyncHandler(async (req, res) => {
  const { month, year } = req.params;
  try {
    const startOfMonth = moment(`${year}-${month}`, "YYYY-MM").startOf("month");
    const endOfMonth = moment(`${year}-${month}`, "YYYY-MM").endOf("month");
    const pipeline = [
      {
        $match: {
          orderStatus: CART_ITEM_STATUS.Delivered,
          createdAt: {
            $gte: startOfMonth.toDate(),
            $lte: endOfMonth.toDate(),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalPrice: { $sum: "$totalPrice" },
        },
      },
    ];
    const result = await Order.aggregate(pipeline);
    const totalPrice = result.length > 0 ? result[0].totalPrice : 0;
    return res.json({ totalPrice });
  } catch (error) {
    throw new Error(error);
  }
});

const getWeeklyRevenue = expressAsyncHandler(async (req, res) => {
  try {
    const startOf7DaysAgo = moment().subtract(7, "days").startOf("day");
    const endOfToday = moment().endOf("day");
    const pipeline = [
      {
        $match: {
          orderStatus: CART_ITEM_STATUS.Delivered,
          createdAt: {
            $gte: startOf7DaysAgo.toDate(),
            $lte: endOfToday.toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalPrice: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
    const result = await Order.aggregate(pipeline);

    const data = [];
    let currentDate = moment(startOf7DaysAgo);
    const endDay = moment(endOfToday);

    while (currentDate <= endDay) {
      const currentDateStr = currentDate.format("YYYY-MM-DD");
      const resultItem = result.find((item) => item._id === currentDateStr);

      const totalPrice = resultItem ? resultItem.totalPrice : 0;
      data.push({ date: currentDateStr, totalPrice });

      currentDate = currentDate.add(1, "day");
    }

    return res.json({ data });
  } catch (error) {
    throw new Error(error);
  }
});

const getYearTotalPrice = expressAsyncHandler(async (req, res) => {
  try {
    const startOfYear = moment().startOf("year");
    const endOfYear = moment().endOf("year");
    const pipeline = [
      {
        $match: {
          orderStatus: "Đã nhận hàng", 
          createdAt: {
            $gte: startOfYear.toDate(),
            $lte: endOfYear.toDate(),
          },
        },
      },
      {
        $group: {
          _id: {
            $month: "$createdAt",
          },
          sales: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
    const result = await Order.aggregate(pipeline);

    const data = [];
    for (let i = 1; i <= 12; i++) {
      const resultItem = result.find((item) => item._id === i);

      const sales = resultItem ? resultItem.sales : 0;
      const monthAbbreviation = moment()
        .month(i - 1)
        .format("MMM");
      data.push({ type: monthAbbreviation, sales });
    }

    return res.json({ data });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  getNumAll,
  getTotalDate,
  getWeeklyRevenue,
  getYearTotalPrice,
};
