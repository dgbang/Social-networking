# Social Networking Promax

Full-stack social media platform built with React, Node.js, PostgreSQL, Sequelize and Docker.

## Local setup

1. Copy env files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Optional Docker Compose overrides can be copied at the root:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
cd server && npm install
cd ../client && npm install
```

3. Run database with Docker or run full stack:

```bash
docker compose up --build
```

4. Run migrations manually when developing server locally:

```bash
cd server
npm run db:migrate
```

5. Start apps locally:

```bash
cd server && npm run dev
cd client && npm run dev
```

## Phase 1 scope

- Express foundation and `/api/health`.
- PostgreSQL + Sequelize migrations for `Users` and `AuthSessions`.
- Auth APIs: register, login, refresh, logout, forgot/reset password, protected `GET /api/auth/me`.
- React auth pages with localStorage access token synced into Redux.

Email uses Resend for forgot/reset password when `RESEND_API_KEY` is configured. Without a key, development reset links are logged to the server console.

## Phase 2 scope

- Profile APIs under `/api/users`: current profile, update profile, profile by id, search by username/fullName.
- Avatar and cover upload with Multer + Cloudinary. Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, and optional `CLOUDINARY_FOLDER`.
- Friends APIs under `/api/friends`: request, accept, reject, unfriend, friends list, pending requests, suggestions.
- React profile and friends pages at `/profile`, `/users/:id`, and `/friends`, plus navbar user search.

## Phase 5-6 realtime scope

- Phase 5 adds realtime chat with conversations, group/private chat, message history, send/reply/delete, read state, typing, online friends, and `/messenger`.
- Phase 6 adds 1-1 video call signaling over Socket.IO, incoming/outgoing call UI, native WebRTC peer connection, mute/camera controls, end/reject/timeout handling, and call log messages.

### WebRTC limitation

Video call currently uses browser WebRTC with a public STUN server and no dedicated TURN server. Calls should work for local/demo-friendly networks, but some NAT/firewall combinations may fail until a TURN server is configured.

## Google login setup

Google login is optional. To enable it locally:

1. Create an OAuth Client ID in Google Cloud Console.
2. Add this authorized redirect URI:

```text
http://localhost:8080/api/auth/google/callback
```

3. Fill these values in `server/.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8080/api/auth/google/callback
```
