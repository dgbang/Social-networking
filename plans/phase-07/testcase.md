# Phase 7: Notifications Testcases

## Nguon requirement va design

- `plans/phase-07/req.md`
- `plans/phase-07/design.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`

## Pham vi test

Phase 7 test cac nhom chuc nang:

- Notification schema/service.
- Notification API list/read/read-all.
- Event tao notification tu like/comment/friend/share/message offline.
- Socket realtime `new_notification` va `notification_count`.
- Frontend NotificationBell/dropdown/page.
- FCM token API foundation.

## Gia dinh va du lieu test

- `user_a`: user dang login.
- `user_b`: friend cua `user_a`.
- `user_c`: khong phai friend cua `user_a`.
- `post_b`: post public/friends cua `user_b` ma `user_a` co quyen xem.
- `conversation_ab`: private conversation giua `user_a` va `user_b`.
- `notification_a_unread`: notification chua doc cua `user_a`.
- `notification_b`: notification cua `user_b`.

## Manual Testcases

| ID | Feature | Scenario | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- |
| P07-MANUAL-001 | Bell | Badge unread hien dung | Login user co 3 notification unread | Bell hien badge 3 | High |
| P07-MANUAL-002 | Dropdown | Mo dropdown notification | Click bell tren Navbar | Dropdown hien notification moi nhat, unread item co style rieng | High |
| P07-MANUAL-003 | Realtime | Nhan notification realtime | Login user_b, user_a like post_b tu browser khac | user_b thay toast/dropdown cap nhat, badge tang | High |
| P07-MANUAL-004 | Mark read | Doc mot notification | Click notification unread | Item duoc mark read, badge giam, navigate dung target | High |
| P07-MANUAL-005 | Mark all | Doc tat ca notification | Click Mark all read | Badge ve 0, cac item chuyen read | High |
| P07-MANUAL-006 | Page | Xem trang notifications | Mo `/notifications` | List hien day du, co filter Tat ca/Chua doc | High |
| P07-MANUAL-007 | Offline message | Message khi receiver offline | user_b logout/disconnect, user_a gui message | user_b co notification message khi login lai/list API | Medium |
| P07-MANUAL-008 | FCM token | Luu token client | Goi UI/DevTools dang ky token neu co | API luu token khong crash; push thuc te co the NOT RUN neu chua config | Medium |

## API Testcases

| ID | Endpoint | Method | Scenario | Payload / Params | Expected Result |
| --- | --- | --- | --- | --- | --- |
| P07-API-001 | `/api/notifications` | GET | List notification thanh cong | token user_a | 200; tra `notifications`, `unreadCount`, meta `hasMore/nextCursor` |
| P07-API-002 | `/api/notifications` | GET | Filter unread | `status=unread` | 200; tat ca item `isRead=false` |
| P07-API-003 | `/api/notifications` | GET | Filter read | `status=read` | 200; tat ca item `isRead=true` |
| P07-API-004 | `/api/notifications` | GET | Limit invalid | `limit=999` | 422 validation |
| P07-API-005 | `/api/notifications` | GET | Cursor invalid | `cursor=abc` | 422 validation |
| P07-API-006 | `/api/notifications` | GET | Chua login | khong token | 401 |
| P07-API-007 | `/api/notifications/:id/read` | PUT | Mark read notification cua minh | `:id=notification_a_unread.id` | 200; `notification.isRead=true`, unread count giam |
| P07-API-008 | `/api/notifications/:id/read` | PUT | Mark read idempotent | Goi lai cung id | 200; unread count khong giam am |
| P07-API-009 | `/api/notifications/:id/read` | PUT | Mark read notification user khac | `:id=notification_b.id` voi token user_a | 404 |
| P07-API-010 | `/api/notifications/:id/read` | PUT | Invalid id | `:id=abc` | 422 |
| P07-API-011 | `/api/notifications/read-all` | PUT | Mark all read | token user_a | 200; unread count = 0 |
| P07-API-012 | `/api/users/fcm-token` | POST | Luu FCM token | `{ "token": "valid-token-string" }` | 200; `saved=true` |
| P07-API-013 | `/api/users/fcm-token` | POST | Token invalid | `{ "token": "" }` | 422 |

