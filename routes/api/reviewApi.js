const express = require("express");
const router = express.Router();

// Bring in Models & Helpers
const Review = require("../../models/review");
const Product = require("../../models/productModel");
const { REVIEW_STATUS, MERCHANT_STATUS } = require("../../constants");

router.get("/success", async (req, res) => {
  try {
    const reviews = await Review.find({
      status: REVIEW_STATUS.Approved,
    })
      .populate("user")
      .populate("product")
      .exec();
    return res.json({ reviews });
  } catch (error) {
    return res.json(error);
  }
});

router.post("/add", async (req, res) => {
  try {
    Review.findOne({ product: req.body.product, user: req.body.user }).then(
      async (response) => {
        console.log("response :>> ", response);
        if (!response) {
          const review = new Review(req.body);
          const reviewDoc = await review.save();
          res.status(200).json({
            success: true,
            message: `Your review has been added successfully and will appear when approved!`,
            review: reviewDoc,
          });
        } else {
          res.status(200).json({
            success: false,
            message: `Đã review`,
            review: response,
          });
        }
      }
    );
  } catch (error) {
    return res.status(400).json({
      error: "Your request could not be processed. Please try again.",
      msg: error.message,
    });
  }
});

// fetch all reviews api
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const reviews = await Review.find({
      status: MERCHANT_STATUS.Waiting_Approval,
      // status: { $nin: ["Approved", "Rejected"] },
    }) // Exclude reviews with status "Approved" and "Rejected"
      .sort("-created")
      .populate({
        path: "user",
        select: "firstname lastname profilePicture",
      })
      .populate({
        path: "product",
        select: "title slug",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Review.countDocuments({
      status: { $nin: ["Approved", "Rejected"] },
    }); // Exclude count of reviews with status "Approved" and "Rejected"
    res.status(200).json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      count,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.get("/inproducs", async (req, res) => {
  try {
    const { page, limit, idproduct } = req.query;

    const reviews = await Review.find({ product: idproduct })
      .sort("-created")
      .populate({
        path: "user",
        select: "firstname lastname profilePicture",
      })
      .populate({
        path: "product",
        select: "title slug ",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Review.countDocuments({ product: idproduct });
    res.status(200).json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      count,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});
router.get("/:slug", async (req, res) => {
  try {
    const productDoc = await Product.findOne({ slug: req.params.slug });

    const hasNoBrand =
      productDoc?.brand === null || productDoc?.brand?.isActive === false;

    if (!productDoc || hasNoBrand) {
      return res.status(404).json({
        message: "No product found.",
      });
    }

    const reviews = await Review.find({
      product: productDoc._id,
      status: REVIEW_STATUS.Approved,
    })
      .populate({
        path: "user",
        select: "firstName",
      })
      .sort("-created");

    res.status(200).json({
      reviews,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const reviewId = req.params.id;
    const update = req.body;
    const query = { _id: reviewId };

    await Review.findOneAndUpdate(query, update, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "review has been updated successfully!",
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

// approve review
router.put("/approve/:reviewId", async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const query = { _id: reviewId };
    const update = {
      status: REVIEW_STATUS.Approved,
      isActive: true,
    };

    await Review.findOneAndUpdate(query, update, {
      new: true,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

// reject review
router.put("/reject/:reviewId", async (req, res) => {
  try {
    const reviewId = req.params.reviewId;

    const query = { _id: reviewId };
    const update = {
      status: REVIEW_STATUS.Rejected,
    };

    await Review.findOneAndUpdate(query, update, {
      new: true,
    });

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const review = await Review.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: `review has been deleted successfully!`,
      review,
    });
  } catch (error) {
    return res.status(400).json({
      error: "Your request could not be processed. Please try again.",
    });
  }
});

module.exports = router;
