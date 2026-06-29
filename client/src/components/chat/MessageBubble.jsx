import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import { Avatar, Box, IconButton, Stack, Tooltip, Typography } from "@mui/material";

function MessageBubble({ message, currentUser, onReply, onDelete }) {
  const senderId = message.senderId || message.sender?.id;
  const own = String(senderId || "") === String(currentUser?.id || "");
  const senderName = message.sender?.fullName || message.sender?.username || "User";
  const bubbleTone = message.isDeleted
    ? "bg-slate-200 text-slate-500 italic"
    : own
      ? "bg-[#1877f2] text-white"
      : "bg-white text-[#172033] shadow-[0_8px_22px_rgba(15,23,42,0.08)]";
  const bubbleShape = own ? "rounded-2xl rounded-br-[4px]" : "rounded-2xl rounded-bl-[4px]";
  const actionsPosition = own ? "justify-end" : "justify-start";

  async function copyMessage() {
    if (message.content && navigator.clipboard) {
      await navigator.clipboard.writeText(message.content);
    }
  }

  return (
    <Box
      className="!w-full"
      sx={{
        alignItems: "flex-end",
        display: "flex",
        gap: 1,
        justifyContent: own ? "flex-end" : "flex-start",
        width: "100%"
      }}
    >
      {!own ? (
        <Avatar src={message.sender?.avatar || undefined} className="!h-8 !w-8 self-end">
          {senderName.charAt(0).toUpperCase()}
        </Avatar>
      ) : null}
      <Box
        className={`flex flex-col ${own ? "items-end" : "items-start"}`}
        sx={{
          marginLeft: own ? "auto" : 0,
          marginRight: own ? 0 : "auto",
          maxWidth: { xs: "84%", sm: "min(72%, 560px)" }
        }}
      >
        {!own ? (
          <Typography variant="caption" className="mb-0.5 ml-1 !font-semibold !text-slate-500">
            {senderName}
          </Typography>
        ) : null}
        <Box className={`relative px-3.5 py-2.5 [overflow-wrap:anywhere] ${bubbleShape} ${bubbleTone}`}>
          {message.replyTo ? (
            <Box className={`mb-1.5 rounded-md border-l-[3px] px-2 py-1.5 ${own ? "border-white/70 bg-slate-900/10" : "border-[#1877f2] bg-[#1877f2]/10"}`}>
              <Typography variant="caption">{message.replyTo.sender?.fullName || "Reply"}</Typography>
              <Typography variant="body2" noWrap>{message.replyTo.isDeleted ? "Tin nhan da duoc thu hoi" : message.replyTo.content}</Typography>
            </Box>
          ) : null}
          <Typography className="!leading-relaxed">{message.isDeleted ? "Tin nhan da duoc thu hoi" : message.content}</Typography>
        </Box>
        {!message.isDeleted ? (
          <Stack direction="row" spacing={0.25} className={`mt-1 w-full ${actionsPosition} opacity-75 [&_.MuiIconButton-root]:!h-6 [&_.MuiIconButton-root]:!w-6`}>
            <Tooltip title="Reply">
              <IconButton size="small" onClick={() => onReply(message)}>
                <ReplyRoundedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy">
              <IconButton size="small" onClick={copyMessage}>
                <ContentCopyRoundedIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
            {own ? (
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(message.id)}>
                  <DeleteOutlineRoundedIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
        ) : null}
      </Box>
    </Box>
  );
}

export default MessageBubble;
