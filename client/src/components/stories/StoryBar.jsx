import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Alert, Avatar, Box, ButtonBase, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { createStory, deleteStory, getStoryFeed, markStoryViewed } from "../../api/storyApi.js";
import { StoryTilesSkeleton } from "../Common/Skeletons.jsx";
import CreateStoryModal from "./CreateStoryModal.jsx";
import StoryViewer from "./StoryViewer.jsx";

const storyTileClass =
  "relative grid min-h-[168px] w-28 min-w-28 content-start overflow-hidden rounded-lg text-left text-white shadow-[0_1px_2px_rgba(0,0,0,0.18)]";
const storyTileBgClass =
  "relative h-[168px] w-full overflow-hidden rounded-lg bg-[linear-gradient(145deg,#dbeafe,#1877f2)] after:absolute after:inset-0 after:bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.58))] after:content-[''] [&_img]:block [&_img]:h-full [&_img]:w-full [&_img]:object-cover [&_video]:block [&_video]:h-full [&_video]:w-full [&_video]:object-cover";
const storyNameClass =
  "absolute bottom-2.5 left-2.5 right-2.5 z-[2] !text-[13px] !font-extrabold !leading-tight !text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]";

function StoryBar({ user }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewerGroup, setViewerGroup] = useState(null);
  const [error, setError] = useState("");

  async function loadStories() {
    setLoading(true);
    setError("");
    try {
      const nextGroups = await getStoryFeed({ limit: 30 });
      setGroups(nextGroups);
    } catch (err) {
      setError(err.response?.data?.message || "Khong tai duoc stories.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  async function handleCreate(file, payload) {
    setCreating(true);
    try {
      await createStory(file, payload);
      await loadStories();
    } finally {
      setCreating(false);
    }
  }

  async function handleViewed(storyId) {
    try {
      await markStoryViewed(storyId);
      setGroups((items) =>
        items.map((group) => ({
          ...group,
          unviewedCount: Math.max(0, group.unviewedCount - (group.stories.some((story) => story.id === storyId && !story.viewed) ? 1 : 0)),
          stories: group.stories.map((story) => (story.id === storyId ? { ...story, viewed: true } : story))
        }))
      );
    } catch (err) {
      setError(err.response?.data?.message || "Khong cap nhat duoc trang thai story.");
    }
  }

  async function handleDelete(storyId) {
    try {
      await deleteStory(storyId);
      const nextGroups = groups
        .map((group) => ({ ...group, stories: group.stories.filter((story) => story.id !== storyId) }))
        .filter((group) => group.stories.length > 0);
      setGroups(nextGroups);
      const nextViewerGroup = nextGroups.find((group) => group.user.id === viewerGroup?.user?.id);
      setViewerGroup(nextViewerGroup || null);
    } catch (err) {
      setError(err.response?.data?.message || "Khong xoa duoc story.");
    }
  }

  return (
    <Paper className="overflow-hidden rounded-lg border border-[#dddfe2] !bg-white p-3 !shadow-[0_1px_2px_rgba(0,0,0,0.08)]" elevation={0}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" className="mb-3">
        <Box>
          <Typography variant="h6">Stories</Typography>
          <Typography variant="body2" color="text.secondary">Khoanh khac 24h cua ban va ban be</Typography>
        </Box>
      </Stack>

      {error ? <Alert severity="error" className="mb-3">{error}</Alert> : null}

      <Box className="grid auto-cols-[112px] grid-flow-col gap-2.5 overflow-x-auto pb-1 [overscroll-behavior-x:contain] [scrollbar-width:thin]">
        <ButtonBase className={storyTileClass} onClick={() => setCreateOpen(true)}>
          <Box className={`${storyTileBgClass} grid place-items-center bg-[radial-gradient(circle_at_top,rgba(24,119,242,0.16),transparent_34%),linear-gradient(145deg,#ffffff,#dbeafe)]`}>
            <Avatar src={user?.avatar || undefined} className="!absolute !left-2.5 !top-2.5 z-[1] !h-[38px] !w-[38px] !border-[3px] !border-white !shadow-[0_8px_18px_rgba(15,23,42,0.22)]">
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </Avatar>
            <Box className="absolute bottom-[34px] right-3 z-[2] grid h-[34px] w-[34px] place-items-center rounded-full border-[3px] border-white bg-[#1877f2] text-white">
              <AddRoundedIcon fontSize="small" />
            </Box>
          </Box>
          <Typography className={storyNameClass}>Create story</Typography>
        </ButtonBase>

        {loading ? <StoryTilesSkeleton /> : null}

        {!loading && groups.length === 0 ? (
          <Box className="grid min-w-[220px] content-center rounded-lg border border-dashed border-[rgba(24,119,242,0.28)] bg-[rgba(239,246,255,0.74)] p-4">
            <Typography variant="subtitle2">Chua co story nao.</Typography>
            <Typography variant="body2" color="text.secondary">Dang story dau tien de lam feed song dong hon.</Typography>
          </Box>
        ) : null}

        {groups.map((group) => {
          const firstStory = group.stories[0];
          const hasUnviewed = group.unviewedCount > 0;
          return (
            <ButtonBase
              key={group.user.id}
              className={storyTileClass}
              onClick={() => setViewerGroup(group)}
            >
              <Box className={storyTileBgClass}>
                {firstStory?.mediaType === "video" ? (
                  <video src={firstStory.media} muted />
                ) : (
                  <img src={firstStory?.media || group.user.avatar || ""} alt="" />
                )}
                <Avatar
                  src={group.user.avatar || undefined}
                  className={`!absolute !left-2.5 !top-2.5 z-[1] !h-[38px] !w-[38px] !border-[3px] !border-white !shadow-[0_8px_18px_rgba(15,23,42,0.22)] ${
                    hasUnviewed ? "!outline !outline-3 !outline-offset-2 !outline-[#1877f2]" : "!outline !outline-3 !outline-offset-2 !outline-slate-400/70"
                  }`}
                >
                  {group.user.fullName?.charAt(0).toUpperCase() || group.user.username?.charAt(0).toUpperCase() || "U"}
                </Avatar>
              </Box>
              <Typography className={storyNameClass} title={group.user.fullName || group.user.username}>
                {group.user.fullName || group.user.username}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      <CreateStoryModal open={createOpen} user={user} busy={creating} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
      {viewerGroup ? (
        <StoryViewer
          group={viewerGroup}
          currentUser={user}
          onClose={() => setViewerGroup(null)}
          onViewed={handleViewed}
          onDelete={handleDelete}
        />
      ) : null}
    </Paper>
  );
}

export default StoryBar;
