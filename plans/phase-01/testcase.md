# Phase 1: Setup & Authentication Testcases

## Nguon requirement va design

- `plans/phase-01/req.md`
- `plans/phase-01/design.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`

## Pham vi test

Phase 1 testcase tap trung vao authentication behavior co the test qua API/UI:

- Health endpoint.
- Register.
- Login.
- Refresh token.
- Logout.
- Verify email.
- Forgot/reset password.
- Protected route mau.
- Frontend auth flow: register, login, logout, protected route.

## Khong tao testcase chi tiet cho setup

Khong tao testcase chi tiet cho cac viec setup thuan tuy:

- Khoi tao Git repository.
- Tao `.gitignore`, `.env.example`, `README.md`.
- Tao thu muc `client/`, `server/`, `nginx/`.
- Cai dependencies nen tang.
- Tao Dockerfile, `docker-compose.yml`.
- Cau hinh Sequelize CLI.
- Tao folder controllers/routes/services/middlewares.
- Tao helper/middleware khung neu chua co behavior test duoc.

Nhung muc nay chi can verification checklist ben duoi.

## Setup Verification Checklist neu can

- [ ] Client React Vite start duoc rieng le.
- [ ] Server Node.js/Express start duoc rieng le.
- [ ] `docker compose up` chay duoc PostgreSQL, server va client.
- [ ] PostgreSQL healthcheck pass.
- [ ] Server connect duoc PostgreSQL.
- [ ] Migration tao bang `Users` chay duoc tu DB rong.
- [ ] Rollback migration co ban chay duoc neu da cau hinh.
- [ ] `GET /api/health` tra ve OK.
- [ ] `.env.example` co bien moi truong can thiet va khong co secret that.
- [ ] README co huong dan chay local co ban.

## Gia dinh va du lieu test

- Base API URL: `http://localhost:8080/api` neu server dung port mac dinh.
- Frontend URL: `http://localhost:3000` hoac port Vite duoc cau hinh.
- Test email hop le: `phase1.user@example.com`.
- Test username hop le: `phase1user`.
- Test password hop le: `Password123!`.
- Password sai: `WrongPassword123!`.
- Email duplicate: dung lai `phase1.user@example.com`.
- Username duplicate: dung lai `phase1user`.
- User chua verify: user moi dang ky nhung chua goi verify email.
- User da verify: user co `isVerified = true`.
- Web session/browser moi: browser chua co auth session verified.
- Reset token het han: token co `resetPasswordExpires` nho hon thoi diem hien tai.

Quyet dinh da chot:

- Login khi email chua verify bi chan.
- Dang nhap lan dau tren web session/browser moi bi chan va yeu cau xac minh qua email.
- Refresh token duoc set trong HTTP-only cookie va hash luu DB theo `AuthSessions`.
- Response format chung gom `success`, `message`, `data`, `error`, `meta`.
- Email verify/reset/session verification dung Resend; development co the fallback Ethereal neu chua co key.
- Access token luu trong localStorage va sync vao Redux khi app khoi dong.

## Manual Testcases

| ID | Feature | Scenario | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- |
| P01-AUTH-M001 | Register UI | Dang ky tai khoan hop le tu UI | Mo trang register; nhap email, username, password, fullName hop le; submit | Hien thi toast/thong bao thanh cong; user duoc tao; UI dieu huong toi trang/thong bao verify email | High |
| P01-AUTH-M002 | Register UI | Register form validate input thieu | Mo trang register; bo trong email/password/fullName; submit | UI hien validation message; khong goi tao user thanh cong | High |
| P01-AUTH-M003 | Login UI | Dang nhap thanh cong voi user hop le | Mo trang login; nhap email/password hop le; submit | Login thanh cong; auth state duoc luu; redirect sau login | High |
| P01-AUTH-M004 | Login UI | Dang nhap that bai voi password sai | Mo trang login; nhap email hop le va password sai; submit | Hien toast/thong bao loi; user van o trang login; khong vao protected route | High |
| P01-AUTH-M005 | Logout UI | Dang xuat tu navbar/user menu | Dang nhap; bam logout | Auth state bi xoa; refresh token bi revoke/clear; redirect ve login hoac public page | High |
| P01-AUTH-M006 | Protected Route | User chua login truy cap route protected | Xoa auth state/token; mo route protected mau | Bi redirect ve login | High |
| P01-AUTH-M007 | Verify Email UI | Mo link verify email hop le | Dang ky user; lay token verify; mo trang verify voi token | Hien ket qua verify thanh cong; user duoc danh dau verified | Medium |
| P01-AUTH-M008 | Forgot Password UI | Gui yeu cau quen mat khau | Mo forgot password; nhap email hop le; submit | Hien thong bao da gui email reset hoac thong bao thanh cong phu hop | Medium |
| P01-AUTH-M009 | Reset Password UI | Dat lai mat khau bang token hop le | Mo reset password voi token hop le; nhap password moi; submit | Reset thanh cong; co the dang nhap bang password moi | High |
| P01-AUTH-M010 | Login UI | Email chua verify bi chan login | Dang ky user moi nhung chua verify; login bang user do | Login bi chan; UI hien thong bao can verify email va hanh dong gui lai email xac minh | High |
| P01-AUTH-M011 | Session Verification UI | Dang nhap lan dau tren web session/browser moi | Login bang user da verify tren browser moi | Login bi chan tam thoi; UI hien thong bao can xac minh session/browser qua email | High |

