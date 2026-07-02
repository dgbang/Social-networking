import { Alert, Snackbar } from "@mui/material";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import IncomingCallModal from "../components/call/IncomingCallModal.jsx";
import OutgoingCallModal from "../components/call/OutgoingCallModal.jsx";
import VideoCallScreen from "../components/call/VideoCallScreen.jsx";
import { useCallManager } from "../hooks/useCallManager.js";
import { createChatSocket } from "../socket/chatSocket.js";

const CallContext = createContext(null);

export function CallProvider({ children }) {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const nextSocket = createChatSocket(accessToken);
    socketRef.current = nextSocket;
    setSocket(nextSocket);

    return () => {
      nextSocket?.disconnect();
      if (socketRef.current === nextSocket) {
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [accessToken]);

  const call = useCallManager({ socket, currentUser: user });

  return (
    <CallContext.Provider value={call}>
      {children}
      <IncomingCallModal call={call.incomingCall} onAnswer={() => call.answerCall()} onReject={() => call.rejectCall()} />
      <OutgoingCallModal call={call.outgoingCall} onCancel={call.endCall} />
      <VideoCallScreen
        call={call.activeCall}
        currentUser={user}
        localStream={call.localStream}
        remoteStream={call.remoteStream}
        mediaState={call.mediaState}
        remoteMediaState={call.remoteMediaState}
        onToggleAudio={call.toggleAudio}
        onToggleVideo={call.toggleVideo}
        onEnd={call.endCall}
      />
      <Snackbar open={Boolean(call.error)} autoHideDuration={4000} onClose={call.clearError} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity="error" variant="filled" onClose={call.clearError}>
          {call.error}
        </Alert>
      </Snackbar>
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used inside CallProvider");
  }
  return context;
}
