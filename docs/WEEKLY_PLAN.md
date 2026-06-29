# Ke Hoach Chi Tiet 12 Tuan - Social Media Platform

> Bat dau: Tuan 1  
> Ket thuc: Tuan 12  
> Stack: React + Node.js + PostgreSQL + Sequelize + Socket.IO + Docker

## Nguyen Tac Lam Viec

- Moi ngay nen co output chay duoc, khong chi viet code roi de do.
- Moi phase co demo nho truoc khi sang phase tiep theo.
- Neu cham tien do, uu tien Must-have trong `PROJECT_PLAN.md`, day Stretch sang sau launch.
- Khong dung `sequelize.sync({ alter: true })` cho production.
- Moi feature backend can co validation, auth middleware va authorization ro rang.
- Commit thuong xuyen theo tung nhom viec.

---

## Phase 1: Setup & Authentication (Tuan 1-2)

### Tuan 1: Khoi tao du an va nen tang backend/frontend

#### Ngay 1: Repository va cau truc

- [ ] Khoi tao Git repository.
- [ ] Tao `.gitignore`, `.env.example`, `README.md`.
- [ ] Tao thu muc `client/`, `server/`, `nginx/`.
- [ ] Tao React app voi Vite.
- [ ] Khoi tao Node.js server.
- [ ] Cai dependencies nen tang.

Output:

- Chay duoc client va server rieng le.
- README co huong dan chay local co ban.

#### Ngay 2: Express foundation

- [ ] Tao `app.js`, `server.js`.
- [ ] Setup middleware: `cors`, `helmet`, `morgan`, `express.json`.
- [ ] Tao global error handler.
- [ ] Tao response helper format chung.
- [ ] Tao route prefix `/api`.
- [ ] Tao health endpoint `/api/health`.

Output:

- `GET /api/health` tra ve OK.

#### Ngay 3: Docker development

- [ ] Viet Dockerfile cho server.
- [ ] Viet Dockerfile cho client.
- [ ] Viet `docker-compose.yml` gom PostgreSQL, server, client.
- [ ] Them healthcheck PostgreSQL.
- [ ] Test `docker compose up`.

Output:

- Docker chay duoc PostgreSQL + server + client.

#### Ngay 4: Sequelize va database

- [ ] Cai Sequelize CLI.
- [ ] Cau hinh ket noi PostgreSQL.
- [ ] Tao migration va model `User`.
- [ ] Them index cho `email`, `username`.
- [ ] Chay migration thanh cong.

Output:

- DB co bang `Users`.
- Server connect DB thanh cong.

#### Ngay 5: Auth service foundation

- [ ] Tao folder controllers/routes/services/middlewares.
- [ ] Tao auth routes.
- [ ] Tao validation middleware.
- [ ] Tao JWT helper.
- [ ] Tao password hash helper.

Output:

- Khung Auth API san sang code flow.

#### Ngay 6: Register API

- [ ] `POST /api/auth/register`.
- [ ] Validate email, username, password, fullName.
- [ ] Hash password bang bcrypt.
- [ ] Tao verification token.
- [ ] Luu user vao DB.
- [ ] Chuan bi Nodemailer service.

Output:

- Dang ky user thanh cong qua Postman.

#### Ngay 7: Review tuan 1

- [ ] Test lai Docker.
- [ ] Test migration tu DB rong.
- [ ] Viet test co ban cho health/register neu kip.
- [ ] Cap nhat README.
- [ ] Don lai `.env.example`.

Checkpoint:

- Setup on dinh.
- DB migration chay lai duoc.
- Register API co validation.

---

### Tuan 2: Authentication day du

#### Ngay 1: Login va token

- [ ] `POST /api/auth/login`.
- [ ] So sanh password bang bcrypt.
- [ ] Chan login neu email chua verify, hoac cho login co warning tuy chon.
- [ ] Tao access token 15 phut.
- [ ] Tao refresh token 7 ngay.
- [ ] Luu refresh token hash vao DB hoac HTTP-only cookie.

Output:

- Login thanh cong, nhan token hop le.

#### Ngay 2: Refresh va logout

