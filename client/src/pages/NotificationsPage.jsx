import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import { Alert, Box, Button, Divider, List, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationItem from "../components/notifications/NotificationItem.jsx";
import { fetchNotifications, readAllNotifications, readNotification } from "../store/notificationSlice.js";
import { notificationTarget } from "../utils/notifications.js";

function NotificationsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, unreadCount, nextCursor, hasMore, loading, error } = useSelector((state) => state.notifications);
  const [status, setStatus] = useState("all");

  useEffect(() => {
    dispatch(fetchNotifications({ limit: 20, status }));
  }, [dispatch, status]);

  async function handleItemClick(notification) {
    if (!notification.isRead) {
      await dispatch(readNotification(notification.id));
    }
    const target = notificationTarget(notification);
    if (target) {
      navigate(target);
    }
  }

  function handleLoadMore() {
    if (!nextCursor) return;
    dispatch(fetchNotifications({ limit: 20, status, cursor: nextCursor, append: true }));
  }

  return (
    <Box className="mx-auto flex w-full max-w-[860px] flex-col gap-3 py-3">
      <Box className="flex flex-wrap items-center justify-between gap-3">
        <Box className="flex min-w-0 items-center gap-3">
          <Box className="grid h-11 w-11 place-items-center rounded-full bg-[#e7f3ff] text-[#1877f2]">
            <NotificationsRoundedIcon />
          </Box>
          <Box className="min-w-0">
            <Typography component="h1" className="!text-2xl !font-bold !tracking-normal">
              Notifications
            </Typography>
            <Typography className="!text-sm !text-[#65676b]">{unreadCount} unread</Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<DoneAllRoundedIcon />}
          disabled={unreadCount <= 0}
          onClick={() => dispatch(readAllNotifications())}
          className="!rounded-md !bg-[#1877f2] !font-semibold !normal-case"
        >
          Mark all read
        </Button>
      </Box>

      <Paper elevation={0} className="overflow-hidden !rounded-lg !border !border-[#dddfe2]">
        <Tabs
          value={status}
          onChange={(_, value) => setStatus(value)}
          variant="fullWidth"
          className="!min-h-11"
        >
          <Tab label="Tat ca" value="all" className="!min-h-11 !normal-case" />
          <Tab label="Chua doc" value="unread" className="!min-h-11 !normal-case" />
        </Tabs>
        <Divider />
        {error ? <Alert severity="error">{error}</Alert> : null}
        <List className="!flex !flex-col !gap-1 !p-2">
          {items.length > 0 ? (
            items.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onClick={handleItemClick} />
            ))
          ) : (
            <Box className="px-4 py-12 text-center">
              <Typography className="!font-semibold !text-[#65676b]">
                {loading ? "Dang tai notifications..." : "Khong co notification phu hop."}
              </Typography>
            </Box>
          )}
        </List>
        {hasMore ? (
          <Box className="border-t border-[#dddfe2] p-3">
            <Button fullWidth disabled={loading} onClick={handleLoadMore} className="!rounded-md !font-semibold !normal-case">
              Load more
            </Button>
          </Box>
        ) : null}
      </Paper>
    </Box>
  );
}

export default NotificationsPage;