## Event Testcases

| ID | Event | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P07-EVENT-001 | Like | Like post cua user khac | user_a like post_b | Notification `like` tao cho user_b |
| P07-EVENT-002 | Like self | Like post cua minh | user_b like post_b | Khong tao notification |
| P07-EVENT-003 | Unlike | Toggle unlike | user_a unlike post_b | Khong tao notification moi |
| P07-EVENT-004 | Comment | Comment post cua user khac | user_a comment post_b | Notification `comment` tao cho user_b |
| P07-EVENT-005 | Comment self | Comment post cua minh | user_b comment post_b | Khong tao notification |
| P07-EVENT-006 | Friend request | Gui request | user_a request user_c | Notification `friend_request` tao cho user_c |
| P07-EVENT-007 | Friend accept | Accept request | user_c accept user_a | Notification `friend_accept` tao cho user_a |
| P07-EVENT-008 | Share | Share post cua user khac | user_a share post_b | Notification `share` tao cho user_b |
| P07-EVENT-009 | Message offline | Gui message khi receiver offline | user_a gui message conversation_ab khi user_b offline | Notification `message` tao cho user_b |
| P07-EVENT-010 | Message online | Gui message khi receiver online | user_a gui message khi user_b online | Khong bat buoc tao offline notification |

## Socket Testcases

| ID | Socket | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P07-SOCKET-001 | `new_notification` | Receiver online | Tao notification cho user_b dang connect socket | user_b nhan event co notification |
| P07-SOCKET-002 | `notification_count` | Count sync | Tao/mark read notification | user_b nhan count moi |
| P07-SOCKET-003 | Reconnect | Client reconnect | Ngat/ket noi lai socket | Client fetch lai unread count/list |

## UI Testcases

| ID | Screen | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P07-UI-001 | Navbar | Badge unread | Login co unread | Badge hien dung count, an khi count 0 |
| P07-UI-002 | Dropdown | Empty state | User chua co notification | Dropdown hien empty state gon, khong crash |
| P07-UI-003 | Dropdown | Mark read item | Click item unread | Item read va navigate dung |
| P07-UI-004 | Dropdown | Mark all read | Click action | Badge clear, list sync |
| P07-UI-005 | Page | Filter unread | Chon tab Chua doc | Chi hien unread |
| P07-UI-006 | Page | Load more | Co nhieu notification | Bam Load more them item, khong duplicate |
| P07-UI-007 | Responsive | Mobile navbar/page | Mo mobile viewport | Bell/dropdown/page khong overlap/clip |

## Edge Cases

- Notification emit socket loi nhung event chinh van thanh cong.
- Notification tao cho user da offline: DB van luu, user thay khi load API.
- Reference target bi xoa sau khi notification tao: click khong crash, co fallback route.
- User mark read notification cua nguoi khac: tra 404.
- Cursor pagination voi notification cung timestamp khong duplicate theo page co ban.
- FCM token qua dai/rong bi validation.

## Regression Checklist

- [ ] Auth login/logout/refresh van hoat dong.
- [ ] Profile/friends Phase 2 van hoat dong sau khi them notification.
- [ ] Post like/comment/share Phase 3 van hoat dong.
- [ ] Chat Phase 5 van gui/nhan message realtime.
- [ ] Video call Phase 6 khong bi anh huong boi socket notification.
- [ ] Backend tests Phase 1-6 quan trong van pass.
- [ ] Frontend build pass.

## Automation Mapping

| Nhom | Muc automate de xuat |
| --- | --- |
| Service create/list/read | Unit test `notification.service.test.js` |
| Event friend/like/comment/share | Unit test service lien quan voi mock notification service |
| API list/read/read-all | Supertest neu co DB test setup |
| UI bell/page | Manual/E2E ve sau |
| Socket realtime | Manual 2 clients hoac integration ve sau |

## Cau hoi can xac nhan

- Co can gom nhieu notification message offline thanh mot notification/conversation khong?
- Co can auto delete notification cu sau N ngay khong?
- Co can FCM that trong Phase 7 hay chap nhan foundation/no-op khi chua config Firebase?