- [ ] `POST /api/auth/refresh-token`.
- [ ] `POST /api/auth/logout`.
- [ ] Revoke refresh token.
- [ ] Tao auth middleware verify Bearer token.
- [ ] Test route protected mau.

Output:

- Access token het han co the refresh.
- Logout lam refresh token mat hieu luc.

#### Ngay 3: Verify email va reset password

- [ ] `GET /api/auth/verify/:token`.
- [ ] `POST /api/auth/forgot-password`.
- [ ] `POST /api/auth/reset-password/:token`.
- [ ] Nodemailer template co ban.
- [ ] Token reset het han sau 1 gio.

Output:

- Flow verify/reset password chay duoc.

#### Ngay 4: Frontend auth setup

- [ ] Setup React Router.
- [ ] Setup Redux Toolkit.
- [ ] Setup Axios instance.
- [ ] Axios interceptor gan token.
- [ ] ProtectedRoute.
- [ ] Auth slice.

Output:

- Frontend co nen tang auth.

#### Ngay 5: Auth pages

- [ ] Trang login.
- [ ] Trang register.
- [ ] Trang verify email.
- [ ] Trang forgot password.
- [ ] Trang reset password.
- [ ] Form validation client-side.

Output:

- Dang ky/dang nhap tu UI duoc.

#### Ngay 6: Auth UI polish va state

- [ ] Luu auth state.
- [ ] Auto load current user.
- [ ] Redirect sau login/logout.
- [ ] Toast loi/thanh cong.
- [ ] Navbar co user menu co ban.

Output:

- Auth flow frontend kha hoan chinh.

#### Ngay 7: Test va checkpoint Phase 1

- [ ] Test register/login/logout/refresh.
- [ ] Test verify/reset password.
- [ ] Test protected route.
- [ ] Viet backend tests cho auth core.
- [ ] Cap nhat README.

Definition of done:

- Auth end-to-end chay duoc.
- Co validation va error message ro.
- Docker van chay duoc tu moi truong rong.

---

## Phase 2: User Profile & Friends (Tuan 3)

### Ngay 1: User profile backend

- [ ] Tao API `GET /api/users/me`.
- [ ] Tao API `PUT /api/users/me`.
- [ ] Tao API `GET /api/users/:id`.
- [ ] Tao API `GET /api/users/search?q=`.
- [ ] Authorization cho profile edit.

Output:

- Lay/sua profile qua API.

### Ngay 2: Upload avatar/cover

- [ ] Setup Multer.
- [ ] Setup Cloudinary.
- [ ] Gioi han file image, size 5MB.
- [ ] Upload avatar va cover.
- [ ] Luu `publicId` neu can xoa/thay anh cu.

Output:

- Profile upload anh thanh cong.

### Ngay 3: Friends backend

- [ ] Tao model/migration `Friendship`.
- [ ] `POST /api/friends/request/:userId`.
- [ ] `PUT /api/friends/accept/:userId`.
- [ ] `PUT /api/friends/reject/:userId`.
- [ ] `DELETE /api/friends/:userId`.
- [ ] Unique constraint tranh trung request.

Output:

- Flow ket ban co ban chay duoc.

### Ngay 4: Friends list va suggestions

- [ ] `GET /api/friends`.
- [ ] `GET /api/friends/requests`.
- [ ] `GET /api/friends/suggestions`.
- [ ] Logic goi y don gian: user chua ket ban.
- [ ] Test authorization va edge cases.

Output:

- Co danh sach ban, loi moi va goi y.

### Ngay 5: Profile frontend

- [ ] Trang profile.
- [ ] Avatar, cover, fullName, username, bio.
- [ ] Modal edit profile.
- [ ] Upload preview truoc khi save.

Output:

- User co the xem/sua profile tu UI.

### Ngay 6: Friends frontend

- [ ] Trang friends.
- [ ] Tab friends/requests/suggestions.
- [ ] UserCard dung lai.
- [ ] Nut add/accept/reject/unfriend.
- [ ] Search user tren navbar.

Output:

- Ket ban duoc tu UI.

### Ngay 7: Test Phase 2

