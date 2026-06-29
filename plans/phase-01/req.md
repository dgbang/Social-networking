# Phase 1: Setup & Authentication Requirements

## Cap nhat quyet dinh

- Theo yeu cau moi nhat, Phase 1 tam thoi bo tinh nang xac minh email, verify session/browser moi va resend verification.
- User dang ky moi duoc tao voi `isVerified=true` va co the dang nhap ngay.
- Resend chi con dung cho forgot/reset password neu can gui email reset.

## Muc tieu

Phase 1 xay dung nen tang ban dau cho du an va hoan thien authentication end-to-end trong 2 tuan dau.

Ket qua chinh:

- Repository, cau truc thu muc, client, server, nginx duoc khoi tao.
- Backend Express co middleware, error handler, response helper va health endpoint.
- Docker development chay duoc PostgreSQL, server va client.
- Sequelize ket noi PostgreSQL, co migration/model `User`.
- Auth backend co register, login, logout, refresh token, verify email, forgot/reset password.
- Frontend co auth setup, auth pages, protected route va auth state co ban.
- Docker van chay duoc tu moi truong rong.

## Nguon tai lieu

- `docs/PROJECT_PLAN.md`
  - Muc 2: Auth la Must-have.
  - Muc 3: Tech stack.
  - Muc 5: Cau truc thu muc.
  - Muc 6: Database schema `Users`.
  - Muc 7: Auth API endpoints.
  - Muc 9: Bao mat.
  - Muc 10: Docker Compose mau.
  - Muc 11: Phase 1 output chinh.
  - Muc 12: Definition of Done.
- `docs/WEEKLY_PLAN.md`
  - Phase 1: Setup & Authentication, tuan 1-2.
  - Tuan 1: Khoi tao du an va nen tang backend/frontend.
  - Tuan 2: Authentication day du.

## Pham vi trong phase

### Tuan 1: Khoi tao du an va nen tang backend/frontend

- Khoi tao Git repository.
- Tao `.gitignore`, `.env.example`, `README.md`.
- Tao thu muc `client/`, `server/`, `nginx/`.
- Tao React app voi Vite.
- Khoi tao Node.js server.
- Cai dependencies nen tang.
- Tao `app.js`, `server.js`.
- Setup middleware: `cors`, `helmet`, `morgan`, `express.json`.
- Tao global error handler.
- Tao response helper format chung.
- Tao route prefix `/api`.
- Tao health endpoint `GET /api/health`.
- Viet Dockerfile cho server.
- Viet Dockerfile cho client.
- Viet `docker-compose.yml` gom PostgreSQL, server, client.
- Them healthcheck PostgreSQL.
- Test `docker compose up`.
- Cai Sequelize CLI.
- Cau hinh ket noi PostgreSQL.
- Tao migration va model `User`.
- Them index cho `email`, `username`.
- Chay migration thanh cong.
- Tao folder controllers/routes/services/middlewares.
- Tao auth routes.
- Tao validation middleware.
- Tao JWT helper.
- Tao password hash helper.
- Implement `POST /api/auth/register`.
- Validate email, username, password, fullName.
- Hash password bang bcrypt.
- Tao verification token.
- Luu user vao DB.
- Chuan bi Nodemailer service.
- Review tuan 1: test Docker, migration tu DB rong, health/register neu kip, cap nhat README, don `.env.example`.

### Tuan 2: Authentication day du

