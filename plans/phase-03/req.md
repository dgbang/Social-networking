# Phase 3: Posts & Newsfeed Requirements

## Muc tieu

Phase 3 xay dung social core trong tuan 4-5: post, media upload, newsfeed, reaction, comment, share va UI feed.

Ket qua chinh:

- User co the tao, xem, sua va xoa bai viet.
- User co the upload nhieu media cho bai viet.
- User co the dat privacy cho bai viet: `public`, `friends`, `private`.
- User co newsfeed ton trong privacy va quan he ban be.
- User co the like/reaction, comment/reply va share bai viet.
- Frontend co flow tao post, hien thi feed, thao tac reaction/comment/share va xem post detail.

## Nguon tai lieu

- `docs/PROJECT_PLAN.md`
  - Muc 2: Posts la Must-have.
  - Muc 3: Cloudinary dung cho storage.
  - Muc 4: Backend la source of truth cho privacy/count; frontend chi optimistic update voi like/comment/chat roi sync server.
  - Muc 6: Schema `Posts`, `Comments`, `Likes`.
  - Muc 7: Posts API endpoints.
  - Muc 9: Bao mat, authorization, privacy, upload.
  - Muc 11: Phase 3 output chinh.
  - Muc 12: Definition of Done.
- `docs/WEEKLY_PLAN.md`
  - Phase 3: Posts & Newsfeed, tuan 4-5.
  - Tuan 4: backend posts.
  - Tuan 5: frontend posts va newsfeed.
- `plans/phase-02/req.md`
  - Phase 3 phu thuoc profile va friendships de hien user info va loc feed theo ban be.

## Pham vi trong phase

### Backend posts

- Tao model/migration `Post`, `Comment`, `Like`.
- Tao associations giua `User`, `Post`, `Comment`, `Like`.
- Them indexes cho cac cot hay query: `userId`, `postId`, `createdAt`.
- Them unique constraint `postId + userId` cho `Likes`.
- Tao API `POST /api/posts`.
- Upload nhieu media len Cloudinary khi tao post.
- Tao API `GET /api/posts/feed`.
- Tao API `GET /api/posts/:id`.
- Tao API `PUT /api/posts/:id`.
- Tao API `DELETE /api/posts/:id`.
- Owner-only edit/delete post.
- Feed lay bai public, bai cua ban be va bai cua chinh minh.
- Feed ton trong privacy.
- Feed dung cursor pagination theo `createdAt`.
- Include user info va counters trong feed/post detail.

### Reactions

- Tao API `POST /api/posts/:id/like`.
- Toggle like/unlike.
- Doi reaction type.
- Cap nhat `likesCount` trong transaction.
- Dung cac reaction type theo schema: `like`, `love`, `haha`, `wow`, `sad`, `angry`.

### Comments

- Tao API `GET /api/posts/:id/comments`.
- Tao API `POST /api/posts/:id/comments`.
- Ho tro reply comment bang `parentId`.
- Tao API `DELETE /api/comments/:id`.
- Cap nhat `commentsCount`.

### Share

- Tao API `POST /api/posts/:id/share`.
- Share bang cach tao post moi co `originalPostId`.
- Cap nhat `sharesCount`.

### Frontend posts va newsfeed

- Tao post API client.
- Tao post state/slice neu can theo pattern hien co.
- Xu ly loading/error states.
- Tao component/page cho CreatePost.
- Tao component PostCard.
- Tao media preview khi tao post.
- Tao privacy selector.
- Tao like/comment/share buttons.
- Hien menu edit/delete cho owner.
- Tao CommentSection.
- Load comments co pagination.
- Tao comment/reply.
- Xoa comment.
- Co optimistic update co rollback don gian cho reaction/comment neu kip.
- Tao Home/Feed page co infinite scroll bang IntersectionObserver.
- Co skeleton loading.
- Co sidebar trai/phai co ban.
- Hien bai viet tren profile.
- Tao trang `/post/:id`.
- Tao share modal.
- Tao reaction picker.
- Test responsive mobile.

## Khong nam trong phase