- [ ] Test profile owner vs non-owner.
- [ ] Test upload file sai type/qua size.
- [ ] Test send/accept/reject/unfriend.
- [ ] Viet backend tests cho friends core.

Checkpoint:

- User co profile day du.
- Friends system san sang de dung cho feed/chat.

---

## Phase 3: Posts & Newsfeed (Tuan 4-5)

### Tuan 4: Backend posts

#### Ngay 1: Models va migrations

- [ ] Tao model `Post`, `Comment`, `Like`.
- [ ] Tao associations.
- [ ] Them indexes: `userId`, `postId`, `createdAt`.
- [ ] Them unique `postId + userId` cho Likes.

Output:

- DB schema cho post hoan thanh.

#### Ngay 2: CRUD posts

- [ ] `POST /api/posts`.
- [ ] Upload nhieu media len Cloudinary.
- [ ] `GET /api/posts/:id`.
- [ ] `PUT /api/posts/:id`.
- [ ] `DELETE /api/posts/:id`.
- [ ] Owner-only edit/delete.

Output:

- CRUD post chay duoc.

#### Ngay 3: Feed

- [ ] `GET /api/posts/feed`.
- [ ] Lay bai public + bai cua ban be + bai cua minh.
- [ ] Ton trong privacy.
- [ ] Cursor pagination theo `createdAt`.
- [ ] Include user info va counters.

Output:

- Feed co pagination va privacy co ban.

#### Ngay 4: Reactions

- [ ] `POST /api/posts/:id/like`.
- [ ] Toggle like/unlike.
- [ ] Doi reaction type.
- [ ] Cap nhat `likesCount` trong transaction.
- [ ] Tao notification event neu can.

Output:

- Reaction hoat dong on dinh.

#### Ngay 5: Comments

- [ ] `GET /api/posts/:id/comments`.
- [ ] `POST /api/posts/:id/comments`.
- [ ] Reply comment bang `parentId`.
- [ ] `DELETE /api/comments/:id`.
- [ ] Cap nhat `commentsCount`.

Output:

- Comment/reply/xoa comment chay duoc.

#### Ngay 6: Share va optimization

- [ ] `POST /api/posts/:id/share`.
- [ ] Tao post moi co `originalPostId`.
- [ ] Cap nhat `sharesCount`.
- [ ] Toi uu include tranh N+1.
- [ ] Kiem tra indexes.

Output:

- Share post chay duoc.

#### Ngay 7: Backend tests

- [ ] Test create/edit/delete post.
- [ ] Test feed privacy.
- [ ] Test like/comment/share.
- [ ] Test upload media.

Checkpoint:

- Backend posts san sang cho UI.

---

### Tuan 5: Frontend posts va newsfeed

#### Ngay 1: Redux va API

- [ ] Tao post API client.
- [ ] Tao post slice.
- [ ] Tao comment/reaction actions.
- [ ] Xu ly loading/error states.

Output:

- Frontend state san sang cho feed.

#### Ngay 2: CreatePost

- [ ] Textarea.
- [ ] Upload media preview.
- [ ] Privacy selector.
- [ ] Emoji picker neu kip.
- [ ] Submit tao post.

Output:

- Tao post tu UI.

#### Ngay 3: PostCard

- [ ] Header user/time/privacy.
- [ ] Content + media gallery.
- [ ] Like/comment/share buttons.
- [ ] Menu edit/delete cho owner.

Output:

- Render bai viet day du.

#### Ngay 4: Comments UI

- [ ] CommentSection.
- [ ] Load comments pagination.
- [ ] Tao comment/reply.
- [ ] Xoa comment.
- [ ] Optimistic update co rollback don gian.

Output:

- Comment tren UI chay duoc.

#### Ngay 5: Feed page

- [ ] Trang Home.
- [ ] Infinite scroll bang IntersectionObserver.
- [ ] Skeleton loading.
- [ ] Sidebar trai/phai co ban.

Output:

- Newsfeed dung duoc.

#### Ngay 6: Profile posts va detail page

- [ ] Hien bai viet tren profile.
- [ ] Trang `/post/:id`.
- [ ] Share modal.
- [ ] Reaction picker.

Output:

