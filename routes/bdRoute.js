const express = require("express");
const router = express.Router();

const {
  getNumAll,
  getTotalDate,
  getWeeklyRevenue,
  getYearTotalPrice,
} = require("../controller/bdCtrl");

router.get("/", getNumAll);
router.get("/getTotalWeek", getWeeklyRevenue);
router.get("/getTotalYear", getYearTotalPrice);
router.get("/:month/:year", getTotalDate);

module.exports = router;
