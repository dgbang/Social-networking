# Phase 1: Setup & Authentication Design

## Cap nhat quyet dinh

- Theo yeu cau moi nhat, Phase 1 tam thoi bo email verification, session/browser verification va resend verification.
- `POST /api/auth/register` tao user voi `isVerified=true`, khong tao verification token va khong gui email verify.
- `POST /api/auth/login` khong chan user vi email chua verify va khong yeu cau verify session/browser moi.
- Mail service trong Phase 1 chi can phuc vu forgot/reset password.

## Tong quan thiet ke

Phase 1 thiet lap nen tang full-stack va auth end-to-end:

- Frontend: React 18 + Vite, React Router, Redux Toolkit, Axios.
- Backend: Node.js + Express.js.
- Database: PostgreSQL + Sequelize ORM + Sequelize CLI migrations.
- Auth: JWT access token, refresh token, bcrypt.
- Security: Helmet, CORS whitelist, rate limit cho auth route, input validation.
- Container: Docker Compose cho PostgreSQL, server va client.

Backend la source of truth cho auth. Frontend chi luu state dang nhap va goi API qua Axios instance.

## Nguon requirement

- `plans/phase-01/req.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`

## Kien truc va module lien quan

### Cau truc thu muc muc tieu

Theo `PROJECT_PLAN.md`, Phase 1 nen tao it nhat cac khu vuc sau:

```text
client/
  src/
    api/
    components/
      Auth/
      Common/
    pages/
    routes/
    store/
    utils/
    App.jsx
    main.jsx
server/
  src/
    app.js
    server.js
    config/
    controllers/
    middlewares/
    migrations/
    models/
    routes/
    services/
    tests/
    utils/
nginx/
  default.conf
```

### Backend modules

- `app.js`: tao Express app, gan middleware, route prefix `/api`, global error handler.
- `server.js`: start HTTP server va load config.
- `config/`: cau hinh env, database, Sequelize.
- `routes/auth.routes`: dinh nghia auth endpoints.
- `controllers/auth.controller`: nhan request/response.
- `services/auth.service`: xu ly register/login/refresh/logout/verify/reset.
- `services/session.service`: xu ly web auth session, refresh token hash va yeu cau xac minh session/browser moi.
- `middlewares/validate`: validate request.
- `middlewares/auth`: verify Bearer token.
- `middlewares/error`: global error handler.
- `utils/jwt`: tao/verify access token va refresh token.
- `utils/password`: hash/compare password bang bcrypt.
- `utils/response`: response helper format chung.
- `services/mail`: mail service gui verify/reset/session verification bang Resend; dev co the fallback Ethereal neu chua co Resend key.

### Frontend modules

- `api/axios`: Axios instance, base URL, interceptor gan token.
- `store/authSlice`: auth state, token/current user/loading/error.
- `routes/ProtectedRoute`: chan user chua login.
- `pages/Login`, `pages/Register`, `pages/VerifyEmail`, `pages/ForgotPassword`, `pages/ResetPassword`.
- `components/Auth`: form UI auth.
- `components/Common`: toast/navbar/user menu co ban.

## Database / Schema

### Users

Dung schema `Users` trong `PROJECT_PLAN.md`.

Phase 1 can tap trung cac cot:

| Column | Muc dich Phase 1 |
| --- | --- |
| id | dinh danh user |
| username | dang ky, unique, search/index ve sau |
| email | dang ky/login/verify/reset, unique |
| password | bcrypt hash |
| fullName | thong tin bat buoc khi dang ky |
| isVerified | trang thai verify email |
| verificationToken | token verify email |
| resetPasswordToken | token reset password |
| resetPasswordExpires | thoi diem het han reset token |
| refreshTokenHash | revoke/refresh/logout |
| createdAt, updatedAt | audit co ban |

Nhung cot `avatar`, `coverPhoto`, `bio`, `isOnline`, `lastSeen`, `fcmToken` co trong schema chinh thuc nhung chua phai luong chinh cua Phase 1.

