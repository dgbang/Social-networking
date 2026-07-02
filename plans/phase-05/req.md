# Phase 5: Realtime Chat Requirements

## Muc tieu

Phase 5 xay dung realtime chat trong tuan 7-8:

- User dang nhap co the tao va xem conversations.
- Private conversation reuse neu da ton tai.
- Group conversation co members va admin.
- User trong conversation co the lay messages co pagination.
- User gui, reply va xoa/thu hoi message realtime.
- User co typing, read state va online/offline co ban.
- Frontend co trang `/messenger` voi conversation list va chat window.
- UI can dep, hien dai, gan voi trai nghiem Messenger/Facebook/Instagram DM theo yeu cau UI truoc do.
- UX cap nhat: khong hien nut tao chat moi trong Messenger; private conversation duoc tao/reuse khi ket ban hoac khi bam nhan tin tu profile ban be.

## Nguon tai lieu

- `docs/PROJECT_PLAN.md`
  - Muc 6: Schema `Conversations`, `ConversationMembers`, `Messages`.
  - Muc 7: Chat API endpoints.
  - Muc 8: Socket.IO events.
  - Muc 11: Phase 5 output chinh.
  - Muc 12: Definition of Done.
- `docs/WEEKLY_PLAN.md`
  - Phase 5: Realtime Chat, tuan 7-8.
  - Tuan 7: backend chat va Socket.IO.
  - Tuan 8: frontend chat UI.
- Yeu cau truc tiep cua user:
  - Tiep tuc phase 5 sau quy trinh tao tai lieu, testcase, code.

## Pham vi trong phase

### Backend chat va Socket.IO

- Tao model/migration `Conversation`.
- Tao model/migration `ConversationMember`.
- Tao model/migration `Message`.
- Them indexes conversation/message.
- Them unique constraint `conversationId + userId`.
- Setup Socket.IO server.
- JWT auth cho socket.
- Map online users.
- Join room `user:{id}` khi connect.
- Broadcast online/offline cho friends.
- API `GET /api/conversations`.
- API `POST /api/conversations`.
- Private conversation reuse neu da ton tai.
- Group conversation voi members.
- Include last message va unread count.
- API `GET /api/conversations/:id/messages`.
- Pagination messages.
- Check member permission.
- Update `lastMessageAt` khi gui message.
- Socket event `send_message` luu DB roi broadcast `new_message`.
- Socket event `reply_message` voi `replyToId`.
- Socket event `delete_message` soft delete va broadcast `message_deleted`.
- API `DELETE /api/messages/:id`.
- Socket event `typing`, `stop_typing`.
- Socket event `mark_read`, cap nhat `lastReadAt`.
- API `GET /api/users/online-friends`.

### Frontend chat UI

- Setup socket client.
- Connect khi login, disconnect khi logout.
- Auto reconnect theo Socket.IO client.
- Tao trang `/messenger`.
- Layout desktop 2 cot, mobile 1 cot.
- ConversationList.
- ChatWindow co header, message list, input gui text.
- Load more messages khi scroll len hoac nut load more.
- Auto scroll bottom khi co tin moi.
- MessageBubble.
- Reply preview va ReplyBar.
- Delete/recall message.
- Copy message.
- Deleted message state.
- Modal tao group chat co chon members tu friends.
- Typing indicator.
- Online indicator.
- Unread badge.

## Khong nam trong phase

- Video call thuoc Phase 6.
- Notifications/FCM thuoc Phase 7.
- Attach image/file trong chat la Stretch neu kip, chua phai Must-have.
- Sound notification la Stretch neu kip.
- Them/xoa member admin-only va roi nhom co trong weekly plan, nhung co the lam sau core chat neu cham tien do.
- Message encryption/end-to-end encryption chua thay trong tai lieu hien tai.
- Search messages, reactions to messages va pinned messages chua thay trong tai lieu hien tai.

## Yeu cau chuc nang

### Conversation

- User dang nhap list duoc conversations cua minh.
- Conversation list sap xep theo `lastMessageAt` moi nhat.
- Conversation private co 2 members.
- Tao private conversation voi cung target phai reuse conversation da ton tai.
- User chi duoc tao private conversation voi accepted friend. De xuat de giam spam va bam theo social graph hien co.
- Group conversation can co it nhat 3 members tinh ca creator.
- Creator cua group la admin.
- Conversation response include members public info, last message va unread count.

