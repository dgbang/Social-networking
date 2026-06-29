const { v2: cloudinary } = require("cloudinary");
const env = require("../config/env");

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  timeout: env.cloudinary.uploadTimeoutMs
});

function createUploadError(error) {
  const isTimeout = error?.name === "TimeoutError" || error?.http_code === 499 || /timeout/i.test(error?.message || "");
  const uploadError = new Error(
    isTimeout
      ? "Media upload timed out. Please try a smaller file or try again later."
      : error?.message || "Media upload failed"
  );

  uploadError.status = isTimeout ? 503 : 502;
  uploadError.code = isTimeout ? "MEDIA_UPLOAD_TIMEOUT" : "MEDIA_UPLOAD_FAILED";
  uploadError.cause = error;
  return uploadError;
}

function ensureCloudinaryConfigured() {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    const error = new Error("Cloudinary is not configured");
    error.status = 503;
    error.code = "CLOUDINARY_NOT_CONFIGURED";
    throw error;
  }
}

function uploadBuffer(file, folderName, resourceType = "image") {
  ensureCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.cloudinary.folder}/${folderName}`,
        resource_type: resourceType,
        timeout: env.cloudinary.uploadTimeoutMs
      },
      (error, result) => {
        if (error) {
          return reject(createUploadError(error));
        }
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type || resourceType
        });
      }
    );

    stream.end(file.buffer);
  });
}

async function deleteByPublicId(publicId) {
  if (!publicId) return;
  ensureCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
}

async function deleteMedia(media = []) {
  if (!Array.isArray(media) || media.length === 0) return;
  await Promise.allSettled(
    media
      .filter((item) => item?.publicId)
      .map((item) =>
        cloudinary.uploader.destroy(item.publicId, {
          resource_type: item.type === "video" ? "video" : "image"
        })
      )
  );
}

module.exports = {
  uploadBuffer,
  deleteByPublicId,
  deleteMedia
};
