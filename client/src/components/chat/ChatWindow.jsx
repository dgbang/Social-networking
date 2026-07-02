import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import { Avatar, Box, Button, IconButton, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { ChatMessagesSkeleton } from "../Common/Skeletons.jsx";
import MessageBubble from "./MessageBubble.jsx";

function ChatWindow({
  conversation,
  currentUser,
  messages,
  hasMore,
  loading,
  typingUsers = [],
  onBack,
  onLoadMore,
  onSend,
  onReply,
  onDelete,
  onTyping,
  onStopTyping,
  onStartCall,
  replyTarget,
  onCancelReply
}) {
  const [content, setContent] = useState("");
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, conversation?.id]);

  if (!conversation) {
    return (
      <Paper className="chat-window grid h-full min-h-0 content-center justify-items-center gap-1.5 rounded-lg border border-slate-200 p-4 text-center shadow-sm" elevation={0}>
        <Typography variant="h6">Chon mot conversation de bat dau.</Typography>
        <Typography color="text.secondary">Tin nhan cua ban se hien o day.</Typography>
      </Paper>
    );
  }

  const otherMember = conversation.type === "private" ? conversation.members.find((member) => member.userId !== currentUser?.id) : null;

  function handleChange(event) {
    setContent(event.target.value);
    onTyping(conversation.id);
    window.clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => onStopTyping(conversation.id), 900);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const value = content.trim();
    if (!value) return;
    onSend(value, replyTarget);
    setContent("");
    onStopTyping(conversation.id);
  }

  return (
    <Paper className="chat-window flex h-full min-h-0 flex-col overflow-hidden !rounded-lg !border !border-slate-200 !bg-white !shadow-sm" elevation={0}>
      <Stack direction="row" alignItems="center" spacing={1.25} className="border-b border-slate-200 p-3.5 max-[560px]:p-2.5">
        <IconButton className="md:!hidden" onClick={onBack}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Avatar src={conversation.avatar || undefined}>{conversation.name?.charAt(0).toUpperCase() || "C"}</Avatar>
        <Box className="min-w-0 flex-1">
          <Typography variant="subtitle1" noWrap className="font-bold">{conversation.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {conversation.members.length} members
          </Typography>
        </Box>
        {otherMember && onStartCall ? (
          <Tooltip title="Video call">
            <IconButton
              onClick={() => onStartCall(otherMember)}
              aria-label="Start video call"
              className="!h-10 !w-10 !rounded-full !bg-[#1877F2] !text-white hover:!bg-[#DDDDDD]"
            >
              <VideocamRoundedIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>

      <Box className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(24,119,242,0.08),transparent_26%),#f8fafc] p-4 max-[560px]:px-2.5 max-[560px]:py-3">
        {hasMore ? (
          <Button size="small" onClick={onLoadMore} disabled={loading}>
            {loading ? "Dang tai..." : "Load older"}
          </Button>
        ) : null}
        {loading && messages.length === 0 ? <ChatMessagesSkeleton /> : null}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            currentUser={currentUser}
            conversationType={conversation.type}
            onReply={onReply}
            onDelete={onDelete}
          />
        ))}
        {typingUsers.length ? (
          <Typography className="!text-[13px] italic !text-slate-500">{typingUsers.map((user) => user.fullName || user.username).join(", ")} dang nhap...</Typography>
        ) : null}
        <div ref={bottomRef} />
      </Box>

      {replyTarget ? (
        <Stack direction="row" alignItems="center" className="border-t border-slate-200 bg-[#eff6ff] px-3.5 py-2">
          <Box className="min-w-0 flex-1">
            <Typography variant="caption">Replying to {replyTarget.sender?.fullName || "message"}</Typography>
            <Typography variant="body2" noWrap>{replyTarget.content}</Typography>
          </Box>
          <IconButton size="small" onClick={onCancelReply}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : null}

      <Stack component="form" direction="row" spacing={1} className="border-t border-slate-200 px-3.5 py-3 max-[560px]:p-2.5" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          size="small"
          value={content}
          onChange={handleChange}
          placeholder="Nhap tin nhan..."
          autoComplete="off"
        />
        <IconButton type="submit" color="primary" disabled={!content.trim()}>
          <SendRoundedIcon />
        </IconButton>
      </Stack>
    </Paper>
  );
}

export default ChatWindow;
