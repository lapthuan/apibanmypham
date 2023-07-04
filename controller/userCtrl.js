const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");
const { passwordfr } = require("../constants/htmlPassword");
// const config = require("config");
const uniqid = require("uniqid");

const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validateMongoDbId = require("../utils/validateMongodbId");
const { generateRefreshToken } = require("../config/refreshtoken");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sendEmail = require("./emailCtrl");
const passport = require("passport");
const axios = require("axios");

// Cookie
var cookie = require("cookie");
const { CART_ITEM_STATUS } = require("../constants");
const Brand = require("../models/brandModel");

// Create a User ----------------------------------------------

const createUser = asyncHandler(async (req, res) => {
  /**
   * TODO:Get the email from req.body
   */
  const email = req.body.email;
  /**
   * TODO:With the help of email find the user exists or not
   */
  const findUser = await User.findOne({ email: email });

  if (req.body.typeLogin == "facebook") {
    const { accessToken } = req.body;
    axios
      .get(
        `https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`
      )
      .then(async (response) => {
        const { id, name, picture } = response.data;
        const names = name.split(" ");
        const firstname = names[names.length - 1]; // First name is the last element in the array
        const middlename = names.slice(1, names.length - 1).join(" ");
        const lastname = names[0] + " " + middlename;
        const existingUser = await User.findOne({ facebookId: id });
        if (existingUser)
          return res.status(400).json({ message: "User already exist!" });
        const result = await User.create({
          verified: "true",
          facebookId: id,
          firstname: firstname,
          lastname: lastname,
          // profilePicture: picture,
        });

        const token = jwt.sign(
          {
            id: result.id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({ result, token });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "Invalid access token!" });
      });
  } else if (req.body.googleAccessToken) {
    const { googleAccessToken } = req.body;
    axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      })
      .then(async (response) => {
        const firstName = response.data.family_name;
        const lastName = response.data.given_name;
        const email = response.data.email;
        const picture = response.data.picture;
        const existingUser = await User.findOne({ email });
        if (existingUser)
          return res.status(400).json({ message: "User already exist!" });
        const result = await User.create({
          verified: "true",
          email,
          firstname: firstName,
          lastname: lastName,
          picture: picture,
        });

        const token = jwt.sign(
          {
            email: result.email,
            id: result._id,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        res.status(200).json({ result, token });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "Invalid access token!" });
      });
  } else {
    if (!findUser) {
      /**
       * TODO:if user not found user create a new user
       */
      console.log(req.body);
      const newUser = await User.create(req.body);
      res.json(newUser);
    } else {
      /**
       * TODO:if user found then thow an error: User already exists
       */
      throw new Error("User Already Exists");
    }
  }
});

