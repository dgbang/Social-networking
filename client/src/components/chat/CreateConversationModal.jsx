import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Alert, Avatar, Box, Button, Checkbox, Dialog, DialogContent, FormControlLabel, IconButton, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getFriends } from "../../api/friendApi.js";

function CreateConversationModal({ open, busy = false, onClose, onCreate }) {
  const [type, setType] = useState("private");
  const [name, setName] = useState("");
  const [friends, setFriends] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    getFriends().then(setFriends).catch(() => setFriends([]));
  }, [open]);

  function toggle(id) {
    setSelected((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    if (type === "private" && selected.length !== 1) {
      setError("Private chat can chon dung 1 nguoi ban.");
      return;
    }
    if (type === "group" && (selected.length < 2 || !name.trim())) {
      setError("Group chat can ten nhom va it nhat 2 thanh vien.");
      return;
    }
    try {
      await onCreate({ type, name, memberIds: selected });
      setSelected([]);
      setName("");
      setType("private");
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Khong tao duoc conversation.");
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent className="space-y-4">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6">New chat</Typography>
              <Typography variant="body2" color="text.secondary">Chon ban be de bat dau conversation.</Typography>
            </Box>
            <IconButton type="button" onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <RadioGroup row value={type} onChange={(event) => setType(event.target.value)}>
            <FormControlLabel value="private" control={<Radio />} label="Private" />
            <FormControlLabel value="group" control={<Radio />} label="Group" />
          </RadioGroup>

          {type === "group" ? (
            <TextField value={name} onChange={(event) => setName(event.target.value)} label="Group name" fullWidth />
          ) : null}

          <Box className="grid max-h-[280px] overflow-y-auto rounded-lg border border-slate-200 p-2">
            {friends.map((friend) => (
              <FormControlLabel
                key={friend.id}
                control={<Checkbox checked={selected.includes(friend.id)} onChange={() => toggle(friend.id)} />}
                label={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar src={friend.avatar || undefined} className="!h-[30px] !w-[30px]">
                      {friend.fullName?.charAt(0).toUpperCase() || "U"}
                    </Avatar>
                    <span>{friend.fullName || friend.username}</span>
                  </Stack>
                }
              />
            ))}
            {friends.length === 0 ? <Typography color="text.secondary">Chua co friends de chat.</Typography> : null}
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}
          <Button type="submit" variant="contained" disabled={busy}>
            {busy ? "Dang tao..." : "Create"}
          </Button>
        </DialogContent>
      </Box>
    </Dialog>
  );
}

export default CreateConversationModal;
