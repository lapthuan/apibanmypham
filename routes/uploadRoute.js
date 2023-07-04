const express = require("express");
const {
  uploadImages,
  deleteImages,
  deleteUpImages,
  deleteImagesBrand
} = require("../controller/uploadCtrl");
const { isAdmin, authMiddleware } = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImage");
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  isAdmin,
  uploadPhoto.array("images", 10),
  productImgResize,
  uploadImages
);

// router.delete("/delete-img/:id/:public_id/:id_images", deleteImages);
// router.delete("/delete-img/:id", authMiddleware, isAdmin, deleteImages);
// router.delete("/delete-img/:id", deleteImages);
router.delete("/delete-img-db/:id", deleteImages);
router.delete("/delete-img-brand/:id", deleteImagesBrand);
router.delete("/delete-img-up/:id", deleteUpImages);

module.exports = router;
