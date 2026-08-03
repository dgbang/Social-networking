# Quy tắc lập trình dành cho AI

Tệp này là quy tắc làm việc cho AI khi đọc tài liệu, phân tích yêu cầu, thiết kế, viết code và trả lời trong dự án.

## 1. Ngôn ngữ bắt buộc

- AI phải trả lời bằng tiếng Việt có đầy đủ dấu.
- Toàn bộ nội dung hiển thị cho người dùng phải dùng tiếng Việt có dấu, bao gồm tiêu đề, nhãn, nút bấm, placeholder, tooltip, trạng thái tải, thông báo thành công, cảnh báo, lỗi, nội dung trống và nội dung hỗ trợ tiếp cận như `aria-label`.
- Thông báo trong response API có khả năng hiển thị cho người dùng cũng phải dùng tiếng Việt có dấu.
- Tài liệu, testcase, chú thích và nội dung hướng dẫn viết bằng tiếng Việt phải có đầy đủ dấu.
- Tuyệt đối không dùng tiếng Việt không dấu trong nội dung mới hoặc nội dung đang được chỉnh sửa.
- Không dùng tiếng Anh cho nội dung sản phẩm khi đã có cách diễn đạt tiếng Việt tự nhiên và rõ nghĩa.
- Được giữ nguyên tên riêng, tên thương hiệu, từ viết tắt, route, tên bảng, tên trường, identifier trong code và thuật ngữ kỹ thuật tiếng Anh khi việc dịch làm sai nghĩa hoặc khó hiểu.
- Khi sửa một màn hình hoặc một luồng nghiệp vụ, AI phải rà soát và chuẩn hóa toàn bộ câu chữ thuộc phạm vi đó, không để lẫn tiếng Anh và tiếng Việt không dấu.
- Câu trả lời cần rõ ràng, ngắn gọn và đúng trọng tâm. Khi có thuật ngữ kỹ thuật khó dịch, có thể giữ nguyên tiếng Anh và giải thích ngắn nếu cần.

## 2. Cấu trúc tài liệu dự án

### `docs/`

Thư mục `docs/` chứa yêu cầu chính thức của dự án.

AI phải đọc tài liệu trong `docs/` trước khi:

- phân tích yêu cầu;
- đề xuất chức năng;
- thiết kế luồng xử lý;
- viết hoặc sửa code;
- đánh giá phạm vi công việc;
- trả lời các câu hỏi liên quan đến nghiệp vụ dự án.

Nếu yêu cầu trong cuộc trò chuyện khác với nội dung trong `docs/`, AI phải báo rõ điểm khác nhau và hỏi lại hoặc nêu giả định trước khi triển khai.

### `plans/`

Thư mục `plans/` chứa thiết kế triển khai, kế hoạch kỹ thuật và testcase.

AI sử dụng `plans/` để:

- hiểu kiến trúc đã được thống nhất;
- kiểm tra luồng xử lý dự kiến;
- bám theo kế hoạch triển khai;
- đối chiếu testcase trước và sau khi sửa code;
- bổ sung thiết kế hoặc testcase khi được yêu cầu.

Nếu `plans/` chưa có tài liệu phù hợp, AI có thể đề xuất nội dung cần bổ sung nhưng phải ghi rõ đó là đề xuất.

## 3. Quy tắc đọc tài liệu

- Luôn ưu tiên đọc tài liệu hiện có trong dự án trước khi kết luận.
- Không tự suy diễn yêu cầu nếu tài liệu chưa nêu rõ.
- Không bịa tính năng, API, database schema, quy tắc nghiệp vụ hoặc ràng buộc kỹ thuật.
- Khi thiếu thông tin, AI phải nói rõ phần nào chưa có trong tài liệu.
- Nếu cần tiếp tục làm việc dù thiếu thông tin, AI phải ghi rõ giả định đang dùng.

## 4. Quy tắc khi viết hoặc sửa code

- Chỉ triển khai chức năng đã có căn cứ từ `docs/`, `plans/` hoặc yêu cầu trực tiếp của người phát triển.
- Bám theo kiến trúc, naming convention và style code đang có trong dự án.
- Không tự ý thay đổi phạm vi lớn ngoài yêu cầu.
- Không xóa hoặc sửa tài liệu, code, cấu hình không liên quan nếu chưa được yêu cầu.
- Khi sửa code, cần cân nhắc ảnh hưởng tới testcase, API contract, database schema và luồng người dùng.
- Mọi câu chữ mới trong code phải tuân thủ quy tắc ngôn ngữ tại Mục 1.

## 5. Quy tắc khi gợi ý

AI được phép gợi ý cho người phát triển, nhưng phải phân biệt rõ:

- phần nào là yêu cầu đã có trong tài liệu;
- phần nào là suy luận hợp lý từ tài liệu;
- phần nào là đề xuất thêm của AI.

Gợi ý nên có lý do rõ ràng, ví dụ:

- giảm rủi ro kỹ thuật;
- tăng tính bảo mật;
- giúp dễ kiểm thử hơn;
- giúp kế hoạch 12 tuần thực tế hơn;
- tránh phát sinh phạm vi ngoài kiểm soát.

## 6. Quy tắc testcase

- Testcase nên được đặt hoặc mô tả trong `plans/`.
- Khi thêm chức năng mới, AI nên kiểm tra xem đã có testcase tương ứng chưa.
- Nếu thiếu testcase quan trọng, AI cần đề xuất bổ sung.
- Testcase nên bao gồm happy path, edge case và lỗi thường gặp.
- Tên và mô tả testcase bằng tiếng Việt phải có đầy đủ dấu.

## 7. Quy tắc báo cáo kết quả

Khi hoàn thành một việc, AI nên báo cáo:

- đã đọc hoặc dùng tài liệu nào;
- đã thay đổi tệp nào;
- nội dung chính đã thay đổi;
- đã kiểm thử hoặc kiểm tra gì;
- phần nào còn rủi ro hoặc cần người phát triển xác nhận.

Mọi báo cáo phải viết bằng tiếng Việt có dấu.

## 8. Nguyên tắc chống bịa

Nếu không tìm thấy thông tin trong tài liệu, AI phải dùng một trong các cách nói sau:

- "Trong tài liệu hiện tại chưa thấy yêu cầu này."
- "Mình đang giả định rằng..."
- "Đây là đề xuất thêm, chưa phải yêu cầu chính thức."
- "Cần xác nhận thêm trước khi triển khai."

AI không được trình bày giả định như sự thật đã được thống nhất.

## 9. Thứ tự làm việc khuyến nghị

Khi nhận task mới, AI nên làm theo thứ tự:

1. Đọc yêu cầu liên quan trong `docs/`.
2. Đọc thiết kế hoặc testcase liên quan trong `plans/`.
3. Kiểm tra code hiện có nếu task yêu cầu sửa code.
4. Nếu task có rủi ro hoặc phạm vi lớn, nêu ngắn gọn hướng xử lý.
5. Thực hiện thay đổi.
6. Kiểm tra lại bằng test, lint, build hoặc review thủ công phù hợp.
7. Báo cáo kết quả bằng tiếng Việt có dấu.

## 10. Quy tắc ưu tiên

Khi có mâu thuẫn, ưu tiên theo thứ tự:

1. Yêu cầu trực tiếp mới nhất của người phát triển.
2. Tài liệu trong `docs/`.
3. Thiết kế và testcase trong `plans/`.
4. Code hiện có trong dự án.
5. Gợi ý hoặc suy luận của AI.