- Post flow gan hoan chinh.

#### Ngay 7: Test Phase 3

- [ ] Test tao/sua/xoa/like/comment/share tu UI.
- [ ] Test feed voi 2-3 users.
- [ ] Test responsive mobile.
- [ ] Fix bug uu tien.

Checkpoint:

- Day la MVP social core. Sau tuan 5 phai demo duoc auth + profile + friends + feed.

---

## Phase 4: Stories (Tuan 6)

### Ngay 1: Stories schema va API create

- [ ] Tao model `Story`.
- [ ] Tao model `StoryView`.
- [ ] `POST /api/stories`.
- [ ] Upload media.
- [ ] Set `expiresAt = now + 24h`.

Output:

- Tao story qua API.

### Ngay 2: Stories feed va view

- [ ] `GET /api/stories/feed`.
- [ ] Chi lay story chua het han.
- [ ] Group theo user.
- [ ] `POST /api/stories/:id/view`.
- [ ] `DELETE /api/stories/:id`.

Output:

- Story feed co view state.

### Ngay 3: Auto-expire

- [ ] Setup `node-cron`.
- [ ] Cron an/xoa stories het han.
- [ ] Index `expiresAt`.
- [ ] Test story het han.

Output:

- Story tu het han.

### Ngay 4: StoryBar va viewer

- [ ] StoryBar tren feed.
- [ ] StoryViewer full screen modal.
- [ ] Progress bar.
- [ ] Next/prev.

Output:

- Xem stories tren UI.

### Ngay 5: CreateStory UI

- [ ] Upload anh/video.
- [ ] Preview truoc khi dang.
- [ ] Text overlay don gian.
- [ ] Delete story cua minh.

Output:

- Tao/xoa story tu UI.

### Ngay 6: Polish mobile

- [ ] Responsive mobile.
- [ ] Auto-advance.
- [ ] Pause khi hover/touch.
- [ ] Viewers list cho owner.

Output:

- Stories dung tot tren mobile.

### Ngay 7: Test Phase 4

- [ ] Test tao/xem/viewer/het han/xoa.
- [ ] Test privacy ban be.
- [ ] Fix bug.

Checkpoint:

- Stories hoan thanh o muc can thiet.

---

## Phase 5: Realtime Chat (Tuan 7-8)

### Tuan 7: Backend chat va Socket.IO

#### Ngay 1: Chat schema

- [ ] Tao model `Conversation`.
- [ ] Tao model `ConversationMember`.
- [ ] Tao model `Message`.
- [ ] Them indexes conversation/message.
- [ ] Them unique member constraint.

Output:

- DB chat san sang.

#### Ngay 2: Socket.IO foundation

- [ ] Setup Socket.IO server.
- [ ] JWT auth cho socket.
- [ ] Map online users.
- [ ] Join room `user:{id}`.
- [ ] Broadcast online/offline cho friends.

Output:

- Client connect socket co auth.

#### Ngay 3: Conversation APIs

- [ ] `GET /api/conversations`.
- [ ] `POST /api/conversations`.
- [ ] Private conversation reuse neu da ton tai.
- [ ] Group conversation voi members.
- [ ] Include last message/unread count.

Output:

- Tao va list conversation.

#### Ngay 4: Message APIs

- [ ] `GET /api/conversations/:id/messages`.
- [ ] Pagination messages.
- [ ] Check member permission.
- [ ] Update `lastMessageAt`.

Output:

- Lay messages co phan trang.

#### Ngay 5: Send/reply/delete realtime

- [ ] `send_message` luu DB roi broadcast.
- [ ] `reply_message` voi `replyToId`.
- [ ] `delete_message` soft delete.
- [ ] API `DELETE /api/messages/:id`.
- [ ] Broadcast `message_deleted`.

Output:

- Chat realtime core chay duoc.

#### Ngay 6: Read/typing/online

- [ ] `typing`, `stop_typing`.
- [ ] `mark_read`.
- [ ] Cap nhat `lastReadAt`.
- [ ] `GET /api/users/online-friends`.
- [ ] Last seen.

Output:

- Chat co typing, read state, online.

