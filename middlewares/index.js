const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();
const {APP_SECRET} =process.env

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: "posts",
  allowedFormats: ["jpg", "png","pdf"],
});

const parser1 = multer({ storage: storage }).single("avatar");
const parser = multer({ storage: storage }).fields([ // Use .fields instead of .single
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 } // Optional, maxCount: 1 means only 1 file allowed per field
]);
// console.log(parser);
exports.parser = parser;
exports.parser1 = parser1;
exports.requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, APP_SECRET);
    req.user = user;
  } else {
    return res.status(400).json({ message: "Authorization required" });
  }
  next();
  //jwt.decode()
};

exports.userMiddleware = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(400).json({ message: "User access denied" });
  }
  next();
};

exports.adminMiddleware = (req, res, next) => {
  console.log(req.user)
  if (req.user.role !== "admin") {
      return res.status(400).json({ message: "Admin access denied" });
  }
  next();
};
exports.superAdminMiddleware = (req, res, next) => {
  if (req.user.data.role !== "super-admin") {
    return res.status(200).json({ message: "Super Admin access denied" });
  }
  next();
};