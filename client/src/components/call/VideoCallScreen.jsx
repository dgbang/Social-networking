import CallEndRoundedIcon from "@mui/icons-material/CallEndRounded";
import MicOffRoundedIcon from "@mui/icons-material/MicOffRounded";
import MicRoundedIcon from "@mui/icons-material/MicRounded";
import VideocamOffRoundedIcon from "@mui/icons-material/VideocamOffRounded";
import VideocamRoundedIcon from "@mui/icons-material/VideocamRounded";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

function formatSeconds(value) {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function StreamVideo({ stream, muted = false, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream || null;
    }
  }, [stream]);

  return <video ref={ref} autoPlay playsInline muted={muted} className={className} />;
}

function VideoCallScreen({
  call,
  currentUser,
  localStream,
  remoteStream,
  mediaState,
  remoteMediaState,
  onToggleAudio,
  onToggleVideo,
  onEnd
}) {
  const [seconds, setSeconds] = useState(0);
  const otherUser = useMemo(() => {
    if (!call) return null;
    return String(call.callerId) === String(currentUser?.id) ? call.receiver : call.caller;
  }, [call, currentUser?.id]);

  useEffect(() => {
    if (!call) return undefined;
    setSeconds(0);
    const interval = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(interval);
  }, [call?.id]);

  if (!call) return null;

  return (
    <Box className="fixed inset-0 z-[1600] grid bg-[#05070d] text-white">
      <Box className="relative grid h-full w-full place-items-center overflow-hidden">
        {remoteStream ? (
          <StreamVideo stream={remoteStream} className="h-full w-full object-cover" />
        ) : (
          <Box className="grid justify-items-center gap-2 text-center">
            <Typography variant="h5">{otherUser?.fullName || otherUser?.username || "User"}</Typography>
            <Typography className="!text-white/65">Dang ket noi video...</Typography>
          </Box>
        )}

        {!remoteMediaState.videoEnabled ? (
          <Box className="absolute inset-0 grid place-items-center bg-black/70 text-center">
            <Typography>{otherUser?.fullName || "Nguoi kia"} da tat camera</Typography>
          </Box>
        ) : null}

        <Box className="absolute left-4 top-4 rounded-full bg-black/35 px-3 py-1.5 text-sm backdrop-blur">
          {formatSeconds(seconds)}
        </Box>

        <Box className="absolute right-4 top-4 h-[clamp(120px,24vh,220px)] w-[clamp(92px,18vw,170px)] overflow-hidden rounded-lg border border-white/20 bg-black shadow-2xl">
          {mediaState.videoEnabled ? (
            <StreamVideo stream={localStream} muted className="h-full w-full object-cover" />
          ) : (
            <Box className="grid h-full place-items-center text-center text-sm text-white/70">Camera off</Box>
          )}
        </Box>

        <Stack direction="row" spacing={1.5} className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/45 p-2 backdrop-blur">
          <IconButton className="!bg-white/15 !text-white hover:!bg-white/25" onClick={onToggleAudio} aria-label="Toggle microphone">
            {mediaState.audioEnabled ? <MicRoundedIcon /> : <MicOffRoundedIcon />}
          </IconButton>
          <IconButton className="!bg-white/15 !text-white hover:!bg-white/25" onClick={onToggleVideo} aria-label="Toggle camera">
            {mediaState.videoEnabled ? <VideocamRoundedIcon /> : <VideocamOffRoundedIcon />}
          </IconButton>
          <IconButton className="!bg-[#ef4444] !text-white hover:!bg-[#dc2626]" onClick={onEnd} aria-label="End call">
            <CallEndRoundedIcon />
          </IconButton>
        </Stack>
      </Box>
    </Box>
  );
}

export default VideoCallScreen;
