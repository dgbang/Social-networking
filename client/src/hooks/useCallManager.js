import { useCallback, useEffect, useRef, useState } from "react";
import { emitChatEvent } from "../socket/chatSocket.js";

const ICE_CONFIG = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

function callErrorMessage(error) {
  return error?.message || "Khong thuc hien duoc cuoc goi.";
}

export function useCallManager({ socket, currentUser }) {
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [error, setError] = useState("");
  const [mediaState, setMediaState] = useState({ audioEnabled: true, videoEnabled: true });
  const [remoteMediaState, setRemoteMediaState] = useState({ audioEnabled: true, videoEnabled: true });
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const currentCallRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  useEffect(() => {
    currentCallRef.current = activeCall || outgoingCall || incomingCall;
  }, [activeCall, outgoingCall, incomingCall]);

  const cleanupPeer = useCallback((stopTracks = true) => {
    if (peerRef.current) {
      peerRef.current.ontrack = null;
      peerRef.current.onicecandidate = null;
      peerRef.current.close();
      peerRef.current = null;
    }
    if (stopTracks && localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    pendingCandidatesRef.current = [];
    setRemoteStream(null);
  }, []);

  const resetCallState = useCallback(() => {
    setIncomingCall(null);
    setOutgoingCall(null);
    setActiveCall(null);
    setRemoteMediaState({ audioEnabled: true, videoEnabled: true });
    setMediaState({ audioEnabled: true, videoEnabled: true });
    cleanupPeer(true);
  }, [cleanupPeer]);

  const ensureLocalStream = useCallback(async () => {
    if (localStreamRef.current) return localStreamRef.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("Trinh duyet khong ho tro camera/microphone.");
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    localStreamRef.current = stream;
    setLocalStream(stream);
    setMediaState({ audioEnabled: true, videoEnabled: true });
    return stream;
  }, []);

  const addPendingCandidates = useCallback(async () => {
    if (!peerRef.current?.remoteDescription) return;
    const candidates = pendingCandidatesRef.current.splice(0);
    for (const candidate of candidates) {
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  const createPeer = useCallback(
    async (call, initiator, stream) => {
      cleanupPeer(false);
      const peer = new RTCPeerConnection(ICE_CONFIG);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => peer.addTrack(track, stream));

      peer.ontrack = (event) => {
        setRemoteStream(event.streams[0] || null);
      };

      peer.onicecandidate = (event) => {
        if (event.candidate && socket?.connected) {
          socket.emit("webrtc_ice_candidate", {
            callId: call.id,
            candidate: event.candidate.toJSON()
          });
        }
      };

      if (initiator) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket?.emit("webrtc_offer", { callId: call.id, offer });
      }

      return peer;
    },
    [cleanupPeer, socket]
  );

  const startCall = useCallback(
    async ({ receiverId, conversationId }) => {
      if (!socket?.connected) {
        setError("Socket chua ket noi.");
        return;
      }
      setError("");
      try {
        await ensureLocalStream();
        const response = await emitChatEvent(socket, "call_user", { receiverId, conversationId });
        setOutgoingCall(response.call);
      } catch (err) {
        resetCallState();
        setError(callErrorMessage(err));
      }
    },
    [ensureLocalStream, resetCallState, socket]
  );

  const answerCall = useCallback(
    async (call = incomingCall) => {
      if (!socket?.connected || !call) return;
      setError("");
      try {
        const stream = await ensureLocalStream();
        const response = await emitChatEvent(socket, "answer_call", { callId: call.id });
        setIncomingCall(null);
        setActiveCall(response.call);
        await createPeer(response.call, false, stream);
      } catch (err) {
        resetCallState();
        setError(callErrorMessage(err));
      }
    },
    [createPeer, ensureLocalStream, incomingCall, resetCallState, socket]
  );

  const rejectCall = useCallback(
    async (call = incomingCall) => {
      if (!socket?.connected || !call) return;
      try {
        await emitChatEvent(socket, "reject_call", { callId: call.id });
      } catch (err) {
        setError(callErrorMessage(err));
      } finally {
        resetCallState();
      }
    },
    [incomingCall, resetCallState, socket]
  );

  const endCall = useCallback(async () => {
    const call = currentCallRef.current;
    if (!socket?.connected || !call) {
      resetCallState();
      return;
    }
    try {
      await emitChatEvent(socket, "end_call", { callId: call.id });
    } catch (err) {
      setError(callErrorMessage(err));
    } finally {
      resetCallState();
    }
  }, [resetCallState, socket]);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    const next = !mediaState.audioEnabled;
    stream?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
    const nextState = { ...mediaState, audioEnabled: next };
    setMediaState(nextState);
    if (socket?.connected && currentCallRef.current) {
      socket.emit("toggle_media", { callId: currentCallRef.current.id, ...nextState });
    }
  }, [mediaState, socket]);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    const next = !mediaState.videoEnabled;
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
    const nextState = { ...mediaState, videoEnabled: next };
    setMediaState(nextState);
    if (socket?.connected && currentCallRef.current) {
      socket.emit("toggle_media", { callId: currentCallRef.current.id, ...nextState });
    }
  }, [mediaState, socket]);

  useEffect(() => {
    if (!socket) return undefined;

    function handleIncoming({ call }) {
      setError("");
      setIncomingCall(call);
    }

    async function handleAnswered({ call }) {
      setOutgoingCall(null);
      setIncomingCall(null);
      setActiveCall(call);
      try {
        const stream = await ensureLocalStream();
        await createPeer(call, true, stream);
      } catch (err) {
        setError(callErrorMessage(err));
      }
    }

    function handleRejected({ reason }) {
      resetCallState();
      setError(reason === "timeout" ? "Cuoc goi da het thoi gian cho." : "Cuoc goi bi tu choi.");
    }

    function handleEnded({ reason }) {
      resetCallState();
      if (reason === "disconnected") {
        setError("Nguoi kia da mat ket noi.");
      }
    }

    async function handleOffer({ callId, offer }) {
      try {
        const call = currentCallRef.current;
        if (!call || call.id !== callId) return;
        const stream = await ensureLocalStream();
        const peer = peerRef.current || (await createPeer(call, false, stream));
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        await addPendingCandidates();
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("webrtc_answer", { callId, answer });
      } catch (err) {
        setError(callErrorMessage(err));
      }
    }

    async function handleAnswer({ callId, answer }) {
      try {
        if (currentCallRef.current?.id !== callId || !peerRef.current) return;
        await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        await addPendingCandidates();
      } catch (err) {
        setError(callErrorMessage(err));
      }
    }

    async function handleCandidate({ callId, candidate }) {
      try {
        if (currentCallRef.current?.id !== callId || !candidate) return;
        if (!peerRef.current?.remoteDescription) {
          pendingCandidatesRef.current.push(candidate);
          return;
        }
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Late ICE candidates can fail after a peer disconnects; ignore safely.
      }
    }

    function handleMedia({ userId, audioEnabled, videoEnabled }) {
      if (String(userId) !== String(currentUser?.id)) {
        setRemoteMediaState({ audioEnabled, videoEnabled });
      }
    }

    function handleError(payload) {
      setError(payload?.message || "Call error");
    }

    socket.on("incoming_call", handleIncoming);
    socket.on("call_answered", handleAnswered);
    socket.on("call_rejected", handleRejected);
    socket.on("call_ended", handleEnded);
    socket.on("webrtc_offer", handleOffer);
    socket.on("webrtc_answer", handleAnswer);
    socket.on("webrtc_ice_candidate", handleCandidate);
    socket.on("media_toggled", handleMedia);
    socket.on("call_error", handleError);

    return () => {
      socket.off("incoming_call", handleIncoming);
      socket.off("call_answered", handleAnswered);
      socket.off("call_rejected", handleRejected);
      socket.off("call_ended", handleEnded);
      socket.off("webrtc_offer", handleOffer);
      socket.off("webrtc_answer", handleAnswer);
      socket.off("webrtc_ice_candidate", handleCandidate);
      socket.off("media_toggled", handleMedia);
      socket.off("call_error", handleError);
    };
  }, [addPendingCandidates, createPeer, currentUser?.id, ensureLocalStream, resetCallState, socket]);

  useEffect(() => () => cleanupPeer(true), [cleanupPeer]);

  return {
    incomingCall,
    outgoingCall,
    activeCall,
    localStream,
    remoteStream,
    error,
    mediaState,
    remoteMediaState,
    clearError: () => setError(""),
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
}