- Stories thuoc Phase 4.
- Chat realtime thuoc Phase 5.
- Video call thuoc Phase 6.
- Notifications va FCM thuoc Phase 7.
- Realtime notification cho like/comment/share chua nam trong Phase 3, tru khi chi tao hook/event noi bo de Phase 7 dung lai.
- Trending posts la Stretch trong `PROJECT_PLAN.md`, khong bat buoc trong Phase 3.
- Advanced media editor, filter anh/video va tag ban be chua thay trong tai lieu hien tai.
- Report/moderation post chua thay trong tai lieu hien tai.

## Yeu cau chuc nang

### Posts

- User dang nhap tao duoc bai viet.
- Bai viet co the co `content`, `media`, hoac ca hai.
- Neu khong co media thi `content` can co noi dung hop le.
- Bai viet co privacy: `public`, `friends`, `private`.
- User xem duoc chi tiet bai viet neu co quyen theo privacy.
- Owner sua duoc content/privacy/media cua bai viet.
- User khong phai owner khong sua duoc bai viet.
- Owner xoa duoc bai viet cua minh.
- User khong phai owner khong xoa duoc bai viet.
- Xoa post dung `isDeleted` theo schema trong `PROJECT_PLAN.md`, tru khi design chot ly do can hard delete.
- API khong tra bai viet da bi xoa trong feed va detail thong thuong.

### Media upload

- User upload duoc nhieu media cho post.
- Media luu dang JSONB `[{ url, publicId, type }]` theo `PROJECT_PLAN.md`.
- Media luu tren Cloudinary.
- Upload can gioi han size/type theo rule bao mat cua project.
- Neu tao post/update post that bai sau khi upload media, backend can co cach cleanup media moi da upload neu co the.

### Feed va privacy

- User dang nhap lay duoc feed qua `GET /api/posts/feed`.
- Feed gom:
  - Bai `public`.
  - Bai `friends` cua ban be.
  - Bai cua chinh current user.
- Bai `private` chi hien cho owner.
- Feed sap xep theo thoi gian moi nhat.
- Feed dung cursor pagination theo `createdAt`.
- Feed include user info co ban va counters: `likesCount`, `commentsCount`, `sharesCount`.
- Feed phai loai post `isDeleted = true`.

### Reactions

- User reaction duoc post co quyen xem.
- Moi user chi co mot reaction tren mot post.
- Goi lai cung reaction thi toggle unlike.
- Goi reaction khac thi doi reaction type.
- `likesCount` phai dong bo voi so row like hien hanh.
- Reaction can xu ly trong transaction de tranh count sai.

### Comments

- User lay duoc comments cua post co quyen xem.
- User comment duoc post co quyen xem.
- Comment can co content hop le.
- User reply comment bang `parentId`.
- User xoa duoc comment cua minh.
- Owner post co the xoa comment tren post cua minh: De xuat, can xac nhan neu muon ap dung ngay Phase 3.
- Xoa comment dung `isDeleted` theo schema trong `PROJECT_PLAN.md`.
- `commentsCount` phai cap nhat khi tao/xoa comment.

### Share

- User share duoc post co quyen xem.
- Share tao post moi co `originalPostId` tro toi post goc.
- `sharesCount` cua post goc tang khi share thanh cong.
- Shared post can ton trong privacy cua post moi va quyen xem post goc.

### Frontend

- Home/feed page hien CreatePost va danh sach PostCard.
- CreatePost cho nhap text, chon media va chon privacy.
- Media preview hien truoc khi submit.
- PostCard hien header user/time/privacy, content, media gallery va counters.
- Owner thay menu edit/delete.
- User thao tac reaction/comment/share tren UI.
- CommentSection load comments, tao comment, reply va xoa comment.
- Infinite scroll load them feed.
- Profile page hien danh sach bai viet cua user: De xuat endpoint/flow can thiet ke ro trong design vi docs chi ghi "Hien bai viet tren profile".
- Trang `/post/:id` hien chi tiet bai viet.
- UI co loading, empty state va error state co ban.

## Yeu cau phi chuc nang

