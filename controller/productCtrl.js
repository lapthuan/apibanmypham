const Product = require("../models/productModel");
const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const validateMongoDbId = require("../utils/validateMongodbId");

const createProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newProduct = await Product.create(req.body);
    res.json(newProduct);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  validateMongoDbId(id);
  try {
    const product = await Product.findById(id).exec();
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    if (req.body.title && req.body.title !== product.title) {
      const existingProduct = await Product.findOne({ slug: req.body.slug });
      if (existingProduct) {
        req.body.slug = `${req.body.slug}-${Date.now()}`;
      }
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    }).exec();
    res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;


  try {
    const deleteProduct = await Product.findOneAndDelete({_id : id});
    res.json(deleteProduct);
  } catch (error) {
    throw new Error(error);
  }
});

const getaProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const pipeline = [
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $addFields: {
          ratingSum: {
            $sum: {
              $map: {
                input: "$reviews",
                as: "review",
                in: {
                  $cond: {
                    if: { $eq: ["$$review.status", "Approved"] },
                    then: "$$review.rating",
                    else: 0,
                  },
                },
              },
            },
          },
          reviewCount: {
            $size: {
              $filter: {
                input: "$reviews",
                as: "review",
                cond: { $eq: ["$$review.status", "Approved"] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          ratingAverage: {
            $cond: [
              { $gt: ["$reviewCount", 0] },
              { $divide: ["$ratingSum", "$reviewCount"] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          description: 1,
          price: 1,
          category: 1,
          brand: 1,
          quantity: 1,
          sold: 1,
          images: 1,
          color: 1,
          totalrating: "$ratingAverage",
          reviewCount: "$reviewCount",
          imagesDetail: 1,
          ratings: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];
    Product.aggregate(pipeline)
      .then((products) => {
        const filteredProduct = products.find(
          (product) => product._id.toString() === id
        );
        if (!filteredProduct) {
          // Sản phẩm không tồn tại
          res.status(404).json({ message: "Sản phẩm không tồn tại" });
        } else {
          return Product.populate(filteredProduct, [
            { path: "brand", select: "title" },
            { path: "category", select: "title" },
          ]);
        }
      })
      .then((populatedProducts) => {
        res.json(populatedProducts);
      })
      .catch((err) => {
        // Xử lý lỗi
      });
  } catch (error) {
    throw new Error(error);
  }
});

const getAllProduct = asyncHandler(async (req, res) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $addFields: {
          ratingSum: {
            $sum: {
              $map: {
                input: "$reviews",
                as: "review",
                in: {
                  $cond: {
                    if: { $eq: ["$$review.status", "Approved"] },
                    then: "$$review.rating",
                    else: 0,
                  },
                },
              },
            },
          },
          reviewCount: {
            $size: {
              $filter: {
                input: "$reviews",
                as: "review",
                cond: { $eq: ["$$review.status", "Approved"] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          ratingAverage: {
            $cond: [
              { $gt: ["$reviewCount", 0] },
              { $divide: ["$ratingSum", "$reviewCount"] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          description: 1,
          price: 1,
          category: 1,
          brand: 1,
          quantity: 1,
          sold: 1,
          images: 1,
          color: 1,
          totalrating: "$ratingAverage",
          reviewCount: "$reviewCount",
          imagesDetail: 1,
          ratings: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    Product.aggregate(pipeline)
      .then((products) => {
        const productIds = products.map((product) => product._id);

        return Product.populate(products, [
          { path: "brand", select: "title" },
          { path: "category", select: "title" },
        ]);
      })
      .then((populatedProducts) => {
        res.json(populatedProducts);
      })
      .catch((err) => {
        // Xử lý lỗi
      });

   
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    const alreadyadded = user.wishlist.find((id) => id.toString() === prodId);
    if (alreadyadded) {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $pull: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    } else {
      let user = await User.findByIdAndUpdate(
        _id,
        {
          $push: { wishlist: prodId },
        },
        {
          new: true,
        }
      );
      res.json(user);
    }
  } catch (error) {
    throw new Error(error);
  }
});

const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { star, prodId, comment } = req.body;
  try {
    const product = await Product.findById(prodId);
    let alreadyRated = product.ratings.find(
      (userId) => userId.postedby.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.comment": comment },
        },
        {
          new: true,
        }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: {
            ratings: {
              star: star,
              comment: comment,
              postedby: _id,
            },
          },
        },
        {
          new: true,
        }
      );
    }
    const getallratings = await Product.findById(prodId);
    let totalRating = getallratings.ratings.length;
    let ratingsum = getallratings.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingsum / totalRating);
    let finalproduct = await Product.findByIdAndUpdate(
      prodId,
      {
        totalrating: actualRating,
      },
      { new: true }
    );
    res.json(finalproduct);
  } catch (error) {
    throw new Error(error);
  }
});

const findProduct = asyncHandler(async (req, res) => {
  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;
  const idBrand = req.query.idBrand != "" ? JSON.parse(req.query.idBrand) : "";
  const inStock = req.query.inStock;
  const idCategory =
    req.query.idCategory != "" ? JSON.parse(req.query.idCategory) : "";

  try {
    const pipeline = [
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "product",
          as: "reviews",
        },
      },
      {
        $addFields: {
          ratingSum: {
            $sum: {
              $map: {
                input: "$reviews",
                as: "review",
                in: {
                  $cond: {
                    if: { $eq: ["$$review.status", "Approved"] },
                    then: "$$review.rating",
                    else: 0,
                  },
                },
              },
            },
          },
          reviewCount: {
            $size: {
              $filter: {
                input: "$reviews",
                as: "review",
                cond: { $eq: ["$$review.status", "Approved"] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          ratingAverage: {
            $cond: [
              { $gt: ["$reviewCount", 0] },
              { $divide: ["$ratingSum", "$reviewCount"] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          description: 1,
          price: 1,
          category: 1,
          brand: 1,
          quantity: 1,
          sold: 1,
          images: 1,
          color: 1,
          totalrating: "$ratingAverage",
          reviewCount: "$reviewCount",
          imagesDetail: 1,
          ratings: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    Product.aggregate(pipeline)
      .then((products) => {
        let filteredProduct;
        if (idBrand && !minPrice && !maxPrice && !inStock && !idCategory)
          filteredProduct = products.filter((product) =>
            idBrand.includes(product.brand.toString())
          );
        if (idBrand && !minPrice && !maxPrice && inStock && !idCategory)
          filteredProduct = products.filter((product) => {
            if (inStock == "0") {
              return (
                product.quantity == 0 &&
                idBrand.includes(product.brand.toString())
              );
            } else {
              return (
                product.quantity > 0 &&
                idBrand.includes(product.brand.toString())
              );
            }
          });
        if (!idBrand && minPrice && maxPrice && inStock && !idCategory)
          filteredProduct = products.filter((product) => {
            if (inStock == "0") {
              return (
                product.quantity == 0 &&
                product.price >= minPrice &&
                product.price <= maxPrice
              );
            } else {
              return (
                product.quantity > 0 &&
                product.price >= minPrice &&
                product.price <= maxPrice
              );
            }
          });
        if (!idBrand && minPrice && maxPrice && !inStock && !idCategory)
          filteredProduct = products.filter(
            (product) => product.price >= minPrice && product.price <= maxPrice
          );
        if (idBrand && minPrice && maxPrice && !inStock && !idCategory)
          filteredProduct = products.filter(
            (product) =>
              product.price >= minPrice &&
              product.price <= maxPrice &&
              idBrand.includes(product.brand.toString())
          );
        if (idBrand && minPrice && maxPrice && inStock && !idCategory)
          filteredProduct = products.filter((product) => {
            if (inStock == "0") {
              return (
                product.quantity == 0 &&
                product.price >= minPrice &&
                product.price <= maxPrice &&
                idBrand.includes(product.brand.toString())
              );
            } else {
              return (
                product.quantity > 0 &&
                product.price >= minPrice &&
                product.price <= maxPrice &&
                idBrand.includes(product.brand.toString())
              );
            }
          });
        if (!idBrand && !minPrice && !maxPrice && inStock && !idCategory)
          filteredProduct = products.filter((product) => {
            if (inStock == "0") {
              return product.quantity == 0;
            } else {
              return product.quantity > 0;
            }
          });
        if (idBrand && !minPrice && !maxPrice && !inStock && idCategory)
          filteredProduct = products.filter(
            (product) =>
              idBrand.includes(product.brand.toString()) &&
              idCategory.includes(product.category.toString())
          );
        if (idBrand && !minPrice && !maxPrice && inStock && idCategory)
          filteredProduct = products.filter((product) => {
            if (inStock == "0") {
              return (
                product.quantity == 0 &&
                idBrand.includes(product.brand.toString()) &&
                idCategory.includes(product.category.toString())
              );
            } else {
              return (
                product.quantity > 0 &&
                idBrand.includes(product.brand.toString()) &&
                idCategory.includes(product.category.toString())
              );
            }
          });
        if (!idBrand && minPrice && maxPrice && inStock && idCategory)
          filteredProduct = products.filter((product) => {
            if (inStock == "0") {
              return (
                product.quantity == 0 &&
                product.price >= minPrice &&
                product.price <= maxPrice &&
                idCategory.includes(product.category.toString())
              );
            } else {
              return (
                product.quantity > 0 &&
                product.price >= minPrice &&
                product.price <= maxPrice &&
                idCategory.includes(product.category.toString())
              );
            }
          });
        if (!idBrand && minPrice && maxPrice && !inStock && idCategory)
          filteredProduct = products.filter(
            (product) =>
              product.price >= minPrice &&
              product.price <= maxPrice &&
              idCategory.includes(product.category.toString())
          );
        if (idBrand && minPrice && maxPrice && !inStock && idCategory)
          filteredProduct = products.filter(
            (product) =>
              product.price >= minPrice &&
              product.price <= maxPrice &&
              idBrand.includes(product.brand.toString()) &&
              idCategory.includes(product.category.toString())
          );
        if (idBrand && minPrice && maxPrice && inStock && idCategory)
          filteredProduct = products.filter((product) => {
            if (inStock == "0") {
              return (
                product.quantity == 0 &&
                product.price >= minPrice &&
                product.price <= maxPrice &&
                idBrand.includes(product.brand.toString()) &&
                idCategory.includes(product.category.toString())
              );
            } else {
              return (
                product.quantity > 0 &&
                product.price >= minPrice &&
                product.price <= maxPrice &&
                idBrand.includes(product.brand.toString()) &&
                idCategory.includes(product.category.toString())
              );
            }
          });
        if (!idBrand && !minPrice && !maxPrice && inStock && idCategory)
          filteredProduct = products.filter((product) => {
            if (inStock == "0") {
              return (
                product.quantity == 0 &&
                idCategory.includes(product.category.toString())
              );
            } else {
              return (
                product.quantity > 0 &&
                idCategory.includes(product.category.toString())
              );
            }
          });
        if (!idBrand && !minPrice && !maxPrice && !inStock && idCategory)
          filteredProduct = products.filter((product) =>
            idCategory.includes(product.category.toString())
          );

        if (!filteredProduct) {
          // Sản phẩm không tồn tại
          res.status(404).json({ message: "Sản phẩm không tồn tại" });
        } else {
          return Product.populate(filteredProduct, [
            { path: "brand", select: "title" },
            { path: "category", select: "title" },
          ]);
        }
      })
      .then((populatedProducts) => {
        res.json(populatedProducts);
      })
      .catch((err) => {
        // Xử lý lỗi
      });
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createProduct,
  getaProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
  addToWishlist,
  rating,
  findProduct,
};
