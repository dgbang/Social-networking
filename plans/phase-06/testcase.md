# Phase 6: Video Call Testcases

## Nguon requirement va design

- `plans/phase-06/req.md`
- `plans/phase-06/design.md`
- `docs/PROJECT_PLAN.md`
- `docs/WEEKLY_PLAN.md`

## Pham vi test

Phase 6 test cac nhom chuc nang:

- Socket call lifecycle.
- Offline/busy/timeout handling.
- WebRTC signaling relay.
- Call log message type `call`.
- Incoming/outgoing/video call UI.
- Global incoming call overlay tren moi man hinh protected.
- Mute/camera/end controls.
- Regression chat/socket Phase 5.

## Setup Verification Checklist

- [ ] Server start thanh cong voi call socket handlers.
- [ ] Client build thanh cong voi call UI.
- [ ] Browser xin duoc quyen camera/microphone.
- [ ] Hai user co private conversation tu Phase 5.

## Gia dinh va du lieu test

- `user_a`: caller.
- `user_b`: receiver online.
- `user_c`: user khong thuoc call.
- `private_ab`: private conversation giua `user_a` va `user_b`.
- Browser A login `user_a`, browser B login `user_b`.

## Manual Testcases

| ID | Feature | Scenario | Steps | Expected Result | Priority |
| --- | --- | --- | --- | --- | --- |
| P06-CALL-001 | Call start | Caller goi receiver online | user_a mo private_ab, bam call | user_b thay incoming call | High |
| P06-CALL-002 | Answer | Receiver accept call | user_b bam answer | Hai ben vao video call screen | High |
| P06-CALL-003 | Reject | Receiver reject call | user_b bam reject | user_a thay call rejected, modal dong | High |
| P06-CALL-004 | End | Mot ben ket thuc call active | Bam end call | Hai ben dong call screen, stream cleanup | High |
| P06-CALL-005 | Offline | Receiver offline | user_a goi user_b offline | user_a nhan offline error/rejected | High |
| P06-CALL-006 | Busy | User dang trong call bi goi tiep | user_c goi user_a khi user_a busy | caller nhan busy error | Medium |
| P06-CALL-007 | Toggle media | Mute/camera | Trong call, toggle mic/camera | Local media doi trang thai, ben kia nhan media_toggled | Medium |
| P06-CALL-008 | Permission denied | Browser chan camera | Deny camera permission | UI hien loi, khong crash | High |
| P06-CALL-009 | Timeout | Receiver khong tra loi | Cho 30s | Call timeout va hai ben cleanup | Medium |
| P06-CALL-010 | Mobile UI | Mobile viewport | Mo call UI width 375px | Controls/video khong overlap | Medium |
| P06-CALL-011 | Global incoming | Receiver khong o Messenger | user_b dang o Dashboard/Profile/Friends, user_a goi | user_b thay incoming call modal va answer/reject duoc | High |

## Socket Testcases

| ID | Event | Scenario | Payload | Expected Result |
| --- | --- | --- | --- | --- |
| P06-SOCKET-001 | `call_user` | Receiver online | `{ receiverId, conversationId }` | Receiver nhan `incoming_call` |
| P06-SOCKET-002 | `call_user` | Receiver offline | receiver offline | Caller nhan `call_error`/`call_rejected` |
| P06-SOCKET-003 | `answer_call` | Receiver answer pending call | `{ callId }` | Caller nhan `call_answered` |
| P06-SOCKET-004 | `reject_call` | Receiver reject pending call | `{ callId }` | Caller nhan `call_rejected` |
| P06-SOCKET-005 | `end_call` | End active call | `{ callId }` | Ben con lai nhan `call_ended` |
| P06-SOCKET-006 | `toggle_media` | Toggle mic/camera | `{ callId, audioEnabled, videoEnabled }` | Ben con lai nhan `media_toggled` |
| P06-SOCKET-007 | `webrtc_offer` | Relay offer | `{ callId, offer }` | Ben con lai nhan `webrtc_offer` |
| P06-SOCKET-008 | `webrtc_answer` | Relay answer | `{ callId, answer }` | Ben con lai nhan `webrtc_answer` |
| P06-SOCKET-009 | `webrtc_ice_candidate` | Relay ICE | `{ callId, candidate }` | Ben con lai nhan candidate |
| P06-SOCKET-010 | Any call event | User khong thuoc call | valid callId by user_c | `call_error` forbidden |

## UI Testcases

| ID | Screen | Scenario | Steps | Expected Result |
| --- | --- | --- | --- | --- |
| P06-UI-001 | ChatWindow | Call button | Mo private conversation | Header co nut call |
| P06-UI-002 | IncomingCallModal | Incoming call | user_b nhan incoming_call | Modal hien caller va answer/reject |
| P06-UI-003 | OutgoingCallModal | Outgoing call | user_a bam call | Modal dang goi va cancel |
| P06-UI-004 | VideoCallScreen | Active call | Hai ben answer | Remote/local video render |
| P06-UI-005 | VideoCallScreen | Mute/camera/end | Bam controls | Trang thai local stream doi, call end cleanup |
| P06-UI-006 | Error state | Permission denied/offline/busy | Trigger loi | UI hien loi ngan, khong crash |
| P06-UI-007 | Global overlay | Incoming call ngoai Messenger | Receiver dang o Dashboard/Profile/Friends | Modal incoming hien tren route hien tai |

## Edge Cases

- Caller disconnect khi call pending: receiver nhan call ended/canceled.
- Receiver disconnect khi call active: caller nhan call ended.
- Duplicate answer/reject/end khong lam crash server.
- Signaling den sau khi call ended bi reject.
- User refresh page trong call: memory state cleanup theo disconnect.
- No TURN server: call co the fail ngoai LAN/NAT kho; can ghi known limitation.

## Regression Checklist

- [ ] Chat realtime Phase 5 van gui/nhan message.
- [ ] Online/offline Phase 5 van hoat dong.
- [ ] Protected route/auth van hoat dong.
- [ ] Backend tests Phase 1-6 pass.
- [ ] Frontend build pass.
- [ ] UI Messenger khong bi overlap sau khi them call button.
- [ ] Call provider khong lam auth screens hien modal/socket khi chua login.

## Nen automate o dau

| Test group | Nen automate o dau |
| --- | --- |
| Offline/busy/lifecycle | Unit test `call.service.test.js` |
| Permission/signaling relay | Unit hoac socket integration |
| getUserMedia/WebRTC | Manual/E2E browser |
| UI controls | Manual/E2E sau khi co browser test setup |

## Cau hoi can xac nhan

- Test WebRTC tren 2 may khac mang co can TURN server ngay khong?
- Call log co can hien trong UI message list ngay Phase 6 khong?
