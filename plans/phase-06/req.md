# Phase 6: Video Call Requirements

## Muc tieu

Phase 6 xay dung video call 1-1 co ban trong tuan 9:

- User dang nhap co the goi video 1-1 cho user khac qua Socket.IO.
- Receiver co the answer, reject; caller co the cancel/end call.
- Hai ben co signaling WebRTC de trao doi offer/answer/ICE candidate.
- User co the mute mic, bat/tat camera trong cuoc goi.
- Backend xu ly busy/offline/co ban va timeout cuoc goi sau 30 giay.
- Luu call log vao `Messages` type `call` neu co conversation phu hop.
- Frontend co incoming/outgoing call UI va video call screen.
- User dang dang nhap phai nhan incoming call o moi man hinh protected, khong chi trong Messenger.

## Nguon tai lieu

- `docs/PROJECT_PLAN.md`
  - Muc 2: Must-have Call.
  - Muc 3: Video Call dung WebRTC/simple-peer.
  - Muc 8: Socket.IO events Video Call.
  - Muc 11: Phase 6 output chinh.
  - Muc 13: WebRTC NAT/TURN risk.
- `docs/WEEKLY_PLAN.md`
  - Phase 6: Video Call (Tuan 9).
  - Ngay 1-7: signaling, call state/log, getUserMedia, incoming/outgoing UI, call screen, edge cases va test.
- Phase 5 chat/socket da hoan thanh la nen tang realtime.

## Pham vi trong phase

### Backend / Socket.IO

- Them socket events:
  - `call_user`
  - `answer_call`
  - `reject_call`
  - `end_call`
  - `toggle_media`
  - WebRTC signaling: `webrtc_offer`, `webrtc_answer`, `webrtc_ice_candidate`
- Server verify socket auth da co tu Phase 5.
- Check receiver online truoc khi goi.
- Check busy state memory-only de tranh mot user nhan nhieu call cung luc.
- Timeout cuoc goi sau 30 giay neu chua answer/reject/end.
- Broadcast events:
  - `incoming_call`
  - `call_answered`
  - `call_rejected`
  - `call_ended`
  - `media_toggled`
  - `call_error`
- Luu call log vao `Messages` type `call` khi co `conversationId` hop le va caller la member.

### Frontend

- Setup call socket helpers tren nen chat socket hien co.
- Xin quyen camera/microphone bang `getUserMedia`.
- Hien incoming call modal.
- Hien outgoing call state.
- Hien video call screen:
  - remote video lon;
  - local video nho;
  - nut mute mic;
  - nut toggle camera;
  - nut end call;
  - timer co ban.
- Tu Messenger co the goi user trong private conversation.
- Incoming call modal hien global tren moi man hinh protected khi socket nhan `incoming_call`.
- Xu ly receiver offline/busy/permission denied khong lam app crash.

## Khong nam trong phase

- Group call chua nam trong Phase 6.
- TURN server rieng la Stretch theo `PROJECT_PLAN.md`.
- Call recording, screen share, chat media/file va call reactions chua nam trong phase.
- Call notification khi offline thuoc Phase 7.
- Full call history page chua nam trong phase; Phase 6 chi luu call log co ban vao Messages.

## Yeu cau chuc nang

### Signaling

- `call_user` tao call session memory voi caller/receiver/conversationId.
- Receiver offline thi caller nhan `call_rejected` hoac `call_error` voi ly do offline.
- Receiver busy hoac caller busy thi caller nhan loi busy.
- Receiver nhan `incoming_call` khi hop le.
- `answer_call` chuyen trang thai call sang active va bao caller qua `call_answered`.
- `reject_call` ket thuc call pending va bao caller qua `call_rejected`.
- `end_call` ket thuc call pending/active va bao ben con lai qua `call_ended`.
- Timeout pending call sau 30 giay va bao hai ben neu can.
- `toggle_media` broadcast trang thai mic/camera cho ben con lai.

### WebRTC

- Caller/receiver trao doi offer, answer, ICE candidate qua socket.
- Server chi relay signaling toi ben con lai trong cung call.
- Server khong xu ly media stream.

### Call log

- Neu payload co `conversationId`, server kiem tra caller la member.
- Call log luu vao `Messages` voi `type = call`, `senderId = callerId`, `content` mo ta trang thai co ban.
- Khong can migration moi vi `Messages.type` da co `call`.

### Frontend

- User co the bam call trong private chat.
- Receiver thay incoming call va co nut answer/reject.
- Caller thay outgoing screen va co nut cancel.
- Khi answer, ca hai thay video call screen.
- Mute/camera toggle cap nhat local stream va broadcast cho ben kia.
- End call dung stream tracks va quay lai Messenger.

## Yeu cau phi chuc nang

- Socket call event bat buoc auth qua Phase 5 socket middleware.
- Payload socket phai validate o handler/service.
- Khong expose password/token/hash cua user.
- Memory call state khong duoc lam server crash khi disconnect.
- WebRTC co the fail do NAT; TURN server la known limitation.
- UI desktop/mobile khong overlap/clip.

## Tieu chi hoan thanh

- Socket events call_user/answer/reject/end/toggle_media chay duoc.
- Offline/busy/timeout duoc xu ly co thong bao.
- WebRTC signaling offer/answer/ICE duoc relay dung user.
- Frontend co incoming/outgoing/call screen co ban.
- Incoming call hien duoc khi receiver dang o Dashboard/Profile/Friends/Messenger.
- User co the mute mic, toggle camera, end call.
- Call log type `call` duoc tao khi co conversation hop le.
- Co backend tests cho call state offline/busy/answer/reject/end core.
- Frontend build pass.

## Phu thuoc phase khac

- Phase 1: auth/JWT.
- Phase 2: friends/online user profile.
- Phase 5: Socket.IO auth, online map, chat conversations/messages.

## Ranh gioi va rui ro

- WebRTC can test thu cong tren 2 browser/user, unit test khong xac nhan duoc media path.
- Network NAT co the can TURN server sau nay.
- Browser permission denied can xay ra, UI phai hien loi va cleanup.
- Memory call state chi phu hop single server.

## Cau hoi can xac nhan

- Co bat buoc chi cho phep call giua accepted friends khong? De xuat dua vao conversation/private chat hien co.
- Call log content can hien chi tiet duration hay chi missed/ended la du? De xuat co ban: missed/rejected/ended.