## API Testcases

| ID | Endpoint | Method | Scenario | Payload / Params | Expected Result |
| --- | --- | --- | --- | --- | --- |
| P01-HEALTH-001 | `/api/health` | GET | Health endpoint OK | None | Response thanh cong; message/status OK |
| P01-AUTH-001 | `/api/auth/register` | POST | Register thanh cong | `{ email, username, password, fullName }` hop le | Tao user moi; password duoc hash; `isVerified=false`; co verification token; response thanh cong |
| P01-AUTH-002 | `/api/auth/register` | POST | Register thieu email | `{ username, password, fullName }` | Response validation error; khong tao user |
| P01-AUTH-003 | `/api/auth/register` | POST | Register email sai format | `{ email: "bad-email", username, password, fullName }` | Response validation error; khong tao user |
| P01-AUTH-004 | `/api/auth/register` | POST | Register duplicate email | Dung email da ton tai, username moi | Response conflict/validation error; khong tao user moi |
| P01-AUTH-005 | `/api/auth/register` | POST | Register duplicate username | Dung username da ton tai, email moi | Response conflict/validation error; khong tao user moi |
| P01-AUTH-006 | `/api/auth/login` | POST | Login thanh cong voi user hop le | `{ email, password }` cua user duoc phep login | Response thanh cong; nhan access token; refresh token duoc set trong HTTP-only cookie va hash luu DB |
| P01-AUTH-007 | `/api/auth/login` | POST | Login password sai | `{ email, password: wrongPassword }` | Response auth error; khong tra access token |
| P01-AUTH-008 | `/api/auth/login` | POST | Login email khong ton tai | `{ email: unknownEmail, password }` | Response auth error; khong tra access token |
| P01-AUTH-009 | `/api/auth/login` | POST | Login khi email chua verify | `{ email, password }` cua user chua verify | Response error; khong cap access token; error code de frontend hien thi can verify email |
| P01-AUTH-010 | `/api/auth/resend-verification` | POST | Gui lai email xac minh | `{ email }` cua user chua verify | Tao token verify moi neu can; gui email bang Resend; response thanh cong |
| P01-AUTH-011 | `/api/auth/resend-verification` | POST | Gui lai email cho user da verify | `{ email }` cua user da verify | Response an toan/phu hop; khong tao verification bat buoc moi |
| P01-AUTH-012 | `/api/auth/login` | POST | Login lan dau tren web session/browser moi | `{ email, password }` cua user da verify tren browser moi | Response yeu cau verify session; khong cap access token; gui email verify session bang Resend |
| P01-AUTH-013 | `/api/auth/verify-session/:token` | GET | Verify session thanh cong | `token` session verification hop le | Auth session duoc danh dau verified; user co the login lai tren browser do |
| P01-AUTH-014 | `/api/auth/verify-session/:token` | GET | Verify session token sai/het han | `token` sai/het han | Response error; auth session khong duoc verify |
| P01-AUTH-015 | `/api/auth/refresh-token` | POST | Refresh token thanh cong | Refresh token hop le trong HTTP-only cookie | Response thanh cong; cap access token moi |
| P01-AUTH-016 | `/api/auth/refresh-token` | POST | Refresh token khong hop le | Refresh token sai/het han/khong ton tai trong cookie | Response auth error; khong cap access token moi |
| P01-AUTH-017 | `/api/auth/logout` | POST | Logout thanh cong | Request co refresh cookie hop le | Refresh token hash bi revoke/clear; HTTP-only cookie bi clear; response thanh cong |
| P01-AUTH-018 | `/api/auth/refresh-token` | POST | Refresh sau logout | Dung refresh cookie da logout | Response auth error; khong cap access token moi |
| P01-AUTH-019 | `/api/auth/verify/:token` | GET | Verify email thanh cong | `token` verify hop le | User `isVerified=true`; `verificationToken` bi xoa/null; response thanh cong |
| P01-AUTH-020 | `/api/auth/verify/:token` | GET | Verify email token sai | `token` khong ton tai | Response error; khong thay doi user |
| P01-AUTH-021 | `/api/auth/forgot-password` | POST | Forgot password voi email hop le | `{ email }` ton tai | Tao reset token; set `resetPasswordExpires`; gui email reset bang Resend |
| P01-AUTH-022 | `/api/auth/forgot-password` | POST | Forgot password voi email sai format | `{ email: "bad-email" }` | Response validation error |
| P01-AUTH-023 | `/api/auth/reset-password/:token` | POST | Reset password thanh cong | `token` hop le, body `{ password: newPassword }` | Password duoc hash moi; reset token/expires bi xoa/null; co the login bang password moi |
| P01-AUTH-024 | `/api/auth/reset-password/:token` | POST | Reset password voi token het han | `token` da het han, body `{ password }` | Response error; password khong doi |
| P01-AUTH-025 | Protected route mau | GET | Truy cap protected route voi access token hop le | Header `Authorization: Bearer <accessToken>` | Response thanh cong; request co current user |
| P01-AUTH-026 | Protected route mau | GET | Truy cap protected route khong co token | Khong co Authorization header | Response unauthorized |
| P01-AUTH-027 | Protected route mau | GET | Truy cap protected route voi token sai/het han | Header Bearer token sai/het han | Response unauthorized |

