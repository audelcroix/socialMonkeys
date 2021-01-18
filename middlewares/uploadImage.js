const multer = require("multer");
const sharp = require("sharp");

const multerStorage = multer.memoryStorage({});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("The file is not an image", false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// Upload avatar
exports.uploadUserAvatar = upload.single("avatar");

// Resize avatar
exports.resizeUserAvatar = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `avatar-${req.user.id}-${Date.now()}.${"jpeg"}`;

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90, force: true })
    .toFile(`public/img/users/avatars/${req.file.filename}`);

  next();
};

// Upload an image as the post
exports.uploadImagePost = upload.single("imagePost");

// Resize a post image
exports.resizeImagePost = (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `${req.user.id}-${
    req.user.username
  }-${Date.now()}.${"jpeg"}`;

  sharp(req.file.buffer)
    //.resize(1920, 1080)
    .toFormat("jpeg")
    .jpeg({ quality: 100, force: true })
    .toFile(`public/img/users/posts/${req.file.filename}`);

  next();
};
