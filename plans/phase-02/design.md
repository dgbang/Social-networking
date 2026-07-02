# Phase 2: User Profile & Friends Design

## Quyet dinh da chot

- Profile user khac khong tra/hien email; chi owner moi thay email cua chinh minh.
- Search user chi query theo `username` va `fullName`; khong query theo email.
- Avatar/cover can co crop anh trong UI truoc khi upload/luu.
- Status `blocked` giu trong schema `Friendships` cho phase sau, chua lam UI blocked trong Phase 2.
- Them `avatarPublicId` va `coverPhotoPublicId` vao `Users`.
- Reject friend request: update status thanh `rejected`, khong xoa record.
- Unfriend: xoa record friendship `accepted`.

## Tong quan thiet ke

Phase 2 mo rong tren nen tang auth Phase 1 de them profile, upload avatar/cover va friends.

Huong thiet ke:

- Backend tiep tuc la source of truth cho profile, upload va friendship.
- Frontend goi REST API qua Axios instance da co auth token.
- Upload anh dung Multer de nhan file va Cloudinary de luu media.
- Frontend crop avatar/cover truoc khi upload de backend nhan file image da crop.
- Friendship dung bang rieng `Friendships` voi status de phuc vu friends, feed va chat ve sau.
- Moi route sua du lieu can auth middleware va authorization ro rang.

## Nguon requirement

- `plans/phase-02/req.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`
- `plans/phase-01/req.md`
- `plans/phase-01/design.md`

## Kien truc va module lien quan

### Backend modules

- `server/src/routes/user.routes.js`: routes profile/search/upload.
- `server/src/controllers/user.controller.js`: nhan request/response cho user/profile.
- `server/src/services/user.service.js`: xu ly query/update/search profile.
- `server/src/routes/friend.routes.js`: routes friendship.
- `server/src/controllers/friend.controller.js`: nhan request/response cho friends.
- `server/src/services/friend.service.js`: xu ly request/accept/reject/unfriend/list/suggestions.
- `server/src/middlewares/auth.middleware.js`: verify user dang nhap.
- `server/src/middlewares/validate.middleware.js`: validate body/params/query.
- `server/src/middlewares/upload.middleware.js`: Multer config va file filter.
- `server/src/services/upload.service.js`: Cloudinary upload/delete neu tach rieng.
- `server/src/models/user.model.js`: dung schema Users da co.
- `server/src/models/friendship.model.js`: model Friendship moi.
- `server/src/migrations/*create-friendships*.js`: migration tao bang Friendships.

### Frontend modules

- `client/src/api/userApi.js`: API profile/search/upload.
- `client/src/api/friendApi.js`: API friends.
- `client/src/pages/ProfilePage.jsx`: trang profile.
- `client/src/pages/FriendsPage.jsx`: trang friends.
- `client/src/components/profile/EditProfileModal.jsx`: modal sua profile.
- `client/src/components/profile/ProfileHeader.jsx`: cover/avatar/name/bio/action va nut nhan tin cho profile ban be.
- `client/src/components/friends/UserCard.jsx`: card user dung chung.
- `client/src/store/userSlice.js`: state profile/search neu can.
- `client/src/store/friendSlice.js`: state friends/requests/suggestions neu can.
- `client/src/components/Navbar.jsx`: them search user neu chua co.

Ten file/module co the dieu chinh theo code hien tai, nhung nen giu tach `user` va `friend` ro rang.

## Database / Schema

### Users

Dung bang `Users` da co tu Phase 1.

Phase 2 su dung/cap nhat cac cot:

| Column | Muc dich Phase 2 |
| --- | --- |
| id | dinh danh user |
| username | hien thi/search |
| email | chi hien cho owner |
| fullName | hien thi/cap nhat profile |
| avatar | URL avatar |
| avatarPublicId | Cloudinary public id cua avatar |
| coverPhoto | URL cover |
| coverPhotoPublicId | Cloudinary public id cua cover |
| bio | gioi thieu ngan |
| isOnline | dung ve sau cho friends/chat |
| lastSeen | dung ve sau cho friends/chat |

Can them migration bo sung hai cot nullable:

| Column | Type | Note |
| --- | --- | --- |
| avatarPublicId | STRING | nullable, dung de xoa/thay avatar cu tren Cloudinary |
| coverPhotoPublicId | STRING | nullable, dung de xoa/thay cover cu tren Cloudinary |

