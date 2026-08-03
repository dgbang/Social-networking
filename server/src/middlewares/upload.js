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
      const error = new Error("Chỉ chấp nhận tệp hình ảnh");
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
          message: "Hình ảnh phải có dung lượng không quá 5 MB"
        });
      }

      return fail(res, req, {
        status: 400,
        code: error.code || "INVALID_UPLOAD",
        message: error.code === "INVALID_UPLOAD_TYPE" ? error.message : "Tệp tải lên không hợp lệ"
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
      const error = new Error("Chỉ chấp nhận tệp hình ảnh hoặc video");
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
          message: "Tệp đa phương tiện phải có dung lượng không quá 5 MB"
        });
      }

      if (error.code === "LIMIT_FILE_COUNT") {
        return fail(res, req, {
          status: 400,
          code: "UPLOAD_TOO_MANY_FILES",
          message: `Mỗi bài viết được chứa tối đa ${maxPostMediaFiles} tệp đa phương tiện`
        });
      }

      return fail(res, req, {
        status: 400,
        code: error.code || "INVALID_UPLOAD",
        message: error.code === "INVALID_UPLOAD_TYPE" ? error.message : "Tệp tải lên không hợp lệ"
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
