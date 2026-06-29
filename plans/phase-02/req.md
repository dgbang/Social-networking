# Phase 2: User Profile & Friends Requirements

## Quyet dinh da chot

- Profile user khac khong hien email; chi owner moi thay email cua chinh minh.
- Search user chi tim theo `username` va `fullName`; khong tim theo email.
- Avatar/cover can co crop anh trong Phase 2.
- Status `blocked` chi de trong schema cho phase sau, chua can UI blocked trong Phase 2.
- Them cot `avatarPublicId` va `coverPhotoPublicId` vao `Users` de quan ly/xoa anh cu tren Cloudinary.
- Reject friend request: giu record va cap nhat status thanh `rejected`.
- Unfriend: xoa record friendship `accepted` de hai user co the ket ban lai sau nay.

## Muc tieu

Phase 2 xay dung cac tinh nang user profile va friends trong tuan 3.

Ket qua chinh:

- User co the xem profile cua minh.
- User co the cap nhat thong tin profile co ban.
- User co the xem profile user khac.
- User co the tim kiem user.
- User co the upload avatar va cover photo.
- User co the gui, chap nhan, tu choi va huy/xoa ket ban.
- User co danh sach ban be, loi moi dang cho va goi y ket ban.
- Frontend co trang profile va trang friends de thao tac cac flow tren.

## Nguon tai lieu

- `docs/PROJECT_PLAN.md`
  - Muc 2: User va Friends la Must-have.
  - Muc 3: Cloudinary dung cho storage.
  - Muc 6: Schema `Users` va `Friendships`.
  - Muc 7: Users & Friends API endpoints.
  - Muc 9: Bao mat, upload, authorization.
  - Muc 11: Phase 2 output chinh.
  - Muc 12: Definition of Done.
- `docs/WEEKLY_PLAN.md`
  - Phase 2: User Profile & Friends, tuan 3.
  - Ngay 1: User profile backend.
  - Ngay 2: Upload avatar/cover.
  - Ngay 3-4: Friends backend.
  - Ngay 5-6: Profile/Friends frontend.
  - Ngay 7: Test Phase 2.
- `plans/phase-01/req.md`
  - Phase 2 phu thuoc auth middleware va current user flow tu Phase 1.

## Pham vi trong phase

### Backend profile

- Tao API `GET /api/users/me`.
- Tao API `PUT /api/users/me`.
- Tao API `GET /api/users/:id`.
- Tao API `GET /api/users/search?q=`.
- Authorization cho profile edit: user chi duoc sua profile cua chinh minh.
- Response khong tra ve password, refresh token hash, reset token hoac thong tin nhay cam.

### Upload avatar/cover

- Setup Multer.
- Setup Cloudinary.
- Gioi han upload file image.
- Gioi han size file 5MB theo `docs/WEEKLY_PLAN.md`.
- Upload avatar.
- Upload cover photo.
- Crop avatar/cover truoc khi luu anh.
- Luu URL anh vao `Users.avatar` va `Users.coverPhoto`.
- Luu `avatarPublicId` va `coverPhotoPublicId` de xoa/thay anh cu tren Cloudinary.

### Friends backend

- Tao model/migration `Friendship`.
- `POST /api/friends/request/:userId`.
- `PUT /api/friends/accept/:userId`.
- `PUT /api/friends/reject/:userId`.
- `DELETE /api/friends/:userId`.
- `GET /api/friends`.
- `GET /api/friends/requests`.
- `GET /api/friends/suggestions`.
- Unique constraint tranh trung request.
- Khong cho user ket ban voi chinh minh.
- Logic goi y don gian: user chua ket ban.
- Test authorization va edge cases.

### Frontend profile

- Tao trang profile.
- Hien avatar, cover, fullName, username, bio.
- Co modal edit profile.
- Upload preview avatar/cover truoc khi save.
- User xem profile cua minh va user khac.
- Chi owner moi thay nut sua profile.
- Chi owner moi thay email tren profile.
- Co thao tac crop avatar/cover truoc khi save.

### Frontend friends

- Tao trang friends.
- Co tab friends/requests/suggestions.
- Tao UserCard dung lai.
- Co nut add/accept/reject/unfriend.
- Search user tren navbar.

## Khong nam trong phase

- Posts/feed/comment/like/share thuoc Phase 3.
- Stories thuoc Phase 4.
- Chat realtime thuoc Phase 5.
- Video call thuoc Phase 6.
- Notifications va FCM thuoc Phase 7.
- Deploy production day du thuoc Phase 8.
- Goi y ket ban nang cao theo mutual friends/trending la Stretch, chua bat buoc trong Phase 2.
- Privacy profile chi tiet chua thay trong tai lieu hien tai, nen Phase 2 chi lam muc co ban neu chua duoc xac nhan them.

## Yeu cau chuc nang

### Profile

