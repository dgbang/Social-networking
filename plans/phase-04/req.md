# Phase 4: Stories Requirements

## Muc tieu

Phase 4 xay dung tinh nang Stories trong tuan 6:

- User dang nhap co the tao story bang anh/video.
- Story tu het han sau 24 gio.
- User co the xem story feed cua minh va ban be.
- User co the danh dau story da xem.
- Owner co the xoa story cua minh.
- Frontend co StoryBar, StoryViewer full screen modal va CreateStory UI.
- UI can dep, hien dai, lay cam hung tu Instagram/Facebook theo yeu cau truc tiep cua user.

## Nguon tai lieu

- `docs/PROJECT_PLAN.md`
  - Muc 6: Schema `Stories`, `StoryViews`.
  - Muc 7: Stories API endpoints.
  - Muc 11: Phase 4 output chinh.
  - Muc 12: Definition of Done.
- `docs/WEEKLY_PLAN.md`
  - Phase 4: Stories, tuan 6.
  - Ngay 1-7: schema/API, feed/view, auto-expire, StoryBar/viewer, CreateStory UI, mobile polish va test.
- Yeu cau truc tiep cua user:
  - Lam theo thu tu: tao tai lieu, tao testcase, code.
  - UI dep nhu Instagram/Facebook.

## Pham vi trong phase

### Backend

- Tao model/migration `Story`.
- Tao model/migration `StoryView`.
- Them associations giua `User`, `Story`, `StoryView`.
- Them index cho `expiresAt`.
- Tao API `POST /api/stories`.
- Upload story media len Cloudinary.
- Set `expiresAt = now + 24h`.
- Tao API `GET /api/stories/feed`.
- Feed chi tra story chua het han.
- Feed group theo user.
- Tao API `POST /api/stories/:id/view`.
- Tao API `DELETE /api/stories/:id`.
- Owner-only delete story.
- Setup auto-expire bang cron de an/xoa story het han.

### Frontend

- Tao `storyApi`.
- Them StoryBar tren feed/dashboard.
- Tao StoryViewer full screen modal.
- StoryViewer co progress bar, next/prev, close.
- Tao CreateStory UI upload anh/video.
- Preview story truoc khi dang.
- Text overlay don gian.
- Owner co the xoa story cua minh.
- Responsive mobile.
- Auto-advance.
- Pause khi hover/touch neu kip.

## Khong nam trong phase

- Advanced story editor/filter/nhieu layer sticker la Stretch, chua phai Must-have.
- Chat realtime thuoc Phase 5.
- Video call thuoc Phase 6.
- Notifications/FCM thuoc Phase 7.
- Realtime notification khi tao/xem story chua nam trong Phase 4.
- Public story cua nguoi la chua co quan he ban be chua thay trong docs; Phase 4 mac dinh lay story cua minh va accepted friends.

## Yeu cau chuc nang

### Story create

- User dang nhap tao duoc story qua `POST /api/stories`.
- Story can co media anh hoac video.
- Text overlay la optional string.
- Media luu Cloudinary URL va public id.
- `mediaType` chi gom `image` hoac `video`.
- `expiresAt` duoc set bang server, mac dinh 24 gio sau thoi diem tao.
- Neu upload thanh cong nhung luu DB loi, backend can co gang cleanup media moi upload.

### Story feed

- User dang nhap lay story feed qua `GET /api/stories/feed`.
- Feed chi tra story co `expiresAt > now`.
- Feed gom story cua current user va accepted friends.
- Feed group theo user.
- Moi group co user info public, danh sach stories, count chua xem va thoi gian story moi nhat.
- Moi story co `viewed` cho current user.
- Feed sap xep theo story moi nhat trong group.

### Story view

- User danh dau da xem qua `POST /api/stories/:id/view`.
- Moi user chi co mot row view cho mot story.
- Goi lai endpoint view khong tao duplicate view.
- User chi view duoc story ma minh co quyen xem.

### Story delete

- Owner xoa duoc story cua minh qua `DELETE /api/stories/:id`.
- User khong phai owner khong duoc xoa story.
- Story da xoa khong xuat hien trong feed.

### Frontend

- StoryBar hien dau feed, gom card tao story va cac group story.
- Group chua xem can co ring/outline noi bat.
- StoryViewer mo full screen, tap/click next/prev va close duoc.
- Progress bar hien tien do story hien tai.
- CreateStory co media picker, preview, text overlay va submit state.
- UI can giong cam giac social app hien dai: avatar ring, card media ro, modal full screen, spacing gon, responsive mobile.

## Yeu cau phi chuc nang

- Tat ca API Phase 4 can protected bang auth middleware.
- Tat ca input body, params, query can validate.
- Dung Sequelize migration, khong dung `sequelize.sync({ alter: true })`.
- Dung response format chung cua du an.
- Upload gioi han type/size theo middleware hien co.
- API khong expose password/token/hash cua user.
- Query feed can tranh lay story het han.
- Cron auto-expire khong duoc lam crash server neu provider/delete loi.

## Tieu chi hoan thanh

- Migration `Stories`, `StoryViews` chay duoc tu DB rong va rollback co ban.
- `POST /api/stories` tao story voi media, text optional va `expiresAt` 24h.
- `GET /api/stories/feed` tra group theo user, chi story con han, dung viewed state.
- `POST /api/stories/:id/view` idempotent va ton trong permission.
- `DELETE /api/stories/:id` chi owner xoa duoc.
- Story het han khong hien trong feed.
- Auto-expire job duoc setup.
- Frontend StoryBar, StoryViewer va CreateStory UI chay duoc.
- UI responsive desktop/mobile va co visual style hien dai theo yeu cau.
- Co backend tests cho story permission/feed/view/delete core.
- Frontend build pass.

## Phu thuoc phase khac

- Phu thuoc Phase 1:
  - Auth middleware.
  - Current user/token flow.
  - Response helper.
  - Sequelize/PostgreSQL migration setup.
- Phu thuoc Phase 2:
  - User profile/avatar.
  - Friendships accepted de loc story feed.
  - Cloudinary upload service.
- Phu thuoc Phase 3:
  - Dashboard/feed UI la noi gan StoryBar.
  - Pattern upload media va social card UI.

## Ranh gioi va rui ro

- Cron auto-expire co the can package moi; neu cham tien do, feed van phai filter `expiresAt > now` de dam bao dung logic.
- Upload video co the nang/cham; Phase 4 dung limit middleware hien co.
- StoryViewer auto-advance va pause co the phuc tap tren mobile; uu tien next/prev/close va progress bar truoc.
- Viewers list cho owner co trong weekly plan polish; neu cham tien do co the de lai sau Must-have.

## Cau hoi can xac nhan

- Story cua nguoi chua ket ban co hien neu public profile khong? De xuat Phase 4 chi lay story cua minh va accepted friends.
- Cron nen hard delete story het han hay chi khong hien trong feed? De xuat hard delete DB sau khi story het han, Cloudinary cleanup best-effort.
- Viewers list cho owner co bat buoc trong dot code nay khong? De xuat de o muc polish neu con thoi gian.
