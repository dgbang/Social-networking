const multer = require("multer");
const { fail } = require("../utils/response");

const maxImageSize = 5 * 1024 * 1024;
const maxPostMediaFiles = 6;

function isAllowedMedia(file) {
  return file.mimetype?.startsWith("image/") || file.mimetype?.startsWith("video/");
}

const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxImageSize
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype || !file.mimetype.startsWith("image/")) {
      const error = new Error("Only image files are allowed");
      error.code = "INVALID_UPLOAD_TYPE";
      return cb(error);
    }
    return cb(null, true);
  }
});

function handleUpload(fieldName) {
  return (req, res, next) => {
    uploader.single(fieldName)(req, res, (error) => {
      if (!error) return next();

      if (error.code === "LIMIT_FILE_SIZE") {
        return fail(res, req, {
          status: 400,
          code: "UPLOAD_TOO_LARGE",
          message: "Image must be 5MB or smaller"
        });
      }

      return fail(res, req, {
        status: 400,
        code: error.code || "INVALID_UPLOAD",
        message: error.message || "Invalid upload"
      });
    });
  };
}

const mediaUploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxImageSize,
    files: maxPostMediaFiles
  },
  fileFilter(req, file, cb) {
    if (!isAllowedMedia(file)) {
      const error = new Error("Only image or video files are allowed");
      error.code = "INVALID_UPLOAD_TYPE";
      return cb(error);
    }
    return cb(null, true);
  }
});

function handleMediaUpload(fieldName = "media") {
  return (req, res, next) => {
    mediaUploader.array(fieldName, maxPostMediaFiles)(req, res, (error) => {
      if (!error) return next();

      if (error.code === "LIMIT_FILE_SIZE") {
        return fail(res, req, {
          status: 400,
          code: "UPLOAD_TOO_LARGE",
          message: "Media must be 5MB or smaller"
        });
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return fail(res, req, {
          status: 400,
          code: "UPLOAD_TOO_MANY_FILES",
          message: `Post can include up to ${maxPostMediaFiles} media files`
        });
      }

      return fail(res, req, {
        status: 400,
        code: error.code || "INVALID_UPLOAD",
        message: error.message || "Invalid upload"
      });
    });
  };
}

module.exports = {
  handleUpload,
  handleMediaUpload,
  maxPostMediaFiles,
  maxImageSize
};
