# Phase 3: Posts & Newsfeed Design

## Tong quan thiet ke

Phase 3 mo rong tren Phase 1 auth va Phase 2 profile/friends de them post, feed, reaction, comment va share.

Huong thiet ke:

- Backend la source of truth cho privacy, permission va counters.
- Media post dung Cloudinary, luu metadata trong `Posts.media`.
- Feed lay bai theo privacy: public, friends cua ban be, va bai cua chinh user.
- Reaction/comment/share cap nhat counters trong transaction.
- Frontend co the optimistic update reaction/comment/share nhung phai rollback/sync lai khi API loi.
- Realtime notification chua lam trong Phase 3; chi co the de san service hook neu khong lam tang scope.

## Nguon requirement

- `plans/phase-03/req.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`
- `plans/phase-02/req.md`
- `plans/phase-02/design.md`

## Kien truc va module lien quan

### Backend modules

- `server/src/routes/post.routes.js`: routes posts/feed/reactions/comments/share.
- `server/src/routes/comment.routes.js`: route xoa comment neu tach theo `/api/comments/:id`.
- `server/src/controllers/post.controller.js`: nhan request/response cho post/feed/reaction/share.
- `server/src/controllers/comment.controller.js`: nhan request/response cho comments.
- `server/src/services/post.service.js`: create/read/update/delete/feed/share logic.
- `server/src/services/comment.service.js`: list/create/delete comments.
- `server/src/services/reaction.service.js`: toggle/doi reaction va count.
- `server/src/services/upload.service.js`: dung lai Cloudinary upload/delete tu Phase 2 neu da co.
- `server/src/middlewares/upload.js`: Multer config cho media post.
- `server/src/middlewares/auth.middleware.js`: verify user dang nhap.
- `server/src/middlewares/validate.middleware.js`: validate body/params/query neu project da co.
- `server/src/models/post.js`: model Post moi.
- `server/src/models/comment.js`: model Comment moi.
- `server/src/models/like.js`: model Like moi.
- `server/src/models/friendship.js`: dung de loc feed `friends`.
- `server/src/utils/publicUser.js`: dung khi include author de khong expose thong tin nhay cam.

Ten file co the dieu chinh theo code hien tai, nhung nen tach service theo domain de test duoc logic counters/privacy.

### Frontend modules

- `client/src/api/postApi.js`: API posts/feed/reactions/comments/share.
- `client/src/store/postSlice.js`: state feed/post detail/actions neu project dung Redux cho domain nay.
- `client/src/pages/HomePage.jsx` hoac update dashboard hien co: feed page.
- `client/src/pages/PostDetailPage.jsx`: trang `/post/:id`.
- `client/src/components/posts/CreatePost.jsx`: tao post.
- `client/src/components/posts/PostCard.jsx`: hien post.
- `client/src/components/posts/PostMediaGrid.jsx`: hien media gallery.
- `client/src/components/posts/PostActions.jsx`: reaction/comment/share buttons.
- `client/src/components/posts/ReactionPicker.jsx`: chon reaction type.
- `client/src/components/posts/CommentSection.jsx`: list/create/reply/delete comments.
- `client/src/components/posts/ShareModal.jsx`: share post.
- `client/src/components/posts/EditPostModal.jsx`: sua post neu can tach rieng.
- `client/src/pages/ProfilePage.jsx`: them section posts cua user.

## Database / Schema

### Posts

Theo `PROJECT_PLAN.md`:

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| userId | UUID | FK Users |
| content | TEXT | nullable neu co media |
| media | JSONB | `[{ url, publicId, type }]` |
| privacy | ENUM | public, friends, private |
| originalPostId | UUID | FK Posts, nullable |
| likesCount | INTEGER | default 0 |
| commentsCount | INTEGER | default 0 |
| sharesCount | INTEGER | default 0 |
| isDeleted | BOOLEAN | default false |
| createdAt | DATE | sort/index |
| updatedAt | DATE | audit |

