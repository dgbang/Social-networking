from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "plans" / "Ke_hoach_trien_khai_12_tuan_Duong_Gia_Bang_22026538.pdf"


def register_fonts() -> tuple[str, str]:
    font_dir = Path("C:/Windows/Fonts")
    regular_candidates = [
        font_dir / "arial.ttf",
        font_dir / "calibri.ttf",
        font_dir / "segoeui.ttf",
    ]
    bold_candidates = [
        font_dir / "arialbd.ttf",
        font_dir / "calibrib.ttf",
        font_dir / "segoeuib.ttf",
    ]

    regular = next((path for path in regular_candidates if path.exists()), None)
    bold = next((path for path in bold_candidates if path.exists()), None)
    if not regular or not bold:
        raise FileNotFoundError("Khong tim thay font Windows ho tro tieng Viet.")

    pdfmetrics.registerFont(TTFont("VN-Regular", str(regular)))
    pdfmetrics.registerFont(TTFont("VN-Bold", str(bold)))
    return "VN-Regular", "VN-Bold"


def make_styles(font_name: str, bold_font: str):
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="CoverTitle",
            fontName=bold_font,
            fontSize=22,
            leading=29,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#17324D"),
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="CoverMeta",
            fontName=font_name,
            fontSize=12,
            leading=18,
            alignment=TA_CENTER,
            textColor=colors.HexColor("#24364A"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="Heading",
            fontName=bold_font,
            fontSize=15,
            leading=20,
            textColor=colors.HexColor("#17324D"),
            spaceBefore=10,
            spaceAfter=8,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyVN",
            fontName=font_name,
            fontSize=10.5,
            leading=16,
            alignment=TA_LEFT,
            textColor=colors.HexColor("#1F2933"),
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="SmallVN",
            fontName=font_name,
            fontSize=9,
            leading=13,
            textColor=colors.HexColor("#1F2933"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableHeader",
            fontName=bold_font,
            fontSize=9,
            leading=12,
            alignment=TA_CENTER,
            textColor=colors.white,
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableCell",
            fontName=font_name,
            fontSize=8.6,
            leading=11.3,
            textColor=colors.HexColor("#1F2933"),
        )
    )
    styles.add(
        ParagraphStyle(
            name="TableCellBold",
            fontName=bold_font,
            fontSize=8.6,
            leading=11.3,
            textColor=colors.HexColor("#17324D"),
        )
    )
    return styles


def p(text: str, style: ParagraphStyle) -> Paragraph:
    return Paragraph(text, style)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("VN-Regular", 8)
    canvas.setFillColor(colors.HexColor("#6B7280"))
    canvas.drawString(2 * cm, 1.2 * cm, "Kế hoạch triển khai 12 tuần - Social Networking Promax")
    canvas.drawRightString(A4[0] - 2 * cm, 1.2 * cm, f"Trang {doc.page}")
    canvas.restoreState()


