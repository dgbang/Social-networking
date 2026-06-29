export function getApiError(error) {
  return {
    message: error.response?.data?.message || "Request failed",
    code: error.response?.data?.error?.code || "REQUEST_ERROR"
  };
}
