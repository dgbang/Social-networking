# Phase 7: Notifications Requirements

## Muc tieu

Phase 7 xay dung notification trong tuan 10:

- User dang nhap co the nhan in-app notification cho cac event quan trong.
- Notification duoc luu DB, co unread count va trang thai da doc/chua doc.
- Frontend co NotificationBell, dropdown, badge unread va trang `/notifications`.
- Socket.IO emit realtime `new_notification` va `notification_count`.
- FCM la muc co gang neu kip; in-app notification la Must-have theo `PROJECT_PLAN.md` va `WEEKLY_PLAN.md`.

## Nguon tai lieu

- `docs/PROJECT_PLAN.md`
  - Muc 2: Must-have Notification.
  - Muc 6: Schema `Notifications`.
  - Muc 7: Notification API endpoints.
  - Muc 8: Socket.IO events Notifications.
  - Muc 11: Phase 7 output chinh.
  - Muc 13/14: FCM co the day sau neu cham, giu in-app.
- `docs/WEEKLY_PLAN.md`
  - Phase 7: Notifications (Tuan 10).
  - Ngay 1-5: schema/service/events/API/frontend/page.
  - Ngay 6: Firebase Cloud Messaging.
  - Ngay 7: test va ghi chu FCM neu cham.

## Pham vi trong phase

### Backend notification

- Tao model/migration `Notification`.
- Tao `notification.service.js`.
- `createNotification` luu DB.
- Emit socket `new_notification` den room `user:{userId}` neu co socket server.
- Emit/cap nhat `notification_count` cho unread count.
- API `GET /api/notifications` co pagination va filter read/unread.
- API `PUT /api/notifications/:id/read`.
- API `PUT /api/notifications/read-all`.
- User chi duoc doc/cap nhat notification cua minh.
- Event tao notification:
  - Like/reaction post.
  - Comment post.
  - Friend request.
  - Friend accept.
  - Share post.
  - Message khi receiver khong online trong conversation.
- Khong tao notification cho actor va receiver trung nhau.

### Frontend notification

- Tao notification API client.
- Tao notification slice/state.
- NotificationBell tren Navbar.
- Badge unread.
- Dropdown list notification gan nhat.
- Toast realtime khi co notification moi.
- Trang `/notifications`.
- Filter tat ca/chua doc.
- Mark read va mark all read.
- Click notification navigate ve noi dung lien quan neu co du lieu reference.

### FCM foundation

- `Users.fcmToken` da co trong schema/model hien tai.
- Tao API `POST /api/users/fcm-token` de luu token neu client co.
- Push notification qua Firebase Admin SDK chi thuc hien khi dependency/config co san. Neu chua co Firebase config, phase van dat Must-have voi in-app notification.

## Khong nam trong phase

- Notification settings theo user.
- Bat/tat tung loai notification.
- Push notification background hoan chinh neu chua co Firebase project/config.
- Notification sound/animation nang cao.
- Email notification.
- Message reaction notification vi message reaction chua nam trong Phase 5.
- Realtime like/comment UI sync ngoai notification.

## Yeu cau chuc nang

### Notification data

- Moi notification gom:
  - `userId`: nguoi nhan.
  - `fromUserId`: nguoi tao event, nullable trong truong hop system.
  - `type`: `like`, `comment`, `friend_request`, `friend_accept`, `share`, `message`.
  - `referenceId`: id post/comment/user/conversation/message tuy event.
  - `content`: text ngan de hien thi.
  - `isRead`: default `false`.
- `createdAt` dung de sort moi nhat truoc.

### API

- `GET /api/notifications`
  - Yeu cau login.
  - Ho tro `limit`, `cursor`, `status=all|unread|read`.
  - Tra `notifications`, `unreadCount`, `nextCursor`, `hasMore`.
- `PUT /api/notifications/:id/read`
  - Yeu cau login.
  - Chi owner notification duoc mark read.
  - Tra notification da cap nhat va unread count moi.
- `PUT /api/notifications/read-all`
  - Yeu cau login.
  - Mark tat ca notification cua user la read.
  - Tra unread count moi.
- `POST /api/users/fcm-token`
  - Yeu cau login.
  - Luu token client gui vao user hien tai.

### Realtime

- Khi notification duoc tao, neu user dang online:
  - Emit `new_notification` voi notification vua tao.
  - Emit `notification_count` voi unread count moi.
- Client load unread count khi connect/reconnect.

### Event rules

- Like/reaction:
  - Tao notification cho owner post khi user khac like/reaction.
  - Toggle unlike khong tao notification.
  - Doi reaction type khong bat buoc tao notification moi.
- Comment:
  - Tao notification cho owner post khi user khac comment.
- Friend request:
  - Tao notification cho nguoi nhan request.
- Friend accept:
  - Tao notification cho nguoi da gui request.
- Share:
  - Tao notification cho owner original post khi user khac share.
- Message offline:
  - Khi message moi duoc gui, tao notification cho cac member khac khong online.

## Yeu cau phi chuc nang

- Tat ca notification API phai qua auth middleware.
- Khong expose password/token/hash cua user trong response.
- Notification service khong duoc lam fail flow chinh neu emit socket/push loi.
- Query notification can co index cho `userId`, `isRead`, `createdAt`.
- Khong commit secret Firebase.
- FCM neu chua config phai degrade thanh no-op ro rang, khong crash server.

## Tieu chi hoan thanh

- Migration/model `Notification` hoat dong va rollback duoc.
- Event like/comment/friend/share/message tao notification dung nguoi nhan.
- API list/mark read/read all chay duoc.
- Frontend hien bell, badge unread, dropdown va `/notifications`.
- Socket realtime cap nhat notification moi/unread count.
- Co backend tests cho notification service/API/event core.
- FCM token API co san; push FCM duoc ghi chu la optional neu chua co config.

## Phu thuoc phase khac

- Phase 2: Friends va `Users.fcmToken`.
- Phase 3: Posts, likes, comments, shares.
- Phase 5: Chat, Socket.IO, online users.
- Phase 6: Socket provider/global protected area da co de tham khao.

## Ranh gioi va rui ro

- FCM can Firebase project/config va dependency Admin SDK; neu chua co, chi implement foundation/token API.
- Message offline notification phu thuoc memory online state single server; khi scale nhieu server can Redis/pubsub ve sau.
- Notification co the duplicate neu user spam event; Phase 7 uu tien don gian, co the dedupe theo type/reference ve sau neu can.

## Cau hoi can xac nhan

- Co can notification cho reply comment rieng hay gop chung `comment`?
- Co can xoa notification khi unlike/delete comment/delete post khong?
- Noi dung notification co can da ngon ngu hay de tieng Viet/ASCII don gian trong phase nay?