- User dang nhap lay duoc profile cua minh qua `GET /api/users/me`.
- User dang nhap cap nhat duoc profile cua minh qua `PUT /api/users/me`.
- User xem duoc profile user khac qua `GET /api/users/:id`.
- User tim kiem duoc user qua `GET /api/users/search?q=`.
- Profile hien thi toi thieu: `id`, `username`, `email` neu la owner, `fullName`, `avatar`, `coverPhoto`, `bio`.
- Profile user khac khong hien email.
- API profile khong tra ve `password`, `refreshTokenHash`, `verificationToken`, `resetPasswordToken`, `resetPasswordExpires`.
- Search user chi tim theo `username` va `fullName`, khong tim theo email.

### Upload avatar/cover

- User dang nhap upload duoc avatar.
- User dang nhap upload duoc cover photo.
- Chi chap nhan file image.
- File qua 5MB bi tu choi.
- File sai type bi tu choi.
- Avatar/cover co crop anh truoc khi upload/luu.
- Sau khi upload thanh cong, profile tra ve URL anh moi.
- He thong luu `avatarPublicId` va `coverPhotoPublicId`.
- Khi upload avatar/cover moi thanh cong va DB update thanh cong, he thong xoa anh cu tren Cloudinary neu co `publicId` cu.

### Friends

- User gui loi moi ket ban toi user khac.
- User khong the gui loi moi ket ban toi chinh minh.
- User khong the tao request trung lap voi cung mot user.
- User nhan loi moi co the chap nhan.
- User nhan loi moi co the tu choi.
- User da la ban co the unfriend.
- User lay duoc danh sach ban be.
- User lay duoc danh sach loi moi dang cho.
- User lay duoc danh sach goi y ket ban don gian.
- Friendship co cac status theo `PROJECT_PLAN.md`: `pending`, `accepted`, `rejected`, `blocked`.
- Phase 2 chua can UI cho `blocked`; status nay chi de schema cho phase sau.
- Khi reject friend request, giu record friendship va set status `rejected`.
- Khi unfriend, xoa record friendship `accepted`.

### Frontend

- Profile page hien thi dung thong tin user.
- Edit profile modal cap nhat duoc profile.
- Upload avatar/cover co preview truoc khi save.
- Upload avatar/cover co crop truoc khi save.
- Friends page co tab friends, requests, suggestions.
- UserCard hien thong tin user co ban va action phu hop.
- Navbar co search user.
- UI co loading, empty state va error state co ban.

## Yeu cau phi chuc nang

- Tat ca API Phase 2 can protected bang auth middleware tru nhung endpoint public profile neu sau nay duoc xac nhan public.
- Tat ca input body, params, query can validate.
- Upload can gioi han size/type.
- Cloudinary credential khong duoc commit vao source code.
- Dung Sequelize migration, khong dung `sequelize.sync({ alter: true })` cho production.
- Dung response format chung cua du an: `success`, `message`, `data`, `error`, `meta`.
- Query search/friends can co pagination hoac limit de tranh tra ve qua nhieu ban ghi.
- API phai xu ly loi authorization ro rang.
- Backend khong expose thong tin nhay cam cua user.

## Tieu chi hoan thanh

- Migration `Friendships` chay duoc tu DB rong.
- `GET /api/users/me` tra ve profile user dang nhap.
- `PUT /api/users/me` cap nhat profile thanh cong va chan user sua profile nguoi khac.
- `GET /api/users/:id` tra ve profile user hop le.
- `GET /api/users/search?q=` tim duoc user theo query.
- Search chi tim theo `username` va `fullName`, khong tim theo email.
- Upload avatar/cover thanh cong voi file image hop le.
- Upload avatar/cover luu URL va Cloudinary publicId tuong ung.
- Doi avatar/cover co xoa anh cu tren Cloudinary neu ton tai publicId cu.
- Crop avatar/cover hoat dong tren UI truoc khi save.
- Upload file sai type/qua size bi tu choi.
- Send/accept/reject/unfriend chay dung qua API.
- Friends list, requests va suggestions chay dung qua API.
- Frontend profile va friends thao tac duoc end-to-end.
- Co backend tests cho friends core theo `docs/WEEKLY_PLAN.md`.
- README hoac checklist duoc cap nhat neu co bien env Cloudinary/setup moi.

## Phu thuoc phase khac

- Phu thuoc Phase 1:
  - Auth middleware.
  - Current user endpoint/token flow.
  - Response helper format chung.
  - Sequelize/PostgreSQL migration setup.
  - Frontend auth state va protected route.
- Phase 3 feed can dung friends relationship de loc bai viet theo privacy `friends`.
- Phase 5 chat can dung friends/online users lam nen cho conversation va online friends.

## Ranh gioi va rui ro

- Cloudinary setup co the lam cham Phase 2 neu chua co account/env; can uu tien profile/friends API truoc, upload co the test bang account dev.
- Neu chua co pagination cho search/friends, du lieu lon se cham; Phase 2 nen co `limit` co ban.
- Neu xoa anh cu tren Cloudinary fail sau khi DB da update, API khong nen rollback anh moi; can log loi de xu ly sau.
- Crop anh tang do phuc tap frontend va can test responsive/crop output ky hon.
- Friendship direction can thiet ke can than de tranh duplicate request nguoc chieu.
- Search user can tranh tra ve thong tin nhay cam.

## Cau hoi can xac nhan

- Profile user khac co public voi guest chua login khong? De xuat Phase 2 yeu cau login.