Associations de xuat:

- `Post.belongsTo(User, { as: 'author', foreignKey: 'userId' })`
- `User.hasMany(Post, { foreignKey: 'userId' })`
- `Post.belongsTo(Post, { as: 'originalPost', foreignKey: 'originalPostId' })`
- `Post.hasMany(Comment, { foreignKey: 'postId' })`
- `Post.hasMany(Like, { foreignKey: 'postId' })`

Indexes:

- `userId`
- `createdAt`
- `privacy`
- `originalPostId`
- Composite de xuat: `(isDeleted, createdAt)` cho feed.

### Comments

Theo `PROJECT_PLAN.md`:

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| postId | UUID | FK Posts |
| userId | UUID | FK Users |
| parentId | UUID | FK Comments, nullable |
| content | TEXT | required |
| isDeleted | BOOLEAN | default false |
| createdAt | DATE | sort/index |
| updatedAt | DATE | audit |

Associations de xuat:

- `Comment.belongsTo(Post, { foreignKey: 'postId' })`
- `Comment.belongsTo(User, { as: 'author', foreignKey: 'userId' })`
- `Comment.belongsTo(Comment, { as: 'parent', foreignKey: 'parentId' })`
- `Comment.hasMany(Comment, { as: 'replies', foreignKey: 'parentId' })`

Indexes:

- `postId`
- `userId`
- `parentId`
- `createdAt`

### Likes

Theo `PROJECT_PLAN.md`:

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| postId | UUID | FK Posts |
| userId | UUID | FK Users |
| type | ENUM | like, love, haha, wow, sad, angry |
| createdAt | DATE | audit |
| updatedAt | DATE | audit |

Constraint:

- Unique `postId + userId`.

Indexes:

- `postId`
- `userId`
- Unique composite `(postId, userId)`.

### Media JSON

Media item theo requirement:

```json
{
  "url": "https://res.cloudinary.com/.../image/upload/...",
  "publicId": "social/posts/abc",
  "type": "image"
}
```

De xuat `type` chi gom `image` va `video` trong Phase 3 vi docs yeu cau upload anh/video cho posts.

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

### POST `/api/posts`

Auth: bat buoc.

Content-Type:

- `application/json` neu chi tao text post.
- `multipart/form-data` neu co media.

Fields de xuat:

- `content`: optional string.
- `privacy`: required enum `public`, `friends`, `private`.
- `media`: optional files, multiple.

Validation:

- Can co `content` khac rong hoac it nhat mot media.
- `privacy` default co the la `public` neu UI khong gui, nhung nen gui ro tu frontend.
- Media type/size/limit theo upload middleware.

Response data de xuat:

```json
{
  "post": {
    "id": "uuid",
    "content": "Hello",
    "media": [],
    "privacy": "public",
    "likesCount": 0,
    "commentsCount": 0,
    "sharesCount": 0,
    "author": {
      "id": "uuid",
      "username": "john",
      "fullName": "John Doe",
      "avatar": "https://..."
    },
    "createdAt": "2026-06-15T00:00:00.000Z"
  }
}
```

### GET `/api/posts/feed`

Auth: bat buoc.

Query de xuat:

- `cursor`: optional ISO datetime hoac encoded cursor.
- `limit`: optional, default 10, max 20.

Logic:

- Lay `isDeleted = false`.
- Include post `public`.
- Include post cua current user.
- Include post `friends` cua accepted friends.
- Include post `private` chi khi `userId = currentUser.id`.
- Sort `createdAt DESC`.

Response meta de xuat:

```json
{
  "meta": {
    "nextCursor": "2026-06-15T00:00:00.000Z",
    "hasMore": true
  }
}
```

### GET `/api/posts/:id`

Auth: bat buoc.

Xu ly:

