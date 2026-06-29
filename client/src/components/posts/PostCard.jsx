import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";
import { deletePost, reactToPost, updatePost } from "../../api/postApi.js";
import CommentSection from "./CommentSection.jsx";
import PostMediaGrid from "./PostMediaGrid.jsx";

const reactions = [
  { type: "like", icon: "\u{1F44D}", label: "Thich" },
  { type: "love", icon: "\u2764\uFE0F", label: "Yeu thich" },
  { type: "haha", icon: "\u{1F606}", label: "Haha" },
  { type: "wow", icon: "\u{1F62E}", label: "Wow" },
  { type: "sad", icon: "\u{1F622}", label: "Buon" },
  { type: "angry", icon: "\u{1F621}", label: "Phan no" }
];

const reactionMap = reactions.reduce((map, reaction) => {
  map[reaction.type] = reaction;
  return map;
}, {});

const reactionToneClass = {
  like: "!text-[#1877f2]",
  love: "!text-[#f3425f]",
  haha: "!text-[#f7b928]",
  wow: "!text-[#f7b928]",
  sad: "!text-[#f7b928]",
  angry: "!text-[#e9710f]"
};

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function PostCard({ post, currentUser, onChanged, onDeleted, onShare, onOpenDetail, defaultCommentsOpen = false, hideMedia = false }) {
  const [commentsOpen, setCommentsOpen] = useState(defaultCommentsOpen);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.content || "");
  const [privacy, setPrivacy] = useState(post.privacy || "public");
  const [busy, setBusy] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const isOwner = post.userId === currentUser?.id;
  const activeReaction = post.currentReaction?.type ? reactionMap[post.currentReaction.type] : null;

  async function handleReact(type) {
    const previous = post;
    const nextReaction = previous.currentReaction?.type === type ? null : { type };
    const delta = previous.currentReaction ? (nextReaction ? 0 : -1) : 1;
    onChanged?.({ ...post, currentReaction: nextReaction, likesCount: Math.max((post.likesCount || 0) + delta, 0) });

    try {
      const result = await reactToPost(post.id, type);
      onChanged?.({ ...post, currentReaction: result.reaction, likesCount: result.likesCount });
    } catch {
      onChanged?.(previous);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    setBusy(true);

    try {
      const updated = await updatePost(post.id, { content: draft, privacy });
      onChanged?.(updated);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setMenuAnchor(null);
    if (!window.confirm("Xoa bai viet nay?")) return;
    await deletePost(post.id);
    onDeleted?.(post.id);
  }

  return (
    <Card className="overflow-hidden !rounded-lg !border !border-[#dce1e7] !bg-white !shadow-[0_1px_2px_rgba(20,32,45,0.12)]">
      <CardHeader
        className="!px-3.5 !pb-2 !pt-3 [&_.MuiAvatar-root]:!h-10 [&_.MuiAvatar-root]:!w-10 [&_.MuiCardHeader-subheader]:!text-[13px] [&_.MuiCardHeader-subheader]:!text-[#65676b] [&_.MuiCardHeader-title]:!text-[15px]"
        avatar={
          <Avatar src={post.author?.avatar || undefined} alt={post.author?.fullName || "User"}>
            {post.author?.fullName?.charAt(0).toUpperCase() || "U"}
          </Avatar>
        }
        title={
          <Link to={`/users/${post.userId}`} className="font-semibold text-[#050505]">
            {post.author?.fullName || "Unknown user"}
          </Link>
        }
        subheader={
          <Stack direction="row" spacing={0.75} alignItems="center">
            <span>{formatDate(post.createdAt)}</span>
            <PublicRoundedIcon fontSize="inherit" />
          </Stack>
        }
        action={
          <>
            <IconButton
              aria-label="Tuy chon bai viet"
              onClick={(event) => setMenuAnchor(event.currentTarget)}
              className="!h-9 !w-9 !bg-transparent !text-[#65676b] hover:!bg-[#f0f2f5]"
            >
              <MoreHorizRoundedIcon />
            </IconButton>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              {isOwner ? (
                <MenuItem
                  onClick={() => {
                    setEditing((value) => !value);
                    setMenuAnchor(null);
                  }}
                >
                  <EditRoundedIcon fontSize="small" className="mr-2" />
                  {editing ? "Dong sua" : "Sua bai viet"}
                </MenuItem>
              ) : null}
              {isOwner ? (
                <MenuItem onClick={handleDelete}>
                  <DeleteOutlineRoundedIcon fontSize="small" className="mr-2" />
                  Xoa bai viet
                </MenuItem>
              ) : null}
            </Menu>
          </>
        }
      />

      {editing ? (
        <Box component="form" onSubmit={handleSave} className="space-y-3 px-4 pb-4">
          <TextField fullWidth multiline minRows={3} value={draft} onChange={(event) => setDraft(event.target.value)} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Select size="small" value={privacy} onChange={(event) => setPrivacy(event.target.value)} className="min-w-36">
              <MenuItem value="public">Public</MenuItem>
              <MenuItem value="friends">Friends</MenuItem>
              <MenuItem value="private">Private</MenuItem>
            </Select>
            <Button type="submit" variant="contained" disabled={busy}>
              {busy ? "Dang luu..." : "Luu"}
            </Button>
          </Stack>
        </Box>
      ) : (
        <CardContent
          className={`!pt-0 !pb-0 ${onOpenDetail ? "cursor-pointer" : ""}`}
          onClick={onOpenDetail ? () => onOpenDetail(post) : undefined}
        >
          {post.content ? (
            <Typography component="p" className="whitespace-pre-wrap text-[15px] leading-6 text-[#050505]">
              {post.content}
            </Typography>
          ) : null}
        </CardContent>
      )}

      {!editing && !hideMedia ? (
        <>
          <Box className={onOpenDetail ? "cursor-pointer" : ""} onClick={onOpenDetail ? () => onOpenDetail(post) : undefined}>
            <PostMediaGrid media={post.media} />
          </Box>
          {post.originalPost ? (
            <Box className={`mx-4 mb-3 rounded-lg border border-slate-200 p-3 ${onOpenDetail ? "cursor-pointer" : ""}`} onClick={onOpenDetail ? () => onOpenDetail(post) : undefined}>
              <Typography variant="subtitle2">{post.originalPost.author?.fullName || "Original post"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {post.originalPost.content || "Bai viet co media"}
              </Typography>
              <PostMediaGrid media={post.originalPost.media} />
            </Box>
          ) : null}
        </>
      ) : null}

      <Stack direction="row" justifyContent="space-between" alignItems="center" className="mx-4 min-h-10 text-sm text-[#65676b]">
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <span className="inline-flex min-w-[58px] items-center" aria-hidden="true">
            <i className="-mr-1 grid h-[21px] w-[21px] place-items-center rounded-full border-2 border-white bg-white text-[13px] not-italic shadow-sm">{reactionMap.like.icon}</i>
            <i className="-mr-1 grid h-[21px] w-[21px] place-items-center rounded-full border-2 border-white bg-white text-[13px] not-italic shadow-sm">{reactionMap.love.icon}</i>
            <i className="-mr-1 grid h-[21px] w-[21px] place-items-center rounded-full border-2 border-white bg-white text-[13px] not-italic shadow-sm">{reactionMap.haha.icon}</i>
          </span>
          <span>{(post.likesCount || 0).toLocaleString("vi-VN")}</span>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button variant="text" size="small" onClick={onOpenDetail ? () => onOpenDetail(post) : () => setCommentsOpen((value) => !value)}>
            {(post.commentsCount || 0).toLocaleString("vi-VN")} binh luan
          </Button>
          <Button variant="text" size="small" onClick={() => onShare?.(post)}>
            {(post.sharesCount || 0).toLocaleString("vi-VN")} chia se
          </Button>
        </Stack>
      </Stack>

      <Divider className="!mx-4" />

      <CardActions className="!mx-4 !grid !grid-cols-3 !gap-1 !px-0 !py-1">
        <Box className="group/reaction relative min-w-0">
          <Button
            fullWidth
            className={`!min-h-[38px] !rounded-md !bg-white !font-bold !text-[#65676b] hover:!bg-[#f0f2f5] ${
              activeReaction ? reactionToneClass[activeReaction.type] || "!text-[#1877f2]" : ""
            }`}
            onClick={() => handleReact(activeReaction?.type || "like")}
          >
            <span className="mr-1 text-lg leading-none" aria-hidden="true">{activeReaction?.icon || reactionMap.like.icon}</span>
            {activeReaction?.label || "Thich"}
          </Button>
          <Box
            className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0 z-10 flex w-max max-w-[min(330px,82vw)] translate-y-2 scale-95 gap-1 rounded-full border border-[#ced0d4]/80 bg-white px-2 py-1.5 opacity-0 shadow-[0_8px_24px_rgba(20,32,45,0.18)] transition group-hover/reaction:pointer-events-auto group-hover/reaction:translate-y-0 group-hover/reaction:scale-100 group-hover/reaction:opacity-100 group-focus-within/reaction:pointer-events-auto group-focus-within/reaction:translate-y-0 group-focus-within/reaction:scale-100 group-focus-within/reaction:opacity-100"
            role="menu"
            aria-label="Chon cam xuc"
          >
            {reactions.map((reaction) => (
              <IconButton
                className={`!h-[39px] !min-h-[39px] !w-[39px] !bg-white !p-0 !text-[26px] hover:!-translate-y-1 hover:!scale-105 hover:!bg-[#edf5ff] ${
                  post.currentReaction?.type === reaction.type ? "!bg-[#edf5ff]" : ""
                }`}
                key={reaction.type}
                onClick={() => handleReact(reaction.type)}
                title={reaction.label}
                aria-label={reaction.label}
              >
                {reaction.icon}
              </IconButton>
            ))}
          </Box>
        </Box>
        <Button fullWidth className="!min-h-[38px] !rounded-md !bg-white !font-bold !text-[#65676b] hover:!bg-[#f0f2f5]" startIcon={<ChatBubbleOutlineRoundedIcon />} onClick={() => setCommentsOpen((value) => !value)}>
          Binh luan
        </Button>
        <Button fullWidth className="!min-h-[38px] !rounded-md !bg-white !font-bold !text-[#65676b] hover:!bg-[#f0f2f5]" startIcon={<ShareRoundedIcon />} onClick={() => onShare?.(post)}>
          Chia se
        </Button>
      </CardActions>

      {commentsOpen ? (
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onCountChange={(delta) => onChanged?.({ ...post, commentsCount: Math.max((post.commentsCount || 0) + delta, 0) })}
        />
      ) : null}
    </Card>
  );
}

export default PostCard;
