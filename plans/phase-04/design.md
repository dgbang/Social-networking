# Phase 4: Stories Design

## Tong quan thiet ke

Phase 4 them Stories tren nen auth/profile/friends/feed da co:

- Backend tiep tuc dung route/controller/service/model rieng.
- Story media dung Cloudinary qua `upload.service.js`.
- Feed la source of truth ve permission, expire va viewed state.
- Story het han khong hien trong feed ke ca khi cron chua chay.
- UI StoryBar/Viewer/CreateStory theo cam giac Instagram/Facebook: avatar ring, horizontal story rail, modal dark full screen, progress bars, controls gon.

## Nguon requirement

- `plans/phase-04/req.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`
- Yeu cau truc tiep cua user ve UI Instagram/Facebook style.

## Kien truc va module lien quan

### Backend modules

- `server/src/models/story.js`: model `Story`.
- `server/src/models/storyView.js`: model `StoryView`.
- `server/src/migrations/*create-stories-story-views.js`: migration.
- `server/src/routes/story.routes.js`: routes `/api/stories`.
- `server/src/controllers/story.controller.js`: response layer.
- `server/src/services/story.service.js`: create/feed/view/delete/expire logic.
- `server/src/jobs/storyExpiry.job.js`: cron auto-expire.
- `server/src/app.js`: mount `/api/stories`.
- `server/src/server.js`: start cron job.
- `server/src/middlewares/upload.js`: dung `handleMediaUpload("media")` cho story upload.

### Frontend modules

- `client/src/api/storyApi.js`: API client.
- `client/src/components/stories/StoryBar.jsx`: rail story tren dashboard.
- `client/src/components/stories/CreateStoryModal.jsx`: tao story.
- `client/src/components/stories/StoryViewer.jsx`: full screen viewer.
- `client/src/pages/DashboardPage.jsx`: gan StoryBar len dau feed.
- `client/src/styles.css`: style story UI.

## Database / Schema

### Stories

Theo `PROJECT_PLAN.md`:

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| userId | UUID | FK Users |
| media | STRING | Cloudinary URL |
| mediaPublicId | STRING | Cloudinary public id |
| mediaType | ENUM | image, video |
| text | STRING | nullable |
| expiresAt | DATE | indexed |
| createdAt | DATE | audit |
| updatedAt | DATE | audit |

De xuat them `deletedAt` nullable de delete mem, giup feed an story va van co rollback/debug ngan. Neu muon bam schema toi thieu, co the hard delete khi owner xoa.

### StoryViews

Theo `PROJECT_PLAN.md`:

| Column | Type | Note |
| --- | --- | --- |
| storyId | UUID | FK Stories |
| userId | UUID | FK Users |
| viewedAt | DATE | default now |

De xuat them `id` UUID PK de dong bo pattern model Sequelize hien co, van giu unique `storyId + userId`.

Indexes:

- `Stories.userId`
- `Stories.expiresAt`
- `Stories.deletedAt`
- Unique `StoryViews(storyId, userId)`
- `StoryViews.userId`

Associations:

- `User.hasMany(Story, { as: "stories", foreignKey: "userId" })`
- `Story.belongsTo(User, { as: "author", foreignKey: "userId" })`
- `Story.hasMany(StoryView, { as: "views", foreignKey: "storyId" })`
- `StoryView.belongsTo(Story, { as: "story", foreignKey: "storyId" })`
- `StoryView.belongsTo(User, { as: "viewer", foreignKey: "userId" })`

## API Contract

Tat ca API auth bat buoc va dung response format chung.

### POST `/api/stories`

Content-Type: `multipart/form-data`

Fields:

- `media`: required file, image/video.
- `text`: optional string, max 160.

Response:

```json
{
  "data": {
    "story": {
      "id": "uuid",
      "media": "https://...",
      "mediaPublicId": "social/stories/...",
      "mediaType": "image",
      "text": "Hello",
      "expiresAt": "2026-06-23T00:00:00.000Z",
      "viewed": false,
      "viewsCount": 0,
      "author": {}
    }
  }
}
```