#### Ngay 7: Backend chat tests

- [ ] Test 2 users chat realtime.
- [ ] Test group chat.
- [ ] Test reply/delete.
- [ ] Test member permission.

Checkpoint:

- Backend chat on dinh truoc khi lam UI.

---

### Tuan 8: Frontend chat UI

#### Ngay 1: Socket client va chat state

- [ ] Setup socket client.
- [ ] Connect khi login, disconnect khi logout.
- [ ] Auto reconnect.
- [ ] Chat slice.
- [ ] Sync events vao Redux.

Output:

- Frontend nhan duoc socket events.

#### Ngay 2: Messenger layout

- [ ] Trang `/messenger`.
- [ ] Layout desktop 2 cot.
- [ ] Mobile 1 cot.
- [ ] ConversationList.

Output:

- Khung chat hien thi conversations.

#### Ngay 3: ChatWindow

- [ ] Header conversation.
- [ ] Message list.
- [ ] Load more khi scroll len.
- [ ] Input gui text.
- [ ] Auto scroll bottom.

Output:

- Gui/nhan tin nhan realtime tu UI.

#### Ngay 4: Message interactions

- [ ] MessageBubble.
- [ ] Reply preview.
- [ ] ReplyBar.
- [ ] Delete/recall.
- [ ] Copy message.
- [ ] Deleted message state.

Output:

- Tuong tac tin nhan day du.

#### Ngay 5: Group chat UI

- [ ] Modal tao nhom.
- [ ] Chon members tu friends.
- [ ] Group info sidebar.
- [ ] Them/xoa thanh vien admin-only.
- [ ] Roi nhom.

Output:

- Group chat dung duoc.

#### Ngay 6: Chat polish

- [ ] Typing indicator.
- [ ] Online indicator.
- [ ] Unread badge.
- [ ] Sound notification neu kip.
- [ ] Attach image/file neu kip.

Output:

- Chat gan voi trai nghiem san pham.

#### Ngay 7: Test Phase 5

- [ ] Test 2 browsers/2 users.
- [ ] Test group chat.
- [ ] Test disconnect/reconnect.
- [ ] Test mobile responsive.
- [ ] Fix bug uu tien.

Checkpoint:

- Realtime chat hoan thanh.

---

## Phase 6: Video Call (Tuan 9)

### Ngay 1: Signaling backend

- [ ] Them socket events `call_user`, `answer_call`, `reject_call`, `end_call`.
- [ ] Them `toggle_media`.
- [ ] Check receiver online.
- [ ] Timeout cuoc goi sau 30s neu khong tra loi.

Output:

- Signaling co ban san sang.

### Ngay 2: Call state va call log

- [ ] Luu call log vao `Messages` type `call`.
- [ ] Xu ly busy state neu dang trong call.
- [ ] Broadcast call ended/rejected.
- [ ] Test event bang 2 clients.

Output:

- Backend call flow duoc kiem tra.

### Ngay 3: simple-peer va getUserMedia

- [ ] Setup `simple-peer`.
- [ ] Xin quyen camera/microphone.
- [ ] Hien local stream.
- [ ] Xu ly loi permission denied.

Output:

- Client lay duoc camera/mic.

### Ngay 4: Incoming/outgoing call UI

- [ ] CallModal incoming.
- [ ] OutgoingCall screen.
- [ ] Nut answer/reject/cancel.
- [ ] Ringtone neu kip.

Output:

- User co the goi va nhan loi moi goi.

### Ngay 5: VideoCallScreen

- [ ] Remote video lon.
- [ ] Local video nho.
- [ ] Mute mic.
- [ ] Toggle camera.
- [ ] End call.
- [ ] Timer.

Output:

- Video call 1-1 chay duoc.

### Ngay 6: Edge cases

- [ ] Receiver offline.
- [ ] Busy.
- [ ] Caller cancel.
- [ ] Receiver reject.
- [ ] Disconnect giua cuoc goi.

Output:

- Cac loi chinh khong lam app crash.

### Ngay 7: Test Phase 6

- [ ] Test Chrome/Edge.
- [ ] Test 2 may neu co.
- [ ] Test mobile browser neu co.
- [ ] Ghi chu han che WebRTC/TURN vao README.

