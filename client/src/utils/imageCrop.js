export async function cropImageFile(file, aspectRatio, outputName) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ chấp nhận tệp hình ảnh.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Hình ảnh phải có dung lượng không quá 5 MB.");
  }

  const image = await loadImage(file);
  const sourceRatio = image.width / image.height;
  let sourceWidth = image.width;
  let sourceHeight = image.height;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > aspectRatio) {
    sourceWidth = image.height * aspectRatio;
    sourceX = (image.width - sourceWidth) / 2;
  } else {
    sourceHeight = image.width / aspectRatio;
    sourceY = (image.height - sourceHeight) / 2;
  }

  const canvas = document.createElement("canvas");
  const maxWidth = aspectRatio === 1 ? 720 : 1600;
  canvas.width = maxWidth;
  canvas.height = Math.round(maxWidth / aspectRatio);
  const context = canvas.getContext("2d");
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, file.type || "image/jpeg", 0.9));
  return new File([blob], outputName || file.name, { type: blob.type || file.type });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không thể đọc tệp hình ảnh."));
    };
    image.src = url;
  });
}
