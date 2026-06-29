import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { createPost, getFeed, sharePost } from "../api/postApi.js";
import { PostCardSkeleton } from "../components/Common/Skeletons.jsx";
import CreatePost from "../components/posts/CreatePost.jsx";
import PostCard from "../components/posts/PostCard.jsx";
import PostDetailModal from "../components/posts/PostDetailModal.jsx";
import ShareModal from "../components/posts/ShareModal.jsx";
import StoryBar from "../components/stories/StoryBar.jsx";

const sidebarItems = [
  { label: "Friends", to: "/friends", icon: <PeopleAltRoundedIcon /> },
  { label: "Groups", href: "#groups", icon: <GroupsRoundedIcon /> },
  { label: "Marketplace", href: "#market", icon: <StorefrontRoundedIcon /> },
  { label: "Events", href: "#events", icon: <CalendarMonthRoundedIcon /> },
  { label: "Memories", href: "#memories", icon: <HistoryRoundedIcon /> },
];

function DashboardPage() {
  const user = useSelector((state) => state.auth.user);
  const displayName = user?.fullName || "John Doe";
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");
  const [shareTarget, setShareTarget] = useState(null);
  const [detailPostId, setDetailPostId] = useState(null);
  const sentinelRef = useRef(null);

  async function loadFeed(nextCursor = null, append = false) {
    setLoading(true);
    setError("");
    try {
      const result = await getFeed({
        cursor: nextCursor || undefined,
        limit: 10,
      });
      setPosts((items) =>
        append ? [...items, ...result.posts] : result.posts,
      );
      setCursor(result.nextCursor);
      setHasMore(Boolean(result.hasMore));
    } catch (err) {
      setError(err.response?.data?.message || "Khong tai duoc feed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading) return undefined;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        loadFeed(cursor, true);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [cursor, hasMore, loading]);

  async function handleCreate(payload, files) {
    setPosting(true);
    try {
      const post = await createPost(payload, files);
      setPosts((items) => [post, ...items]);
    } finally {
      setPosting(false);
    }
  }

  function updatePostInFeed(nextPost) {
    setPosts((items) =>
      items.map((item) => (item.id === nextPost.id ? nextPost : item)),
    );
  }

  function removePostFromFeed(id) {
    setPosts((items) => items.filter((item) => item.id !== id));
    setDetailPostId((currentId) => (currentId === id ? null : currentId));
  }

  async function handleShare(post, payload) {
    const shared = await sharePost(post.id, payload);
    setPosts((items) => [
      shared,
      ...items.map((item) =>
        item.id === post.id
          ? { ...item, sharesCount: (item.sharesCount || 0) + 1 }
          : item,
      ),
    ]);
  }

  return (
    <Box
      className="grid min-w-0 justify-center"
      sx={{
        alignItems: "start",
        gap: "clamp(12px, 1.5vw, 22px)",
        gridTemplateColumns: {
          xs: "minmax(0, min(680px, 100%))",
          md: "minmax(220px, clamp(220px, 24vw, 280px)) minmax(0, min(680px, 100%))",
          xl: "minmax(220px, clamp(220px, 20vw, 300px)) minmax(420px, 680px) minmax(240px, clamp(240px, 20vw, 320px))",
        },
      }}
    >
      <Paper
        className="sticky top-[74px] max-h-[calc(100dvh-92px)] self-start overflow-y-auto !bg-transparent p-2 !shadow-none max-[899px]:hidden"
        elevation={0}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.25}
          className="mb-1.5 min-h-[54px] rounded-lg p-2 hover:!bg-[#e4e6eb]"
        >
          <Avatar src={user?.avatar || undefined}>
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <Box className="min-w-0">
            <Typography variant="subtitle2" noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              View your profile
            </Typography>
          </Box>
        </Stack>
        <List disablePadding>
          {sidebarItems.map((item, index) => (
            <ListItemButton
              key={item.label}
              component={item.to ? Link : "a"}
              to={item.to}
              href={item.href}
              selected={index === 0}
              className="!min-h-12 !rounded-lg hover:!bg-[#e4e6eb] [&.Mui-selected]:!bg-[#e7f3ff]"
            >
              <ListItemIcon className="!min-w-10 text-[#1877f2]">
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Stack component="main" spacing={2} className="min-w-0">
        <StoryBar user={user} />
        <CreatePost user={user} onCreate={handleCreate} busy={posting} />
        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading && posts.length === 0
          ? [0, 1].map((item) => <PostCardSkeleton key={item} />)
          : null}
        {!loading && posts.length === 0 ? (
          <Paper className="p-6 text-center" elevation={0}>
            <Typography color="text.secondary">
              Chua co post nao trong feed.
            </Typography>
          </Paper>
        ) : null}
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            onChanged={updatePostInFeed}
            onDeleted={removePostFromFeed}
            onShare={setShareTarget}
            onOpenDetail={(target) => setDetailPostId(target.id)}
          />
        ))}
        <Box
          ref={sentinelRef}
          className="grid min-h-9 place-items-center text-sm text-slate-500"
        >
          {loading && posts.length > 0 ? (
            <Box className="w-full">
              <PostCardSkeleton mediaHeight={220} />
            </Box>
          ) : hasMore ? (
            " "
          ) : (
            "End of feed"
          )}
        </Box>
      </Stack>

      <Stack
        component="aside"
        spacing={2}
        className="sticky top-[74px] flex max-h-[calc(100dvh-92px)] self-start overflow-y-auto max-[1279px]:hidden"
      >
        <Paper
          className="!rounded-lg !bg-transparent !p-[10px_4px] !shadow-none"
          elevation={0}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            className="mb-3"
          >
            <Typography variant="h6">Sponsored</Typography>
            <Button size="small">...</Button>
          </Stack>
          <Stack direction="row" spacing={1.5}>
            <Box className="h-20 w-24 rounded-lg bg-gradient-to-br from-sky-200 to-blue-500" />
            <Box>
              <Typography variant="subtitle2">
                Facebook Stores lacilina?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The new daily add do the token and present in your blochs
                section...
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Paper
          className="!rounded-lg !bg-transparent !p-[10px_4px] !shadow-none"
          elevation={0}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            className="mb-2"
          >
            <Typography variant="h6">Contacts</Typography>
          </Stack>
          <Stack spacing={1.25}>
            {[displayName, "John Doe", "Sarah Jones", "John Doe"].map(
              (name, index) => (
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  key={`${name}-${index}`}
                >
                  <Avatar
                    src={index === 0 ? user?.avatar || undefined : undefined}
                    className="!h-9 !w-9"
                  >
                    {name.charAt(0)}
                  </Avatar>
                  <Box className="min-w-0 flex-1">
                    <Typography variant="subtitle2" noWrap>
                      {name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Online Friends
                    </Typography>
                  </Box>
                  <Box className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </Stack>
              ),
            )}
          </Stack>
        </Paper>
      </Stack>

      {shareTarget ? (
        <ShareModal
          post={shareTarget}
          onClose={() => setShareTarget(null)}
          onShare={handleShare}
        />
      ) : null}
      {detailPostId ? (
        <PostDetailModal
          postId={detailPostId}
          currentUser={user}
          onClose={() => setDetailPostId(null)}
          onChanged={updatePostInFeed}
          onDeleted={removePostFromFeed}
          onShare={setShareTarget}
        />
      ) : null}
    </Box>
  );
}

export default DashboardPage;
