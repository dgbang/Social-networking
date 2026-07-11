import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import { Avatar, Box, ListItemAvatar, ListItemButton, ListItemText, Typography } from "@mui/material";
import { formatNotificationTime } from "../../utils/notifications.js";

function actorLabel(notification) {
  return notification.fromUser?.fullName || notification.fromUser?.username || "Someone";
}

function NotificationItem({ notification, dense = false, onClick }) {
  const unread = !notification.isRead;
  return (
    <ListItemButton
      alignItems="flex-start"
      onClick={() => onClick?.(notification)}
      className={`!gap-2 !rounded-md !px-3 ${unread ? "!bg-[#e7f3ff]" : "hover:!bg-[#f0f2f5]"}`}
      sx={{ minHeight: dense ? 64 : 76 }}
    >
      <ListItemAvatar className="!min-w-10">
        <Avatar src={notification.fromUser?.avatar || undefined} className="!h-10 !w-10">
          {actorLabel(notification).charAt(0).toUpperCase()}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        disableTypography
        primary={
          <Typography className="!text-sm !leading-snug !text-[#050505]">
            <Box component="span" className="font-semibold">
              {actorLabel(notification)}
            </Box>{" "}
            {notification.content}
          </Typography>
        }
        secondary={
          <Typography className={`!mt-1 !text-xs ${unread ? "!font-semibold !text-[#1877f2]" : "!text-[#65676b]"}`}>
            {formatNotificationTime(notification.createdAt)}
          </Typography>
        }
      />
      {unread ? <CircleRoundedIcon className="mt-5 !h-2.5 !w-2.5 !text-[#1877f2]" /> : null}
    </ListItemButton>
  );
}

export default NotificationItem;
