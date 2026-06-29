# Phase 4: Stories Testcases

## Nguon requirement va design

- `plans/phase-04/req.md`
- `plans/phase-04/design.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`

## Pham vi test

Phase 4 test cac nhom chuc nang:

- Story schema/migration.
- Create story voi media.
- Story feed group theo user, con han, viewed state.
- Mark story viewed idempotent.
- Delete story owner-only.
- Auto-expire/expired filtering.
- StoryBar, CreateStoryModal, StoryViewer UI.
- Regression auth/feed/profile/posts sau khi them stories.

## Setup Verification Checklist

- [ ] Migration `Stories`, `StoryViews` chay duoc tu database rong.
- [ ] Rollback migration Phase 4 chay duoc.
- [ ] Associations `User`, `Story`, `StoryView` hoat dong.
- [ ] Index `Stories.expiresAt` duoc tao.
- [ ] Unique constraint `StoryViews(storyId, userId)` duoc tao.
- [ ] Server start thanh cong sau khi mount story routes va cron job.
- [ ] Cloudinary env dung lai duoc tu Phase 2/3 va khong commit secret.
- [ ] Frontend build/chay dev server sau khi them stories UI.

## Gia dinh va du lieu test

- `user_a`: current user.
- `user_b`: accepted friend cua `user_a`.
- `user_c`: khong phai friend cua `user_a`.
- `story_a_1`: story con han cua `user_a`.
- `story_b_1`: story con han cua `user_b`.
- `story_c_1`: story con han cua `user_c`.
- `story_expired`: story co `expiresAt < now`.
- Media hop le:
  - `valid-image.jpg`
  - `valid-video.mp4`
- Media khong hop le:
  - `invalid.txt`
  - file lon hon limit upload hien co.

## Manual Testcases

| ID | Feature | Scenario | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- |
| P04-STORY-001 | Create story | Tao story anh thanh cong | Login, mo Create Story, chon anh, nhap text, submit | Story moi xuat hien trong StoryBar, expires sau 24h | High |
| P04-STORY-002 | Create story | Tao story video thanh cong | Login, chon video hop le, submit | Story video hien va play duoc trong viewer | High |
| P04-STORY-003 | Create story | Submit khi chua chon media | Mo Create Story, khong chon media, submit | UI chan submit hoac API tra loi media required | High |
| P04-STORY-004 | Feed | Xem story cua minh va ban be | Tao story cho user_a/user_b/user_c, login user_a | StoryBar chi hien user_a va user_b, khong hien user_c | High |
| P04-STORY-005 | Feed | Story het han khong hien | Tao story expired, reload feed | Story expired khong hien | High |
| P04-STORY-006 | Viewer | Xem story va danh dau viewed | Click story chua xem | Viewer mo, story duoc mark viewed, ring doi trang thai sau reload | High |
| P04-STORY-007 | Viewer | Next/prev/close | Mo viewer co nhieu story, bam next/prev/close | Chuyen story dung, close quay lai feed | Medium |
| P04-STORY-008 | Delete | Owner xoa story cua minh | Login owner, mo story cua minh, bam delete | Story bien khoi StoryBar sau khi xoa | High |
| P04-STORY-009 | Delete | Non-owner khong xoa duoc | Login user_a, co story cua user_b trong feed | UI khong hien delete; neu goi API thi bi 403 | High |
| P04-STORY-010 | Responsive | Mobile story UI | Mo viewport mobile, tao va xem story | StoryBar scroll ngang, viewer khong bi overflow/clip | Medium |

## API Testcases

