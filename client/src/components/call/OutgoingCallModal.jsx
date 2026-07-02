import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";
import { Avatar, Box, Dialog, DialogContent, IconButton, Typography } from "@mui/material";

function OutgoingCallModal({ call, onCancel }) {
  const receiver = call?.receiver;

  return (
    <Dialog open={Boolean(call)} fullWidth maxWidth="xs">
      <DialogContent className="!p-0">
        <Box className="grid justify-items-center gap-4 bg-[#101827] px-6 py-8 text-center text-white">
          <Avatar src={receiver?.avatar || undefined} className="!h-20 !w-20 !border-4 !border-white/20">
            {receiver?.fullName?.charAt(0).toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Typography variant="h6">{receiver?.fullName || receiver?.username || "User"}</Typography>
            <Typography variant="body2" className="!text-white/70">Dang goi...</Typography>
          </Box>
          <IconButton className="!h-14 !w-14 !bg-[#ef4444] !text-white hover:!bg-[#dc2626]" onClick={onCancel} aria-label="Cancel call">
            <CallEndRoundedIcon />
          </IconButton>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default OutgoingCallModal;
