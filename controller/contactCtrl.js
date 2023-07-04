const Contact = require("../models/contactModel");
const validateMongoDbId = require("../utils/validateMongodbId");
const asynHandler = require("express-async-handler");
const User = require("../models/userModel");
const { CONTACTS_STATUS } = require("../constants");
createContact = asynHandler(async (req, res) => {
  try {
    const newContact = await Contact.create(req.body);
    res.json(newContact);
  } catch (err) {
    throw new Error(err);
  }
});

getAllContact = asynHandler(async (req, res) => {
  try {
    const Contacts = await Contact.find().sort("-created");
    res.json(Contacts);
  } catch (error) {
    throw new Error(error);
  }
});

getContactSuccess = asynHandler(async (req, res) => {
  try {
    const Contacts = await Contact.find({
      status: CONTACTS_STATUS.Completed,
    }).sort("-created");
    res.json(Contacts);
  } catch (error) {
    throw new Error(error);
  }
});

getAContact = asynHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const ContactData = await Contact.findById(id);
    return res.json(ContactData);
  } catch (error) {
    throw new Error(error);
  }
});

deleteContact = asynHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const deleteContact = await Contact.findByIdAndDelete(id);
    return res.json({ data: deleteContact, msg: "Delete success" });
  } catch (error) {
    throw new Error(error);
  }
});

updateOrderStatus = asynHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  validateMongoDbId(id);
  if (
    status == CONTACTS_STATUS.Completed ||
    status == CONTACTS_STATUS.Not_processed
  ) {
    const deleteContact = await Contact.findByIdAndDelete(id);
    return res.json({ data: deleteContact, msg: "Update success" });
  }
  try {
    const updateContactStatus = await Contact.findByIdAndUpdate(
      { _id: id },
      {
        status: status,
      },
      { new: true }
    );
    res.json(updateContactStatus);
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
});

module.exports = {
  createContact,
  getAllContact,
  deleteContact,
  getAContact,
  updateOrderStatus,
  getContactSuccess,
};