- Implement `POST /api/auth/login`.
- So sanh password bang bcrypt.
- Chan login neu email chua verify.
- Dang nhap lan dau tren web session/browser moi phai xac minh qua email.
- Email verify/reset/session verification duoc gui bang Resend thong qua mail service.
- Tao access token khoang 15 phut.
- Tao refresh token khoang 7 ngay.
- Luu refresh token trong HTTP-only cookie va luu refresh token hash trong DB theo `AuthSessions` de revoke.
- Implement `POST /api/auth/refresh-token`.
- Implement `POST /api/auth/logout`.
- Revoke refresh token.
- Tao auth middleware verify Bearer token.
- Test route protected mau.
- Implement `GET /api/auth/verify/:token`.
- Implement flow resend verification email khi user can gui lai email xac minh.
- Implement `POST /api/auth/forgot-password`.
- Implement `POST /api/auth/reset-password/:token`.
- Tao Nodemailer template co ban.
- Reset password token het han sau 1 gio.
- Setup React Router.
- Setup Redux Toolkit.
- Setup Axios instance.
- Axios interceptor gan token.
- ProtectedRoute.
- Auth slice.
- Tao trang login.
- Tao trang register.
- Tao trang verify email.
- Tao trang forgot password.
- Tao trang reset password.
- Form validation client-side.
- Luu auth state.
- Auto load current user.
- Redirect sau login/logout.
- Toast loi/thanh cong.
- Navbar co user menu co ban.
- Test register/login/logout/refresh.
- Test verify/reset password.
- Test protected route.
- Viet backend tests cho auth core.
- Cap nhat README.

## Khong nam trong phase

- OAuth2 Google la Stretch, khong bat buoc trong Phase 1.
- Profile, upload avatar/cover, friends thuoc Phase 2.
- Posts, feed, reactions, comments, share thuoc Phase 3.
- Stories thuoc Phase 4.
- Chat realtime thuoc Phase 5.
- Video call thuoc Phase 6.
- Notifications va FCM thuoc Phase 7.
- Production deploy day du thuoc Phase 8.

## Yeu cau chuc nang

### Repository va setup

- Du an co cau truc thu muc theo `PROJECT_PLAN.md`: `client/`, `server/`, `nginx/`.
- Client React 18 + Vite chay duoc rieng le.
- Server Node.js + Express chay duoc rieng le.
- README co huong dan chay local co ban.
- `.env.example` co cac bien moi truong can thiet, khong commit secret that.

### Backend foundation

- Server co route prefix `/api`.
- `GET /api/health` tra ve OK.
- Middleware nen tang gom `cors`, `helmet`, `morgan`, `express.json`.
- Co global error handler.
- Co response helper format chung.

### Docker va database

- Docker development chay duoc PostgreSQL, server va client.
- PostgreSQL co healthcheck.
- Sequelize CLI duoc cau hinh ket noi PostgreSQL.
- Migration tu DB rong chay thanh cong.
- Co model/migration `User`.
- `email` va `username` co unique index.

### User schema cho Phase 1

Bang `Users` can co cac cot lien quan auth theo `PROJECT_PLAN.md`:

| Column | Type | Note |
| --- | --- | --- |
| id | UUID | PK |
| username | STRING | unique, indexed |
| email | STRING | unique, indexed |
| password | STRING | bcrypt hash |
| fullName | STRING | required |
| avatar | STRING | Cloudinary URL |
| coverPhoto | STRING | Cloudinary URL |
| bio | TEXT | nullable |
| isVerified | BOOLEAN | default false |
| verificationToken | STRING | nullable |
| resetPasswordToken | STRING | nullable |
| resetPasswordExpires | DATE | nullable |
| refreshTokenHash | STRING | nullable |
| isOnline | BOOLEAN | default false |
| lastSeen | DATE | nullable |
| fcmToken | STRING | nullable |

### Auth backend

- Register user qua `POST /api/auth/register`.
- Login qua `POST /api/auth/login`.
- Logout qua `POST /api/auth/logout`.
- Refresh access token qua `POST /api/auth/refresh-token`.
- Verify email qua `GET /api/auth/verify/:token`.
- Forgot password qua `POST /api/auth/forgot-password`.
- Reset password qua `POST /api/auth/reset-password/:token`.
- Password duoc hash bang bcrypt.
- Access token song ngan, khoang 15 phut.
- Refresh token song khoang 7 ngay.
- Refresh token duoc revoke khi logout.
- Refresh token duoc truyen bang HTTP-only cookie va hash duoc luu trong DB theo `AuthSessions`.
- Auth middleware verify Bearer token cho route protected mau.
- User chua verify email bi chan login.
- Dang nhap lan dau tren web session/browser moi bi chan cho den khi xac minh qua email.
- Co co che gui lai email xac minh bang Resend.

