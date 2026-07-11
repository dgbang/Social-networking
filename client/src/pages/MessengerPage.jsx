import { Alert, Box } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteMessage, getConversations, getMessages, getOnlineFriends, sendMessage } from "../api/chatApi.js";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import ConversationList from "../components/chat/ConversationList.jsx";
import { useCall } from "../context/CallContext.jsx";
import { createChatSocket, emitChatEvent } from "../socket/chatSocket.js";
import { decrementChatUnreadCount, setActiveChatConversation, setChatUnreadCount } from "../store/chatNotificationsSlice.js";

function sumUnreadCounts(items) {
  return items.reduce((total, item) => total + (Number(item.unreadCount) || 0), 0);
}

function MessengerPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const totalUnreadCount = useSelector((state) => state.chatNotifications.unreadCount);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const socketRef = useRef(null);
  const selectedIdRef = useRef(null);
  const conversationsRef = useRef([]);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [onlineIds, setOnlineIds] = useState([]);
  const [error, setError] = useState("");

  const selectedId = selected?.id;
  const requestedConversationId = searchParams.get("conversationId");
  const call = useCall();

  useEffect(() => {
    selectedIdRef.current = selectedId || null;
  }, [selectedId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    return () => {
      dispatch(setActiveChatConversation(null));
    };
  }, [dispatch]);

  useEffect(() => {
    dispatch(setActiveChatConversation(selectedId || null));
  }, [dispatch, selectedId]);

  async function loadConversations() {
    setLoadingConversations(true);
    setError("");
    try {
      const items = await getConversations();
      conversationsRef.current = items;
      setConversations(items);
      dispatch(setChatUnreadCount(sumUnreadCounts(items)));
      setSelected((current) => {
        const requested = items.find((item) => item.id === requestedConversationId);
        if (requested) return requested;
        if (requestedConversationId) return current ? items.find((item) => item.id === current.id) || null : null;
        return null;
      });
    } catch (err) {
      setError(err.response?.data?.message || "Khong tai duoc conversations.");
    } finally {
      setLoadingConversations(false);
    }
  }

  function markConversationReadLocally(conversationId, fallbackUnreadCount = 0) {
    const unreadCount = Number(conversationsRef.current.find((item) => item.id === conversationId)?.unreadCount ?? fallbackUnreadCount) || 0;
    setConversations((items) => {
      const next = items.map((item) => (item.id === conversationId && item.unreadCount > 0 ? { ...item, unreadCount: 0 } : item));
      conversationsRef.current = next;
      return next;
    });
    setSelected((current) => (current?.id === conversationId ? { ...current, unreadCount: 0 } : current));
    if (unreadCount > 0) {
      dispatch(decrementChatUnreadCount(unreadCount));
    }
  }

  async function loadMessages(conversationId, nextCursor = null, appendOlder = false) {
    if (!conversationId) return;
    setLoadingMessages(true);
    try {
      const result = await getMessages(conversationId, { cursor: nextCursor || undefined, limit: 30 });
      setMessages((items) => (appendOlder ? [...result.messages, ...items] : result.messages));
      setCursor(result.nextCursor);
      setHasMore(Boolean(result.hasMore));
    } catch (err) {
      setError(err.response?.data?.message || "Khong tai duoc messages.");
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    loadConversations();
    getOnlineFriends()
      .then((friends) => setOnlineIds(friends.map((friend) => friend.id)))
      .catch(() => {});
  }, [requestedConversationId]);

  useEffect(() => {
    if (!requestedConversationId) {
      setSelected(null);
      return;
    }
    if (conversations.length === 0) return;
    const requested = conversations.find((item) => item.id === requestedConversationId);
    if (requested && requested.id !== selectedId) {
      setSelected(requested);
    }
  }, [conversations, requestedConversationId, selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    setReplyTarget(null);
    loadMessages(selectedId);
    markConversationReadLocally(selectedId, selected?.unreadCount);
    socketRef.current?.emit("join_conversation", { conversationId: selectedId });
    socketRef.current?.emit("mark_read", { conversationId: selectedId });
  }, [selectedId]);

  useEffect(() => {
    const socket = createChatSocket(accessToken);
    socketRef.current = socket;
    if (!socket) return undefined;

    socket.on("connect", () => {
      const activeId = selectedIdRef.current;
      if (activeId) socket.emit("join_conversation", { conversationId: activeId });
    });

    socket.on("new_message", ({ conversationId, message }) => {
      const activeId = selectedIdRef.current;
      setConversations((items) => bumpConversation(items, conversationId, message, activeId));
      if (conversationId === activeId) {
        setMessages((items) => (items.some((item) => item.id === message.id) ? items : [...items, message]));
        socket.emit("mark_read", { conversationId });
      }
    });

    socket.on("new_reply", ({ conversationId, message }) => {
      const activeId = selectedIdRef.current;
      setConversations((items) => bumpConversation(items, conversationId, message, activeId));
      if (conversationId === activeId) {
        setMessages((items) => (items.some((item) => item.id === message.id) ? items : [...items, message]));
        socket.emit("mark_read", { conversationId });
      }
    });

    socket.on("message_deleted", ({ conversationId, messageId, message }) => {
      const activeId = selectedIdRef.current;
      setConversations((items) =>
        items.map((item) =>
          item.id === conversationId && item.lastMessage?.id === messageId ? { ...item, lastMessage: { ...item.lastMessage, ...message } } : item
        )
      );
      if (conversationId === activeId) {
        setMessages((items) => items.map((item) => (item.id === messageId ? { ...item, ...message, isDeleted: true } : item)));
      }
    });

    socket.on("user_online", ({ userId }) => setOnlineIds((items) => (items.includes(userId) ? items : [...items, userId])));
    socket.on("user_offline", ({ userId }) => setOnlineIds((items) => items.filter((id) => id !== userId)));
    socket.on("online_users_list", ({ userIds }) => setOnlineIds(userIds || []));
    socket.on("socket_error", (payload) => setError(payload.message || "Socket error"));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, user?.id]);

  const selectedMessages = useMemo(() => messages, [messages]);

  function bumpConversation(items, conversationId, message, activeConversationId = selectedId) {
    const shouldCountUnread = message?.senderId !== user?.id && activeConversationId !== conversationId;
    const next = items.map((item) =>
      item.id === conversationId
        ? {
            ...item,
            lastMessage: message,
            lastMessageAt: message.createdAt,
            unreadCount: activeConversationId === conversationId ? 0 : shouldCountUnread ? (item.unreadCount || 0) + 1 : item.unreadCount || 0
          }
        : item
    );
    return next.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
  }

  async function handleSend(content, reply) {
    if (!selectedId) return;
    setError("");
    try {
      const payload = {
        conversationId: selectedId,
        content,
        replyToId: reply?.id || null
      };
      const eventName = reply?.id ? "reply_message" : "send_message";
      const message = socketRef.current?.connected
        ? (await emitChatEvent(socketRef.current, eventName, payload)).message
        : await sendMessage(selectedId, {
            content,
            replyToId: reply?.id || null
          });
      setMessages((items) => (items.some((item) => item.id === message.id) ? items : [...items, message]));
      setConversations((items) => bumpConversation(items, selectedId, message));
      setReplyTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || "Khong gui duoc message.");
    }
  }

  async function handleDelete(messageId) {
    setError("");
    try {
      const message = socketRef.current?.connected
        ? (await emitChatEvent(socketRef.current, "delete_message", { messageId })).message
        : await deleteMessage(messageId);
      setMessages((items) => items.map((item) => (item.id === messageId ? message : item)));
      setConversations((items) =>
        items.map((item) =>
          item.id === message.conversationId && item.lastMessage?.id === messageId ? { ...item, lastMessage: { ...item.lastMessage, ...message } } : item
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Khong xoa duoc message.");
    }
  }

  function handleStartCall(member) {
    if (!selected?.id || !member?.userId) return;
    call.startCall({
      receiverId: member.userId,
      conversationId: selected.id
    });
  }

  function handleSelectConversation(conversation) {
    setSelected(conversation);
    navigate(`/messenger?conversationId=${conversation.id}`);
  }

  function handleBackToList() {
    setSelected(null);
    navigate("/messenger", { replace: true });
  }

  return (
    <Box className={`grid h-[calc(100dvh-96px)] min-h-[480px] grid-cols-[minmax(280px,360px)_minmax(0,1fr)] gap-3 py-3 max-[820px]:h-[calc(100dvh-88px)] max-[820px]:grid-cols-1 ${selected ? "max-[820px]:[&_.conversation-list]:hidden" : "max-[820px]:[&_.chat-window]:hidden"}`}>
      {error ? <Alert severity="error" className="col-span-full">{error}</Alert> : null}
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        totalUnreadCount={totalUnreadCount}
        currentUser={user}
        loading={loadingConversations}
        onlineIds={onlineIds}
        onSelect={handleSelectConversation}
      />
      <ChatWindow
        conversation={selected}
        currentUser={user}
        messages={selectedMessages}
        hasMore={hasMore}
        loading={loadingMessages}
        onlineIds={onlineIds}
        replyTarget={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
        onBack={handleBackToList}
        onLoadMore={() => loadMessages(selectedId, cursor, true)}
        onSend={handleSend}
        onReply={setReplyTarget}
        onDelete={handleDelete}
        onStartCall={handleStartCall}
      />
    </Box>
  );
}

export default MessengerPage;
