# Phase 5: Realtime Chat Testcases

## Nguon requirement va design

- `plans/phase-05/req.md`
- `plans/phase-05/design.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`

## Pham vi test

Phase 5 test cac nhom chuc nang:

- Chat schema/migration.
- Conversation list/create/private reuse/group create.
- Member permission.
- Message history pagination.
- Send/reply/delete/read message.
- Socket auth, join room, typing, online/offline.
- Messenger UI desktop/mobile.
- Regression auth/profile/friends/feed/stories.

## Setup Verification Checklist

- [ ] Migration `Conversations`, `ConversationMembers`, `Messages` chay duoc tu database rong.
- [ ] Rollback migration Phase 5 chay duoc.
- [ ] Associations chat hoat dong.
- [ ] Unique constraint `ConversationMembers(conversationId, userId)` duoc tao.
- [ ] Indexes conversation/message duoc tao.
- [ ] Server start thanh cong voi Socket.IO.
- [ ] Client build thanh cong voi socket client.

## Gia dinh va du lieu test

- `user_a`: current user.
- `user_b`: accepted friend cua `user_a`.
- `user_c`: accepted friend cua `user_a`.
- `user_d`: khong phai friend cua `user_a`.
- `private_ab`: private conversation giua `user_a` va `user_b`.
- `group_abc`: group conversation gom `user_a`, `user_b`, `user_c`.
- Access token hop le cua moi user.

## Manual Testcases

| ID | Feature | Scenario | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- |
| P05-CHAT-001 | Socket auth | Connect socket khi da login | Login user_a, mo messenger | Socket connected, user_a online | High |
| P05-CHAT-002 | Private chat | Tao private chat voi friend | user_a tao chat voi user_b | Conversation private duoc tao/reuse | High |
| P05-CHAT-003 | Private chat | Tao lai private chat cu | Tao private user_a-user_b lan 2 | Tra lai cung conversation id | High |
| P05-CHAT-004 | Group chat | Tao group chat | Chon user_b/user_c, dat ten group, tao | Group hien trong list, user_a la admin | High |
| P05-CHAT-005 | Send message | 2 browser chat realtime | user_a gui tin, user_b dang mo conversation | user_b nhan `new_message` khong can refresh | High |
| P05-CHAT-006 | Reply message | Reply tin nhan | user_b reply message user_a | Reply preview hien dung | Medium |
| P05-CHAT-007 | Delete message | Sender recall message | user_a xoa message cua minh | 2 ben thay deleted state | High |
| P05-CHAT-008 | Permission | Non-member khong xem messages | user_d goi API/messages private_ab | 403/404 theo design | High |
| P05-CHAT-009 | Typing | Typing indicator | user_a go trong input | user_b thay typing indicator | Medium |
| P05-CHAT-010 | Read state | Mark read | user_b mo conversation | unread count ve 0/lastReadAt cap nhat | Medium |
| P05-CHAT-011 | Online | Online/offline friends | user_b online/offline | user_a thay online dot doi trang thai | Medium |
| P05-CHAT-012 | Responsive | Mobile messenger | Mo viewport 375px | Layout khong overflow/clip, chat dung duoc | Medium |

## API Testcases

| ID | Endpoint | Method | Scenario | Payload / Params | Expected Result |
| --- | --- | --- | --- | --- | --- |
| P05-API-001 | `/api/conversations` | GET | List conversations cua current user | token user_a | 200, chi tra conversations user_a la member |
| P05-API-002 | `/api/conversations` | POST | Tao private conversation | `{ type: "private", memberIds: [user_b] }` | 201/200, type private, 2 members |
| P05-API-003 | `/api/conversations` | POST | Reuse private conversation | Goi P05-API-002 lan 2 | 200, cung conversation id |
| P05-API-004 | `/api/conversations` | POST | Tao private voi non-friend | memberIds `[user_d]` | 403/400 `CHAT_FRIEND_REQUIRED` |
| P05-API-005 | `/api/conversations` | POST | Tao group thanh cong | `{ type: "group", name, memberIds: [user_b,user_c] }` | 201, user_a role admin |
| P05-API-006 | `/api/conversations` | POST | Group thieu name | type group, memberIds du | 422/400 validation error |
| P05-API-007 | `/api/conversations/:id/messages` | GET | Lay message history | private_ab | 200, messages oldest-first, meta nextCursor |
| P05-API-008 | `/api/conversations/:id/messages` | GET | Non-member bi chan | user_d/private_ab | 403/404 |
| P05-API-009 | `/api/messages/:id` | DELETE | Sender delete message | token sender | 200, message soft deleted |
| P05-API-010 | `/api/messages/:id` | DELETE | Non-sender delete message | token other member | 403 `MESSAGE_DELETE_FORBIDDEN` |
| P05-API-011 | `/api/users/online-friends` | GET | Lay online friends | user_a co user_b online | 200, users include user_b |

