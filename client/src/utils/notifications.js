export function notificationTarget(notification) {
  if (!notification) return null;
  if (["like", "comment", "share"].includes(notification.type) && notification.referenceId) {
    return `/post/${notification.referenceId}`;
  }
  if (notification.type === "friend_request") {
    return "/friends";
  }
  if (notification.type === "friend_accept" && notification.referenceId) {
    return `/users/${notification.referenceId}`;
  }
  if (notification.type === "message" && notification.referenceId) {
    return `/messenger?conversationId=${notification.referenceId}`;
  }
  return null;
}

export function formatNotificationTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}