// Login a user
const loginUserCtrl = asyncHandler(async (req, res) => {
  // return console.log(req.body);
  const { email, password } = req.body;
  // check if user exists or not
  const findUser = await User.findOne({ email });
  // return console.log(req.body);
  if (req.body.typeLogin == "facebook") {
    const { accessToken } = req.body;
    // const names = name.split(" ");
    // const firstName = names[names.length - 1]; // First name is the last element in the array
    // const middleName = names.slice(1, names.length - 1).join(" ");
    // const lastName = names[0];
    axios
      .get(
        `https://graph.facebook.com/me?fields=id,name,picture&access_token=${accessToken}`
      )
      .then(async (result) => {
        // console.log(result);
        // return;
        const { id, name, picture } = result.data;
        const names = name.split(" ");
        const firstname = names[names.length - 1]; // First name is the last element in the array
        const middlename = names.slice(1, names.length - 1).join(" ");
        const lastname = names[0] + " " + middlename;
        const checkIdFacebook = await User.findOne({ facebookId: id });
        if (!checkIdFacebook)
          return res.status(404).json({ message: "User don't exist!" });
        const refreshToken = await generateRefreshToken(checkIdFacebook?._id);
        console.log("refreshToken", refreshToken);
        console.log(checkIdFacebook.id);
        updateuser = await User.findByIdAndUpdate(
          checkIdFacebook.id,
          {
            refreshToken,
          },
          { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
          _id: checkIdFacebook?._id,
          facebookId: checkIdFacebook?.id,
          firstname,
          lastname,
          email: checkIdFacebook?.email,
          mobile: checkIdFacebook?.mobile,
          token: generateToken(checkIdFacebook?._id),
          role: checkIdFacebook?.role,
          createdAt: checkIdFacebook?.createdAt,
          isBlocked: checkIdFacebook?.isBlocked,
        });
        // const token = jwt.sign(
        //   {
        //     email: existingUser.email,
        //     id: existingUser._id,
        //   },
        //   // config.get("JWT_SECRET"),
        //   process.env.JWT_SECRET,
        //   { expiresIn: "1h" }
        // );

        // res.status(200).json({ result: existingUser, token });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "Invalid access token!" });
      });
  } else if (req.body.googleAccessToken) {
    // gogole-auth
    const { googleAccessToken } = req.body;

    axios
      .get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      })
      .then(async (response) => {
        console.log(response.data);
        const googleId = response.data.sub;
        const firstname = response.data.family_name;
        const lastname = response.data.given_name;
        const email = response.data.email;
        const picture = response.data.picture;
        const address = response.data.address;
        const existingUser = await User.findOne({ email });
        const findUserGoogle = await User.findOne({ email });
        //  return console.log(findUserGoogle.id);
        if (!existingUser)
          return res.status(404).json({ message: "User don't exist!" });
        const refreshToken = await generateRefreshToken(
          findUserGoogle?._id,
          "123213"
        );
        console.log("refreshToken", refreshToken);
        updateuser = await User.findByIdAndUpdate(
          findUserGoogle.id,
          {
            refreshToken: refreshToken,
          },
          { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
          _id: findUserGoogle?._id,
          firstname,
          lastname,
          address: findUserGoogle.address,
          picture: findUserGoogle.profilePicture,
          email: findUserGoogle?.email,
          mobile: findUserGoogle?.mobile,
          token: generateToken(findUserGoogle?._id),
          role: findUserGoogle?.role,
          createdAt: findUserGoogle?.createdAt,
          isBlocked: findUserGoogle?.isBlocked,
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json({ message: "Invalid access token!" });
      });
  } else {
    if (findUser && (await findUser.isPasswordMatched(password))) {
      const refreshToken = await generateRefreshToken(findUser?._id);
      const updateuser = await User.findByIdAndUpdate(
        findUser.id,
        {
          refreshToken: refreshToken,
        },
        { new: true }
      );
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000,
      });
      res.json({
        _id: findUser?._id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        token: generateToken(findUser?._id),
        role: findUser?.role,
        address: findUser?.address,
        createdAt: findUser?.createdAt,
        isBlocked: findUser?.isBlocked,
        picture: findUser?.picture,
      });
    } else {
      throw new Error("Invalid Credentials");
    }
  }
});

const findAUser = asyncHandler(async (req, res) => {
  const email = req.params;
  const gmail = email.gmail;
  try {
    const user = await User.findOne({ email: gmail });
    return res.json({
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    res.json({ error: error });
  }
});

// admin login

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check if user exists or not
  const findAdmin = await User.findOne({ email });
  if (findAdmin.role !== "personnel" && findAdmin.role !== "admin")
    // if (findAdmin.role !== "admin" || findAdmin.role !== "personnel")
    throw new Error("Not Authorised");
  if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateuser = await User.findByIdAndUpdate(
      findAdmin.id,
      {
        refreshToken: refreshToken,
      },
      { new: true }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      isBlocked: findAdmin?.isBlocked,
      role: findAdmin?.role,
      token: generateToken(findAdmin?._id),
    });
  } else {
    throw new Error("Invalid Credentials");
  }
});

// handle refresh token

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) throw new Error(" No Refresh token present in db or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || user.id !== decoded.id) {
      throw new Error("There is something wrong with refresh token");
    }
    const accessToken = generateToken(user?._id);
    res.json({ accessToken });
  });
});

// logout functionality

const logout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
});

// Update a user

const editUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  validateMongoDbId(id);

  try {
    const editUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        role: req?.body?.role,
        mobile: req?.body?.mobile,
        isBlocked: req?.body?.isBlocked,
        Introduce: req?.body?.Introduce,
      },
      { new: true }
    );
    res.json(editUser);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const updatedUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
        Introduce: req?.body?.Introduce,
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// save user Address