### Auth frontend

- Co React Router.
- Co Redux Toolkit.
- Co Axios instance.
- Axios interceptor gan token.
- Co ProtectedRoute.
- Co auth slice.
- Co UI cho login, register, verify email, forgot password, reset password.
- Co client-side form validation.
- Co auth state, auto load current user, redirect sau login/logout.
- Access token luu trong localStorage va sync vao Redux khi app khoi dong.
- Co toast loi/thanh cong.
- Navbar co user menu co ban.

## Yeu cau phi chuc nang

- Password dung bcrypt, saltRounds 12 theo `PROJECT_PLAN.md`.
- Response API dung format chung de mo rong: `success`, `message`, `data`, `error`, `meta`.
- Auth route can co rate limit rieng.
- Input body, params, query can duoc validate.
- CORS can whitelist domain frontend.
- Dung Helmet de tang bao mat HTTP headers.
- Dung Sequelize query binding, tranh raw query tu input.
- Khong commit `.env` hoac secret.
- Khong dung `sequelize.sync({ alter: true })` cho production.
- API loi validation/auth phai co error message ro.
- Docker phai chay duoc tu moi truong rong.

## Tieu chi hoan thanh

- Client va server chay duoc rieng le.
- Docker chay duoc PostgreSQL, server va client.
- `GET /api/health` tra ve OK.
- Migration tao bang `Users` chay duoc tu DB rong.
- Register API co validation va luu user thanh cong.
- Login thanh cong va nhan token hop le.
- Login bi chan neu email chua verify.
- Login lan dau tren web session/browser moi yeu cau xac minh qua email.
- Access token het han co the refresh.
- Logout lam refresh token mat hieu luc.
- Verify email va reset password chay duoc.
- Frontend dang ky/dang nhap duoc tu UI.
- Protected route hoat dong.
- Auth end-to-end chay duoc.
- Co it nhat backend tests cho auth core theo `WEEKLY_PLAN.md`.
- README va `.env.example` duoc cap nhat.

## Phu thuoc phase khac

- Phase 1 la nen tang cho tat ca phase sau.
- Phase 2 can auth middleware va current user flow de lam profile/friends.
- Cac phase realtime/chat/call/notification sau nay can JWT/auth state on dinh tu Phase 1.

## Ranh gioi va rui ro

- Resend can duoc cau hinh qua env; neu dev chua co API key thi co the fallback Ethereal de test email local.
- Du an hien tai uu tien Web, chua co y dinh lam mobile/smartphone app, nen Phase 1 chi can `AuthSessions` cho web browser sessions; khong tao `UserDevices` rieng.
- OAuth2 Google la Stretch, neu cham tien do thi khong dua vao Phase 1.
- Neu setup Docker/Sequelize cham, can uu tien Must-have: health, migration, register/login/refresh/logout, UI auth co ban.

## Quyet dinh da chot

- Response format chung dung cau truc de mo rong: `success`, `message`, `data`, `error`, `meta`.
- Login khi email chua verify: bi chan.
- Dang nhap lan dau tren web session/browser moi: bi chan va phai xac minh qua email.
- Email verify/reset/session verification: dung Resend thong qua mail service; dev co the fallback Ethereal neu chua co Resend key.
- Refresh token: truyen bang HTTP-only cookie, hash luu DB theo `AuthSessions` de revoke.
- Frontend access token: luu trong localStorage va sync vao Redux khi app khoi dong.
- Phase 1 tao bang `AuthSessions` cho Web; khong tao bang `UserDevices` rieng vi hien tai chua phat trien mobile/smartphone app.

