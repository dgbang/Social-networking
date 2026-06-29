import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { Avatar, Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

function timeAgo(value) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function StoryViewer({ group, initialIndex = 0, currentUser, onClose, onViewed, onDelete }) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const stories = group?.stories || [];
  const story = stories[index];
  const isOwner = story?.userId === currentUser?.id;

  const progressItems = useMemo(
    () =>
      stories.map((item, itemIndex) => ({
        id: item.id,
        value: itemIndex < index ? 100 : itemIndex === index ? progress : 0
      })),
    [stories, index, progress]
  );

  useEffect(() => {
    setIndex(initialIndex);
    setProgress(0);
  }, [group?.user?.id, initialIndex]);

  useEffect(() => {
    if (!story?.id) return undefined;
    onViewed(story.id);
    setProgress(0);
    return undefined;
  }, [story?.id]);

  useEffect(() => {
    if (!story || paused) return undefined;
    const duration = story.mediaType === "video" ? 8000 : 5000;
    const interval = window.setInterval(() => {
      setProgress((value) => {
        const next = value + 100 / (duration / 120);
        if (next >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => goNext(), 0);
          return 100;
        }
        return next;
      });
    }, 120);
    return () => window.clearInterval(interval);
  }, [story?.id, paused]);

  function goPrev() {
    if (index > 0) {
      setIndex((value) => value - 1);
      return;
    }
    onClose();
  }

  function goNext() {
    if (index < stories.length - 1) {
      setIndex((value) => value + 1);
      return;
    }
    onClose();
  }

  if (!story) return null;

  return (
    <Box
      className="fixed inset-0 z-[1500] grid place-items-center bg-black/90 p-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <Box className="relative flex h-[min(92vh,760px)] w-[min(430px,100%)] flex-col overflow-hidden rounded-lg bg-[#111827] text-white shadow-[0_24px_80px_rgba(0,0,0,0.46)]">
        <Stack direction="row" spacing={0.75} className="absolute left-3 right-3 top-3 z-[2]">
          {progressItems.map((item) => (
            <Box key={item.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
              <Box className="h-full rounded-full bg-white transition-[width] duration-100 ease-linear" style={{ width: `${item.value}%` }} />
            </Box>
          ))}
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" className="absolute left-0 right-0 top-0 z-[2] bg-[linear-gradient(180deg,rgba(0,0,0,0.62),transparent)] p-4 pt-7 text-white">
          <Stack direction="row" alignItems="center" spacing={1.2} className="min-w-0">
            <Avatar src={group.user?.avatar || undefined}>{group.user?.fullName?.charAt(0).toUpperCase() || "U"}</Avatar>
            <Box className="min-w-0">
              <Typography variant="subtitle2" noWrap>{group.user?.fullName || group.user?.username || "User"}</Typography>
              <Typography variant="caption">{timeAgo(story.createdAt)}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5}>
            {isOwner ? (
              <IconButton color="inherit" onClick={() => onDelete(story.id)}>
                <DeleteOutlineRoundedIcon />
              </IconButton>
            ) : null}
            <IconButton color="inherit" onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box className="grid h-full place-items-center bg-black [&_img]:max-h-full [&_img]:w-full [&_img]:object-contain [&_video]:max-h-full [&_video]:w-full [&_video]:object-contain">
          {story.mediaType === "video" ? (
            <video src={story.media} controls autoPlay muted={false} />
          ) : (
            <img src={story.media} alt={story.text || "Story"} />
          )}
          {story.text ? (
            <Typography className="absolute bottom-[76px] left-5 right-5 rounded-lg bg-black/45 p-3 text-center !text-xl !font-extrabold !text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">
              {story.text}
            </Typography>
          ) : null}
        </Box>

        <IconButton className="!absolute !left-3 !top-1/2 !z-[2] !-translate-y-1/2 !bg-white/18 !text-white backdrop-blur hover:!bg-white/28" onClick={goPrev}>
          <ChevronLeftRoundedIcon />
        </IconButton>
        <IconButton className="!absolute !right-3 !top-1/2 !z-[2] !-translate-y-1/2 !bg-white/18 !text-white backdrop-blur hover:!bg-white/28" onClick={goNext}>
          <ChevronRightRoundedIcon />
        </IconButton>

        {isOwner && story.viewsCount !== undefined ? (
          <Button className="!absolute !bottom-4 !left-1/2 !z-[2] !-translate-x-1/2 !rounded-full !bg-white/18 !text-white backdrop-blur" size="small" variant="contained">
            {story.viewsCount} views
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}

export default StoryViewer;
