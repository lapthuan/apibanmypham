const bodyParser = require("body-parser");
const express = require("express");
const dbConnect = require("./config/dbConnect");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const app = express();
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;
const authRouter = require("./routes/authRoute");
const testRouter = require("./routes/testRoute");
const productRouter = require("./routes/productRoute");
const blogRouter = require("./routes/blogRoute");
const categoryRouter = require("./routes/prodcategoryRoute");
const blogcategoryRouter = require("./routes/blogCatRoute");
const brandRouter = require("./routes/brandRoute");
const colorRouter = require("./routes/colorRoute");
const enqRouter = require("./routes/enqRoute");
const couponRouter = require("./routes/couponRoute");
const uploadRouter = require("./routes/uploadRoute");
const conversation = require("./routes/conversationRoute");
const review = require("./routes/api/reviewApi");
const message = require("./routes/messagesRoute");
const contact = require("./routes/contactRoute");
const introduce = require("./routes/introductFriendRoute");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");
const session = require("express-session");
var passport = require("passport");
const bd = require("./routes/bdRoute");
const orders = require("./routes/orderRoute");
// const passportSetup = require("./passport");
// require("./auth");

// passportSetup;

dbConnect();
app.use(morgan("dev"));
app.use(cors());

// app.use(
//   cors({
//     origin: "http://localhost:3000/",
//     methods: "GET, POST,PUT,DELETE",
//     credentials: true,
//   })
// );

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require("cookie-parser")());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use("/api/introduce", introduce);
app.use("/api/users", authRouter);
app.use("/api/review", review);
app.use("/api/product", productRouter);
app.use("/api/blog", blogRouter);
app.use("/api/category", categoryRouter);
app.use("/api/blogcategory", blogcategoryRouter);
app.use("/api/brand", brandRouter);
app.use("/api/coupon", couponRouter);
app.use("/api/color", colorRouter);
app.use("/api/enquiry", enqRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/conversation", conversation);
app.use("/api/message", message);
app.use("/api/test", testRouter);
app.use("/api/contact", contact);
app.use("/api/bd", bd);
app.use("/api/orders", orders);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running  at PORT ${PORT}`);
});