- Tim post `isDeleted = false`.
- Check quyen xem theo privacy.
- Include author, counters, current user reaction neu co.
- Include `originalPost` neu la shared post va current user co quyen xem post goc.

### PUT `/api/posts/:id`

Auth: bat buoc.

Owner-only.

Fields de xuat:

- `content`: optional string.
- `privacy`: optional enum.
- `media`: optional replacement/add/remove tuy theo UI.

De xuat de giu Phase 3 gon:

- Sua content/privacy la must-have.
- Sua media co the lam theo cach replace toan bo media neu UI can.
- Xoa media cu tren Cloudinary sau khi DB update thanh cong.

### DELETE `/api/posts/:id`

Auth: bat buoc.

Owner-only.

Xu ly:

- Set `isDeleted = true`.
- Khong can xoa Cloudinary media ngay trong Phase 3 neu muon giu an toan rollback; neu xoa thi phai log loi provider. De xuat soft delete DB truoc.

### POST `/api/posts/:id/like`

Auth: bat buoc.

Request body:

```json
{
  "type": "love"
}
```

Validation:

- `type` enum: `like`, `love`, `haha`, `wow`, `sad`, `angry`.

Logic:

- Check post ton tai va current user co quyen xem.
- Neu chua co like: tao row va tang `likesCount`.
- Neu da co cung `type`: xoa row va giam `likesCount`.
- Neu da co type khac: update row, giu nguyen `likesCount`.
- Chay trong transaction.

Response data de xuat:

```json
{
  "reaction": {
    "type": "love"
  },
  "likesCount": 12
}
```

Neu unlike, `reaction` co the la `null`.

### GET `/api/posts/:id/comments`

Auth: bat buoc.

Query de xuat:

- `cursor`: optional.
- `limit`: optional, default 20, max 50.
- `parentId`: optional de load replies theo comment cha.

Logic:

- Check post co quyen xem.
- Tra comments `isDeleted = false`.
- Include author.
- Sap xep `createdAt ASC` cho conversation doc tu cu den moi.

### POST `/api/posts/:id/comments`

Auth: bat buoc.

Request body:

```json
{
  "content": "Nice post",
  "parentId": "uuid-or-null"
}
```

Logic:

- Check post co quyen xem.
- Neu co `parentId`, comment cha phai thuoc cung post.
- Tao comment.
- Tang `commentsCount` trong transaction.

### DELETE `/api/comments/:id`

Auth: bat buoc.

Permission:

- Comment owner duoc xoa comment cua minh.
- De xuat: post owner duoc xoa comment tren post cua minh, can xac nhan.

Xu ly:

- Set `isDeleted = true`.
- Giam `commentsCount` neu comment chua bi xoa.

### POST `/api/posts/:id/share`

Auth: bat buoc.

Request body de xuat:

```json
{
  "content": "My thoughts",
  "privacy": "public"
}
```

Logic:

- Check post goc ton tai va current user co quyen xem.
- Tao post moi voi `originalPostId = :id`.
- Tang `sharesCount` cua post goc trong transaction.
- Shared post co author la current user.

### De xuat endpoint profile posts

Docs yeu cau "Hien bai viet tren profile" nhung chua ghi API rieng.

De xuat them endpoint:

- `GET /api/users/:id/posts?cursor=&limit=`

Ly do:

- Tach feed home khoi profile posts.
- Reuse privacy logic theo viewer.
- Frontend profile khong phai filter feed client-side.

Day la `De xuat`, can xac nhan neu muon giu API list trong `PROJECT_PLAN.md` khong doi.

## Socket / Realtime neu co

Phase 3 chua co yeu cau Socket.IO realtime.

Khong implement realtime like/comment/share trong Phase 3. Notification realtime thuoc Phase 7.

De xuat nhe:

- Service like/comment/share co the goi internal no-op hook sau nay thay bang `NotificationService`.
- Khong emit socket trong Phase 3 de tranh lech scope.

## UI / UX Flow neu co

### Home / Feed

