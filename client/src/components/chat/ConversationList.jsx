import { Avatar, Badge, Box, List, ListItemButton, ListItemText, Paper, Stack, Typography } from "@mui/material";
import { ConversationListSkeleton } from "../Common/Skeletons.jsx";

function preview(conversation) {
  if (!conversation.lastMessage) return "Chua co tin nhan";
  if (conversation.lastMessage.isDeleted) return "Tin nhan da duoc thu hoi";
  return conversation.lastMessage.content || "Media";
}

function ConversationList({ conversations, selectedId, totalUnreadCount = 0, loading, onlineIds = [], currentUser, onSelect }) {
  return (
    <Paper className="conversation-list flex h-full min-h-0 flex-col overflow-hidden !rounded-lg !border !border-slate-200 !bg-white !shadow-sm" elevation={0}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" className="border-b border-slate-200 p-3.5 max-[560px]:p-2.5">
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5">Chats</Typography>
            {totalUnreadCount > 0 ? (
              <Box className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[#e41e3f] px-1.5 text-xs font-extrabold text-white">
                {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
              </Box>
            ) : null}
          </Stack>
          <Typography variant="body2" color="text.secondary">Tin nhan realtime</Typography>
        </Box>
      </Stack>

      {loading ? <ConversationListSkeleton /> : null}

      {!loading && conversations.length === 0 ? (
        <Box className="grid min-h-[220px] content-center justify-items-center gap-1.5 p-4 text-center">
          <Typography variant="subtitle2">Chua co conversation.</Typography>
          <Typography variant="body2" color="text.secondary">Ket ban hoac vao profile ban be de bat dau nhan tin.</Typography>
        </Box>
      ) : null}

      <List disablePadding className="overflow-y-auto !p-1.5">
        {conversations.map((conversation) => {
          const other = conversation.type === "private" ? conversation.members.find((member) => member.userId !== currentUser?.id)?.user : null;
          const isOnline = conversation.members.some((member) => member.userId !== currentUser?.id && onlineIds.includes(member.userId));
          return (
            <ListItemButton
              key={conversation.id}
              selected={conversation.id === selectedId}
              onClick={() => onSelect(conversation)}
              className="mb-1 !gap-2.5 !rounded-lg"
            >
              <Badge
                color="success"
                variant="dot"
                invisible={!isOnline}
                overlap="circular"
                sx={{
                  "& .MuiBadge-dot": {
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: "2px solid #fff"
                  }
                }}
              >
                <Avatar src={conversation.avatar || other?.avatar || undefined}>
                  {(conversation.name || other?.fullName || "C").charAt(0).toUpperCase()}
                </Avatar>
              </Badge>
              <ListItemText
                primary={conversation.name}
                secondary={preview(conversation)}
                primaryTypographyProps={{ noWrap: true, fontWeight: 800 }}
                secondaryTypographyProps={{ noWrap: true }}
                className="min-w-0"
              />
              {conversation.unreadCount > 0 ? (
                <Box className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[#1877f2] text-xs font-extrabold text-white">
                  {conversation.unreadCount}
                </Box>
              ) : null}
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

export default ConversationList;