### Friendships

Theo `PROJECT_PLAN.md`:

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| requesterId | UUID | FK Users |
| addresseeId | UUID | FK Users |
| status | ENUM | pending, accepted, rejected, blocked |
| createdAt | DATE | audit |
| updatedAt | DATE | audit |

Constraints:

- `requesterId` FK toi `Users.id`.
- `addresseeId` FK toi `Users.id`.
- Unique pair `requesterId + addresseeId`.
- Khong cho `requesterId = addresseeId`.
- Index `requesterId`, `addresseeId`, `status`.

### De xuat chong duplicate nguoc chieu

Trong PostgreSQL, unique `requesterId + addresseeId` chi chan duplicate cung chieu, chua chan duoc request nguoc chieu.

De xuat trong service:

- Khi user A gui request toi B, query tim friendship co cap `(A,B)` hoac `(B,A)`.
- Neu da co `pending` hoac `accepted`, tra loi loi hop le.
- Neu da co `rejected`, co the cap nhat lai thanh `pending` neu san pham cho phep gui lai.

Neu muon chat hon o DB, co the them hai cot normalized `userOneId`, `userTwoId` hoac unique expression ve sau. Trong Phase 2, service-level check la du de giam rui ro.

### Cloudinary publicId

Phase 2 chot them `avatarPublicId` va `coverPhotoPublicId` vao `Users` de tranh rac storage khi user thay avatar/cover.

Luon luu cap gia tri:

- Avatar: `avatar` URL + `avatarPublicId`.
- Cover: `coverPhoto` URL + `coverPhotoPublicId`.

Quy trinh thay anh:

1. Upload anh moi len Cloudinary.
2. Lay URL va publicId moi.
3. Cap nhat DB voi URL/publicId moi.
4. Sau khi DB update thanh cong, xoa anh cu bang publicId cu neu co.
5. Neu xoa anh cu fail, log loi va khong rollback anh moi.

## API Contract