Flow:

1. User vao trang home sau login.
2. Frontend load `GET /api/posts/feed`.
3. Hien CreatePost o dau feed.
4. Hien danh sach PostCard.
5. Khi scroll gan cuoi, IntersectionObserver goi page tiep theo bang `nextCursor`.
6. Neu het data, hien empty/end state gon.

### Create post

Flow:

1. User nhap content.
2. User chon media neu can.
3. User chon privacy.
4. UI hien preview media.
5. Submit goi `POST /api/posts`.
6. Thanh cong thi prepend post moi vao feed/profile.
7. Loi thi hien message va giu draft neu co the.

Controls:

- Textarea cho content.
- Button/icon upload media.
- Select/segmented control cho privacy.
- Submit button co loading state.

### PostCard

Hien:

- Author avatar/fullName/username.
- Time va privacy indicator.
- Content.
- Media gallery.
- Original post preview neu la shared post.
- Counters.
- Reaction/comment/share actions.
- Owner menu edit/delete.

Owner actions:

- Edit: mo modal sua content/privacy.
- Delete: confirm truoc khi xoa.

### Reaction picker

Flow:

1. Click nut reaction mac dinh de like nhanh type `like`.
2. Mo picker de chon `love/haha/wow/sad/angry` neu UI lam du.
3. UI optimistic update count/currentReaction.
4. Neu API fail, rollback ve state cu.

### Comments

Flow:

1. User mo comments tren PostCard hoac post detail.
2. Load comments qua `GET /api/posts/:id/comments`.
3. User nhap comment va submit.
4. User reply comment bang `parentId`.
5. User xoa comment cua minh.
6. UI cap nhat count theo response server.

### Share

Flow:

1. User click Share.
2. Mo ShareModal.
3. User nhap content tuy chon va chon privacy.
4. Submit `POST /api/posts/:id/share`.
5. Shared post xuat hien trong feed/profile cua user.

### Profile posts

De xuat:

- Them tab/section posts trong `ProfilePage`.
- Load posts cua profile user bang endpoint rieng neu duoc chap nhan.
- Privacy theo viewer:
  - Owner thay tat ca post cua minh.
  - Friend thay public + friends.
  - Non-friend thay public.

## Validation va Error Handling

### Validation backend

- `postId`, `commentId`, `userId`: UUID hop le.
- `content`: trim, gioi han do dai; required neu khong co media.
- `privacy`: enum `public`, `friends`, `private`.
- `reaction type`: enum `like`, `love`, `haha`, `wow`, `sad`, `angry`.
- `parentId`: optional UUID, phai thuoc cung post khi reply.
- `limit`: integer, co max.
- `cursor`: datetime/encoded cursor hop le.
- Media: gioi han file type, size va so luong file.

### Error code de xuat

- `POST_NOT_FOUND`
- `POST_FORBIDDEN`
- `POST_VALIDATION_ERROR`
- `POST_UPDATE_FORBIDDEN`
- `POST_DELETE_FORBIDDEN`
- `POST_MEDIA_REQUIRED`
- `INVALID_POST_PRIVACY`
- `INVALID_REACTION_TYPE`
- `COMMENT_NOT_FOUND`
- `COMMENT_FORBIDDEN`
- `COMMENT_PARENT_INVALID`
- `UPLOAD_TOO_LARGE`
- `INVALID_UPLOAD_TYPE`

### Error handling

- Validation loi tra 400.
- Chua login tra 401.
- Khong co quyen xem/sua/xoa tra 403.
- Not found tra 404.
- Conflict/duplicate neu co tra 409.
- Upload/Cloudinary loi tra message than thien, khong expose provider secret/raw stack.

## Security / Permission

- Tat ca route Phase 3 can auth middleware.
- Khong include email/password/token/hash cua author trong feed.
- View post phai check privacy:
  - `public`: user dang nhap nao cung xem duoc.
  - `friends`: owner hoac accepted friend moi xem duoc.
  - `private`: chi owner xem duoc.
