const fs = require("fs");
const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const Brand = require("../models/brandModel");

const {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
} = require("../utils/cloudinary");
const validateMongoDbId = require("../utils/validateMongodbId");

const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = (path) => cloudinaryUploadImg(path, "images");
    const urls = [];
    const files = req.files;
    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      console.log(newpath);
      urls.push(newpath);
      fs.unlinkSync(path);
    }
    const images = urls.map((file) => {
      return file;
    });
    res.json(images);
  } catch (error) {
    console.log(error);

    throw new Error(error);
  }
});

const deleteUpImages = asyncHandler(async (req, res) => {
  const { public_id } = req.params;
  try {
    const deleted = await cloudinaryDeleteImg(public_id, "images");
    res.json({ msg: "Delete images successfully" });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

const deleteImages = asyncHandler(async (req, res) => {
  const public_id = req.params;
  const { id_images, id } = req.body;
  validateMongoDbId(id);
  try {
    await Product.findByIdAndUpdate(
      id,
      { $pull: { images: { _id: id_images } } },
      { new: true }
    )
      .then((updatedProduct) => {
        if (updatedProduct) {
          res.json(updatedProduct);
        } else {
          res.jon("Không tìm thấy tài liệu có ID", productId);
        }
      })
      .catch((error) => {
        res.json("Lỗi khi xóa phần tử:", error);
      });
    const deleted = await cloudinaryDeleteImg(public_id, "images");
    res.json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
const deleteImagesBrand = asyncHandler(async (req, res) => {
  const public_id = req.params;
  const { id_images, id } = req.body;
  validateMongoDbId(id);
  try {
    await Brand.findByIdAndUpdate(
      id,
      { $pull: { images: { _id: id_images } } },
      { new: true }
    )
      .then((updatedProduct) => {
        if (updatedProduct) {
          res.json(updatedProduct);
        } else {
          res.jon("Không tìm thấy tài liệu có ID", productId);
        }
      })
      .catch((error) => {
        res.json("Lỗi khi xóa phần tử:", error);
      });
    const deleted = await cloudinaryDeleteImg(public_id, "images");
    res.json({ message: "Deleted" });
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});
module.exports = {
  uploadImages,
  deleteImages,
  deleteUpImages,
  deleteImagesBrand
};
