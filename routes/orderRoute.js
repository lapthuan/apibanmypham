const express = require("express");
const { getOrderRecent, getOrderByUser } = require("../controller/orderCtrl");
const router = express.Router();

router.get("/recent", getOrderRecent);
router.get("/getOrder/:id", getOrderByUser);

module.exports = router;