- Tat ca API Phase 3 can protected bang auth middleware.
- Tat ca input body, params, query can validate.
- Authorization bat buoc cho edit/delete post, delete comment va view theo privacy.
- Backend la source of truth cho privacy va counters.
- Dung Sequelize migrations, khong dung `sequelize.sync({ alter: true })` cho production.
- Dung response format chung cua du an: `success`, `message`, `data`, `error`, `meta`.
- Query feed/comments can co pagination de tranh tra ve qua nhieu ban ghi.
- Query feed can tranh N+1 bang include/association hop ly.
- Cloudinary credential khong duoc commit vao source code.
- Upload can gioi han size/type va cleanup file khi rollback neu can.
- API khong expose password/token/hash cua user trong include.

## Tieu chi hoan thanh

- Migration `Posts`, `Comments`, `Likes` chay duoc tu DB rong va rollback co ban.
- Associations giua users/posts/comments/likes hoat dong.
- `POST /api/posts` tao post voi content/media/privacy thanh cong.
- Upload nhieu media len Cloudinary va luu `url/publicId/type` vao `Posts.media`.
- `GET /api/posts/feed` tra feed dung privacy va pagination.
- `GET /api/posts/:id` ton trong privacy.
- `PUT /api/posts/:id` chi owner sua duoc.
- `DELETE /api/posts/:id` chi owner xoa duoc va feed khong hien post da xoa.
- `POST /api/posts/:id/like` toggle/doi reaction dung va count dung.
- `GET /api/posts/:id/comments` tra comments dung.
- `POST /api/posts/:id/comments` tao comment/reply dung va count tang.
- `DELETE /api/comments/:id` xoa comment dung permission va count giam.
- `POST /api/posts/:id/share` tao shared post va count tang.
- Frontend tao/sua/xoa/like/comment/share duoc tu UI.
- Feed infinite scroll chay duoc.
- Post detail page chay duoc.
- Profile hien bai viet cua user theo quyen xem.
- Co backend tests cho create/edit/delete post, feed privacy, like/comment/share va upload media theo `docs/WEEKLY_PLAN.md`.
- README hoac checklist duoc cap nhat neu them env/config upload moi.

## Phu thuoc phase khac

- Phu thuoc Phase 1:
  - Auth middleware.
  - Current user/token flow.
  - Response helper format chung.
  - Sequelize/PostgreSQL migration setup.
  - Frontend auth state va protected route.
- Phu thuoc Phase 2:
  - User profile info de include trong post/feed.
  - Friendships de loc feed privacy `friends`.
  - Cloudinary setup tu upload avatar/cover.
- Phase 4 stories dung chung kinh nghiem upload/media.
- Phase 7 notifications co the tich hop events tu like/comment/share ve sau.

## Ranh gioi va rui ro

- Feed privacy phu thuoc friendship data dung; neu Phase 2 chua on dinh, feed `friends` co the sai.
- Counters `likesCount`, `commentsCount`, `sharesCount` de sai neu khong dung transaction.
- Media upload co nguy co rac Cloudinary neu DB save fail sau khi upload.
- Feed include nhieu bang co nguy co N+1/cham; can test voi data mau.
- Share post co the phuc tap khi post goc bi xoa hoac bi doi privacy; can chot cach hien thi fallback.
- Optimistic UI can rollback khi API fail de tranh UI/count lech server.
- Comments nested qua sau co the lam UI va query phuc tap; Phase 3 chi can reply bang `parentId` theo docs, chua can thread vo han nang cao.

## Cau hoi can xac nhan

- Owner post co duoc xoa comment cua user khac tren post cua minh trong Phase 3 khong?
- Khi post goc cua share bi xoa hoac khong con quyen xem, shared post nen hien placeholder hay an hoan toan?
- Gioi han so media moi post va size tung file chua thay trong tai lieu hien tai; can xac nhan, neu chua co thi design se de xuat muc an toan.
- Profile posts nen dung endpoint rieng hay dung query filter tren feed/posts? Trong docs hien tai chua ghi API rieng.