## UI Testcases

| ID | Screen | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P01-UI-001 | Register | Render register page | Mo trang register | Form co email, username, password, fullName va nut submit |
| P01-UI-002 | Register | Client-side validation | Submit form rong hoac email sai format | Hien validation message, khong tao user thanh cong |
| P01-UI-003 | Login | Render login page | Mo trang login | Form co email, password va nut submit |
| P01-UI-004 | Login | Login success state | Login bang user hop le | Auth state cap nhat; redirect sau login; navbar hien user menu co ban |
| P01-UI-005 | Login | Login error state | Login password sai | Hien toast/thong bao loi; khong redirect vao protected route |
| P01-UI-006 | Verify Email | Verify token success | Mo URL verify voi token hop le | Hien trang/thong bao verify thanh cong |
| P01-UI-007 | Forgot Password | Submit email | Nhap email hop le va submit | Hien thong bao thanh cong phu hop |
| P01-UI-008 | Reset Password | Submit password moi | Mo reset URL voi token hop le; nhap password moi | Hien thong bao reset thanh cong; dieu huong ve login neu co |
| P01-UI-009 | ProtectedRoute | User chua login | Mo route protected khi chua co auth state | Redirect ve login |
| P01-UI-010 | Logout | Logout from navbar | Dang nhap; bam logout | Auth state bi clear; user menu an; redirect ve login/public page |
| P01-UI-011 | Login | Email chua verify | Login bang user chua verify | Hien thong bao can verify email va nut gui lai email |
| P01-UI-012 | Login | Browser moi | Login tren browser/session moi | Hien thong bao can xac minh session/browser qua email |

## Edge Cases

- Register voi email da ton tai nhung username moi.
- Register voi username da ton tai nhung email moi.
- Register voi password qua ngan/khong dat rule validation neu co rule.
- Login voi email hop le nhung password sai.
- Login user chua verify bi chan.
- Resend verification bi spam nhieu lan: can rate limit.
- Login tren web session/browser moi bi chan cho den khi verify session.
- Refresh token bi revoke sau logout.
- Refresh token het han.
- Reset password token sai.
- Reset password token het han.
- Goi protected route khong co token.
- Goi protected route voi access token het han.
- Goi API voi body rong.
- Goi API voi JSON sai format neu middleware co xu ly.

## Regression Checklist

- [ ] `GET /api/health` van tra OK sau khi them auth modules.
- [ ] Migration `Users` van chay duoc tu DB rong.
- [ ] Register khong lam loi login flow.
- [ ] Verify email khong lam mat thong tin user.
- [ ] Reset password xong password cu khong dang nhap duoc.
- [ ] Logout xong refresh token cu khong dung lai duoc.
- [ ] Refresh token khong doc duoc bang JavaScript vi nam trong HTTP-only cookie.
- [ ] Access token duoc luu localStorage sau login va bi xoa sau logout.
- [ ] Axios interceptor khong lap vo han khi refresh token fail.
- [ ] ProtectedRoute khong cho user chua login vao trang protected.
- [ ] `.env.example` khong chua secret that.
- [ ] Docker compose van chay duoc sau khi them auth dependencies.

## Cau hoi can xac nhan

- Protected route mau ten endpoint nao de dung trong API testcase?
