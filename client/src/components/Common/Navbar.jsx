import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Tooltip,
  Toolbar,
  Typography
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchUsers } from "../../api/userApi.js";
import NotificationBell from "../notifications/NotificationBell.jsx";
import { createChatSocket } from "../../socket/chatSocket.js";
import { logoutUser } from "../../store/authSlice.js";
import { fetchChatUnreadCount, incrementChatUnreadCount, resetChatNotifications } from "../../store/chatNotificationsSlice.js";
import {
  fetchNotifications,
  receiveNotification,
  resetNotifications,
  setNotificationUnreadCount
} from "../../store/notificationSlice.js";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const chatUnreadCount = useSelector((state) => state.chatNotifications.unreadCount);
  const activeConversationId = useSelector((state) => state.chatNotifications.activeConversationId);
  const activeConversationRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    activeConversationRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    if (!user || query.trim().length < 2) {
      setResults([]);
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      searchUsers(query)
        .then((users) => {
          setResults(users);
          setSearchOpen(true);
        })
        .catch(() => setResults([]));
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query, user]);

  useEffect(() => {
    if (!user || !accessToken) {
      dispatch(resetChatNotifications());
      dispatch(resetNotifications());
      return undefined;
    }

    dispatch(fetchChatUnreadCount());
    dispatch(fetchNotifications({ limit: 8 }));
    const socket = createChatSocket(accessToken);
    if (!socket) return undefined;

    function handleIncomingMessage({ conversationId, message }) {
      if (!conversationId || message?.senderId === user.id || activeConversationRef.current === conversationId) {
        return;
      }
      dispatch(incrementChatUnreadCount(1));
    }

    socket.on("connect", () => {
      dispatch(fetchChatUnreadCount());
      dispatch(fetchNotifications({ limit: 8 }));
    });
    socket.on("new_message", handleIncomingMessage);
    socket.on("new_reply", handleIncomingMessage);
    socket.on("new_notification", ({ notification }) => {
      dispatch(receiveNotification(notification));
    });
    socket.on("notification_count", ({ unreadCount }) => {
      dispatch(setNotificationUnreadCount(unreadCount));
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, dispatch, user]);

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate("/login");
  }

  const navItems = [
    { label: "Home", to: "/dashboard", icon: <DashboardRoundedIcon />, activePaths: ["/dashboard", "/post"] },
    { label: "Friends", to: "/friends", icon: <PeopleAltRoundedIcon />, activePaths: ["/friends"] },
    { label: "Messenger", to: "/messenger", icon: <ChatBubbleRoundedIcon />, activePaths: ["/messenger"] },
    { label: "Groups", to: "/friends", icon: <GroupsRoundedIcon />, activePaths: [] },
    { label: "Market", to: "/dashboard", icon: <StorefrontRoundedIcon />, activePaths: [] }
  ];

  function isActive(item) {
    return item.activePaths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="z-[1200] !border-b !border-[#dddfe2] !bg-white/95 !text-[#050505] !shadow-[0_1px_2px_rgba(0,0,0,0.08)] backdrop-blur-xl"
    >
      <Toolbar
        className="!grid !min-h-14 gap-3 !px-4"
        sx={{
          gridTemplateColumns: "auto minmax(220px,360px) minmax(260px,1fr) auto",
          "@media (max-width: 1279.95px)": {
            gridTemplateColumns: "auto auto minmax(260px,1fr) auto"
          },
          "@media (max-width: 1040px)": {
            gridTemplateColumns: "auto auto minmax(0,1fr)"
          },
          "@media (max-width: 639.95px)": {
            gridTemplateColumns: "auto minmax(0,1fr)"
          }
        }}
      >
        <Button
          component={Link}
          to={user ? "/dashboard" : "/login"}
          variant="contained"
          className="!h-[42px] !min-w-[42px] !w-[42px] !rounded-full !bg-[#1877f2] !p-0 !font-black !tracking-normal !text-white"
          aria-label="SocialConnect home"
        >
          SC
        </Button>

        {user ? (
          <Box
            className="relative hidden min-w-0 sm:flex sm:items-center"
            sx={{
              flex: "0 0 auto",
              "@media (min-width: 1280px)": {
                flex: "1 1 0%"
              }
            }}
          >
            <Tooltip title="Tim kiem">
              <IconButton
                aria-label="Tim kiem"
                className="!h-11 !w-11 !rounded-full !border !border-[#ccd0d5] !bg-white !text-[#65676b] hover:!bg-[#f0f2f5]"
                sx={{
                  display: "inline-flex",
                  "@media (min-width: 1280px)": {
                    display: "none"
                  }
                }}
              >
                <SearchRoundedIcon />
              </IconButton>
            </Tooltip>
            <TextField
              fullWidth
              size="small"
              type="search"
              placeholder="Tim kiem"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setSearchOpen(true)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  )
                }
              }}
              className="max-w-[420px] [&_.MuiOutlinedInput-root]:!rounded-full [&_.MuiOutlinedInput-root]:!bg-[#f0f2f5] [&_fieldset]:!border-0"
              sx={{
                display: "none",
                "@media (min-width: 1280px)": {
                  display: "block"
                }
              }}
            />
            {searchOpen && results.length > 0 ? (
              <Paper className="absolute left-0 top-12 z-30 w-full max-w-[420px] overflow-hidden" elevation={6}>
                <List dense disablePadding>
                  {results.map((result) => (
                    <ListItemButton
                      key={result.id}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery("");
                        navigate(`/users/${result.id}`);
                      }}
                    >
                      <Avatar src={result.avatar || undefined} className="mr-3">
                        {result.fullName?.charAt(0).toUpperCase() || "U"}
                      </Avatar>
                      <ListItemText primary={result.fullName} secondary={`@${result.username}`} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            ) : null}
          </Box>
        ) : (
          <Typography className="flex-1 font-bold">SocialConnect</Typography>
        )}

        {user ? (
          <Box component="nav" className="hidden min-w-0 justify-center gap-1.5 min-[1041px]:flex">
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Tooltip key={item.label} title={item.label}>
                  <IconButton
                    component={Link}
                    to={item.to}
                    aria-label={item.label}
                    aria-current={active ? "page" : undefined}
                    className={`!relative !h-11 !w-[min(104px,12vw)] !rounded-lg hover:!bg-[#f0f2f5] hover:!text-[#1877f2] ${
                      active ? "!bg-[#e7f3ff] !text-[#1877f2] after:absolute after:bottom-[-7px] after:h-1 after:w-10 after:rounded-full after:bg-[#1877f2] after:content-['']" : "!text-[#65676b]"
                    }`}
                  >
                    {item.label === "Messenger" ? (
                      <Badge color="error" badgeContent={chatUnreadCount} max={99} invisible={chatUnreadCount <= 0}>
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </IconButton>
                </Tooltip>
              );
            })}
          </Box>
        ) : null}

        <Box component="nav" className="ml-auto flex items-center gap-1">
          {user ? (
            <>
              <Button
                component={Link}
                to="/profile"
                color="inherit"
                startIcon={
                  <Avatar src={user.avatar || undefined} className="!h-7 !w-7">
                    {user.fullName?.charAt(0).toUpperCase()}
                  </Avatar>
                }
                className="!hidden !rounded-full !bg-[#f0f2f5] !text-[#050505] !normal-case md:!inline-flex"
              >
                {user.fullName}
              </Button>
              <NotificationBell />
              <IconButton className="!bg-[#e4e6eb] !text-[#050505]" color="inherit" onClick={handleLogout} aria-label="Logout">
                <LogoutRoundedIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" color="inherit" startIcon={<AccountCircleRoundedIcon />}>
                Login
              </Button>
              <Button component={Link} to="/register" color="inherit">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
