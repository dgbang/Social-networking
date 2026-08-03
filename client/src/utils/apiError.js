export function getApiError(error) {
  return {
    message: error.response?.data?.message || "Yêu cầu thất bại.",
    code: error.response?.data?.error?.code || "REQUEST_ERROR"
  };
}
