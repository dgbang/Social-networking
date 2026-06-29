import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getPost } from "../../api/postApi.js";
import { PostDetailModalSkeleton } from "../Common/Skeletons.jsx";
import PostCard from "./PostCard.jsx";

function MediaItem({ item }) {
  const mediaClassName =
    "block !h-full !w-full !object-contain !object-center";

  if (item.type === "video") {
    return (
      <video
        className={mediaClassName}
        src={item.url}
        controls
        preload="metadata"
      />
    );
  }

  return (
    <img
      className={mediaClassName}
      src={item.url}
      alt=""
    />
  );
}

function DetailMedia({ media = [], fallbackName = "User" }) {
  if (!media.length) {
    return (
      <Box className="grid h-full place-items-center bg-[#111827] px-8 text-center text-white">
        <Typography className="!text-[22px] !font-bold">
          {fallbackName}
        </Typography>
      </Box>
    );
  }

  if (media.length === 1) {
    return (
      <Box className="relative h-full w-full overflow-hidden bg-black">
        <Box className="h-full w-full overflow-hidden">
          <MediaItem item={media[0]} />
        </Box>
      </Box>
    );
  }

  return (
    <Box className="grid h-full grid-cols-2 gap-0.5 bg-black">
      {media.slice(0, 4).map((item, index) => (
        <Box
          className="relative min-h-0 min-w-0 overflow-hidden bg-black"
          key={item.publicId || item.url || index}
        >
          <Box className="absolute inset-0 overflow-hidden">
            <MediaItem item={item} />
          </Box>
          {index === 3 && media.length > 4 ? (
            <span className="absolute inset-0 grid place-items-center bg-[rgba(0,0,0,0.56)] text-[28px] font-black text-white">
              +{media.length - 4}
            </span>
          ) : null}
        </Box>
      ))}
    </Box>
  );
}

function PostDetailModal({
  postId,
  currentUser,
  onClose,
  onChanged,
  onDeleted,
  onShare,
}) {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getPost(postId)
      .then((result) => {
        if (active) setPost(result);
      })
      .catch((err) => {
        if (active)
          setError(err.response?.data?.message || "Không tải được bài viết.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [postId]);

  function handleChanged(nextPost) {
    setPost(nextPost);
    onChanged?.(nextPost);
  }

  function handleDeleted(id) {
    onDeleted?.(id);
    onClose();
  }

  return (
    <Dialog
      open={Boolean(postId)}
      onClose={onClose}
      maxWidth={false}
      sx={{
        "& .MuiDialog-paper": {
          height: "70vh",
          maxHeight: "70vh",
          maxWidth: "70vw",
          width: "70vw",
        },
      }}
      PaperProps={{
        className: "!m-3 !overflow-hidden !rounded-lg",
        sx: {
          height: "70vh !important",
          maxHeight: "70vh !important",
          maxWidth: "70vw !important",
          width: "70vw !important",
        },
      }}
    >
      <DialogContent className="!h-full !overflow-hidden !bg-[#f0f2f5] !p-0">
        {loading ? <PostDetailModalSkeleton /> : null}
        {error ? (
          <Alert severity="error" className="!m-4">
            {error}
          </Alert>
        ) : null}
        {!loading && !error && post ? (
          <Box
            className="grid h-full min-h-0"
            sx={{
              gridTemplateColumns: "minmax(0, 1fr) clamp(360px, 32%, 430px)",
              gridTemplateRows: "minmax(0, 1fr)",
              "@media (max-width: 820px)": {
                gridTemplateColumns: "minmax(0, 1fr)",
                gridTemplateRows: "minmax(0, 58%) minmax(0, 42%)",
              },
            }}
          >
            <Box
              className="h-full min-h-0 min-w-0 overflow-hidden bg-black"
            >
              <DetailMedia
                media={post.media}
                fallbackName={post.author?.fullName || "User"}
              />
            </Box>
            <Box className="flex min-h-0 flex-col bg-[#f0f2f5]">
              <Box className="relative grid h-16 shrink-0 place-items-center border-b border-[#e4e6eb] bg-white px-16">
                <Typography
                  component="h2"
                  className="!text-[22px] !font-extrabold !text-[#050505]"
                >
                  Chi tiết bài viết
                </Typography>
                <IconButton
                  aria-label="Đóng"
                  className="!absolute !right-4 !top-3 !bg-[#e4e6eb] !text-[#606770] hover:!bg-[#d8dadf]"
                  onClick={onClose}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Box>
              <Box className="min-h-0 flex-1 overflow-y-auto p-3">
                <PostCard
                  post={post}
                  currentUser={currentUser}
                  onChanged={handleChanged}
                  onDeleted={handleDeleted}
                  onShare={onShare}
                  defaultCommentsOpen
                  hideMedia
                />
              </Box>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default PostDetailModal;