### GET `/api/stories/feed`

Query:

- `limit`: optional, default 30 users/groups, max 50.

Logic:

- Lay story `expiresAt > now` va `deletedAt IS NULL`.
- User trong scope: current user + accepted friends.
- Group theo user.
- Sort stories trong group theo `createdAt ASC` de viewer chay theo trinh tu tao.
- Sort groups theo story moi nhat `DESC`.

Response:

```json
{
  "data": {
    "groups": [
      {
        "user": {},
        "latestStoryAt": "2026-06-22T00:00:00.000Z",
        "unviewedCount": 1,
        "stories": []
      }
    ]
  }
}
```

### POST `/api/stories/:id/view`

Auth: bat buoc.

Logic:

- Kiem tra story con han va viewer co quyen xem.
- `findOrCreate` `StoryView`.
- Idempotent.

### DELETE `/api/stories/:id`

Auth: bat buoc.

Logic:

- Chi owner xoa.
- Set `deletedAt = now`.
- Cloudinary cleanup best-effort bang `mediaPublicId`.

## Socket / Realtime neu co

Phase 4 khong implement Socket.IO. Realtime notification cho stories chua nam trong scope.

## UI / UX Flow neu co

### StoryBar

- Dat tren dau `DashboardPage`, truoc CreatePost/feed.
- Card dau tien la create story, dung avatar current user va nut `+`.
- Cac story group hien avatar ring gradient neu co story chua xem; subdued ring neu da xem het.
- Horizontal scroll, card width on dinh, khong nested card phuc tap.

### CreateStoryModal

- Modal centered/fullscreen nho tren mobile.
- Media picker anh/video.
- Preview media ro, text overlay nam tren preview.
- Button post disabled khi dang upload hoac chua co media.
- Loi upload/API hien bang Notice/inline alert.

### StoryViewer

- Full screen dark modal.
- Progress bar tren top cho tung story trong group.
- Header co avatar, fullName/username, relative created time, close.
- Media full viewport, object-fit contain/cover hop ly.
- Click left/right hoac nut prev/next.
- Auto-advance theo thoi luong co ban.
- Pause khi hover/touch neu kip.
- Owner thay nut delete.

## Validation va Error Handling

- `POST /api/stories`: media required, `text` max 160.
- `:id`: UUID.
- `limit`: integer 1-50.
- Upload errors dung middleware hien co.
- Loi domain:
  - `STORY_MEDIA_REQUIRED`
  - `STORY_NOT_FOUND`
  - `STORY_FORBIDDEN`
  - `STORY_DELETE_FORBIDDEN`

## Security / Permission

- Tat ca route stories dung `requireAuth`.
- Feed chi include current user + accepted friends.
- View chi cho story current user/friend va con han.
- Delete chi owner.
- Include author dung public fields, khong expose email/password/token.

## Logging / Monitoring neu can

- Dung morgan/requestId hien co.
- Cron auto-expire log bang `console.error` khi cleanup loi, khong throw lam crash server.

## Thu tu implement de xuat

1. Tao docs va testcase Phase 4.
2. Tao model/migration `Story`, `StoryView`, associations.
3. Tao story service/controller/routes.
4. Mount route `/api/stories`.
5. Them auto-expire job.
6. Them backend unit tests cho permission/feed/view/delete.
7. Tao frontend `storyApi`.
8. Tao `StoryBar`, `CreateStoryModal`, `StoryViewer`.
9. Gan StoryBar vao `DashboardPage`.
10. Chay backend test va frontend build.

## Anh huong testcase

Testcase can cover:

- Create story thanh cong/khong media.
- Feed group theo user, chi story con han, current user + friends.
- Viewed state va idempotent view.
- Delete owner-only.
- Expired/deleted story khong hien.
- UI create/view/delete va responsive.

## Cau hoi can xac nhan

- Co chap nhan them `deletedAt` vao `Stories` de soft delete khong? Design nay de xuat soft delete cho an toan.
- Viewers list cho owner co can lam ngay khong? Design de o polish neu con thoi gian.