### AuthSessions

Du an hien tai uu tien Web va chua co y dinh phat trien mobile/smartphone app. Phase 1 chot tao bang `AuthSessions` de quan ly web browser sessions, refresh token hash va xac minh lan dau tren browser/session moi. Khong tao bang `UserDevices` rieng trong Phase 1.

Schema toi thieu:

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| userId | UUID | FK Users |
| refreshTokenHash | STRING | hash refresh token hien tai |
| sessionId | STRING | dinh danh web session/browser |
| browserName | STRING | user agent/browser rut gon, nullable |
| ipAddress | STRING | nullable |
| isVerified | BOOLEAN | default false cho session/browser moi |
| verificationToken | STRING | nullable |
| verificationExpires | DATE | nullable |
| revokedAt | DATE | nullable |
| lastUsedAt | DATE | nullable |
| createdAt, updatedAt | DATE | audit |

Khong dung moi `Users.refreshTokenHash` cho MVP vi se kho revoke tung browser/session va kho xu ly dang nhap nhieu browser tren Web.

### Migration

- Dung UUID primary key.
- Tao unique index cho `email`.
- Tao unique index cho `username`.
- Khong dung `sequelize.sync({ alter: true })` cho production.
- Migration can chay duoc tu DB rong va rollback co ban theo Definition of Done.

## API Contract

Chi tiet payload/response cu the chua duoc dinh nghia day du trong `docs/`. Phan duoi la thiet ke de xuat dua tren validation da duoc neu trong `WEEKLY_PLAN.md`.

### Common response format

Chot response format chung theo huong de mo rong:

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-06-14T00:00:00.000Z"
  }
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
  "meta": {
    "requestId": "req_123",
    "timestamp": "2026-06-14T00:00:00.000Z"
  }
}
```

Quy uoc:

- `success`: boolean bat buoc.
- `message`: text ngan de hien thi/log.
- `data`: payload thanh cong, `null` khi loi.
- `error`: chi co khi loi, gom `code` va `details`.
- `meta`: thong tin phu de mo rong, vi du `requestId`, `timestamp`, pagination.

### GET `/api/health`

Muc dich: kiem tra server song.

Response de xuat:

```json
{
  "success": true,
  "message": "OK",
  "data": {
    "status": "ok"
  }
}
```

### POST `/api/auth/register`

Request body theo `WEEKLY_PLAN.md`:

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "fullName": "Full Name"
}
```

Xu ly:

- Validate email, username, password, fullName.
- Check email/username unique.
- Hash password bang bcrypt.
- Tao verification token.
- Luu user vao DB.
- Gui email verify bang Resend thong qua mail service.

### POST `/api/auth/login`

Request body de xuat:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

Xu ly:

- Tim user theo email.
- So sanh password bang bcrypt.
- Neu email chua verify: chan login, tra response loi co code de frontend hien thi va cho phep gui lai email xac minh.
- Neu web session/browser moi chua verified: gui email xac minh session bang Resend, chan login cho den khi session duoc verify.
- Tao access token 15 phut.
- Tao refresh token 7 ngay.
- Set refresh token vao HTTP-only cookie.
- Luu refresh token hash trong DB theo `AuthSessions` de revoke.

### POST `/api/auth/refresh-token`

Xu ly:

- Nhan refresh token tu HTTP-only cookie.
- Verify token va doi chieu voi token da luu/hash.
- Cap access token moi.
- Tu choi neu refresh token bi revoke/khong hop le.

### POST `/api/auth/logout`

Xu ly:

- Revoke refresh token.
- Xoa/null refresh token hash trong `AuthSessions` tuong ung.
- Clear HTTP-only cookie.

### GET `/api/auth/verify/:token`

Xu ly:

- Tim user theo `verificationToken`.
- Set `isVerified = true`.
- Xoa/null `verificationToken`.

### POST `/api/auth/resend-verification`

Request body de xuat:

