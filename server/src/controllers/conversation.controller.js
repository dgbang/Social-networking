const chatService = require("../services/chat.service");
const { success } = require("../utils/response");

async function list(req, res) {
  const conversations = await chatService.listConversations(req.user.id, req.query);
  return success(res, req, {
    message: "Conversations",
    data: { conversations }
  });
}

async function create(req, res) {
  const conversation = await chatService.createConversation(req.user.id, req.body);
  return success(res, req, {
    status: conversation.__created === false ? 200 : 201,
    message: "Conversation ready",
    data: { conversation }
  });
}

async function messages(req, res) {
  const result = await chatService.listMessages(req.user.id, req.params.id, req.query);
  return success(res, req, {
    message: "Conversation messages",
    data: { messages: result.messages },
    meta: {
      nextCursor: result.nextCursor,
      hasMore: result.hasMore
    }
  });
}

async function createMessage(req, res) {
  const message = await chatService.createMessage(req.user.id, {
    conversationId: req.params.id,
    content: req.body.content,
    replyToId: req.body.replyToId
  });
  const io = req.app.get("io");
  if (io) {
    const eventName = message.replyToId ? "new_reply" : "new_message";
    const memberIds = await chatService.getConversationMemberIds(message.conversationId);
    const rooms = [`conversation:${message.conversationId}`, ...memberIds.map((memberId) => `user:${memberId}`)];
    io.to(rooms).emit(eventName, {
      conversationId: message.conversationId,
      message
    });
  }
  return success(res, req, {
    status: 201,
    message: "Message created",
    data: { message }
  });
}

module.exports = {
  list,
  create,
  messages,
  createMessage
};
