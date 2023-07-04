const express = require("express");
const { newTestController } = require("../controller/testCtrl");
const router = express.Router();

router.post("/", newTestController);

// router.put("/:id", updateCategory);
// router.delete("/:id", deleteCategory);
// router.get("/:id", getCategory);
// router.get("/", getallCategory);

module.exports = router;