### Messages

- User la member moi duoc lay messages trong conversation.
- Messages lay theo pagination, moi nhat truoc hoac cursor theo `createdAt`.
- User gui text message qua Socket.IO event `send_message`.
- User reply message qua `reply_message` voi `replyToId`.
- Message content phai co noi dung khi type la `text`.
- Khi gui message thanh cong, server luu DB, cap nhat `lastMessageAt`, broadcast `new_message` cho room conversation va user rooms lien quan.
- User xoa/thu hoi message cua minh qua socket `delete_message` hoac API `DELETE /api/messages/:id`.
- Deleted message khong mat row DB, hien state deleted.

### Read, typing, online

- `mark_read` cap nhat `lastReadAt` cua member.
- `typing` va `stop_typing` broadcast cho members khac trong conversation.
- Socket connect can verify JWT.
- Khi user online/offline, server broadcast cho friends.
- `GET /api/users/online-friends` tra danh sach friends dang online theo memory map hien tai.

### Frontend

- Navbar co link toi `/messenger`.
- Messenger page hien conversation list va chat window.
- Messenger khong hien nut tao chat moi; user vao profile ban be de bam nhan tin, hoac conversation da co sau khi accept friend.
- User gui/nhan message realtime.
- User reply, delete/recall va copy message duoc tu UI.
- UI co loading, empty state, error state.
- Desktop 2 cot, mobile 1 cot khong bi overlap/clip.

## Yeu cau phi chuc nang

- Tat ca Chat API can protected bang auth middleware.
- Socket.IO connection bat buoc co access token hop le.
- Tat ca input body, params, query va socket payload can validate trong service/socket handler.
- Backend la source of truth cho membership, permission, read state va deleted state.
- Dung Sequelize migrations, khong dung `sequelize.sync({ alter: true })`.
- Dung response format chung cua du an.
- API/socket khong expose password/token/hash cua user.
- Query messages/conversations can co pagination hoac limit.
- Socket disconnect/reconnect khong duoc lam server crash.

## Tieu chi hoan thanh

- Migration chat chay duoc tu DB rong va rollback co ban.
- Socket.IO server setup va auth bang JWT.
- Online users map hoat dong o muc memory.
- `GET /api/conversations` tra conversations cua current user.
- `POST /api/conversations` tao private/group va reuse private.
- `GET /api/conversations/:id/messages` check member permission va pagination.
- `send_message` luu DB, update `lastMessageAt`, broadcast realtime.
- `reply_message` tao message co `replyToId`.
- `delete_message` va `DELETE /api/messages/:id` soft delete dung permission.
- `mark_read` cap nhat `lastReadAt`.
- `typing`/`stop_typing` broadcast dung room.
- `/messenger` UI gui/nhan tin realtime duoc.
- Co backend tests cho conversation create/reuse, member permission, send/delete/read core.
- Frontend build pass.

## Phu thuoc phase khac

- Phu thuoc Phase 1:
  - Auth middleware.
  - JWT access token.
  - Response helper.
  - Sequelize/PostgreSQL migration setup.
- Phu thuoc Phase 2:
  - User profile/avatar.
  - Friends accepted de tao private chat va broadcast online.
- Phu thuoc Phase 3/4:
  - Navbar/dashboard style va social UI pattern.
- Phase 6 video call se dung chat/socket foundation.
- Phase 7 notification se co the dung events message ve sau.

## Ranh gioi va rui ro

- Socket.IO + tests realtime co the ton thoi gian; uu tien service tests va build pass neu chua co E2E socket test.
- Online map dang memory-only, khi scale multi-instance se can Redis adapter trong phase/deploy sau.
- Group admin/member management day du co the phinh scope; core group create + message la Must-have.
- Attach file/image trong chat can upload security rieng; de Stretch neu chat text core chua on dinh.

## Cau hoi can xac nhan

- Private chat co bat buoc chi giua accepted friends khong? De xuat co.
- Group chat co can them/xoa member/roi nhom ngay dot code nay khong? De xuat de sau khi core chat pass.
- Chat media/file co lam ngay trong Phase 5 khong? De xuat Stretch.
