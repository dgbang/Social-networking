import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import { Avatar, Box, Dialog, DialogContent, IconButton, Stack, Typography } from "@mui/material";

function IncomingCallModal({ call, onAnswer, onReject }) {
  const caller = call?.caller;

  return (
    <Dialog open={Boolean(call)} fullWidth maxWidth="xs">
      <DialogContent className="!p-0">
        <Box className="grid justify-items-center gap-4 bg-[#101827] px-6 py-8 text-center text-white">
          <Avatar src={caller?.avatar || undefined} className="!h-20 !w-20 !border-4 !border-white/20">
            {caller?.fullName?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Typography variant="h6">{caller?.fullName || caller?.username || "User"}</Typography>
            <Typography variant="body2" className="!text-white/70">Incoming video call</Typography>
          </Box>
          <Stack direction="row" spacing={3}>
            <IconButton className="!h-14 !w-14 !bg-[#ef4444] !text-white hover:!bg-[#dc2626]" onClick={onReject} aria-label="Reject call">
              <CallEndRoundedIcon />
            </IconButton>
            <IconButton className="!h-14 !w-14 !bg-[#22c55e] !text-white hover:!bg-[#16a34a]" onClick={onAnswer} aria-label="Answer call">
              <VideocamRoundedIcon />
            </IconButton>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default IncomingCallModal;
