import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  Menu,
  Snackbar,
  Tooltip,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearNotificationToast,
  fetchNotifications,
  readAllNotifications,
  readNotification
} from "../../store/notificationSlice.js";
import { notificationTarget } from "../../utils/notifications.js";
import NotificationItem from "./NotificationItem.jsx";

function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unreadCount, loading, toast } = useSelector((state) => state.notifications);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const recentItems = items.slice(0, 8);

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 8 }));
  }, [dispatch]);

  function handleOpen(event) {
    setAnchorEl(event.currentTarget);
    dispatch(fetchNotifications({ limit: 8 }));
  }

  function handleClose() {
    setAnchorEl(null);
  }

  async function handleItemClick(notification) {
    if (!notification.isRead) {
      await dispatch(readNotification(notification.id));
    }
    handleClose();
    const target = notificationTarget(notification);
    if (target) {
      navigate(target);
    }
  }

  async function handleReadAll() {
    await dispatch(readAllNotifications());
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton className="!bg-[#e4e6eb] !text-[#050505]" color="inherit" aria-label="Notifications" onClick={handleOpen}>
          <Badge color="error" badgeContent={unreadCount} max={99} invisible={unreadCount <= 0}>
            <NotificationsRoundedIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          className: "!mt-2 !w-[min(92vw,380px)] !rounded-lg !border !border-[#dddfe2] !shadow-xl"
        }}
      >
        <Box className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
          <Typography className="!text-xl !font-bold">Notifications</Typography>
          <Tooltip title="Mark all read">
            <IconButton size="small" onClick={handleReadAll} disabled={unreadCount <= 0}>
              <DoneAllRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Divider />
        <List className="max-h-[420px] overflow-y-auto !p-2">
          {recentItems.length > 0 ? (
            recentItems.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} dense onClick={handleItemClick} />
            ))
          ) : (
            <Box className="px-3 py-8 text-center">
              <Typography className="!text-sm !font-semibold !text-[#65676b]">
                {loading ? "Dang tai notifications..." : "Chua co notification nao."}
              </Typography>
            </Box>
          )}
        </List>
        <Divider />
        <Box className="p-2">
          <Button
            fullWidth
            className="!rounded-md !font-semibold !normal-case"
            onClick={() => {
              handleClose();
              navigate("/notifications");
            }}
          >
            See all notifications
          </Button>
        </Box>
      </Menu>
      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => dispatch(clearNotificationToast())}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="info" variant="filled" onClose={() => dispatch(clearNotificationToast())}>
          {toast ? `${toast.fromUser?.fullName || "Someone"} ${toast.content}` : ""}
        </Alert>
      </Snackbar>
    </>
  );
}

export default NotificationBell;
