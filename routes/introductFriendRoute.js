const express = require("express");
const {
  addIntroduce,
  getAllIntroduce,
  getAIntroduceIsUser
} = require("../controller/introduceFriendsCtrl");
const router = express.Router();


router.post("/", addIntroduce);
router.get("/", getAllIntroduce);
router.get("/:id", getAIntroduceIsUser);



module.exports = router;