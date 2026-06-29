import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import ChatBubbleRoundedIcon from "@mui/icons-material/ChatBubbleRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import {
  AppBar,
  Avatar,
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
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { searchUsers } from "../../api/userApi.js";
import { logoutUser } from "../../store/authSlice.js";

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

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

  async function handleLogout() {
    await dispatch(logoutUser());
    navigate("/login");
  }

  const navItems = [
    { label: "Home", to: "/dashboard", icon: <DashboardRoundedIcon /> },
    { label: "Friends", to: "/friends", icon: <PeopleAltRoundedIcon /> },
    { label: "Messenger", to: "/messenger", icon: <ChatBubbleRoundedIcon /> },
    { label: "Groups", to: "/friends", icon: <GroupsRoundedIcon /> },
    { label: "Market", to: "/dashboard", icon: <StorefrontRoundedIcon /> }
  ];

  return (
    <AppBar
      position="sticky"
      elevation={0}
      className="z-[1200] !border-b !border-[#dddfe2] !bg-white/95 !text-[#050505] !shadow-[0_1px_2px_rgba(0,0,0,0.08)] backdrop-blur-xl"
    >
      <Toolbar className="!grid !min-h-14 grid-cols-[auto_minmax(220px,360px)_minmax(260px,1fr)_auto] gap-3 !px-4 max-[1040px]:grid-cols-[auto_minmax(180px,1fr)_auto] max-[820px]:grid-cols-[auto_minmax(0,1fr)_auto]">
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
          <Box className="relative hidden min-w-0 flex-1 sm:block">
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
            {navItems.map((item) => (
              <Tooltip key={item.label} title={item.label}>
                <IconButton
                  component={Link}
                  to={item.to}
                  aria-label={item.label}
                  className="!h-11 !w-[min(104px,12vw)] !rounded-lg !text-[#65676b] hover:!bg-[#f0f2f5] hover:!text-[#1877f2]"
                >
                  {item.icon}
                </IconButton>
              </Tooltip>
            ))}
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
              <IconButton className="!bg-[#e4e6eb] !text-[#050505]" color="inherit" aria-label="Notifications">
                <NotificationsRoundedIcon />
              </IconButton>
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