```json
{
  "email": "user@example.com"
}
```

Xu ly:

- Tim user theo email.
- Neu user da verify, tra response thanh cong an toan hoac message phu hop.
- Neu user chua verify, tao verification token moi.
- Gui email verify bang Resend.
- Rate limit endpoint nay de tranh spam.

### GET `/api/auth/verify-session/:token`

Xu ly de xuat:

- Tim auth session theo `verificationToken`.
- Kiem tra token chua het han.
- Set auth session `isVerified = true`.
- Sau khi verify, user co the login lai tren browser/session do de nhan access token va refresh cookie.

### POST `/api/auth/forgot-password`

Request body de xuat:

```json
{
  "email": "user@example.com"
}
```

Xu ly:

- Tao `resetPasswordToken`.
- Tao `resetPasswordExpires` het han sau 1 gio.
- Gui email reset password bang Resend.

### POST `/api/auth/reset-password/:token`

Request body de xuat:

```json
{
  "password": "new-password"
}
```

Xu ly:

- Kiem tra token ton tai va chua het han.
- Hash password moi.
- Xoa/null reset token va reset expires.
- De xuat: revoke refresh token cu sau khi reset password.

## Socket / Realtime neu co

Phase 1 khong co yeu cau Socket.IO feature. Socket.IO connection co JWT se dung cho cac phase sau.

## UI / UX Flow neu co

### Register flow

1. User vao trang register.
2. Nhap email, username, password, fullName.
3. Client validate form co ban.
4. Goi `POST /api/auth/register`.
5. Hien thi toast thanh cong/loi.
6. Dieu huong toi trang verify email hoac thong bao can verify.

### Login flow

1. User vao trang login.
2. Nhap email/password.
3. Client validate form co ban.
4. Goi `POST /api/auth/login`.
5. Neu email chua verify, hien thong bao bi chan va hien hanh dong gui lai email xac minh.
6. Neu la web session/browser moi, hien thong bao can xac minh qua email.
7. Neu login thanh cong, luu access token trong localStorage va sync vao Redux.
8. Axios interceptor dung access token trong Redux/localStorage cho request sau.
9. Refresh token nam trong HTTP-only cookie, frontend khong doc truc tiep.
10. Redirect sau login.

### Verify email flow

1. User mo link verify email.
2. Frontend doc `token` tren URL.
3. Goi `GET /api/auth/verify/:token`.
4. Hien thi ket qua verify.

### Resend verification flow

1. User bi chan login vi email chua verify.
2. Frontend hien nut gui lai email xac minh.
3. Frontend goi `POST /api/auth/resend-verification`.
4. Backend gui email verify bang Resend.
5. Frontend hien toast/thong bao da gui.

### Session verification flow

1. User login lan dau tren web session/browser moi.
2. Backend tao auth session verification token va gui email bang Resend.
3. Backend tra loi yeu cau xac minh session, khong cap access token.
4. User mo link verify session trong email.
5. Backend danh dau auth session da verify.
6. User login lai tren browser/session do de nhan access token va refresh cookie.

### Forgot/reset password flow

1. User yeu cau forgot password bang email.
2. Backend gui email reset.
3. User mo link reset password.
4. Frontend gui password moi toi `POST /api/auth/reset-password/:token`.
5. Hien thi toast ket qua va dieu huong ve login.

### Protected route flow

1. Neu chua co auth state/token hop le, redirect ve login.
2. Neu co token, cho vao route protected.
3. Khi token het han, Axios interceptor goi refresh token neu da implement.

## Validation va Error Handling

### Backend validation

- Register: validate email, username, password, fullName.
- Login: validate email/password.
- Resend verification: validate email.
- Forgot password: validate email.
- Reset password: validate token param va password moi.
- Verify email: validate token param.
- Verify session: validate token param.
- Refresh/logout: validate refresh token trong HTTP-only cookie.

### Error handling

- Dung global error handler.
- Loi validation/auth can co message ro.
- Response nen theo format chung.
- Khong expose stack trace trong production.

