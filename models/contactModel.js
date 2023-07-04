const Mongoose = require("mongoose");
const { Schema } = Mongoose;
const { CONTACTS_STATUS } = require("../constants/index");
// Contact Schema
const ContactSchema = new Schema({
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    default: CONTACTS_STATUS.Pending,
    enum: [
      CONTACTS_STATUS.Pending,
      CONTACTS_STATUS.Contacted,
      CONTACTS_STATUS.InProgress,
      CONTACTS_STATUS.Completed,
    ],
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Mongoose.model("Contact", ContactSchema);
