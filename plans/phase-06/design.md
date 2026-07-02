# Phase 6: Video Call Design

## Tong quan thiet ke

Phase 6 them video call 1-1 tren nen Phase 5 Socket.IO:

- Backend them call state memory-only va socket handlers cho call lifecycle/signaling.
- WebRTC media stream chay truc tiep giua client; server chi relay signaling.
- Call log dung bang `Messages` san co voi `type = call`.
- Frontend tao call provider/overlay global cho moi man hinh protected; Messenger chi giu nut start call trong private conversation.
- Neu chua co TURN server, demo uu tien cung may/cung LAN hoac moi truong browser ho tro peer connection truc tiep.

## Nguon requirement

- `plans/phase-06/req.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`
- `plans/phase-05/req.md` va `plans/phase-05/design.md` cho socket/chat dependency.

## Kien truc va module lien quan

### Backend modules

- `server/src/socket/callState.js`: memory store cho active/pending calls.
- `server/src/socket/callHandlers.js`: socket handlers cho call lifecycle va signaling.
- `server/src/socket/index.js`: register call handlers trong connection.
- `server/src/services/call.service.js`: validate call, create/end/reject/log call.
- `server/src/services/chat.service.js`: dung `ensureMember` va `createMessage`/model khi log call.
- `server/src/tests/call.service.test.js`: test call state/service core.

### Frontend modules

- `client/src/hooks/useCallManager.js`: quan ly call socket state, getUserMedia, RTCPeerConnection.
- `client/src/components/call/IncomingCallModal.jsx`
- `client/src/components/call/OutgoingCallModal.jsx`
- `client/src/components/call/VideoCallScreen.jsx`
- `client/src/components/chat/ChatWindow.jsx`: nut call trong header private conversation.
- `client/src/context/CallContext.jsx`: ket noi socket call global sau login, dung `useCallManager`, render incoming/outgoing/video overlay.
- `client/src/pages/MessengerPage.jsx`: dung `useCall` de start call tu private chat.

## Database / Schema

- Khong can migration moi.
- Dung `Messages.type = call` da co trong Phase 5.
- Call log de xuat:

```json
{
  "conversationId": "uuid",
  "senderId": "caller-id",
  "type": "call",
  "content": "Call ended",
  "media": {
    "callId": "uuid-or-generated",
    "status": "ended|rejected|missed",
    "startedAt": "iso",
    "endedAt": "iso",
    "durationSeconds": 30
  }
}
```

## API Contract

- Khong them REST API trong Phase 6.
- Tat ca flow call di qua Socket.IO.

## Socket / Realtime neu co

### Client -> Server

- `call_user`

```json
{
  "receiverId": "uuid",
  "conversationId": "uuid"
}
```

- `answer_call` `{ "callId": "id" }`
- `reject_call` `{ "callId": "id" }`
- `end_call` `{ "callId": "id" }`
- `toggle_media` `{ "callId": "id", "audioEnabled": true, "videoEnabled": false }`
- `webrtc_offer` `{ "callId": "id", "offer": {} }`
- `webrtc_answer` `{ "callId": "id", "answer": {} }`
- `webrtc_ice_candidate` `{ "callId": "id", "candidate": {} }`

### Server -> Client

- `incoming_call` `{ call }`
- `call_answered` `{ call }`
- `call_rejected` `{ callId, reason }`
- `call_ended` `{ callId, reason, callLog }`
- `media_toggled` `{ callId, userId, audioEnabled, videoEnabled }`
- `webrtc_offer` `{ callId, fromUserId, offer }`
- `webrtc_answer` `{ callId, fromUserId, answer }`
- `webrtc_ice_candidate` `{ callId, fromUserId, candidate }`
- `call_error` `{ code, message }`

### Permission / routing

- Sender/receiver phai nam trong call.
- `conversationId` neu co phai la conversation caller la member.
- Relay signaling chi toi ben con lai bang `user:{id}` room.
- Receiver offline/busy bi reject truoc khi tao incoming call.

## UI / UX Flow neu co

### Messenger call button

- Chi hien trong private conversation co other member.
- Bieu tuong phone/video o header.

### IncomingCallModal

- Hien avatar/name caller.
- Nut answer/reject.
- Auto dismiss khi call ended/timeout.
- Render qua global `CallProvider` de receiver nhan call tren Dashboard/Profile/Friends/Messenger.

### OutgoingCallModal

- Hien "Dang goi..." va nut cancel.
- Neu offline/busy/reject thi hien loi ngan.

### VideoCallScreen

- Full viewport overlay dark.
- Remote video la primary surface.
- Local video nho fixed corner.
- Controls icon buttons: mic, camera, end.
- Timer tu luc call active.

## Validation va Error Handling

- `receiverId`, `conversationId` neu co phai UUID.
- `callId` required voi answer/reject/end/toggle/signaling.
- Offer/answer/candidate phai la object.
- Loi domain:
  - `CALL_RECEIVER_REQUIRED`
  - `CALL_RECEIVER_OFFLINE`
  - `CALL_BUSY`
  - `CALL_NOT_FOUND`
  - `CALL_FORBIDDEN`
  - `CALL_INVALID_STATE`
  - `CALL_PERMISSION_DENIED`

## Security / Permission

- Socket auth bat buoc.
- Khong accept signaling tu user khong thuoc call.
- Khong broadcast call event cho user ngoai caller/receiver.
- Khong luu SDP/ICE vao DB.

## Logging / Monitoring neu can

- Socket call error tra `call_error`.
- Non-test env co the log loi cleanup/signaling bat thuong.

## Thu tu implement de xuat

1. Tao docs/testcase Phase 6.
2. Tao backend call state/service/handlers.
3. Register call handlers vao socket index.
4. Them backend tests cho offline/busy/answer/reject/end/log.
5. Tao frontend call components va hook.
6. Gan `CallProvider` vao app protected shell va call button vao Messenger private chat.
7. Chay backend tests va frontend build.
8. Test thu cong 2 browser/2 users.

## Anh huong testcase

Testcase can cover:

- Receiver offline/busy.
- Answer/reject/end lifecycle.
- Unauthorized user khong duoc control/signaling call.
- Call log message type `call`.
- UI incoming/outgoing/call controls.
- Global incoming call tren moi protected route.

## Cau hoi can xac nhan

- Co dung native `RTCPeerConnection` neu khong cai duoc `simple-peer` khong? De xuat uu tien native de tranh them dependency neu network bi chan.
