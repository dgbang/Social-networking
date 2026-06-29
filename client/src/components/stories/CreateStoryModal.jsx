import AddPhotoAlternateRoundedIcon from "@mui/icons-material/AddPhotoAlternateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Alert, Avatar, Box, Button, Dialog, DialogContent, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useRef, useState } from "react";

function CreateStoryModal({ open, user, busy = false, onClose, onCreate }) {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const preview = useMemo(() => {
    if (!file) return null;
    return {
      url: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "video" : "image"
    };
  }, [file]);

  function reset() {
    setFile(null);
    setText("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Can chon anh hoac video de tao story.");
      return;
    }

    try {
      await onCreate(file, { text });
      reset();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khong tao duoc story.");
    }
  }

  function handleClose() {
    if (!busy) {
      reset();
      onClose();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { className: "!rounded-lg" } }}
    >
      <DialogContent className="!p-0">
        <Box component="form" onSubmit={handleSubmit} className="grid gap-4 !p-4">
          <Stack direction="row" alignItems="center" justifyContent="space-between" className="pb-1">
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <Avatar src={user?.avatar || undefined}>{user?.fullName?.charAt(0).toUpperCase() || "U"}</Avatar>
              <Box>
                <Typography variant="subtitle1" className="font-semibold">Create story</Typography>
                <Typography variant="caption" color="text.secondary">Anh/video se het han sau 24h</Typography>
              </Box>
            </Stack>
            <IconButton type="button" onClick={handleClose} disabled={busy}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Box className="relative grid min-h-[330px] place-items-center overflow-hidden rounded-lg bg-[#0f172a] text-white [&_img]:h-full [&_img]:max-h-[420px] [&_img]:w-full [&_img]:object-contain [&_video]:h-full [&_video]:max-h-[420px] [&_video]:w-full [&_video]:object-contain">
            {preview ? (
              preview.type === "video" ? (
                <video src={preview.url} controls />
              ) : (
                <img src={preview.url} alt="Story preview" />
              )
            ) : (
              <Stack alignItems="center" spacing={1.5}>
                <AddPhotoAlternateRoundedIcon fontSize="large" />
                <Typography variant="subtitle2">Chon anh hoac video</Typography>
                <Typography variant="body2" color="text.secondary">Preview se hien tai day truoc khi dang.</Typography>
              </Stack>
            )}
            {text.trim() ? (
              <Typography className="absolute bottom-5 left-5 right-5 rounded-lg bg-black/45 p-3 text-center !text-xl !font-extrabold !text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">
                {text.trim()}
              </Typography>
            ) : null}
          </Box>

          <Stack spacing={1.5}>
            <input
              ref={fileInputRef}
              hidden
              type="file"
              accept="image/*,video/*"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
            <Button type="button" variant="outlined" startIcon={<AddPhotoAlternateRoundedIcon />} onClick={() => fileInputRef.current?.click()}>
              {file ? `Da chon: ${file.name}` : "Chon media"}
            </Button>
            <TextField
              value={text}
              onChange={(event) => setText(event.target.value)}
              label="Text overlay"
              slotProps={{ htmlInput: { maxLength: 160 } }}
              helperText={`${text.length}/160`}
            />
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Button type="submit" variant="contained" size="large" disabled={busy || !file} endIcon={<SendRoundedIcon />}>
              {busy ? "Dang dang..." : "Dang story"}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default CreateStoryModal;
