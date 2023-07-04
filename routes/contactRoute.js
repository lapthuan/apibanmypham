const express = require("express");

const {
  createContact,
  getAllContact,
  deleteContact,
  getAContact,
  updateOrderStatus,
  getContactSuccess,
} = require("../controller/contactCtrl");
const router = express.Router();

router.get("/:id", getAContact);
router.get("/contactSucc", getContactSuccess);
router.put("/:id", updateOrderStatus);
router.get("/", getAllContact);
router.post("/", createContact);
router.delete("/:id", deleteContact);

module.exports = router;
