# Phase 3: Posts & Newsfeed Testcases

## Nguon requirement va design

- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`
- `plans/phase-03/req.md`
- `plans/phase-03/design.md`
- `plans/phase-02/req.md`
- `plans/phase-02/design.md`

## Pham vi test

Phase 3 test cac nhom chuc nang:

- Backend posts: model/migration, create/read/update/delete post, media upload, privacy.
- Feed: public/friends/private visibility, cursor pagination, user info va counters.
- Reactions: like/unlike, doi reaction type, unique reaction per user/post, count transaction.
- Comments: list/create/reply/delete, parent comment validation, count transaction.
- Share: tao shared post voi `originalPostId`, tang `sharesCount`, permission theo post goc.
- Frontend posts/newsfeed: CreatePost, PostCard, CommentSection, ShareModal, feed infinite scroll, post detail, profile posts.
- Security/permission: auth required, owner-only edit/delete, privacy check, khong expose sensitive user fields.

## Khong tao testcase chi tiet cho setup

Phase 3 co cac viec setup nhu tao model, migration, associations, indexes, post API client va post slice. Cac viec nay duoc verify bang checklist va API/UI testcase, khong tach thanh testcase setup chi tiet tru khi co behavior nguoi dung/API.

## Setup Verification Checklist

- [ ] Migration `Posts`, `Comments`, `Likes` chay duoc tu database rong.
- [ ] Rollback migrations Phase 3 chay duoc.
- [ ] Associations `User`, `Post`, `Comment`, `Like` hoat dong.
- [ ] Indexes cho `userId`, `postId`, `createdAt` duoc tao.
- [ ] Unique constraint `postId + userId` tren `Likes` duoc tao.
- [ ] Server start thanh cong sau khi mount post/comment routes.
- [ ] Cloudinary env dung lai duoc tu Phase 2 va khong commit secret.
- [ ] Upload middleware cho post media gioi han type/size/so luong theo cau hinh da chot.
- [ ] Frontend build/chay dev server sau khi them posts/newsfeed UI.

## Gia dinh va du lieu test

Du lieu user:

- `userA`: current user/owner, da login, co access token hop le.
- `userB`: friend accepted voi `userA`.
- `userC`: non-friend voi `userA`.
- `userD`: user khong ton tai hoac UUID hop le nhung khong co record.

Du lieu post:

- `postPublicB`: post `public` cua `userB`.
- `postFriendsB`: post `friends` cua `userB`.
- `postPrivateB`: post `private` cua `userB`.
- `postPublicC`: post `public` cua `userC`.
- `postFriendsC`: post `friends` cua `userC`.
- `postPrivateA`: post `private` cua `userA`.
- `postDeletedA`: post cua `userA` co `isDeleted=true`.
- `postOriginalB`: post cua `userB` co quyen xem, dung cho share.

File test:

- `valid-image.jpg`: image hop le.
- `valid-video.mp4`: video hop le neu Phase 3 bat upload video.
- `too-large-media.jpg`: file vuot gioi han size da chot.
- `not-media.pdf`: file sai type.

Quy uoc:

- Tat ca API Phase 3 mac dinh can Bearer access token hop le.
- Response dung format chung `success`, `message`, `data`, `error`, `meta`.
- Author trong post/feed/comment khong duoc expose `password`, token/hash, va email cua user khac.
- Backend la source of truth cho privacy va counters.
- Cac testcase lien quan gioi han so media/size file can cap nhat sau khi cau hoi nay duoc chot.
- Endpoint profile posts dang la `Can xac nhan`; neu chua co endpoint rieng, test UI profile posts dua theo flow da implement.

## Manual Testcases

| ID | Feature | Scenario | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- |
| P03-MANUAL-001 | Create Post | Tao text post public | Login `userA` -> vao home/feed -> nhap content -> chon privacy public -> Post | Post moi xuat hien dau feed, dung author/content/privacy, count ban dau = 0 | High |
| P03-MANUAL-002 | Create Post | Tao post co media | Login `userA` -> chon `valid-image.jpg` -> preview -> Post | Media hien trong post, refresh trang van con media, khong mat content | High |
| P03-MANUAL-003 | Create Post | Tao post rong | Login `userA` -> khong nhap content, khong chon media -> Post | UI/API hien loi, khong tao post rong | High |
| P03-MANUAL-004 | Create Post | Upload sai type | Chon `not-media.pdf` trong CreatePost | UI/API hien loi file khong hop le, khong tao post | High |
| P03-MANUAL-005 | Create Post | Upload qua size | Chon `too-large-media.jpg` | UI/API hien loi vuot gioi han, khong tao post | High |
| P03-MANUAL-006 | Feed Privacy | Feed cua friend | Login `userA` khi `userB` la friend -> mo feed | Hien `postPublicB` va `postFriendsB`; khong hien `postPrivateB` | High |
| P03-MANUAL-007 | Feed Privacy | Feed cua non-friend | Login `userA` khi `userC` khong la friend -> mo feed | Hien `postPublicC`; khong hien `postFriendsC` va private cua `userC` | High |
| P03-MANUAL-008 | Feed Privacy | Private post cua minh | Login `userA` -> tao private post -> mo feed | Post private cua `userA` hien cho `userA` | High |
| P03-MANUAL-009 | Feed | Infinite scroll | Tao du lieu nhieu hon 1 page -> cuon gan cuoi feed | Feed load them post, khong duplicate, thu tu moi den cu | High |
| P03-MANUAL-010 | Post Detail | Xem post detail | Click vao `postPublicB` tu feed | Trang `/post/:id` hien dung post, author, counters, comments | High |
| P03-MANUAL-011 | Post Detail | Xem post khong co quyen | Login `userA` -> mo URL detail `postPrivateB` | UI hien forbidden/not found than thien, khong render noi dung post | High |
| P03-MANUAL-012 | Edit Post | Owner sua post | Login `userA` -> tao post -> edit content/privacy -> save | Post cap nhat tren UI, refresh van dung noi dung moi | High |
| P03-MANUAL-013 | Edit Post | Non-owner khong thay edit | Login `userA` -> xem post cua `userB` | Khong hien menu edit/delete owner | High |
| P03-MANUAL-014 | Delete Post | Owner xoa post | Login `userA` -> delete post cua minh -> confirm | Post bien mat khoi feed/profile; detail khong hien noi dung thong thuong | High |
| P03-MANUAL-015 | Reaction | Like/unlike nhanh | Login `userA` -> click Like tren post co quyen xem -> click lai | Lan 1 count tang va current reaction hien; lan 2 count giam va reaction mat | High |
| P03-MANUAL-016 | Reaction | Doi reaction type | Chon `love`, sau do chon `haha` tren cung post | UI hien reaction moi, `likesCount` khong tang them khi chi doi type | High |
| P03-MANUAL-017 | Comments | Tao comment | Login `userA` -> mo comments -> nhap comment -> submit | Comment moi hien len, `commentsCount` tang | High |
| P03-MANUAL-018 | Comments | Reply comment | Reply mot comment hop le | Reply hien dung duoi/gan comment cha, count tang | High |
| P03-MANUAL-019 | Comments | Xoa comment cua minh | Tao comment -> delete comment do | Comment bien mat hoac hien deleted state theo UI, count giam | High |
| P03-MANUAL-020 | Share | Share post | Login `userA` -> share `postOriginalB` -> nhap caption -> chon privacy -> submit | Tao shared post moi co original preview, `sharesCount` cua post goc tang | High |
| P03-MANUAL-021 | Profile Posts | Hien bai viet tren profile | Login `userA` -> mo profile `userB` | Hien posts cua `userB` ma `userA` co quyen xem; khong hien private/forbidden posts | High |
| P03-MANUAL-022 | UI State | Empty feed | Login account khong co post nao co quyen xem | Feed hien empty state ro rang, CreatePost van dung duoc | Medium |
| P03-MANUAL-023 | UI State | Loading/error states | Gia lap API cham/loi khi load feed/comments | UI co skeleton/loading/error state, khong crash | Medium |
| P03-MANUAL-024 | Responsive | Mobile feed | Mo home/post detail/profile posts o mobile viewport | PostCard, media, actions, comments khong overlap; thao tac chinh dung duoc | Medium |

## API Testcases

| ID | Endpoint | Method | Scenario | Payload / Params | Expected Result |
| --- | --- | --- | --- | --- | --- |
| P03-POST-001 | `/api/posts` | POST | Tao text-only post thanh cong | token `userA`, `{ "content": "Hello", "privacy": "public" }` | 201/200; `success=true`; tra post co author `userA`, content, privacy, counters = 0 |
| P03-POST-002 | `/api/posts` | POST | Tao media-only post thanh cong | multipart media=`valid-image.jpg`, privacy=`public` | 201/200; post co `media[]` gom `url`, `publicId`, `type` |
| P03-POST-003 | `/api/posts` | POST | Tao post content + media thanh cong | content + multipart media | 201/200; post co content va media |
| P03-POST-004 | `/api/posts` | POST | Tao post khong content va khong media | `{ "privacy": "public" }` | 400; khong tao post |
| P03-POST-005 | `/api/posts` | POST | Privacy khong hop le | `{ "content": "x", "privacy": "friends_only" }` | 400; error validation |
| P03-POST-006 | `/api/posts` | POST | Chua login | valid payload, khong token | 401 |
| P03-POST-007 | `/api/posts` | POST | Upload sai type | multipart media=`not-media.pdf` | 400; error `INVALID_UPLOAD_TYPE` hoac tuong duong |
| P03-POST-008 | `/api/posts` | POST | Upload qua size | multipart media=`too-large-media.jpg` | 400; error `UPLOAD_TOO_LARGE` hoac tuong duong |
| P03-POST-009 | `/api/posts/feed` | GET | Feed hien public post | token `userA` | 200; co `postPublicB`, `postPublicC` neu chua deleted |
| P03-POST-010 | `/api/posts/feed` | GET | Feed hien friends post cua friend | token `userA`, `userB` la friend | 200; co `postFriendsB` |
| P03-POST-011 | `/api/posts/feed` | GET | Feed khong hien friends post cua non-friend | token `userA`, `userC` non-friend | 200; khong co `postFriendsC` |
| P03-POST-012 | `/api/posts/feed` | GET | Feed hien private post cua owner | token `userA` | 200; co `postPrivateA` |
| P03-POST-013 | `/api/posts/feed` | GET | Feed khong hien private post cua user khac | token `userA` | 200; khong co `postPrivateB` |
| P03-POST-014 | `/api/posts/feed` | GET | Feed khong hien deleted post | token `userA` | 200; khong co `postDeletedA` |
| P03-POST-015 | `/api/posts/feed` | GET | Cursor pagination | `limit=2`, sau do goi `cursor=nextCursor` | 200; page sau khong duplicate page truoc; meta co `hasMore/nextCursor` theo data |
| P03-POST-016 | `/api/posts/feed` | GET | Limit qua lon | `limit=999` | 200 hoac 400 theo validation; khong tra qua max limit da chot |
| P03-POST-017 | `/api/posts/:id` | GET | Xem public post | `:id=postPublicB.id`, token `userA` | 200; tra post, author public fields, counters |
| P03-POST-018 | `/api/posts/:id` | GET | Xem friends post cua friend | `:id=postFriendsB.id`, token `userA` | 200 |
| P03-POST-019 | `/api/posts/:id` | GET | Xem friends post cua non-friend | `:id=postFriendsC.id`, token `userA` | 403/404; khong tra noi dung |
| P03-POST-020 | `/api/posts/:id` | GET | Xem private post nguoi khac | `:id=postPrivateB.id`, token `userA` | 403/404; khong tra noi dung |
| P03-POST-021 | `/api/posts/:id` | GET | Post khong ton tai | UUID hop le khong ton tai | 404 |
| P03-POST-022 | `/api/posts/:id` | GET | Invalid post id | `:id=abc` | 400 |
| P03-POST-023 | `/api/posts/:id` | PUT | Owner sua content/privacy | `:id=post cua userA`, `{ "content": "Updated", "privacy": "friends" }` | 200; post cap nhat dung |
| P03-POST-024 | `/api/posts/:id` | PUT | Non-owner sua post | `:id=postPublicB.id`, token `userA` | 403; post khong doi |
| P03-POST-025 | `/api/posts/:id` | PUT | Sua privacy invalid | owner token, `{ "privacy": "bad" }` | 400 |
| P03-POST-026 | `/api/posts/:id` | DELETE | Owner xoa post | `:id=post cua userA` | 200; DB set `isDeleted=true`; feed/detail thong thuong khong hien |
| P03-POST-027 | `/api/posts/:id` | DELETE | Non-owner xoa post | `:id=postPublicB.id`, token `userA` | 403; post khong bi xoa |
| P03-LIKE-001 | `/api/posts/:id/like` | POST | Like lan dau | `:id=postPublicB.id`, `{ "type": "like" }` | 200; tao Like row; `likesCount` tang 1; reaction=`like` |
| P03-LIKE-002 | `/api/posts/:id/like` | POST | Toggle unlike cung type | Goi lai `{ "type": "like" }` tren post da like | 200; xoa Like row; `likesCount` giam 1; reaction=null |
| P03-LIKE-003 | `/api/posts/:id/like` | POST | Doi reaction type | Da like `like`, goi `{ "type": "love" }` | 200; Like row doi type; `likesCount` giu nguyen |
| P03-LIKE-004 | `/api/posts/:id/like` | POST | Reaction type invalid | `{ "type": "care" }` | 400; khong tao/update Like |
| P03-LIKE-005 | `/api/posts/:id/like` | POST | Reaction post khong co quyen xem | `:id=postPrivateB.id`, token `userA` | 403/404; khong doi count |
| P03-LIKE-006 | `/api/posts/:id/like` | POST | Chua login | valid body, khong token | 401 |
| P03-COMMENT-001 | `/api/posts/:id/comments` | GET | Lay comments post co quyen xem | `:id=postPublicB.id` | 200; tra comments chua deleted, include author public fields |
| P03-COMMENT-002 | `/api/posts/:id/comments` | GET | Lay comments post khong co quyen xem | `:id=postPrivateB.id`, token `userA` | 403/404 |
| P03-COMMENT-003 | `/api/posts/:id/comments` | GET | Comments pagination | `limit=2`, sau do cursor page tiep | 200; khong duplicate; meta pagination dung |
| P03-COMMENT-004 | `/api/posts/:id/comments` | POST | Tao comment thanh cong | `{ "content": "Nice post" }` | 201/200; comment duoc tao; `commentsCount` tang 1 |
| P03-COMMENT-005 | `/api/posts/:id/comments` | POST | Comment rong | `{ "content": "   " }` | 400; khong tao comment |
| P03-COMMENT-006 | `/api/posts/:id/comments` | POST | Reply comment hop le | `{ "content": "reply", "parentId": "comment cua cung post" }` | 201/200; comment co parentId; `commentsCount` tang |
| P03-COMMENT-007 | `/api/posts/:id/comments` | POST | Reply parent khac post | `parentId` cua post khac | 400/404; khong tao comment |
| P03-COMMENT-008 | `/api/posts/:id/comments` | POST | Comment post khong co quyen xem | `:id=postPrivateB.id`, token `userA` | 403/404; khong tao comment |
| P03-COMMENT-009 | `/api/comments/:id` | DELETE | Comment owner xoa comment | `:id=comment cua userA` | 200; comment set `isDeleted=true`; `commentsCount` giam |
| P03-COMMENT-010 | `/api/comments/:id` | DELETE | User khac xoa comment | `:id=comment cua userB`, token `userA` | 403/404 theo permission da chot; comment khong bi xoa |
| P03-COMMENT-011 | `/api/comments/:id` | DELETE | Comment khong ton tai | UUID hop le khong ton tai | 404 |
| P03-SHARE-001 | `/api/posts/:id/share` | POST | Share post thanh cong | `:id=postOriginalB.id`, `{ "content": "My thoughts", "privacy": "public" }` | 201/200; tao post moi co `originalPostId`; post goc `sharesCount` tang |
| P03-SHARE-002 | `/api/posts/:id/share` | POST | Share khong caption | `{ "privacy": "public" }` | 201/200 neu design cho phep; shared post co `originalPostId` |
| P03-SHARE-003 | `/api/posts/:id/share` | POST | Share post khong co quyen xem | `:id=postPrivateB.id`, token `userA` | 403/404; khong tao shared post; `sharesCount` khong doi |
| P03-SHARE-004 | `/api/posts/:id/share` | POST | Share privacy invalid | `{ "privacy": "bad" }` | 400; khong tao shared post |
| P03-SEC-001 | Nhieu endpoint | Nhieu method | Author/user info khong expose sensitive fields | Goi feed/detail/comments | Response khong co `password`, `refreshTokenHash`, token/reset fields; email user khac khong bi expose |

## UI Testcases

| ID | Screen | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P03-UI-001 | Home/Feed | Protected feed route | Logout -> mo home/feed | Bi redirect ve login hoac hien yeu cau dang nhap |
| P03-UI-002 | Home/Feed | Load feed success | Login `userA` -> mo home | Hien CreatePost, danh sach PostCard, loading ket thuc |
| P03-UI-003 | Home/Feed | Feed empty state | Login account khong co post nao co quyen xem | Hien empty state ro rang, khong crash |
| P03-UI-004 | CreatePost | Tao post text | Nhap content -> chon privacy -> submit | Post moi prepend vao feed, form reset |
| P03-UI-005 | CreatePost | Media preview | Chon 1-n media hop le | Preview hien dung truoc khi submit, co the bo chon neu UI ho tro |
| P03-UI-006 | CreatePost | Validation loi | Submit post rong | Hien loi, khong append post ao vao feed |
| P03-UI-007 | PostCard | Render post day du | Mo feed co post text/media/shared | Hien author/time/privacy/content/media/counters/actions dung |
| P03-UI-008 | PostCard | Owner menu | Login owner cua post | Hien edit/delete menu cho post cua minh |
| P03-UI-009 | PostCard | Non-owner menu | Login user khac | Khong hien edit/delete menu owner |
| P03-UI-010 | EditPost | Edit success | Owner edit content/privacy -> save | Modal dong, UI cap nhat, refresh van dung |
| P03-UI-011 | DeletePost | Delete success | Owner delete post -> confirm | Post bien mat khoi feed/profile |
| P03-UI-012 | ReactionPicker | Like nhanh | Click like button | Current reaction/counter cap nhat theo response |
| P03-UI-013 | ReactionPicker | Chon reaction khac | Mo picker -> chon reaction khac | Icon/label reaction cap nhat, counter khong double count |
| P03-UI-014 | ReactionPicker | Rollback khi API fail | Gia lap API like fail | UI quay ve state cu, hien loi than thien |
| P03-UI-015 | CommentSection | Load comments | Mo comments tren post | Hien comments, author, created time; loading/empty state dung |
| P03-UI-016 | CommentSection | Tao comment | Nhap comment -> submit | Comment moi hien, input reset, count cap nhat |
| P03-UI-017 | CommentSection | Reply comment | Bam reply -> nhap reply -> submit | Reply gan voi comment cha, count cap nhat |
| P03-UI-018 | CommentSection | Delete comment | Delete comment cua minh | Comment bi xoa/an theo UI, count cap nhat |
| P03-UI-019 | ShareModal | Share success | Bam share -> nhap caption/privacy -> submit | Modal dong, shared post hien tren feed/profile, share count cap nhat |
| P03-UI-020 | PostDetail | Open detail | Click post tu feed | Dieu huong `/post/:id`, hien dung post va comments |
| P03-UI-021 | Profile | Profile posts | Mo profile user khac | Hien posts user do theo quyen xem cua viewer |
| P03-UI-022 | Responsive | Mobile create/feed | Mo mobile viewport -> tao post/comment/share | UI khong overlap, button text khong tran, thao tac dung |

## Edge Cases

- Content chi co khoang trang: backend trim va tu choi neu khong co media.
- Content rat dai vuot gioi han validation: API tra 400, UI hien loi.
- Cursor feed khong hop le: API tra 400 hoac fallback an toan theo design, khong crash.
- Hai request like cung luc tren cung user/post: chi co mot Like row, `likesCount` khong bi tang sai.
- Hai request comment/share gui lap do double click: UI disabled/loading hoac backend xu ly khong tao ngoai y muon neu san pham yeu cau.
- Upload Cloudinary thanh cong nhung DB save fail: media moi duoc cleanup neu co the, API khong tao post nua voi data lech.
- Cleanup Cloudinary fail: backend log loi, khong expose secret/raw provider stack.
- Post bi xoa sau khi feed da load, user thao tac like/comment/share: API tra 404/403 hop le, UI remove/refresh state.
- User mat friendship sau khi feed da load friends post: thao tac detail/like/comment tren post do phai check lai permission server-side.
- Original post cua shared post bi xoa hoac doi privacy: behavior can xac nhan; UI khong crash va khong expose noi dung khong co quyen xem.
- Deleted comment khong duoc tinh double decrement khi delete lai lan hai.
- Comment parent da bi xoa: can xac nhan co cho reply khong; neu khong, API tra loi loi hop le.
- Author user bi xoa/khong active nhung post con ton tai: feed/detail khong crash, hien fallback author neu can.
- Frontend optimistic update fail: rollback reaction/comment/share ve state truoc do.
- Media gallery voi nhieu ty le anh/video: UI khong vo layout desktop/mobile.

## Regression Checklist

- [ ] Auth login/logout/refresh van hoat dong sau khi them posts.
- [ ] Protected routes Phase 1/2 van chan user chua login.
- [ ] Profile va friends Phase 2 van hoat dong, friendship accepted van dung cho feed privacy.
- [ ] Upload avatar/cover Phase 2 khong bi anh huong boi upload post media.
- [ ] Navbar/search/profile links van hoat dong.
- [ ] Response format van dung `success`, `message`, `data`, `error`, `meta`.
- [ ] API khong tra sensitive fields cua user trong feed/comments.
- [ ] Counters khong am va khong lech sau like/comment/share/delete.
- [ ] Migration tu DB rong chay duoc.
- [ ] Backend tests Phase 1/2 van pass.
- [ ] Backend tests Phase 3 core pass.
- [ ] Frontend build pass.

## Automation Mapping

| Test group | Nen automate o dau |
| --- | --- |
| Post CRUD service | Backend unit/integration test voi Jest |
| Post API | Backend integration test voi Supertest |
| Feed privacy | Backend integration test voi seed users/friendships/posts |
| Reactions | Backend service/integration test, uu tien transaction/count |
| Comments | Backend service/integration test |
| Share | Backend integration test |
| Upload media | Backend integration test voi mock Cloudinary hoac test env |
| CreatePost/PostCard UI | Manual E2E truoc, Playwright/Cypress neu co thoi gian |
| Feed infinite scroll | Playwright/Cypress hoac manual E2E |
| Responsive UI | Manual viewport desktop/mobile, sau do visual regression neu co setup |

## Cau hoi can xac nhan

- Gioi han so media moi post va size tung file la bao nhieu?
- Update post co bat buoc sua/thay media trong Phase 3 khong, hay chi sua content/privacy?
- Owner post co duoc xoa comment cua user khac tren post cua minh khong?
- Khi shared original post bi xoa/doi privacy, UI/API nen hien placeholder hay an shared content?
- Co chap nhien endpoint `GET /api/users/:id/posts` cho profile posts khong, hay dung endpoint/filter khac?
- Comment parent da bi xoa co cho reply tiep khong?