| ID | Endpoint | Method | Scenario | Payload / Params | Expected Result |
| --- | --- | --- | --- | --- | --- |
| P04-API-001 | `/api/stories` | POST | Tao story image thanh cong | multipart `media=valid-image.jpg`, `text=Hello` | 201, tra `story.media`, `mediaType=image`, `expiresAt` |
| P04-API-002 | `/api/stories` | POST | Tao story video thanh cong | multipart `media=valid-video.mp4` | 201, tra `mediaType=video` |
| P04-API-003 | `/api/stories` | POST | Thieu media | `text=Only text` | 400 `STORY_MEDIA_REQUIRED` hoac upload validation |
| P04-API-004 | `/api/stories` | POST | Text qua dai | `text` > 160 | 422 validation error |
| P04-API-005 | `/api/stories/feed` | GET | Feed current user va friends | user_a co friend user_b, user_c khong friend | 200, groups chi gom user_a/user_b |
| P04-API-006 | `/api/stories/feed` | GET | Story expired bi loai | Co story `expiresAt < now` | 200, khong tra story expired |
| P04-API-007 | `/api/stories/:id/view` | POST | Mark viewed lan dau | `story_b_1` | 200, `viewed=true`, tao view row |
| P04-API-008 | `/api/stories/:id/view` | POST | Mark viewed idempotent | Goi 2 lan cung story/user | 200, khong duplicate row |
| P04-API-009 | `/api/stories/:id/view` | POST | View story khong co quyen | `story_c_1` | 403 hoac 404 theo design |
| P04-API-010 | `/api/stories/:id` | DELETE | Owner xoa story | Login owner | 200, story khong con trong feed |
| P04-API-011 | `/api/stories/:id` | DELETE | Non-owner xoa story | Login user_a xoa story_b_1 | 403 `STORY_DELETE_FORBIDDEN` |
| P04-API-012 | `/api/stories/feed` | GET | Chua login | Khong Bearer token | 401 `UNAUTHORIZED` |

## UI Testcases

| ID | Screen | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P04-UI-001 | Dashboard | StoryBar hien dau feed | Login vao dashboard | StoryBar hien tren CreatePost/feed |
| P04-UI-002 | Dashboard | Empty state | User khong co story/friend story | Van hien create story card, khong vo layout |
| P04-UI-003 | CreateStoryModal | Preview media | Chon anh/video | Preview hien dung media, text overlay nhap duoc |
| P04-UI-004 | CreateStoryModal | Loading/error | Submit khi upload/API loi | Button loading, loi hien ro, modal khong mat input |
| P04-UI-005 | StoryViewer | Full screen viewer | Click story group | Modal dark full screen, media ro, header/progress/close hien |
| P04-UI-006 | StoryViewer | Owner delete | Mo story cua minh | Nut delete hien va xoa thanh cong |
| P04-UI-007 | StoryViewer | Non-owner controls | Mo story ban be | Khong hien nut delete |
| P04-UI-008 | Responsive | Mobile | Test width 375px | Rail scroll ngang, viewer fit viewport |

## Edge Cases

- Story vua het han trong luc viewer dang mo: API view/delete can tra loi hop ly, reload feed an story.
- Story group chi co story da viewed: ring subdued, van mo xem lai duoc.
- User bi huy ket ban sau khi story da tao: feed cua user kia khong con hien story neu khong con accepted friendship.
- Cloudinary delete loi khi owner xoa story: API khong crash, DB story van bi an/xoa theo design.
- Duplicate view race condition: unique constraint giu khong duplicate.

## Regression Checklist

- [ ] Auth login/logout/refresh van hoat dong.
- [ ] Protected routes van chan user chua login.
- [ ] Profile va friends van hoat dong, accepted friendship van dung cho story feed.
- [ ] Posts/feed/comment/share Phase 3 van build va render.
- [ ] Upload avatar/cover/post media khong bi anh huong boi story upload.
- [ ] Response format van dung `success`, `message`, `data`, `error`, `meta`.
- [ ] API khong tra sensitive fields cua user trong stories.
- [ ] Backend tests Phase 1/2/3 van pass.
- [ ] Backend tests Phase 4 core pass.
- [ ] Frontend build pass.

## Nen automate o dau

| Test group | Nen automate o dau |
| --- | --- |
| Feed permission/expired/viewed | Unit test `story.service.test.js` |
| View idempotent | Unit test `story.service.test.js` |
| Delete owner-only | Unit test `story.service.test.js` |
| Route validation/auth | API integration neu co test DB |
| StoryBar/Viewer/CreateStory UI | E2E/manual trong dot nay neu chua co FE test setup |

## Cau hoi can xac nhan

- Viewers list cho owner co bat buoc automate ngay Phase 4 khong?
- Story public ngoai friend co can hien khong? Testcase hien mac dinh chi current user + accepted friends theo design de xuat.