## Security / Permission

- Password hash bang bcrypt, saltRounds 12.
- Access token song ngan, khoang 15 phut.
- Refresh token song khoang 7 ngay.
- Refresh token phai revoke duoc khi logout.
- Refresh token duoc set trong HTTP-only cookie voi `Secure`, `SameSite` phu hop moi truong, va hash luu DB theo `AuthSessions`.
- Access token luu trong localStorage va sync vao Redux khi app khoi dong.
- Email chua verify bi chan login.
- Web session/browser moi bi chan login cho den khi verify qua email.
- Resend verification endpoint can rate limit.
- Auth route can rate limit rieng.
- Dung Helmet.
- CORS whitelist domain frontend.
- Khong commit `.env`.
- Dung Sequelize query binding, tranh raw query tu input.
- Auth middleware verify Bearer token cho route protected.
- HTTPS bat buoc tren production, nhung deploy production thuoc phase sau.

## Logging / Monitoring neu can

- Dung `morgan` cho HTTP request log trong backend foundation.
- Health endpoint `GET /api/health` dung de kiem tra server song.
- Chua co yeu cau monitoring rieng trong Phase 1.

## Thu tu implement de xuat

Day la thiet ke de xuat dua tren `docs/WEEKLY_PLAN.md`:

1. Khoi tao repository, `.gitignore`, `.env.example`, `README.md`, `client/`, `server/`, `nginx/`.
2. Tao React Vite app va Node.js server.
3. Setup Express app, middleware, response helper, error handler, route prefix `/api`, health endpoint.
4. Tao Dockerfile client/server va `docker-compose.yml` voi PostgreSQL healthcheck.
5. Setup Sequelize CLI, DB config, migration/model `User`.
6. Tao auth folders/routes/controllers/services/middlewares/utils.
7. Implement register va mail service foundation.
8. Implement mail service dung Resend, dev fallback Ethereal neu chua co key.
9. Implement login, access token, HTTP-only refresh cookie, refresh token hash theo `AuthSessions`.
10. Implement refresh token va logout.
11. Implement auth middleware va route protected mau.
12. Implement verify email, resend verification, forgot password, reset password.
13. Implement session verification cho lan dau login tren web session/browser moi.
14. Setup frontend auth: Router, Redux Toolkit, Axios instance, interceptor, ProtectedRoute, auth slice.
15. Tao auth pages va client-side validation.
16. Hoan thien auth state localStorage + Redux, redirect, toast, navbar user menu.
17. Test Docker, migration tu DB rong, auth flow, protected route.
18. Cap nhat README va `.env.example`.

## Anh huong testcase

Testcase Phase 1 nen bao gom:

- Health endpoint.
- Migration tu DB rong.
- Register success.
- Register validation fail.
- Register duplicate email/username.
- Login success.
- Login wrong password.
- Login email chua verify bi chan.
- Resend verification email.
- Session verification cho web session/browser moi.
- Refresh token success/fail.
- Logout revoke refresh token.
- Verify email success/fail.
- Forgot password success.
- Reset password success/fail/expired token.
- Protected route voi token hop le/khong hop le/het han.
- Frontend register/login/logout/protected route flow.
- Docker compose up tu moi truong rong.

## Quyet dinh da chot

- Response format chung: `success`, `message`, `data`, `error`, `meta`.
- Login khi email chua verify: bi chan.
- Dang nhap lan dau tren web session/browser moi: bi chan va phai xac minh qua email.
- Email provider: Resend qua mail service; development co the fallback Ethereal neu chua co Resend key.
- Refresh token: set trong HTTP-only cookie; hash luu DB theo `AuthSessions` de revoke.
- Frontend access token: luu trong localStorage va sync vao Redux khi app khoi dong.
- Phase 1 tao bang `AuthSessions` cho Web; khong tao `UserDevices` rieng vi hien tai chua phat trien mobile/smartphone app.
