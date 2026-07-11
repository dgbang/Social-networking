# Phase 7: Notifications Design

## Tong quan thiet ke

Phase 7 them notification in-app tren kien truc hien co:

- Backend them bang `Notifications`, service trung tam va REST API.
- Cac service domain goi `notificationService.createNotification` sau khi event chinh thanh cong.
- Socket.IO dung room `user:{id}` da co tu Phase 5 de emit realtime.
- Frontend dung Redux slice cho list/unread count, Navbar hien `NotificationBell`, va trang `/notifications` cho quan ly day du.
- FCM foundation luu token vao `Users.fcmToken`; push server-side la no-op neu chua co Firebase Admin config/dependency.

## Nguon requirement

- `plans/phase-07/req.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`
- `plans/phase-03/req.md` cho posts/reactions/comments/share dependency.
- `plans/phase-05/req.md` cho chat/socket/online dependency.

## Kien truc va module lien quan

### Backend modules

- `server/src/models/notification.js`
- `server/src/migrations/*create-notifications.js`
- `server/src/services/notification.service.js`
- `server/src/controllers/notification.controller.js`
- `server/src/routes/notification.routes.js`
- `server/src/services/post.service.js`: tao notification like/share.
- `server/src/services/comment.service.js`: tao notification comment.
- `server/src/services/friend.service.js`: tao notification friend request/accept.
- `server/src/services/chat.service.js`: tao message object nhu hien tai.
- `server/src/socket/index.js`: expose notification emitter, tao offline message notification.
- `server/src/socket/onlineUsers.js`: check receiver online.
- `server/src/controllers/user.controller.js` va `server/src/routes/user.routes.js`: `POST /api/users/fcm-token`.
- `server/src/app.js`: mount `/api/notifications`.
- `server/src/tests/notification.service.test.js`: test notification core.

### Frontend modules

- `client/src/api/notificationApi.js`
- `client/src/store/notificationSlice.js`
- `client/src/components/notifications/NotificationBell.jsx`
- `client/src/pages/NotificationsPage.jsx`
- `client/src/components/Common/Navbar.jsx`: render bell.
- `client/src/App.jsx`: route `/notifications`.
- `client/src/store/store.js`: mount reducer.

## Database / Schema

### Notifications

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| userId | UUID | FK Users, nguoi nhan |
| fromUserId | UUID | FK Users, nullable |
| type | ENUM | like, comment, friend_request, friend_accept, share, message |
| referenceId | UUID | nullable, id lien quan |
| content | STRING | text ngan |
| isRead | BOOLEAN | default false |
| createdAt | DATE | sort |
| updatedAt | DATE | audit |

Indexes:

- `userId, createdAt`
- `userId, isRead, createdAt`
- `type, referenceId`

Associations:

- `User.hasMany(Notification, as: "notifications")`
- `Notification.belongsTo(User, as: "recipient", foreignKey: "userId")`
- `Notification.belongsTo(User, as: "fromUser", foreignKey: "fromUserId")`

## API Contract

### `GET /api/notifications`

Query:

```json
{
  "limit": 20,
  "cursor": "2026-06-01T00:00:00.000Z",
  "status": "all"
}
```

Response data:

```json
{
  "notifications": [],
  "unreadCount": 3
}
```

Response meta:

```json
{
  "nextCursor": "2026-06-01T00:00:00.000Z",
  "hasMore": true
}
```

### `PUT /api/notifications/:id/read`

Response data:

```json
{
  "notification": {},
  "unreadCount": 2
}
```

### `PUT /api/notifications/read-all`

Response data:

```json
{
  "unreadCount": 0
}
```

### `POST /api/users/fcm-token`

Payload:

```json
{
  "token": "client-fcm-token"
}
```

Response data:

```json
{
  "saved": true
}
```

## Socket / Realtime neu co

Socket server can co notification hub nho:

- `notificationService.setSocketServer(io)` khi setup socket.
- `createNotification` sau khi luu DB goi:
  - `io.to("user:<userId>").emit("new_notification", { notification })`
  - `io.to("user:<userId>").emit("notification_count", { unreadCount })`

Client:

- Navbar connect socket nhu chat notification hien co.
- On `new_notification`: prepend notification, tang unread, hien toast.
- On `notification_count`: sync unread count.
- On socket connect: fetch unread/list moi nhat.

## UI / UX Flow neu co

### Navbar NotificationBell

- Icon button co badge unread.
- Click mo dropdown.
- Dropdown hien 6-8 notification moi nhat.
- Moi item co avatar actor, content, time, unread dot.
- Actions:
  - Click item: mark read, dong dropdown, navigate neu co target.
  - `See all`: den `/notifications`.
  - `Mark all read`: goi API va clear badge.

### Notifications page

- Route protected `/notifications`.
- Header co title va button mark all read.
- Tabs/segmented control `Tat ca` va `Chua doc`.
- List notifications co loading/empty/error state.
- Load more khi con `hasMore`.
- Click item mark read va navigate.

### Navigation target

- `like`, `comment`, `share`: `/post/:referenceId`.
- `friend_request`: `/friends`.
- `friend_accept`: `/users/:referenceId` neu `referenceId` la user id.
- `message`: `/messenger?conversationId=:referenceId`.

## Validation va Error Handling

- `limit`: 1-50.
- `cursor`: ISO8601.
- `status`: `all|unread|read`.
- `:id`: UUID.
- `fcm-token`: string 10-4096 chars.
- Notification not found hoac khong thuoc user tra 404 de khong expose ownership.
- Socket/FCM emit loi thi swallow/log nhe, khong rollback event chinh.

## Security / Permission

- Tat ca API notification va FCM token qua `requireAuth`.
- Response `fromUser` chi dung public fields.
- Service bo qua notification self-event.
- Domain service van phai check permission nhu cac phase truoc; notification khong thay the authorization.

## Logging / Monitoring neu can

- Phase 7 khong them monitoring rieng.
- FCM no-op/config missing khong throw trong runtime.

## Thu tu implement de xuat

1. Tao migration/model/association cho `Notification`.
2. Tao notification service: serialize, list, unread count, mark read, mark all, create + emit.
3. Tao controller/routes va mount `/api/notifications`.
4. Them `POST /api/users/fcm-token`.
5. Moc event vao friend/post/comment/share.
6. Moc offline message notification trong socket send/reply sau khi luu message.
7. Them backend tests notification service/event.
8. Tao frontend API/slice.
9. Them NotificationBell vao Navbar.
10. Them `/notifications` page.
11. Chay backend tests va frontend build.

## Anh huong testcase

- API testcase tap trung list/read/read-all/auth/ownership.
- Service testcase tap trung create/self-event/unread count.
- Event testcase tap trung friend request/accept, like/comment/share, offline message.
- UI testcase tap trung bell badge/dropdown/page/filter/navigation.

## Cau hoi can xac nhan

- Co can dedupe notification like/share theo cung actor/reference trong Phase 7 khong? Mac dinh hien tai chua dedupe.
- Co can push FCM that ngay khi co Firebase config khong? Mac dinh phase nay tao foundation va no-op neu chua config.