## Socket Testcases

| ID | Event | Scenario | Payload | Expected Result |
| --- | --- | --- | --- | --- |
| P05-SOCKET-001 | connect | Thieu/invalid token | none/invalid token | Connection bi reject |
| P05-SOCKET-002 | join_conversation | Member join room | `{ conversationId }` | Join thanh cong, khong error |
| P05-SOCKET-003 | join_conversation | Non-member join room | `{ conversationId }` | `socket_error` forbidden |
| P05-SOCKET-004 | send_message | Gui text message | `{ conversationId, content }` | DB create message, broadcast `new_message` |
| P05-SOCKET-005 | reply_message | Reply message | `{ conversationId, content, replyToId }` | DB create reply, broadcast `new_reply` |
| P05-SOCKET-006 | delete_message | Recall message | `{ messageId }` | DB soft delete, broadcast `message_deleted` |
| P05-SOCKET-007 | typing | Typing broadcast | `{ conversationId }` | Members khac nhan `user_typing` |
| P05-SOCKET-008 | stop_typing | Stop typing broadcast | `{ conversationId }` | Members khac nhan `user_stop_typing` |
| P05-SOCKET-009 | mark_read | Mark read | `{ conversationId }` | `lastReadAt` update, broadcast `message_read` |
| P05-SOCKET-010 | online/offline | Friend online state | connect/disconnect | Friends nhan `user_online`/`user_offline` |

## UI Testcases

| ID | Screen | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P05-UI-001 | Navbar | Messenger link | Login | Chat icon/link di toi `/messenger` |
| P05-UI-002 | Messenger | Empty state | User chua co conversation | Hien empty state, khong co nut tao chat moi |
| P05-UI-003 | Profile CTA | Nhan tin voi ban be | Tu profile friend, bam Nhan tin | Tao/reuse private conversation va mo `/messenger?conversationId=...` |
| P05-UI-004 | Accept friend | Chap nhan ket ban | Accept request | Private conversation giua hai user duoc tao/reuse |
| P05-UI-005 | ChatWindow | Send text | Nhap text, bam send | Bubble cua minh hien ben phai, realtime append |
| P05-UI-006 | ChatWindow | Receive text | User khac gui | Bubble ben trai hien khong refresh |
| P05-UI-007 | ChatWindow | Reply | Chon reply tren bubble | ReplyBar hien, message moi co preview |
| P05-UI-008 | ChatWindow | Delete/copy | Mo menu message | Copy vao clipboard, delete hien deleted state |
| P05-UI-009 | ChatWindow | Load older | Bam load older | Messages cu duoc prepend |
| P05-UI-010 | Messenger mobile | Mobile layout | Viewport 375px | List/window khong overlap, co back button neu can |

## Edge Cases

- Socket disconnect/reconnect: client khong duplicate message listener.
- Gui message content rong/toan space: bi reject.
- Reply vao message khong thuoc conversation: bi reject.
- Conversation member deletedAt khong duoc doc/gui message.
- Private conversation race condition tao dong thoi: unique/reuse service giam duplicate.
- User offline khi message den: message van luu DB, unread tinh qua `lastReadAt`.

## Regression Checklist

- [ ] Auth login/logout/refresh van hoat dong.
- [ ] Protected routes van chan user chua login.
- [ ] Friends accepted van dung cho chat permission.
- [ ] Feed/posts Phase 3 van render.
- [ ] Stories Phase 4 van render.
- [ ] Response format van dung `success`, `message`, `data`, `error`, `meta`.
- [ ] API/socket khong tra sensitive user fields.
- [ ] Backend tests Phase 1-5 pass.
- [ ] Frontend build pass.

## Nen automate o dau

| Test group | Nen automate o dau |
| --- | --- |
| Private reuse/group validation | Unit test `chat.service.test.js` |
| Member permission | Unit test `chat.service.test.js` |
| Send/reply/delete/read | Unit test `chat.service.test.js` |
| Socket auth/events | Socket integration neu co setup |
| Messenger UI realtime | Manual/E2E sau khi co browser test setup |

## Cau hoi can xac nhan

- Private/group chat chi cho accepted friends co dung mong muon khong?
- Group admin them/xoa member/roi nhom co lam ngay sau core chat khong?
- Attach media/file chat co de Stretch khong?