def build_pdf():
    font_name, bold_font = register_fonts()
    styles = make_styles(font_name, bold_font)

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=1.6 * cm,
        leftMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.7 * cm,
        title="Kế hoạch triển khai 12 tuần",
        author="Đường Gia Bằng",
    )

    story = []

    story.append(Spacer(1, 3.2 * cm))
    story.append(p("KẾ HOẠCH TRIỂN KHAI DỰ ÁN TRONG 12 TUẦN", styles["CoverTitle"]))
    story.append(p("Dự án: Social Networking Promax", styles["CoverMeta"]))
    story.append(Spacer(1, 0.8 * cm))
    story.append(p("Sinh viên thực hiện: <b>Đường Gia Bằng</b>", styles["CoverMeta"]))
    story.append(p("Mã sinh viên: <b>22026538</b>", styles["CoverMeta"]))
    story.append(p("Thời lượng kế hoạch: <b>12 tuần</b>", styles["CoverMeta"]))
    story.append(p("Công nghệ chính: React, Node.js, Express, PostgreSQL, Sequelize, Docker", styles["CoverMeta"]))
    story.append(PageBreak())

    story.append(p("1. Mục tiêu dự án", styles["Heading"]))
    story.append(
        p(
            "Xây dựng nền tảng mạng xã hội full-stack cho phép người dùng đăng ký, đăng nhập, "
            "quản lý hồ sơ cá nhân, kết bạn, đăng bài, tương tác, nhắn tin và nhận thông báo. "
            "Kế hoạch 12 tuần tập trung vào việc triển khai theo từng giai đoạn có kiểm thử, "
            "tài liệu hóa và chuẩn bị môi trường vận hành bằng Docker.",
            styles["BodyVN"],
        )
    )

    story.append(p("2. Phạm vi chức năng", styles["Heading"]))
    scope_items = [
        "Xác thực người dùng: đăng ký, đăng nhập, làm mới token, đăng xuất, quên và đặt lại mật khẩu.",
        "Hồ sơ cá nhân: cập nhật thông tin, ảnh đại diện, ảnh bìa, tìm kiếm người dùng.",
        "Bạn bè: gửi lời mời, chấp nhận, từ chối, hủy kết bạn, danh sách bạn bè và gợi ý kết bạn.",
        "Bài viết và bảng tin: tạo, sửa, xóa, xem bài viết, tải ảnh, lọc bài theo người dùng và bạn bè.",
        "Tương tác: thích, bình luận, trả lời bình luận, thống kê tương tác cơ bản.",
        "Nhắn tin và thông báo: hội thoại, tin nhắn thời gian thực, thông báo sự kiện chính.",
        "Triển khai: cấu hình Docker, biến môi trường, migration database, kiểm thử và tài liệu hướng dẫn.",
    ]
    for item in scope_items:
        story.append(p(f"• {item}", styles["BodyVN"]))

    story.append(p("3. Kế hoạch chi tiết theo tuần", styles["Heading"]))
    weeks = [
        [
            "Tuần 1",
            "Khảo sát yêu cầu và thiết kế tổng quan",
            "Rà soát mục tiêu dự án, xác định actor, use case, luồng nghiệp vụ chính; thống nhất kiến trúc client-server và database.",
            "Tài liệu yêu cầu, sơ đồ kiến trúc, danh sách chức năng ưu tiên.",
        ],
        [
            "Tuần 2",
            "Thiết lập nền tảng backend",
            "Khởi tạo Express API, cấu hình Sequelize, PostgreSQL, Docker Compose, health check, logging, validation và cấu trúc thư mục.",
            "Backend chạy được local, endpoint /api/health, migration ban đầu.",
        ],
        [
            "Tuần 3",
            "Xác thực và quản lý phiên",
            "Triển khai đăng ký, đăng nhập, access token, refresh token, logout, forgot/reset password và middleware bảo vệ API.",
            "API auth hoàn chỉnh, kiểm thử các luồng thành công và lỗi.",
        ],
        [
            "Tuần 4",
            "Giao diện xác thực và quản lý trạng thái",
            "Xây dựng trang login/register/forgot/reset, tích hợp Redux hoặc state store, lưu token, điều hướng route riêng tư.",
            "Người dùng đăng nhập được từ giao diện, phiên làm việc ổn định.",
        ],
        [
            "Tuần 5",
            "Hồ sơ người dùng",
            "Thiết kế bảng dữ liệu hồ sơ, API lấy/cập nhật profile, upload avatar/cover qua Cloudinary hoặc storage tương đương.",
            "Trang profile cá nhân và profile người khác, upload ảnh hoạt động.",
        ],
        [
            "Tuần 6",
            "Tìm kiếm và kết bạn",
            "Triển khai tìm kiếm người dùng, gửi lời mời kết bạn, chấp nhận, từ chối, hủy kết bạn, danh sách bạn bè và yêu cầu chờ.",
            "Module friends hoàn chỉnh trên API và giao diện.",
        ],
        [
            "Tuần 7",
            "Bài viết và bảng tin",
            "Xây dựng model bài viết, API CRUD, upload ảnh bài viết, phân quyền sửa/xóa, giao diện tạo bài và hiển thị feed.",
            "Feed cơ bản, người dùng tạo/sửa/xóa bài viết được.",
        ],
        [
            "Tuần 8",
            "Tương tác bài viết",
            "Triển khai thích bài viết, bình luận, trả lời bình luận, xóa bình luận, cập nhật số lượng tương tác theo thời gian gần thực.",
            "Tính năng like/comment hoạt động trên feed và trang profile.",
        ],
        [
            "Tuần 9",
            "Nhắn tin",
            "Thiết kế hội thoại, tin nhắn, API danh sách hội thoại, gửi/nhận tin nhắn; nếu phù hợp tích hợp Socket.IO cho thời gian thực.",
            "Trang messages, gửi nhận tin nhắn giữa hai người dùng.",
        ],
        [
            "Tuần 10",
            "Thông báo và hoàn thiện UX",
            "Triển khai thông báo lời mời kết bạn, tương tác bài viết, tin nhắn mới; hoàn thiện navbar, trạng thái loading/error/empty.",
            "Trung tâm thông báo và trải nghiệm giao diện nhất quán.",
        ],
        [
            "Tuần 11",
            "Kiểm thử, bảo mật và tối ưu",
            "Viết test API quan trọng, rà soát phân quyền, validate input, xử lý lỗi, kiểm tra CORS, rate limit, truy vấn N+1 và index database.",
            "Bộ kiểm thử hồi quy, danh sách lỗi đã xử lý, hiệu năng ổn định.",
        ],
        [
            "Tuần 12",
            "Đóng gói, triển khai và nghiệm thu",
            "Chuẩn hóa Docker, biến môi trường, migration, tài liệu cài đặt, hướng dẫn demo, checklist nghiệm thu và báo cáo tổng kết.",
            "Bản release demo, tài liệu triển khai, báo cáo hoàn thành.",
        ],
    ]

    table_data = [
        [
            p("Tuần", styles["TableHeader"]),
            p("Trọng tâm", styles["TableHeader"]),
            p("Công việc chính", styles["TableHeader"]),
            p("Sản phẩm bàn giao", styles["TableHeader"]),
        ]
    ]
    for row in weeks:
        table_data.append([p(row[0], styles["TableCellBold"]), *[p(cell, styles["TableCell"]) for cell in row[1:]]])

    table = Table(table_data, colWidths=[1.45 * cm, 3.6 * cm, 7.15 * cm, 4.4 * cm], repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F8FAFC")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ]
        )
    )
    story.append(table)

    story.append(p("4. Mốc kiểm soát chất lượng", styles["Heading"]))
    milestones = [
        "Cuối tuần 3: hoàn thành backend xác thực và kiểm thử API cốt lõi.",
        "Cuối tuần 6: hoàn thành hồ sơ người dùng và quan hệ bạn bè.",
        "Cuối tuần 8: hoàn thành bảng tin, bài viết và tương tác.",
        "Cuối tuần 10: hoàn thành nhắn tin, thông báo và trải nghiệm giao diện chính.",
        "Cuối tuần 12: hoàn thành triển khai demo, tài liệu và nghiệm thu.",
    ]
    for item in milestones:
        story.append(p(f"• {item}", styles["BodyVN"]))

    story.append(p("5. Rủi ro và phương án xử lý", styles["Heading"]))
    risks = [
        [
            "Rủi ro",
            "Tác động",
            "Phương án xử lý",
        ],
        [
            "Chậm tiến độ do chức năng nhiều",
            "Ảnh hưởng tới các module cuối như nhắn tin và thông báo",
            "Ưu tiên MVP trước, tách tính năng nâng cao sang backlog.",
        ],
        [
            "Lỗi bảo mật trong xác thực hoặc phân quyền",
            "Người dùng truy cập dữ liệu không hợp lệ",
            "Kiểm tra middleware, test case quyền truy cập, validate dữ liệu đầu vào.",
        ],
        [
            "Upload ảnh hoặc dịch vụ bên thứ ba không ổn định",
            "Không cập nhật được avatar, cover hoặc ảnh bài viết",
            "Có cấu hình fallback cho môi trường phát triển và xử lý lỗi rõ ràng trên giao diện.",
        ],
        [
            "Truy vấn dữ liệu chậm khi feed lớn",
            "Giảm trải nghiệm người dùng",
            "Dùng phân trang, index database và tối ưu include/query Sequelize.",
        ],
    ]
    risk_table = Table(
        [[p(cell, styles["TableHeader"]) for cell in risks[0]]]
        + [[p(cell, styles["TableCell"]) for cell in row] for row in risks[1:]],
        colWidths=[4.9 * cm, 5.2 * cm, 6.5 * cm],
        repeatRows=1,
    )
    risk_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#CBD5E1")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ]
        )
    )
    story.append(risk_table)

    story.append(p("6. Kết luận", styles["Heading"]))
    story.append(
        p(
            "Kế hoạch 12 tuần được chia theo hướng tăng dần độ hoàn thiện: xây nền tảng, triển khai "
            "nghiệp vụ cốt lõi, bổ sung tương tác thời gian thực, sau đó kiểm thử và đóng gói triển khai. "
            "Cách tiếp cận này giúp dự án luôn có phiên bản chạy được sau từng giai đoạn và giảm rủi ro khi nghiệm thu.",
            styles["BodyVN"],
        )
    )

    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT)