API dung response format chung cua du an:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {}
}
```

Loi:

```json
{
  "success": false,
  "message": "Validation error",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  },
  "meta": {}
}
```

### GET `/api/users/me`

Auth: bat buoc.

Response data de xuat:

```json
{
  "user": {
    "id": "uuid",
    "username": "john",
    "email": "john@example.com",
    "fullName": "John Doe",
    "avatar": "https://...",
    "avatarPublicId": "social/avatar/abc",
    "coverPhoto": "https://...",
    "coverPhotoPublicId": "social/cover/abc",
    "bio": "Hello",
    "createdAt": "2026-06-14T00:00:00.000Z"
  }
}
```

### PUT `/api/users/me`

Auth: bat buoc.

Request body de xuat:

```json
{
  "fullName": "John Doe",
  "bio": "Short bio"
}
```

Validation de xuat:

- `fullName`: optional, string, trim, gioi han do dai.
- `bio`: optional, string, gioi han do dai.
- Khong cho update `email`, `password`, `isVerified`, `role` neu sau nay co role.

### GET `/api/users/:id`

Auth: bat buoc trong Phase 2 de giam rui ro thong tin ca nhan.

Response:

- Neu `:id` la current user: tra email.
- Neu `:id` la user khac: khong tra email.

### GET `/api/users/search?q=`

Auth: bat buoc.

Query de xuat:

- `q`: required, min 2 ky tu.
- `limit`: optional, default 10, max 20.
- `page` hoac cursor: optional neu can.

Search fields da chot:

- `username`
- `fullName`

Khong search email.

### POST `/api/users/me/avatar`

Auth: bat buoc.

Content-Type: `multipart/form-data`

Field de xuat:

- `avatar`: image file.

Xu ly:

- Frontend crop avatar truoc khi upload.
- Multer nhan file.
- Validate image type va size <= 5MB.
- Upload Cloudinary.
- Cap nhat `Users.avatar` va `Users.avatarPublicId`.
- Sau khi DB update thanh cong, xoa avatar cu bang `avatarPublicId` cu neu co.
- Neu xoa avatar cu fail, log loi va khong rollback avatar moi.

### POST `/api/users/me/cover`

Auth: bat buoc.

Content-Type: `multipart/form-data`

Field de xuat:

- `cover`: image file.

Xu ly tuong tu avatar, cap nhat `Users.coverPhoto` va `Users.coverPhotoPublicId`.
Frontend crop cover truoc khi upload.

### POST `/api/friends/request/:userId`

Auth: bat buoc.

Xu ly:

- `userId` la addressee.
- Chan neu current user gui cho chinh minh.
- Kiem tra friendship da ton tai theo ca hai chieu.
- Tao `Friendship` status `pending`.

### PUT `/api/friends/accept/:userId`

Auth: bat buoc.

Xu ly:

- `userId` la requester.
- Chi addressee cua request moi duoc accept.
- Cap nhat status thanh `accepted`.
- Tao hoac reuse private conversation giua current user va requester de chat co san sau khi ket ban.
- Response tra `friendship` va `conversation`.

### PUT `/api/friends/reject/:userId`

Auth: bat buoc.

Xu ly:

- `userId` la requester.
- Chi addressee cua request moi duoc reject.
- Cap nhat status thanh `rejected`, khong xoa record.
- Request da `rejected` khong hien trong pending requests.
- Neu user gui lai request sau khi da bi reject, service co the cap nhat record cu tu `rejected` ve `pending` thay vi tao record moi.

### DELETE `/api/friends/:userId`

Auth: bat buoc.

Xu ly:

- Tim friendship accepted giua current user va `userId`.
- Xoa record friendship `accepted`.
- Sau khi xoa, hai user khong con trong friends list va co the ket ban lai sau nay.

### GET `/api/friends`

Auth: bat buoc.

Tra ve danh sach user co friendship `accepted` voi current user.

Query de xuat:

- `limit`: default 20, max 50.
- `page` hoac cursor: optional.

### GET `/api/friends/requests`

Auth: bat buoc.

Tra ve danh sach request status `pending` ma current user la addressee.

### GET `/api/friends/suggestions`

Auth: bat buoc.

Logic Phase 2:

- Lay user khac current user.
- Loai cac user da co friendship pending/accepted voi current user.
- Loai cac user da co friendship blocked neu du lieu nay ton tai tu phase sau.
- Gioi han ket qua bang `limit`.

## Socket / Realtime neu co

Phase 2 chua co yeu cau Socket.IO realtime.

De xuat khong lam realtime friend request trong Phase 2 de giu scope gon. Notification realtime thuoc Phase 7.

## UI / UX Flow neu co

### Profile page

Flow owner:

1. User vao `/profile` hoac `/users/:id`.
2. Frontend goi API lay profile.
3. Hien cover, avatar, fullName, username, bio.
4. Neu la owner, hien nut edit profile.
5. User mo modal edit, sua `fullName`, `bio`, avatar/cover neu can.
6. Preview va crop avatar/cover truoc khi save.
7. Upload file da crop va save thanh cong thi cap nhat UI.

Flow viewer:

1. User vao profile user khac.
2. Frontend goi `GET /api/users/:id`.
3. Hien thong tin public co ban, khong hien email.
4. Hien action theo trang thai friendship: Add Friend, Pending, Accept/Reject, Unfriend.
5. Neu user khac da la accepted friend, hien nut `Nhan tin`; khi bam thi tao/reuse private conversation va dieu huong toi `/messenger?conversationId=...`.

### Friends page

Tabs:

- `Friends`: danh sach ban be.
- `Requests`: loi moi dang cho.
- `Suggestions`: goi y ket ban.

Actions:

- Add friend: goi `POST /api/friends/request/:userId`.
- Accept: goi `PUT /api/friends/accept/:userId`.
- Reject: goi `PUT /api/friends/reject/:userId`.
- Unfriend: goi `DELETE /api/friends/:userId`.

### Navbar search

Flow de xuat:

1. User nhap query vao search.
2. Debounce 300ms neu lam live search.
3. Goi `GET /api/users/search?q=`.
4. Hien dropdown ket qua.
5. Click user thi vao profile.

Neu muon lam nhanh trong Phase 2, co the tao trang/search result don gian thay vi live dropdown.

## Validation va Error Handling

### Validation backend

- `userId`: phai la UUID hop le.
- Search `q`: required, min 2 ky tu.
- `limit`: so nguyen, co max.
- `fullName`: optional, trim, gioi han do dai.
- `bio`: optional, trim, gioi han do dai.
- Upload: chi image MIME, max 5MB.
- Crop UI: file sau crop van phai dung image MIME va max 5MB.

### Error code de xuat

- `USER_NOT_FOUND`
- `PROFILE_UPDATE_FORBIDDEN`
- `INVALID_UPLOAD_TYPE`
- `UPLOAD_TOO_LARGE`
- `FRIEND_REQUEST_SELF`
- `FRIEND_REQUEST_EXISTS`
- `FRIEND_REQUEST_NOT_FOUND`
- `FRIEND_ACTION_FORBIDDEN`
- `ALREADY_FRIENDS`

### Error handling

- Dung global error handler.
- Loi validation tra 400.
- Loi auth tra 401.
- Loi permission tra 403.
- Not found tra 404.
- Conflict friendship tra 409.
- Upload/Cloudinary loi tra message than thien, khong expose secret/provider raw stack.

## Security / Permission

- Tat ca route Phase 2 can auth middleware.
- Current user chi duoc update profile cua minh.
- Khong tra ve password/token/hash.
- Search user khong tra ve thong tin nhay cam.
- Search user khong query theo email va khong tra email cua user khac.
- Upload can gioi han type/size.
- Upload avatar/cover phai luu publicId moi va xoa publicId cu sau khi DB update thanh cong.
- Cloudinary API key/secret nam trong `.env`.
- Friendship action can check dung actor:
  - Requester gui request.
  - Addressee accept/reject request.
  - Ca hai ben accepted friendship co the unfriend.
- Dung transaction cho cac thao tac friendship neu co nhieu update lien quan.

## Logging / Monitoring neu can

- Log HTTP request da co tu Phase 1 neu dung `morgan`.
- Nen log loi upload Cloudinary o backend de debug.
- Khong log access token, refresh token, password, Cloudinary secret.

## Thu tu implement de xuat

1. Kiem tra Phase 1 auth middleware/current user da on dinh.
2. Tao user routes/controller/service cho `me`, update profile, get by id, search.
3. Them validation cho user params/query/body.
4. Tao Cloudinary config va upload middleware Multer.
5. Tao migration them `avatarPublicId`, `coverPhotoPublicId` vao `Users`.
6. Implement crop avatar/cover tren frontend va upload file da crop.
7. Implement upload avatar/cover voi URL + publicId, xoa anh cu sau khi DB update thanh cong.
8. Tao migration/model `Friendship` va associations voi `User`.
9. Implement friend service: request, accept, reject giu status `rejected`, unfriend xoa record.
10. Khi accept request, goi chat service de tao/reuse private conversation.
11. Implement friends list, requests va suggestions.
12. Viet backend tests cho profile/friends core.
13. Tao frontend API clients `userApi`, `friendApi`.
14. Tao Profile page, ProfileHeader, EditProfileModal.
15. Tao Friends page, tabs va UserCard.
16. Gan navbar search user.
17. Gan nut nhan tin tren profile accepted friend.
18. Test end-to-end voi it nhat 2-3 users.
19. Cap nhat README/env neu them Cloudinary variables.

## Anh huong testcase

Testcase Phase 2 nen bao gom:

- `GET /api/users/me` voi token hop le.
- `GET /api/users/me` khi chua login.
- `PUT /api/users/me` success.
- `PUT /api/users/me` validation fail.
- `GET /api/users/:id` user ton tai/khong ton tai.
- `GET /api/users/:id` user khac khong tra email.
- `GET /api/users/search?q=` success theo `username/fullName`, query qua ngan, khong search/tra email.
- Upload avatar success.
- Upload cover success.
- Upload avatar/cover luu publicId moi.
- Doi avatar/cover xoa anh cu bang publicId cu neu co.
- Crop avatar/cover tren UI truoc khi upload.
- Upload sai type.
- Upload qua 5MB.
- Gui friend request success.
- Gui friend request cho chinh minh fail.
- Gui duplicate request fail.
- Accept request success.
- Accept request tao/reuse private conversation.
- Accept request boi user khong phai addressee fail.
- Reject request success va status duoc set `rejected`.
- Unfriend success va record friendship `accepted` bi xoa.
- Friends list dung.
- Requests list dung.
- Suggestions loai current user va user da co friendship.
- UI profile edit/upload.
- UI profile ban be co nut nhan tin va dieu huong dung conversation.
- UI friends add/accept/reject/unfriend.

## Cau hoi can xac nhan

- Profile user khac co public voi guest chua login khong? De xuat Phase 2 yeu cau login.