const saveAddress = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        address: {
          city: req.body.city,
          district: req.body.district,
          ward: req.body.ward,
          address: req.body.address,
        },
      },
      {
        new: true,
      }
    );
    res.json(updatedUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Get all users

const getallUser = asyncHandler(async (req, res) => {
  try {
    const getUsers = await User.find().populate("wishlist");
    const userCount = await User.countDocuments();
    res.json(getUsers);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

// Get a single user

const getaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const getaUser = await User.findById(id);
    res.json({
      getaUser,
    });
  } catch (error) {
    console.log("error", error);
    throw new Error(error);
  }
});

// Get a single user

const deleteaUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteaUser = await User.findByIdAndDelete(id);
    res.json({
      deleteaUser,
    });
  } catch (error) {
    throw new Error(error);
  }
});

const blockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const blockusr = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockusr);
  } catch (error) {
    throw new Error(error);
  }
});

const blockUserEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;

  res.json(email);
  // return;
  try {
    const blockUserGmail = await User.findOneAndUpdate(
      { email },
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.json(blockUserGmail);
  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const unblock = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.json({
      message: "User UnBlocked",
    });
  } catch (error) {
    throw new Error(error);
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);
  } else {
    res.json(user);
  }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found with this email");

  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    // const resetURL = `Xin chào, Vui lòng theo liên kết này để đặt lại Mật khẩu của bạn. Liên kết này có giá trị đến 10 phút kể từ bây giờ. <a href='http://localhost:3000/api/users/reset-password/${token}'>Click Here</>`;
    // const resetURL = `<h1>Xin chào, Vui lòng theo liên kết này để đặt lại Mật khẩu của bạn. Liên kết này có giá trị đến 10 phút kể từ bây giờ. <a href='http://luxubudev.vercel.app/NewPassword/${token}'>Click Here</></h1><p>Đây là nội dung HTML của email.</p>`;
    const resetURL = passwordfr(token);
    const data = {
      to: email,
      text: "Xin chào chúng tôi là Luxubu",
      subject: "Đặt lại mật khẩu",
      htm: resetURL,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new Error(" Token Expired, Please try again later");
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  res.json(user);
});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

const userCart = asyncHandler(async (req, res) => {
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    let products = [];
    const user = await User.findById(_id);
    // check if user already have product in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });
    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }
    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();
    res.json(newCart);
  } catch (error) {
    throw new Error(error);
  }
});

const getUserCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product"
    );
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const emptyCart = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);
  try {
    const user = await User.findOne({ _id });
    const cart = await Cart.findOneAndRemove({ orderby: user._id });
    res.json(cart);
  } catch (error) {
    throw new Error(error);
  }
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { coupon } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  const validCoupon = await Coupon.findOne({ name: coupon });
  if (validCoupon === null) {
    throw new Error("Invalid Coupon");
  }
  const user = await User.findOne({ _id });
  let { cartTotal } = await Cart.findOne({
    orderby: user._id,
  }).populate("products.product");
  let totalAfterDiscount = (
    cartTotal -
    (cartTotal * validCoupon.discount) / 100
  ).toFixed(2);
  await Cart.findOneAndUpdate(
    { orderby: user._id },
    { totalAfterDiscount },
    { new: true }
  );
  res.json(totalAfterDiscount);
});

const createOrder = asyncHandler(async (req, res) => {
  const { iduser, cart, payment, shipping, totalprice } = req.body;
  validateMongoDbId(iduser);
  const { firstname, lastname } = await User.findById({ _id: iduser });
  const name = firstname + " " + lastname;
  const checkUser = User.findById(iduser);
  if (!checkUser) return res.json({ message: "Người dùng không tồn tai" });
  try {
    let newOrder = await new Order({
      products: cart,
      paymentIntent: payment,
      shippingMethor: shipping,
      orderby: iduser,
      totalPrice: totalprice,
      nameUserOrder: name,
    }).save();
    res.json({ message: "success", newOrder: newOrder });
  } catch (error) {
    throw new Error(error);
  }
});