Checkpoint:

- Video call dat muc demo production-lite. TURN server la Stretch.

---

## Phase 7: Notifications (Tuan 10)

### Ngay 1: Notification schema va service

- [ ] Tao model `Notification`.
- [ ] Tao `NotificationService`.
- [ ] `createNotification`.
- [ ] Luu DB.
- [ ] Emit socket `new_notification`.

Output:

- Tao notification noi bo duoc.

### Ngay 2: Tich hop notification events

- [ ] Like post.
- [ ] Comment post.
- [ ] Friend request.
- [ ] Friend accept.
- [ ] Share post.
- [ ] Message khi receiver offline.

Output:

- Event quan trong tao notification.

### Ngay 3: Notification APIs

- [ ] `GET /api/notifications`.
- [ ] `PUT /api/notifications/:id/read`.
- [ ] `PUT /api/notifications/read-all`.
- [ ] Pagination.
- [ ] Unread count.

Output:

- Lay va danh dau notification duoc.

### Ngay 4: Frontend notification

- [ ] Notification slice.
- [ ] NotificationBell.
- [ ] Dropdown list.
- [ ] Badge unread.
- [ ] Toast realtime.

Output:

- In-app notification chay duoc.

### Ngay 5: Notifications page

- [ ] Trang `/notifications`.
- [ ] Filter tat ca/chua doc.
- [ ] Click notification navigate dung noi dung.
- [ ] Mark read/read all.

Output:

- User quan ly notification duoc.

### Ngay 6: Firebase Cloud Messaging

- [ ] Setup Firebase project.
- [ ] Setup Firebase Admin SDK.
- [ ] `POST /api/users/fcm-token`.
- [ ] Service worker `firebase-messaging-sw.js`.
- [ ] Gui push khi user offline.

Output:

- FCM chay duoc neu browser cho phep.

### Ngay 7: Test Phase 7

- [ ] Test notification realtime.
- [ ] Test unread count.
- [ ] Test FCM background.
- [ ] Neu FCM cham: giu in-app la Must-have, ghi FCM la known limitation.

Checkpoint:

- In-app notification bat buoc xong; FCM co gang hoan thanh trong tuan 10.

---

## Phase 8: Deploy, Testing & Launch (Tuan 11-12)

### Tuan 11: Production setup va deploy

#### Ngay 1: Docker production

- [ ] Dockerfile client multi-stage build.
- [ ] Dockerfile server production.
- [ ] `docker-compose.prod.yml`.
- [ ] `.dockerignore`.
- [ ] Health checks.

Output:

- Production build chay local.

#### Ngay 2: Nginx

- [ ] Reverse proxy `/api`.
- [ ] Reverse proxy `/socket.io`.
- [ ] Serve React static files.
- [ ] Gzip.
- [ ] Cache static assets.

Output:

- Nginx route dung client/API/socket.

#### Ngay 3: VPS setup

- [ ] Chuan bi VPS Ubuntu.
- [ ] Cai Docker va Docker Compose.
- [ ] Setup firewall UFW.
- [ ] Setup SSH key.
- [ ] Clone repo.

Output:

- Server san sang deploy.

#### Ngay 4: Domain va SSL

- [ ] Cau hinh DNS A record.
- [ ] Setup Let's Encrypt.
- [ ] HTTPS redirect.
- [ ] Test WebSocket qua HTTPS.

Output:

- Domain HTTPS chay duoc.

#### Ngay 5: Production database

- [ ] Tao production database.
- [ ] Chay migrations.
- [ ] Seed admin/test data neu can.
- [ ] Cau hinh backup PostgreSQL.
- [ ] Kiem tra restore backup thu cong neu kip.

Output:

- DB production co backup.

#### Ngay 6: Deploy full app

- [ ] Chay `docker compose -f docker-compose.prod.yml up -d`.
- [ ] Kiem tra logs.
- [ ] Test auth/feed/chat tren production.
- [ ] Fix config/env loi.

Output:

- App online ban dau.

#### Ngay 7: Deploy hardening

