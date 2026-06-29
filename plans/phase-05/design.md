# Phase 5: Realtime Chat Design

## Tong quan thiet ke

Phase 5 them chat realtime tren kien truc Express + Sequelize + React:

- Backend REST API dung cho conversation list, create conversation, message history va delete fallback.
- Socket.IO dung cho realtime send/reply/delete/typing/read/online.
- Socket auth bang access token JWT hien co.
- Permission tap trung trong `chat.service.js`: chi members moi doc/gui/xoa/read.
- Online state dung memory map trong single server.
- Frontend `/messenger` dung API de bootstrap data, Socket.IO de sync realtime.

## Nguon requirement

- `plans/phase-05/req.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`
- `plans/phase-02/req.md` cho friends dependency.

## Kien truc va module lien quan

### Backend modules

- `server/src/models/conversation.js`
- `server/src/models/conversationMember.js`
- `server/src/models/message.js`
- `server/src/migrations/*create-chat.js`
- `server/src/services/chat.service.js`
- `server/src/controllers/conversation.controller.js`
- `server/src/controllers/message.controller.js`
- `server/src/routes/conversation.routes.js`
- `server/src/routes/message.routes.js`
- `server/src/socket/index.js`
- `server/src/socket/onlineUsers.js`
- `server/src/app.js`: mount API routes.
- `server/src/server.js`: create HTTP server va attach Socket.IO.

### Frontend modules

- `client/src/api/chatApi.js`
- `client/src/socket/chatSocket.js`
- `client/src/pages/MessengerPage.jsx`
- `client/src/components/chat/ConversationList.jsx`
- `client/src/components/chat/ChatWindow.jsx`
- `client/src/components/chat/MessageBubble.jsx`
- `client/src/components/chat/CreateConversationModal.jsx`
- `client/src/components/Common/Navbar.jsx`: link Messenger.
- `client/src/App.jsx`: route `/messenger`.

## Database / Schema

### Conversations

Theo `PROJECT_PLAN.md`:

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| type | ENUM | private, group |
| name | STRING | nullable voi private |
| avatar | STRING | nullable |
| adminId | UUID | FK Users, nullable |
| lastMessageAt | DATE | sort conversation |
| createdAt | DATE | audit |
| updatedAt | DATE | audit |

Indexes:

- `type`
- `adminId`
- `lastMessageAt`

### ConversationMembers

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK de dong bo Sequelize pattern |
| conversationId | UUID | FK Conversations |
| userId | UUID | FK Users |
| role | ENUM | member, admin |
| joinedAt | DATE | default now |
| lastReadAt | DATE | nullable |
| deletedAt | DATE | nullable |
| createdAt | DATE | audit |
| updatedAt | DATE | audit |

Constraint:

- Unique `conversationId + userId`.

Indexes:

- `conversationId`
- `userId`
- `deletedAt`

### Messages

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| conversationId | UUID | FK Conversations |
| senderId | UUID | FK Users |
| replyToId | UUID | FK Messages nullable |
| content | TEXT | nullable neu media/call |
| media | JSONB | nullable |
| type | ENUM | text, image, video, file, call |
| isDeleted | BOOLEAN | default false |
| deletedAt | DATE | nullable |
| deletedFor | JSONB | default [] |
| createdAt | DATE | audit |
| updatedAt | DATE | audit |

Indexes:

- `conversationId`
- `senderId`
- `replyToId`
- `(conversationId, createdAt)`

Associations:

- `Conversation.hasMany(ConversationMember, { as: "members" })`
- `Conversation.hasMany(Message, { as: "messages" })`
- `ConversationMember.belongsTo(User, { as: "user" })`
- `Message.belongsTo(User, { as: "sender" })`
- `Message.belongsTo(Message, { as: "replyTo" })`

## API Contract

Tat ca REST API auth bat buoc va dung response format chung.

### GET `/api/conversations`

Query:

- `limit`: optional default 20 max 50.

Response:

```json
{
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "type": "private",
        "name": null,
        "members": [],
        "lastMessage": null,
        "unreadCount": 0,
        "lastMessageAt": "2026-06-22T00:00:00.000Z"
      }
    ]
  }
}
```

### POST `/api/conversations`

Body:

```json
{
  "type": "private",
  "memberIds": ["uuid"],
  "name": "Team chat"
}
```

Rules:

- `private`: exactly one target member id; reuse existing private conversation.
- `group`: at least two target member ids plus creator; `name` required.
- De xuat: private target va group members nen la accepted friends cua creator.

### GET `/api/conversations/:id/messages`

Query:

- `cursor`: optional ISO datetime.
- `limit`: optional default 30 max 50.

Response sort:

- API query DB newest-first, response return oldest-first de UI append tu tren xuong.
- `meta.nextCursor` dung cho load older messages.

### DELETE `/api/messages/:id`

Rules:

- Chi sender duoc thu hoi message trong Phase 5 core.
- Set `isDeleted = true`, `deletedAt = now`, `content = null`, `media = null`.
- Broadcast realtime neu socket server available trong handler.

## Socket / Realtime neu co

### Auth

Client connect:

```js
io(API_ORIGIN, { auth: { token: accessToken } })
```

Server:

- Verify JWT.
- Load user.
- `socket.data.user = user`.
- Add socket vao online map.
- Join `user:{id}`.
- Broadcast online/offline cho accepted friends.

### Rooms

- `user:{userId}`: personal notifications/events.
- `conversation:{conversationId}`: messages/typing/read.

### Events

Client -> Server:

- `join_conversation` `{ conversationId }`
- `send_message` `{ conversationId, content }`
- `reply_message` `{ conversationId, content, replyToId }`
- `delete_message` `{ messageId }`
- `typing` `{ conversationId }`
- `stop_typing` `{ conversationId }`
- `mark_read` `{ conversationId }`

Server -> Client:

- `new_message` `{ conversationId, message }`
- `new_reply` `{ conversationId, message }`
- `message_deleted` `{ conversationId, messageId }`
- `user_typing` `{ conversationId, user }`
- `user_stop_typing` `{ conversationId, user }`
- `message_read` `{ conversationId, userId, lastReadAt }`
- `user_online` `{ userId }`
- `user_offline` `{ userId }`
- `socket_error` `{ code, message }`

## UI / UX Flow neu co

### MessengerPage

- Desktop: grid 320px conversation list + chat window.
- Mobile: mot cot; khi chon conversation thi chat window chiem man hinh.
- Empty state khi chua co conversation.

### ConversationList

- Hien avatar/name, last message preview, unread badge, online dot.
- Nut tao chat/private/group.
- Sort theo lastMessageAt.

### ChatWindow

- Header conversation co avatar/name/members online.
- Message list bubble trai/phai.
- Deleted message hien "Tin nhan da duoc thu hoi".
- Reply preview tren bubble va ReplyBar tren input.
- Input text + send button icon.
- Typing indicator duoi message list.
- Load older button neu co `nextCursor`.

### CreateConversationModal

- Chon type private/group.
- Tim/chon friends tu `/api/friends`.
- Group name required khi type group.

## Validation va Error Handling

- Conversation id/message id phai UUID.
- `type` conversation in `private`, `group`.
- `memberIds` la array UUID.
- Message content trim length 1-5000 cho text.
- Socket handler validate payload truoc khi goi service.
- Loi domain:
  - `CONVERSATION_NOT_FOUND`
  - `CONVERSATION_FORBIDDEN`
  - `INVALID_CONVERSATION_TYPE`
  - `PRIVATE_CONVERSATION_TARGET_REQUIRED`
  - `GROUP_MEMBERS_REQUIRED`
  - `MESSAGE_NOT_FOUND`
  - `MESSAGE_DELETE_FORBIDDEN`

## Security / Permission

- REST routes dung `requireAuth`.
- Socket auth bat buoc token hop le.
- Member permission check cho list messages, join room, send/reply/delete/read/typing.
- Private/group member create chi cho accepted friends theo de xuat.
- Include user public fields, khong expose email/password/token.

## Logging / Monitoring neu can

- Dung requestId/morgan hien co cho REST.
- Socket errors tra qua `socket_error`, log server error o non-test env.

## Thu tu implement de xuat

1. Tao docs va testcase Phase 5.
2. Cai `socket.io` backend va `socket.io-client` frontend.
3. Tao migration/model associations chat.
4. Tao chat service + REST routes.
5. Tao Socket.IO server/auth/online map/events.
6. Them backend service tests.
7. Tao frontend API/socket helpers.
8. Tao `/messenger` UI components.
9. Gan navbar link Messenger.
10. Chay backend tests va frontend build.

## Anh huong testcase

Testcase can cover:

- Conversation private reuse.
- Group create validation.
- Member-only permission.
- Message send/reply/delete/read.
- Online friends memory map.
- UI messenger happy path va responsive.

## Cau hoi can xac nhan

- Co chap nhan private/group chat chi giua accepted friends trong Phase 5 khong? Design dang chon cach nay.
- Attach media/file trong chat co de Stretch khong? Design dang de Stretch.
