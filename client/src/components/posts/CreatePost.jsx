import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import AutoStoriesRoundedIcon from "@mui/icons-material/AutoStoriesRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EmojiEmotionsRoundedIcon from "@mui/icons-material/EmojiEmotionsRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

function initial(user) {
  return (
    user?.fullName?.charAt(0)?.toUpperCase() ||
    user?.username?.charAt(0)?.toUpperCase() ||
    "U"
  );
}

const privacyOptions = [
  {
    value: "public",
    label: "Công khai",
    helper: "Ai cũng có thể xem",
    icon: <PublicRoundedIcon fontSize="small" />,
  },
  {
    value: "friends",
    label: "Bạn bè",
    helper: "Bạn bè của bạn có thể xem",
    icon: <PeopleAltRoundedIcon fontSize="small" />,
  },
  {
    value: "private",
    label: "Chỉ mình tôi",
    helper: "Chỉ bạn có thể xem",
    icon: <LockRoundedIcon fontSize="small" />,
  },
];

function SettingRow({
  icon,
  title,
  subtitle,
  disabled = false,
  trailing = "chevron",
  onClick,
}) {
  return (
    <button
      className={`grid w-full grid-cols-[48px_1fr_auto] items-center gap-4 rounded-lg border-0 bg-transparent px-0 py-3 text-left ${
        disabled
          ? "cursor-not-allowed text-[#a8adb5]"
          : "cursor-pointer text-[#050505] hover:bg-[#f2f3f5]"
      }`}
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span
        className={`grid h-12 w-12 place-items-center rounded-full ${disabled ? "bg-[#e4e6eb] text-[#a8adb5]" : "bg-[#e4e6eb] text-[#050505]"}`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <strong className="block text-[20px] leading-6">{title}</strong>
        <span className="mt-0.5 block text-[16px] leading-5 text-[#65676b]">
          {subtitle}
        </span>
      </span>
      {trailing === "switch" ? (
        <Switch checked={false} disabled />
      ) : (
        <ChevronRightRoundedIcon
          className={disabled ? "!text-[#a8adb5]" : "!text-[#050505]"}
        />
      )}
    </button>
  );
}

function CreatePost({ user, onCreate, busy = false }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("compose");
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState("friends");
  const [privacyAnchor, setPrivacyAnchor] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const displayName = user?.fullName || user?.username || "Bạn";
  const promptText = `${displayName} ơi, bạn đang nghĩ gì thế?`;
  const selectedPrivacy =
    privacyOptions.find((option) => option.value === privacy) ||
    privacyOptions[1];
  const canSubmit = content.trim().length > 0 || files.length > 0;
  const previews = useMemo(
    () =>
      files.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      })),
    [files],
  );
  const firstPreview = previews[0];

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function resetComposer() {
    setStep("compose");
    setContent("");
    setPrivacy("friends");
    setPrivacyAnchor(null);
    setFiles([]);
    setError("");
  }

  function selectPrivacy(value) {
    setPrivacy(value);
    setPrivacyAnchor(null);
  }

  function closeModal() {
    if (busy) return;
    setOpen(false);
    resetComposer();
  }

  function goToSettings() {
    setError("");
    if (!canSubmit) {
      setError(
        "Cần có nội dung hoặc media để tạo post.",
      );
      return;
    }
    setStep("settings");
  }

  async function publishPost() {
    setError("");
    if (!canSubmit) {
      setError(
        "Cần có nội dung hoặc media để tạo post.",
      );
      setStep("compose");
      return;
    }

    try {
      await onCreate({ content, privacy }, files);
      setOpen(false);
      resetComposer();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không tạo được post.",
      );
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (step === "settings") {
      publishPost();
      return;
    }
    goToSettings();
  }

  const privacyMenu = (
    <Menu
      anchorEl={privacyAnchor}
      open={Boolean(privacyAnchor)}
      onClose={() => setPrivacyAnchor(null)}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      {privacyOptions.map((option) => (
        <MenuItem
          key={option.value}
          selected={privacy === option.value}
          onClick={() => selectPrivacy(option.value)}
        >
          <ListItemIcon className="!min-w-9 text-[#050505]">
            {option.icon}
          </ListItemIcon>
          <ListItemText primary={option.label} secondary={option.helper} />
        </MenuItem>
      ))}
    </Menu>
  );

  return (
    <>
      <Card className="!rounded-lg !border !border-[#dddfe2] !bg-white !shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
        <CardContent className="!p-3">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={user?.avatar || undefined} alt={displayName}>
              {initial(user)}
            </Avatar>
            <button
              className="min-h-10 flex-1 rounded-full border-0 bg-[#f0f2f5] px-4 text-left text-[17px] text-[#65676b] outline-none transition hover:bg-[#e4e6eb]"
              type="button"
              onClick={() => setOpen(true)}
            >
              {promptText}
            </button>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onClose={closeModal}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          component: "form",
          onSubmit: handleSubmit,
          className: "!m-3 !rounded-lg !shadow-[0_16px_48px_rgba(0,0,0,0.24)]",
        }}
      >
        <Box className="relative grid min-h-[72px] place-items-center px-16">
          {step === "settings" ? (
            <IconButton
              aria-label="Quay lại"
              className="!absolute !left-5 !top-4 !bg-[#e4e6eb] !text-[#606770] hover:!bg-[#d8dadf]"
              onClick={() => setStep("compose")}
              disabled={busy}
            >
              <ArrowBackRoundedIcon />
            </IconButton>
          ) : null}
          <Typography
            component="h2"
            className="!text-[24px] !font-extrabold !text-[#050505]"
          >
            {step === "settings"
              ? "Cài đặt bài viết"
              : "Tạo bài viết"}
          </Typography>
          {step === "compose" ? (
            <IconButton
              aria-label="Đóng"
              className="!absolute !right-4 !top-3 !bg-[#e4e6eb] !text-[#606770] hover:!bg-[#d8dadf]"
              onClick={closeModal}
              disabled={busy}
            >
              <CloseRoundedIcon />
            </IconButton>
          ) : null}
        </Box>
        <Divider />

        {step === "compose" ? (
          <DialogContent className="!p-5">
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={user?.avatar || undefined}
                  alt={displayName}
                  className="!h-12 !w-12"
                >
                  {initial(user)}
                </Avatar>
                <Box className="min-w-0">
                  <Typography
                    className="!font-bold !leading-5 !text-[#050505]"
                    noWrap
                  >
                    {displayName}
                  </Typography>
                  <Button
                    type="button"
                    size="small"
                    startIcon={selectedPrivacy.icon}
                    endIcon={
                      <ArrowDropDownRoundedIcon className="!-ml-2 !text-[18px]" />
                    }
                    onClick={(event) => setPrivacyAnchor(event.currentTarget)}
                    className="!mt-1 !h-6 !min-w-0 !rounded-md !bg-[#e4e6eb] !px-2 !text-[13px] !font-bold !normal-case !text-[#050505] hover:!bg-[#d8dadf] [&_.MuiButton-endIcon]:!ml-1 [&_.MuiButton-startIcon]:!mr-1"
                  >
                    {selectedPrivacy.label}
                  </Button>
                  {privacyMenu}
                </Box>
              </Stack>

              <TextField
                autoFocus
                fullWidth
                multiline
                minRows={5}
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder={promptText}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  className:
                    "!items-start !text-[28px] !leading-[1.25] !text-[#050505]",
                }}
                inputProps={{
                  className: "!p-0 placeholder:!text-[#65676b]",
                }}
              />

              {previews.length ? (
                <Box className="grid grid-cols-2 gap-2">
                  {previews.map((preview) => (
                    <Box
                      key={preview.url}
                      className="h-36 overflow-hidden rounded-lg bg-slate-100"
                    >
                      {preview.type === "video" ? (
                        <video
                          className="h-full w-full object-cover"
                          src={preview.url}
                          controls
                        />
                      ) : (
                        <img
                          className="h-full w-full object-cover"
                          src={preview.url}
                          alt=""
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              ) : null}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Tooltip title="Nền bài viết">
                  <IconButton className="!h-9 !w-9 !rounded-md !bg-[linear-gradient(135deg,#ff4fb6,#facc15,#2dd4bf,#3b82f6)] !text-white !shadow">
                    <Typography className="!text-[15px] !font-black">
                      Aa
                    </Typography>
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cảm xúc">
                  <IconButton className="!text-[#bcc0c4]">
                    <EmojiEmotionsRoundedIcon />
                  </IconButton>
                </Tooltip>
              </Stack>

              <Box className="rounded-lg border border-[#ced0d4] px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                <Stack
                  direction="row"
                  alignItems="center"
                  className="flex-wrap gap-1"
                >
                  <Typography className="min-w-0 flex-1 !font-bold !text-[#050505]">
                    Thêm vào bài viết của bạn
                  </Typography>
                  <Tooltip title="Ảnh/video">
                    <IconButton component="label" className="!text-[#45bd62]">
                      <AddPhotoAlternateRoundedIcon />
                      <input
                        hidden
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={(event) =>
                          setFiles(Array.from(event.target.files || []))
                        }
                      />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Gắn thẻ bạn bè">
                    <IconButton className="!text-[#1877f2]">
                      <PersonAddAlt1RoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Cảm xúc/hoạt động">
                    <IconButton className="!text-[#f5533d]">
                      <EmojiEmotionsRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Check in">
                    <IconButton className="!text-[#f3425f]">
                      <LocationOnRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Gọi điện">
                    <IconButton className="!text-[#1877f2]">
                      <PhoneRoundedIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Thêm">
                    <IconButton className="!text-[#65676b]">
                      <MoreHorizRoundedIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Button
                type="button"
                variant="contained"
                disabled={!canSubmit}
                onClick={goToSettings}
                className="!min-h-11 !rounded-md !bg-[#1877f2] !text-[16px] !font-bold disabled:!bg-[#e4e6eb] disabled:!text-[#bcc0c4]"
              >
                Tiếp
              </Button>
            </Stack>
          </DialogContent>
        ) : (
          <DialogContent className="!p-0">
            <Box className="px-5 py-4">
              <Typography className="!mb-2 !text-[20px] !font-bold !text-[#050505]">
                Xem trước bài viết
              </Typography>
              <Stack direction="row" spacing={1.75} alignItems="flex-start">
                {firstPreview ? (
                  <Box className="h-[120px] w-[120px] shrink-0 overflow-hidden bg-[#f0f2f5]">
                    {firstPreview.type === "video" ? (
                      <video
                        className="h-full w-full object-cover"
                        src={firstPreview.url}
                      />
                    ) : (
                      <img
                        className="h-full w-full object-cover"
                        src={firstPreview.url}
                        alt=""
                      />
                    )}
                  </Box>
                ) : (
                  <Avatar
                    src={user?.avatar || undefined}
                    alt={displayName}
                    className="!h-[76px] !w-[76px]"
                  >
                    {initial(user)}
                  </Avatar>
                )}
                <Typography className="line-clamp-4 !text-[18px] !leading-6 !text-[#050505]">
                  {content.trim() || "Nội dung bài viết"}
                </Typography>
              </Stack>
            </Box>
            <Divider />

            <Box className="px-5 py-6">
              <SettingRow
                icon={selectedPrivacy.icon}
                title="Đối tượng của bài viết"
                subtitle={selectedPrivacy.label}
                onClick={(event) => setPrivacyAnchor(event.currentTarget)}
              />
              {privacyMenu}
              <SettingRow
                icon={<ScheduleRoundedIcon />}
                title="Lựa chọn lịch đăng"
                subtitle="Đăng ngay"
              />
              <SettingRow
                icon={<GroupsRoundedIcon />}
                title="Chia sẻ lên nhóm"
                subtitle="Đặt bài viết ở chế độ công khai để chia sẻ"
                disabled
              />
              <SettingRow
                icon={<AutoStoriesRoundedIcon />}
                title="Chia sẻ lên tin"
                subtitle="Tắt"
              />
              <SettingRow
                icon={<CampaignRoundedIcon />}
                title="Quảng bá bài viết"
                subtitle="Bạn sẽ chọn phần cài đặt sau khi nhấp vào nút Đăng. Bạn chỉ có thể quảng cáo bài viết công khai."
                disabled
                trailing="switch"
              />

              {error ? (
                <Alert severity="error" className="!mt-3">
                  {error}
                </Alert>
              ) : null}

              <Stack direction="row" spacing={2} className="mt-4">
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  onClick={() => setStep("compose")}
                  disabled={busy}
                  className="!min-h-11 !rounded-md !bg-[#e4e6eb] !font-bold !text-[#050505] hover:!bg-[#d8dadf]"
                >
                  Lưu
                </Button>
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  onClick={publishPost}
                  disabled={busy || !canSubmit}
                  className="!min-h-11 !rounded-md !bg-[#1877f2] !font-bold !text-white hover:!bg-[#166fe5]"
                >
                  {busy ? "Đang đăng..." : "Đăng"}
                </Button>
              </Stack>
            </Box>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export default CreatePost;