- [ ] Restart policy.
- [ ] Log rotation.
- [ ] Basic monitoring.
- [ ] Cap nhat README deploy.
- [ ] Tao checklist rollback thu cong.

Checkpoint:

- Production environment san sang cho test cuoi.

---

### Tuan 12: Testing, optimization va launch

#### Ngay 1: Regression test core

- [ ] Auth full flow.
- [ ] Profile/friends.
- [ ] Post/feed/comment/like/share.
- [ ] Stories.
- [ ] Chat.
- [ ] Notifications.

Output:

- Danh sach bug uu tien.

#### Ngay 2: Realtime va WebRTC test

- [ ] Test 2 users chat.
- [ ] Test online/offline.
- [ ] Test unread/read state.
- [ ] Test video call.
- [ ] Test disconnect/reconnect.

Output:

- Realtime on dinh o muc demo.

#### Ngay 3: Security audit

- [ ] Kiem tra auth middleware tat ca protected routes.
- [ ] Kiem tra owner/admin/member authorization.
- [ ] Kiem tra input validation.
- [ ] Kiem tra upload limit/type.
- [ ] Kiem tra CORS.
- [ ] Chay `npm audit`.

Output:

- Khong co loi bao mat nghiem trong da biet.

#### Ngay 4: Performance optimization

- [ ] Them/kiem tra indexes.
- [ ] Sua query N+1.
- [ ] Lazy load routes.
- [ ] Image lazy loading.
- [ ] Bundle analysis neu kip.

Output:

- App muot hon voi data mau.

#### Ngay 5: UI/UX polish

- [ ] Responsive mobile/tablet.
- [ ] Loading states.
- [ ] Empty states.
- [ ] Error states.
- [ ] Toast messages.
- [ ] Fix overlap/text overflow.

Output:

- UI du polished de demo.

#### Ngay 6: Documentation

- [ ] README setup local.
- [ ] README deploy.
- [ ] ENV variables.
- [ ] API overview.
- [ ] Known limitations.
- [ ] Screenshots/demo notes.

Output:

- Project co the nguoi khac clone va chay.

#### Ngay 7: Launch

- [ ] Final test tren production.
- [ ] Backup database.
- [ ] Kiem tra logs.
- [ ] Tag release `v1.0.0`.
- [ ] Ghi changelog.
- [ ] Launch.

Checkpoint:

- Project hoan thanh 12 tuan voi day du core features.

---

## Bang Tong Ket Deliverables

| Phase | Tuan  | Deliverable                          |
| ----- | ----- | ------------------------------------ |
| 1     | 1-2   | Docker + DB + Auth end-to-end        |
| 2     | 3     | Profile + upload + friends           |
| 3     | 4-5   | Posts + feed + like/comment/share    |
| 4     | 6     | Stories 24h                          |
| 5     | 7-8   | Realtime chat 1-1/nhom               |
| 6     | 9     | Video call 1-1                       |
| 7     | 10    | In-app notification + FCM            |
| 8     | 11-12 | Production deploy + testing + launch |

---

## Checklist Uu Tien Khi Cham Tien Do

Cat truoc:

- [ ] OAuth2 Google.
- [ ] Trending/sidebar nang cao.
- [ ] Advanced story editor.
- [ ] Chat sound/animation nang cao.
- [ ] FCM neu in-app notification da xong.
- [ ] TURN server.
- [ ] CI/CD nang cao.

Khong cat:

- [ ] Auth va authorization.
- [ ] Database migrations.
- [ ] Profile/friends.
- [ ] Posts/feed/comment/like.
- [ ] Chat core.
- [ ] Deploy production.
- [ ] README.

---

## Cong Cu Ho Tro

| Cong cu                | Muc dich           |
| ---------------------- | ------------------ |
| Postman/Thunder Client | Test API           |
| pgAdmin/DBeaver        | Quan ly PostgreSQL |
| Docker Desktop         | Quan ly containers |
| VS Code                | Code editor        |
| Git/GitHub             | Version control    |
| Chrome DevTools        | Debug frontend     |
| Cloudinary Dashboard   | Quan ly media      |
| Firebase Console       | Push notification  |