const getOrders = asyncHandler(async (req, res) => {
  // const { _id } = req.user;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    res.json(userorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllOrders = asyncHandler(async (req, res) => {
  try {
    const alluserorders = await Order.find({
      // orderStatus: CART_ITEM_STATUS.Processing,
    })
      .populate("products.product")
      .populate({
        path: "orderby",
      })
      .exec();
    res.json(alluserorders);
  } catch (error) {
    throw new Error(error);
  }
});

const getOrderByUserId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const userorders = await Order.findOne({ orderby: id })
      .populate("products.product")
      .populate("orderby")
      .exec();
    return res.json(userorders.products);
  } catch (error) {
    throw new Error(error);
  }
});

// Back up the order
// const getOrderByUserId = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     const userorders = await Order.findOne({ orderby: id });
//     res.json(userorders);
//   } catch (error) {
//     throw new Error(error);
//   }
// });
// Back up the order

const updateOrderCancel = asyncHandler(async (req, res) => {
  const { id, message } = req.body;
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          // orderStatus: "Đơn hàng đã hủy",
          orderStatus: CART_ITEM_STATUS.Cancelled,
          messageCancel: message,
        },
      },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    throw new Error(error);
  }
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const order = await Review.deleteOne({ _id: id });
    res.status(200).json({
      success: true,
      message: `review has been deleted successfully!`,
      order,
    });
  } catch (error) {
    return res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

// const updateOrderStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const { id } = req.params;
//   validateMongoDbId(id);
//   try {
//     let temp = parseInt(status);
//     if (status === 1) {
//       temp = CART_ITEM_STATUS.Processing;
//     } else if (status === 2) {
//       temp = CART_ITEM_STATUS.Received;
//     } else if (status === 3) {
//       temp = CART_ITEM_STATUS.Shipped;
//     } else if (status === 4) {
//       temp = CART_ITEM_STATUS.Delivered;
//     } else if (status === 5) {
//       temp = CART_ITEM_STATUS.Cancelled;
//     } else if (status === 6) {
//       temp = CART_ITEM_STATUS.Not_processed;
//     } else {
//       return res.json({ error: "Order status not found !" });
//     }
//     const updateOrderStatus = await Order.findByIdAndUpdate(
//       { _id: id },
//       {
//         orderStatus: temp,
//         paymentIntent: {
//           status: temp,
//         },
//       },
//       { new: true }
//     );
//     res.json(updateOrderStatus);
//   } catch (error) {
//     console.log(error);
//     throw new Error(error);
//   }
// });

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    let temp = parseInt(status);
    if (status === 1) {
      temp = CART_ITEM_STATUS.Processing;
    } else if (status === 2) {
      temp = CART_ITEM_STATUS.Received;
    } else if (status === 3) {
      temp = CART_ITEM_STATUS.Shipped;
    } else if (status === 4) {
      temp = CART_ITEM_STATUS.Delivered;
    } else if (status === 5) {
      temp = CART_ITEM_STATUS.Cancelled;
    } else if (status === 6) {
      temp = CART_ITEM_STATUS.Not_processed;
    } else {
      return res.json({ error: "Order status not found!" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      { _id: id },
      {
        orderStatus: temp,
        paymentIntent: {
          status: temp,
        },
      },
      { new: true }
    );

    if (temp === CART_ITEM_STATUS.Delivered) {
      const products = updatedOrder.products;
      for (const product of products) {
        const updatedProduct = await Product.findById(product.product);
        if (updatedProduct.quantity <= 0) {
          throw new Error("Sản phẩm đã hết hàng.");
        }
        const newQuantity = updatedProduct.quantity - 1;
        const newSold = updatedProduct.sold + 1;
        if (newQuantity < 0) {
          throw new Error("Không đủ số lượng sản phẩm.");
        }
        await Product.findByIdAndUpdate(product.product, {
          quantity: newQuantity,
          sold: newSold,
        });
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const findOrderUser = asyncHandler(async (req, res) => {
  try {
    Order.find({ orderby: req.body.iduser })
      .then((response) => {
        res.json(response);
      })
      .catch((error) => {
        console.log(error);
      });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getallUser,
  getaUser,
  deleteaUser,
  updatedUser,
  blockUser,
  blockUserEmail,
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
  getOrderByUserId,
  editUser,
  findAUser,
  findOrderUser,
  deleteOrder,
  updateOrderCancel,
};
