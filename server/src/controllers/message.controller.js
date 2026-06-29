const chatService = require("../services/chat.service");
const { success } = require("../utils/response");

async function remove(req, res) {
  const message = await chatService.deleteMessage(req.user.id, req.params.id);
  const io = req.app.get("io");
  if (io) {
    io.to(`conversation:${message.conversationId}`).emit("message_deleted", {
      conversationId: message.conversationId,
      messageId: message.id,
      message
    });
  }
  return success(res, req, {
    message: "Message deleted",
    data: { message }
  });
}

module.exports = {
  remove
};
