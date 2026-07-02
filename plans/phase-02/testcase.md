# Phase 2: User Profile & Friends Testcases

## Nguon requirement va design

- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`
- `plans/phase-02/req.md`
- `plans/phase-02/design.md`

## Pham vi test

Phase 2 test cac nhom chuc nang:

- User profile backend: lay profile, cap nhat profile, xem profile user khac, search user.
- Upload avatar/cover: crop tren UI, validate file image, validate size 5MB, upload thanh cong.
- Friends backend: request, accept, reject, unfriend, friends list, requests, suggestions, auto-create private chat khi accept.
- Frontend profile: hien thi profile, edit profile, crop/upload avatar cover, owner vs non-owner.
- Frontend friends: tabs, UserCard, add/accept/reject/unfriend, search tren navbar.
- Security/permission: auth required, khong expose sensitive fields, chi owner thay email.

## Khong tao testcase chi tiet cho setup

Phase 2 co mot so viec setup nhu Multer, Cloudinary config, migration/model `Friendship`. Cac viec nay se duoc verify thong qua API/UI testcase va checklist ngan, khong tach thanh testcase setup chi tiet.

## Setup Verification Checklist

- [ ] Migration `Friendships` chay duoc tu database rong.
- [ ] Rollback migration `Friendships` chay duoc.
- [ ] Server start thanh cong sau khi them user/friend routes.
- [ ] Cloudinary env duoc cau hinh trong local `.env` va khong commit secret.
- [ ] Upload middleware gioi han image va size 5MB.
- [ ] Migration them `avatarPublicId` va `coverPhotoPublicId` vao `Users` chay duoc va rollback duoc.
- [ ] Frontend build/chay dev server sau khi them profile/friends UI.

## Gia dinh va du lieu test

Du lieu test de xuat:

- `userA`: owner/current user, da login, co access token hop le.
- `userB`: user khac, chua co friendship voi `userA`.
- `userC`: user da co friendship accepted voi `userA`.
- `userD`: user da gui pending request toi `userA`.
- `userE`: user co pending request tu `userA`.
- `userF`: user da bi reject request voi `userA`.

File test:

- `valid-avatar.jpg`: image hop le, nho hon 5MB.
- `valid-cover.png`: image hop le, nho hon 5MB.
- `too-large-image.jpg`: image lon hon 5MB.
- `not-image.pdf`: file khong phai image.

Quy uoc:

- Tat ca API Phase 2 mac dinh can Bearer access token hop le.
- Profile user khac khong duoc tra ve email.
- Search chi theo `username` va `fullName`, khong search email.
- Upload avatar/cover luu URL va Cloudinary publicId.
- Reject friend request giu record voi status `rejected`.
- Unfriend xoa record friendship `accepted`.
- UI `blocked` chua nam trong Phase 2.

## Manual Testcases

| ID | Feature | Scenario | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- |
| P02-MANUAL-001 | Profile | Owner xem profile cua minh | Dang nhap bang `userA` -> vao trang profile cua minh | Hien avatar, cover, fullName, username, bio va email cua `userA`; co nut edit profile | High |
| P02-MANUAL-002 | Profile | User xem profile nguoi khac | Dang nhap bang `userA` -> vao profile `userB` | Hien avatar, cover, fullName, username, bio cua `userB`; khong hien email; khong hien nut edit profile | High |
| P02-MANUAL-003 | Profile | Cap nhat profile co ban | Dang nhap `userA` -> mo edit profile -> sua fullName/bio -> save | UI hien thong tin moi, refresh trang van giu thong tin moi | High |
| P02-MANUAL-004 | Upload | Crop va upload avatar | Dang nhap `userA` -> chon avatar hop le -> crop -> save | Avatar moi hien tren profile va navbar neu co; anh da crop dung khung | High |
| P02-MANUAL-005 | Upload | Crop va upload cover | Dang nhap `userA` -> chon cover hop le -> crop -> save | Cover moi hien tren profile; anh da crop dung khung cover | High |
| P02-MANUAL-006 | Upload | Upload file sai type | Dang nhap `userA` -> chon `not-image.pdf` lam avatar/cover | UI hien loi file khong hop le, khong upload | High |
| P02-MANUAL-007 | Upload | Upload file qua 5MB | Dang nhap `userA` -> chon `too-large-image.jpg` | UI/API hien loi file qua gioi han, khong upload | High |
| P02-MANUAL-008 | Search | Search user theo username | Dang nhap `userA` -> search username cua `userB` tren navbar | Ket qua co `userB`, khong hien email | High |
| P02-MANUAL-009 | Search | Search user theo fullName | Dang nhap `userA` -> search fullName cua `userB` tren navbar | Ket qua co `userB`, khong hien email | High |
| P02-MANUAL-010 | Search | Search bang email | Dang nhap `userA` -> search email cua `userB` | Khong tra ket qua dua tren email, khong expose email | High |
| P02-MANUAL-011 | Friends | Gui loi moi ket ban | Dang nhap `userA` -> vao profile/suggestion cua `userB` -> bam Add Friend | Trang thai chuyen thanh pending/sent request; request xuat hien cho `userB` | High |
| P02-MANUAL-012 | Friends | Chap nhan loi moi | Dang nhap `userA` co request tu `userD` -> bam Accept | `userD` vao danh sach friends cua `userA`; request bien mat khoi tab requests | High |
| P02-MANUAL-013 | Friends | Tu choi loi moi | Dang nhap `userA` co request tu `userD` -> bam Reject | Request bien mat khoi tab requests; `userD` khong vao friends list | High |
| P02-MANUAL-014 | Friends | Huy/xoa ban | Dang nhap `userA` -> vao friends list -> unfriend `userC` | `userC` bien mat khoi friends list; co the xuat hien lai trong suggestions neu thiet ke cho phep | High |
| P02-MANUAL-015 | Friends | Suggestions loai user da co quan he | Dang nhap `userA` -> vao tab suggestions | Khong hien `userA`, `userC`, `userD` pending, `userE` pending; co the hien `userB` | Medium |
| P02-MANUAL-016 | UI State | Empty states | Dung account khong co friends/requests/suggestions -> mo Friends page | UI hien empty state ro rang, khong bi trang trong kho hieu | Medium |
| P02-MANUAL-017 | UI State | Loading/error states | Mo profile/friends khi API cham hoac bi loi | UI co loading/error state, khong crash | Medium |
| P02-MANUAL-018 | Chat handoff | Nhan tin tu profile ban be | Dang nhap `userA` -> vao profile accepted friend `userC` -> bam Nhan tin | Mo `/messenger?conversationId=...` va select private conversation voi `userC` | High |

## API Testcases

| ID | Endpoint | Method | Scenario | Payload / Params | Expected Result |
| --- | --- | --- | --- | --- | --- |
| P02-USER-001 | `/api/users/me` | GET | Lay profile current user thanh cong | Bearer token `userA` | 200; `success=true`; tra `id`, `username`, `email`, `fullName`, `avatar`, `coverPhoto`, `bio`; khong co password/token fields |
| P02-USER-002 | `/api/users/me` | GET | Chua login | Khong co token | 401; khong tra profile |
| P02-USER-003 | `/api/users/me` | PUT | Cap nhat profile thanh cong | `{ "fullName": "User A New", "bio": "New bio" }` | 200; profile tra ve fullName/bio moi |
| P02-USER-004 | `/api/users/me` | PUT | Khong cho update email/password | `{ "email": "hack@example.com", "password": "new" }` | Email/password khong doi; response khong expose password |
| P02-USER-005 | `/api/users/me` | PUT | Validation fail fullName/bio | fullName/bio vuot gioi han theo validation | 400; `success=false`; co error details |
| P02-USER-006 | `/api/users/:id` | GET | Xem profile user khac | `:id=userB.id`, token `userA` | 200; tra profile `userB`; khong co email/password/token fields |
| P02-USER-007 | `/api/users/:id` | GET | Xem profile chinh minh qua id | `:id=userA.id`, token `userA` | 200; tra profile `userA`; co email cua owner |
| P02-USER-008 | `/api/users/:id` | GET | User khong ton tai | UUID hop le khong ton tai | 404; error `USER_NOT_FOUND` hoac message tuong duong |
| P02-USER-009 | `/api/users/:id` | GET | Invalid user id | `:id=abc` | 400; validation error |
| P02-USER-010 | `/api/users/search?q=` | GET | Search theo username | `q=userB.username` | 200; co `userB`; khong tra email |
| P02-USER-011 | `/api/users/search?q=` | GET | Search theo fullName | `q=userB.fullName` | 200; co `userB`; khong tra email |
| P02-USER-012 | `/api/users/search?q=` | GET | Search theo email khong duoc ho tro | `q=userB.email` | 200; khong tim bang email; khong tra email trong item |
| P02-USER-013 | `/api/users/search?q=` | GET | Query qua ngan | `q=a` | 400; validation error |
| P02-USER-014 | `/api/users/search?q=` | GET | Limit qua lon | `q=user&limit=999` | 200 hoac 400 theo validation; khong tra qua max limit da chot |
| P02-UPLOAD-001 | `/api/users/me/avatar` | POST | Upload avatar thanh cong | multipart `avatar=valid-avatar.jpg`, token `userA` | 200; tra avatar URL moi; profile sau do hien avatar moi |
| P02-UPLOAD-002 | `/api/users/me/cover` | POST | Upload cover thanh cong | multipart `cover=valid-cover.png`, token `userA` | 200; tra coverPhoto URL moi; profile sau do hien cover moi |
| P02-UPLOAD-003 | `/api/users/me/avatar` | POST | Upload avatar luu publicId | multipart `avatar=valid-avatar.jpg`, token `userA` | 200; DB luu `avatar` va `avatarPublicId` moi |
| P02-UPLOAD-004 | `/api/users/me/cover` | POST | Upload cover luu publicId | multipart `cover=valid-cover.png`, token `userA` | 200; DB luu `coverPhoto` va `coverPhotoPublicId` moi |
| P02-UPLOAD-005 | `/api/users/me/avatar` | POST | Doi avatar xoa anh cu | User da co `avatarPublicId` cu, upload avatar moi | DB luu avatar moi; service goi xoa Cloudinary voi publicId cu sau khi DB update thanh cong |
| P02-UPLOAD-006 | `/api/users/me/cover` | POST | Doi cover xoa anh cu | User da co `coverPhotoPublicId` cu, upload cover moi | DB luu cover moi; service goi xoa Cloudinary voi publicId cu sau khi DB update thanh cong |
| P02-UPLOAD-007 | `/api/users/me/avatar` | POST | Xoa anh cu fail | Mock Cloudinary delete fail sau khi DB update avatar moi | API khong rollback avatar moi; backend log loi xoa anh cu |
| P02-UPLOAD-008 | `/api/users/me/avatar` | POST | Sai file type | multipart `avatar=not-image.pdf` | 400; error `INVALID_UPLOAD_TYPE` hoac tuong duong |
| P02-UPLOAD-009 | `/api/users/me/cover` | POST | File qua 5MB | multipart `cover=too-large-image.jpg` | 400; error `UPLOAD_TOO_LARGE` hoac tuong duong |
| P02-UPLOAD-010 | `/api/users/me/avatar` | POST | Khong co file | multipart khong co `avatar` | 400; validation/upload error |
| P02-UPLOAD-011 | `/api/users/me/avatar` | POST | Chua login | multipart `avatar=valid-avatar.jpg`, khong token | 401 |
| P02-FRIEND-001 | `/api/friends/request/:userId` | POST | Gui request thanh cong | `:userId=userB.id`, token `userA` | 201/200; friendship status `pending`; requester=`userA`, addressee=`userB` |
| P02-FRIEND-002 | `/api/friends/request/:userId` | POST | Gui request cho chinh minh | `:userId=userA.id` | 400; error `FRIEND_REQUEST_SELF` hoac tuong duong |
| P02-FRIEND-003 | `/api/friends/request/:userId` | POST | Duplicate request cung chieu | Gui lai request `userA -> userB` | 409; khong tao duplicate |
| P02-FRIEND-004 | `/api/friends/request/:userId` | POST | Duplicate request nguoc chieu | Da co `userB -> userA` pending, `userA` gui lai cho `userB` | 409 hoac xu ly theo design; khong tao duplicate cap nguoc |
| P02-FRIEND-005 | `/api/friends/request/:userId` | POST | Gui request toi user da la friend | `:userId=userC.id` | 409; error `ALREADY_FRIENDS` hoac tuong duong |
| P02-FRIEND-006 | `/api/friends/request/:userId` | POST | User target khong ton tai | UUID hop le khong ton tai | 404 |
| P02-FRIEND-007 | `/api/friends/accept/:userId` | PUT | Accept request thanh cong | `:userId=userD.id`, token `userA` | 200; friendship status `accepted`; response co private conversation giua hai user |
| P02-FRIEND-008 | `/api/friends/accept/:userId` | PUT | User khong phai addressee accept | `userB` accept request khong gui toi minh | 403/404; khong doi status |
| P02-FRIEND-009 | `/api/friends/accept/:userId` | PUT | Accept request khong ton tai | `:userId=userB.id` khi khong co pending request | 404 |
| P02-FRIEND-010 | `/api/friends/reject/:userId` | PUT | Reject request thanh cong | `:userId=userD.id`, token `userA` | 200; request khong con pending; record friendship duoc giu voi status `rejected` |
| P02-FRIEND-011 | `/api/friends/reject/:userId` | PUT | User khong phai addressee reject | `userB` reject request khong gui toi minh | 403/404; khong doi status |
| P02-FRIEND-012 | `/api/friends/request/:userId` | POST | Gui lai request sau khi bi reject | Da co record `rejected` giua `userA` va `userB`, `userA` gui request lai | 200/201; record cu duoc update ve `pending`, khong tao duplicate |
| P02-FRIEND-013 | `/api/friends/:userId` | DELETE | Unfriend thanh cong | `:userId=userC.id`, token `userA` | 200; record friendship `accepted` bi xoa; hai user khong con trong friends list |
| P02-FRIEND-014 | `/api/friends/:userId` | DELETE | Unfriend khi chua la friend | `:userId=userB.id` | 404/409; khong crash |
| P02-FRIEND-015 | `/api/friends` | GET | Lay danh sach friends | token `userA` | 200; co `userC`; khong co pending/rejected; item khong co email |
| P02-FRIEND-016 | `/api/friends/requests` | GET | Lay loi moi dang cho | token `userA` | 200; co request tu `userD`; khong co request `userA` da gui di va khong co rejected |
| P02-FRIEND-017 | `/api/friends/suggestions` | GET | Lay suggestions | token `userA` | 200; loai current user, accepted friends, pending requests; item khong co email |
| P02-FRIEND-018 | `/api/friends/suggestions` | GET | Limit suggestions | `limit=5` | 200; so item <= 5 |
| P02-FRIEND-019 | `/api/friends` | GET | Chua login | Khong token | 401 |

## UI Testcases

| ID | Screen | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P02-UI-001 | Profile | Protected profile route | Logout -> mo profile page | Bi redirect ve login hoac hien yeu cau dang nhap |
| P02-UI-002 | Profile | Owner profile hien email/edit | Login `userA` -> mo profile minh | Hien email va nut edit profile |
| P02-UI-003 | Profile | Non-owner profile an email/edit | Login `userA` -> mo profile `userB` | Khong hien email, khong hien nut edit profile |
| P02-UI-004 | Profile | Edit profile success | Login `userA` -> edit fullName/bio -> save | Modal dong, toast/thong bao thanh cong, UI cap nhat |
| P02-UI-005 | Profile | Edit profile validation fail | Nhap fullName/bio khong hop le -> save | Hien loi validation, khong cap nhat UI sai |
| P02-UI-006 | Profile | Avatar crop | Chon avatar image -> mo crop UI -> crop -> save | Preview dung vung crop; avatar sau save dung anh crop |
| P02-UI-007 | Profile | Cover crop | Chon cover image -> mo crop UI -> crop -> save | Preview dung vung crop; cover sau save dung anh crop |
| P02-UI-008 | Profile | Upload error | Chon file sai type/qua size | Hien loi ro rang, khong crash |
| P02-UI-009 | Navbar Search | Search dropdown/result | Nhap username/fullName | Hien user matching, khong hien email; click vao profile dung |
| P02-UI-010 | Navbar Search | Query email | Nhap email user khac | Khong search theo email, khong expose email |
| P02-UI-011 | Friends | Friends tab | Mo `/friends` tab Friends | Hien danh sach friends va nut Unfriend phu hop |
| P02-UI-012 | Friends | Requests tab | Mo tab Requests | Hien request pending den current user va nut Accept/Reject |
| P02-UI-013 | Friends | Suggestions tab | Mo tab Suggestions | Hien user co the add friend va nut Add Friend |
| P02-UI-014 | Friends | Add friend action | Bam Add Friend tren `userB` | Nut chuyen sang Pending/Sent, khong cho bam duplicate |
| P02-UI-015 | Friends | Accept action | Bam Accept request tu `userD` | User chuyen sang friends list, request bien mat |
| P02-UI-016 | Friends | Reject action | Bam Reject request tu `userD` | Request bien mat, user khong vao friends list |
| P02-UI-017 | Friends | Unfriend action | Bam Unfriend `userC` va confirm neu co | User bien mat khoi friends list |
| P02-UI-018 | Profile | Message accepted friend | Mo profile accepted friend -> bam Nhan tin | Dieu huong toi Messenger va chon dung private conversation |
| P02-UI-019 | Responsive | Mobile profile/friends | Mo profile/friends o mobile viewport | Khong overlap text/UI; crop modal va action buttons dung duoc |

## Edge Cases

- Search query co khoang trang dau/cuoi: backend trim va tra ket qua dung.
- Search query khong co ket qua: API tra danh sach rong, UI hien empty state.
- Hai request ket ban gui gan dong thoi giua cung hai user: khong tao duplicate friendship.
- Accept request da bi reject/accepted truoc do: API tra loi loi hop le, khong doi sai status.
- Unfriend hai lan lien tiep: lan dau thanh cong, lan hai tra loi loi hop le.
- Upload avatar thanh cong nhung cap nhat DB fail: khong lam user thay avatar sai; can log/xu ly file moi da upload neu can.
- Xoa Cloudinary publicId cu fail sau khi DB update thanh cong: khong rollback anh moi, backend log loi.
- Cloudinary loi tam thoi: API tra loi loi than thien, khong expose secret/raw stack.
- Access token het han: frontend xu ly theo auth flow Phase 1, khong mat trang.
- User bi xoa/khong ton tai nhung van nam trong friendship cu: friends APIs khong crash.
- File crop ra dung image MIME nhung kich thuoc van qua 5MB: backend van phai tu choi.
- UI blocked khong xuat hien trong Phase 2 du `blocked` co trong schema.

## Regression Checklist

- [ ] Auth login/logout van hoat dong sau khi them profile/friends.
- [ ] Protected route van chan user chua login.
- [ ] Navbar hien user dang login dung sau khi update avatar/fullName.
- [ ] Response format van dung `success`, `message`, `data`, `error`, `meta`.
- [ ] API khong tra `password`, `refreshTokenHash`, `verificationToken`, `resetPasswordToken`, `resetPasswordExpires`.
- [ ] Profile owner co the tra URL anh nhung khong bat buoc expose publicId cho user khac.
- [ ] `.env` va Cloudinary secret khong bi commit.
- [ ] Migration tu DB rong chay duoc.
- [ ] Backend tests friends core chay pass.
- [ ] Frontend build pass.

## Automation Mapping

| Test group | Nen automate o dau |
| --- | --- |
| Profile API | Backend integration test voi Jest/Supertest |
| Search API | Backend integration test voi Jest/Supertest |
| Upload API | Backend integration test voi mock Cloudinary hoac test env |
| Friendship service | Backend unit/integration test |
| Friends API | Backend integration test |
| Profile/Friends UI | Manual E2E truoc, Playwright/Cypress neu co thoi gian |
| Crop UI | Manual E2E va component test neu co setup |

## Cau hoi can xac nhan

- Profile user khac co public voi guest chua login khong? Testcase hien mac dinh Phase 2 yeu cau login theo design de xuat.