- Edit/delete post chi owner.
- Delete comment chi comment owner; post owner delete comment cua nguoi khac la `De xuat` can xac nhan.
- Reaction/comment/share chi cho post ma user co quyen xem.
- Upload media can gioi han type/size/so luong.
- Cloudinary API key/secret nam trong `.env`.
- Dung transaction cho create/delete like, comment va share de counters khong lech.
- Khong tin counters tu client.

## Logging / Monitoring neu can

- Log HTTP request da co tu Phase 1 neu dung `morgan`.
- Log loi upload Cloudinary va cleanup media fail.
- Log loi transaction/counter de debug.
- Khong log token, password, Cloudinary secret, raw file content.

## Thu tu implement de xuat

1. Kiem tra Phase 1 auth va response helper.
2. Kiem tra Phase 2 `Friendship` service/query accepted friends.
3. Tao migrations/models `Post`, `Comment`, `Like`.
4. Them associations va indexes.
5. Tao post routes/controller/service cho create/detail/update/delete.
6. Tich hop upload media Cloudinary cho create post.
7. Implement privacy helper `canViewPost`.
8. Implement `GET /api/posts/feed` voi cursor pagination va include author/counters.
9. Implement reaction service trong transaction.
10. Implement comments list/create/delete trong transaction.
11. Implement share post trong transaction.
12. Viet backend tests cho post CRUD, feed privacy, reaction/comment/share va upload media.
13. Tao frontend `postApi`.
14. Tao CreatePost, PostCard, media gallery, reaction picker.
15. Tao CommentSection va ShareModal.
16. Gan feed vao Home/Dashboard page va infinite scroll.
17. Them post detail route `/post/:id`.
18. Them profile posts section theo endpoint/flow da chot.
19. Test UI voi 2-3 users: owner, friend, non-friend.
20. Cap nhat README/env neu upload config thay doi.

## Anh huong testcase

Testcase Phase 3 nen bao gom:

- Migration tao `Posts`, `Comments`, `Likes` tu DB rong.
- Tao text-only post success.
- Tao media-only post success.
- Tao post khong content va khong media fail.
- Upload media sai type fail.
- Upload media qua size fail.
- Feed hien public post.
- Feed hien friends post cua ban be.
- Feed khong hien friends post cua non-friend.
- Feed hien private post cua owner.
- Feed khong hien private post cua user khac.
- Feed cursor pagination dung.
- Get post detail ton trong privacy.
- Owner edit post success.
- Non-owner edit post fail.
- Owner delete post success.
- Deleted post khong hien trong feed/detail thong thuong.
- Like post lan dau tang `likesCount`.
- Like lai cung type thi unlike va giam `likesCount`.
- Doi reaction type khong doi `likesCount`.
- Comment post success va tang `commentsCount`.
- Reply comment success voi parent hop le.
- Reply comment voi parent khac post fail.
- Delete comment success va giam `commentsCount`.
- Share post success, tao post moi co `originalPostId`, tang `sharesCount`.
- Share post khong co quyen xem fail.
- UI CreatePost tao post thanh cong.
- UI PostCard reaction/comment/share dung.
- UI owner edit/delete dung.
- UI feed infinite scroll dung.
- UI post detail dung.
- UI profile posts ton trong privacy.
- Responsive mobile feed/post card/comment khong vo layout.

## Cau hoi can xac nhan

- Owner post co duoc xoa comment cua user khac tren post cua minh trong Phase 3 khong?
- Gioi han media moi post la bao nhieu file va moi file toi da bao nhieu MB?
- Update post co can sua/thay media trong Phase 3, hay chi sua content/privacy?
- Khi shared original post bi xoa/doi privacy, UI hien placeholder hay an shared content?
- Co chap nhan them endpoint `GET /api/users/:id/posts` cho profile posts khong?
