const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const Test = require("../models/testModel");

const newTestController = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newTestController = await Test.create(req.body);
    res.json(newTestController);
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  newTestController,
};
