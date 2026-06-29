import { Alert, Box } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { createConversation, deleteMessage, getConversations, getMessages, getOnlineFriends, sendMessage } from "../api/chatApi.js";
import ChatWindow from "../components/chat/ChatWindow.jsx";
import ConversationList from "../components/chat/ConversationList.jsx";
import CreateConversationModal from "../components/chat/CreateConversationModal.jsx";
import { createChatSocket } from "../socket/chatSocket.js";

function MessengerPage() {
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);
  const socketRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineIds, setOnlineIds] = useState([]);
  const [error, setError] = useState("");

  const selectedId = selected?.id;

  async function loadConversations() {
    setLoadingConversations(true);
    setError("");
    try {
      const items = await getConversations();
      setConversations(items);
      setSelected((current) => current || items[0] || null);
    } catch (err) {
      setError(err.response?.data?.message || "Khong tai duoc conversations.");
    } finally {
      setLoadingConversations(false);
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
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    setReplyTarget(null);
    setTypingUsers([]);
    loadMessages(selectedId);
    socketRef.current?.emit("join_conversation", { conversationId: selectedId });
    socketRef.current?.emit("mark_read", { conversationId: selectedId });
  }, [selectedId]);

  useEffect(() => {
    const socket = createChatSocket(accessToken);
    socketRef.current = socket;
    if (!socket) return undefined;

    socket.on("connect", () => {
      if (selectedId) socket.emit("join_conversation", { conversationId: selectedId });
    });

    socket.on("new_message", ({ conversationId, message }) => {
      setConversations((items) => bumpConversation(items, conversationId, message));
      if (conversationId === selectedId) {
        setMessages((items) => (items.some((item) => item.id === message.id) ? items : [...items, message]));
        socket.emit("mark_read", { conversationId });
      }
    });

    socket.on("new_reply", ({ conversationId, message }) => {
      setConversations((items) => bumpConversation(items, conversationId, message));
      if (conversationId === selectedId) {
        setMessages((items) => (items.some((item) => item.id === message.id) ? items : [...items, message]));
      }
    });

    socket.on("message_deleted", ({ conversationId, messageId, message }) => {
      if (conversationId === selectedId) {
        setMessages((items) => items.map((item) => (item.id === messageId ? { ...item, ...message, isDeleted: true } : item)));
      }
    });

    socket.on("user_typing", ({ conversationId, user: typingUser }) => {
      if (conversationId !== selectedId || typingUser.id === user?.id) return;
      setTypingUsers((items) => (items.some((item) => item.id === typingUser.id) ? items : [...items, typingUser]));
    });

    socket.on("user_stop_typing", ({ conversationId, user: typingUser }) => {
      if (conversationId !== selectedId) return;
      setTypingUsers((items) => items.filter((item) => item.id !== typingUser.id));
    });

    socket.on("user_online", ({ userId }) => setOnlineIds((items) => (items.includes(userId) ? items : [...items, userId])));
    socket.on("user_offline", ({ userId }) => setOnlineIds((items) => items.filter((id) => id !== userId)));
    socket.on("online_users_list", ({ userIds }) => setOnlineIds(userIds || []));
    socket.on("socket_error", (payload) => setError(payload.message || "Socket error"));

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, selectedId, user?.id]);

  const selectedMessages = useMemo(() => messages, [messages]);

  function bumpConversation(items, conversationId, message) {
    const next = items.map((item) =>
      item.id === conversationId
        ? { ...item, lastMessage: message, lastMessageAt: message.createdAt, unreadCount: selectedId === conversationId ? 0 : (item.unreadCount || 0) + 1 }
        : item
    );
    return next.sort((a, b) => new Date(b.lastMessageAt || b.createdAt).getTime() - new Date(a.lastMessageAt || a.createdAt).getTime());
  }

  async function handleCreate(payload) {
    setCreating(true);
    try {
      const conversation = await createConversation(payload);
      setConversations((items) => {
        const withoutDuplicate = items.filter((item) => item.id !== conversation.id);
        return [conversation, ...withoutDuplicate];
      });
      setSelected(conversation);
    } finally {
      setCreating(false);
    }
  }

  async function handleSend(content, reply) {
    if (!selectedId) return;
    setError("");
    try {
      const message = await sendMessage(selectedId, {
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
      const message = await deleteMessage(messageId);
      setMessages((items) => items.map((item) => (item.id === messageId ? message : item)));
    } catch (err) {
      setError(err.response?.data?.message || "Khong xoa duoc message.");
    }
  }

  return (
    <Box className={`grid h-[calc(100dvh-96px)] min-h-[480px] grid-cols-[minmax(280px,360px)_minmax(0,1fr)] gap-3 py-3 max-[820px]:h-[calc(100dvh-88px)] max-[820px]:grid-cols-1 ${selected ? "max-[820px]:[&_.conversation-list]:hidden" : "max-[820px]:[&_.chat-window]:hidden"}`}>
      {error ? <Alert severity="error" className="col-span-full">{error}</Alert> : null}
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        currentUser={user}
        loading={loadingConversations}
        onlineIds={onlineIds}
        onSelect={setSelected}
        onCreate={() => setCreateOpen(true)}
      />
      <ChatWindow
        conversation={selected}
        currentUser={user}
        messages={selectedMessages}
        hasMore={hasMore}
        loading={loadingMessages}
        typingUsers={typingUsers}
        replyTarget={replyTarget}
        onCancelReply={() => setReplyTarget(null)}
        onBack={() => setSelected(null)}
        onLoadMore={() => loadMessages(selectedId, cursor, true)}
        onSend={handleSend}
        onReply={setReplyTarget}
        onDelete={handleDelete}
        onTyping={(conversationId) => socketRef.current?.emit("typing", { conversationId })}
        onStopTyping={(conversationId) => socketRef.current?.emit("stop_typing", { conversationId })}
      />
      <CreateConversationModal open={createOpen} busy={creating} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
    </Box>
  );
}

export default MessengerPage;
