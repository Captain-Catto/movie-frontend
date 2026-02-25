import type { UiLocale } from "@/lib/ui-messages";
import { resolveUiLocale } from "@/lib/ui-messages";

export type LegalPageKey = "privacy" | "terms";

export interface LegalSection {
  title: string;
  text?: string;
  bullets?: string[];
}

export interface LegalPageContent {
  title: string;
  description: string;
  sections: LegalSection[];
  contactTitle: string;
  contactPrefix: string;
  lastUpdated: string;
}

const LEGAL_PAGE_CONTENT: Record<
  LegalPageKey,
  Record<UiLocale, LegalPageContent>
> = {
  privacy: {
    en: {
      title: "Privacy Policy",
      description: "Privacy Policy for MovieStream platform",
      sections: [
        {
          title: "1. Information We Collect",
          text: "We collect information you provide directly to us, including:",
          bullets: [
            "Account information (name, email address, password)",
            "Profile information and preferences",
            "Watch history and viewing preferences",
            "Comments and ratings",
            "Communication preferences",
          ],
        },
        {
          title: "2. How We Use Your Information",
          text: "We use the collected information to:",
          bullets: [
            "Provide, maintain, and improve our services",
            "Personalize your experience and recommendations",
            "Send technical notices and support updates",
            "Respond to your comments and questions",
            "Monitor usage and service performance",
          ],
        },
        {
          title: "3. Information Sharing",
          text: "We do not sell personal data. We may share data only with your consent, to comply with legal obligations, or to protect users and service security.",
        },
        {
          title: "4. Cookies and Tracking",
          text: "We use cookies and similar technologies to maintain sessions, remember preferences, and improve product experience.",
        },
        {
          title: "5. Data Security",
          text: "We apply technical and organizational measures to protect your information. However, no online transmission method is absolutely secure.",
        },
        {
          title: "6. Your Rights",
          text: "You may access, update, or request deletion of your data and adjust communication preferences.",
        },
        {
          title: "7. Third-Party Services",
          text: "Our service may include links to third-party services. We are not responsible for their content or privacy practices.",
        },
        {
          title: "8. Children's Privacy",
          text: "Our service is not intended for children under 13. We do not knowingly collect personal information from children under this age.",
        },
        {
          title: "9. Policy Changes",
          text: "We may update this Privacy Policy from time to time. Changes will be posted on this page.",
        },
      ],
      contactTitle: "10. Contact Us",
      contactPrefix:
        "If you have any questions about this Privacy Policy, please contact us at",
      lastUpdated: "Last updated: December 26, 2024",
    },
    vi: {
      title: "Chính Sách Bảo Mật",
      description: "Chính sách bảo mật cho nền tảng MovieStream",
      sections: [
        {
          title: "1. Thông tin chúng tôi thu thập",
          text: "Chúng tôi thu thập các thông tin bạn cung cấp trực tiếp, bao gồm:",
          bullets: [
            "Thông tin tài khoản (tên, email, mật khẩu)",
            "Thông tin hồ sơ và tùy chọn cá nhân",
            "Lịch sử xem và sở thích nội dung",
            "Bình luận và đánh giá",
            "Tùy chọn liên lạc",
          ],
        },
        {
          title: "2. Cách chúng tôi sử dụng thông tin",
          text: "Chúng tôi sử dụng dữ liệu để:",
          bullets: [
            "Cung cấp, duy trì và cải thiện dịch vụ",
            "Cá nhân hóa trải nghiệm và gợi ý nội dung",
            "Gửi thông báo kỹ thuật và hỗ trợ",
            "Phản hồi câu hỏi, góp ý của bạn",
            "Theo dõi mức độ sử dụng và hiệu năng hệ thống",
          ],
        },
        {
          title: "3. Chia sẻ thông tin",
          text: "Chúng tôi không bán dữ liệu cá nhân. Dữ liệu chỉ được chia sẻ khi có sự đồng ý của bạn, để tuân thủ pháp luật, hoặc để bảo vệ người dùng và an toàn hệ thống.",
        },
        {
          title: "4. Cookie và công nghệ theo dõi",
          text: "Chúng tôi sử dụng cookie và công nghệ tương tự để duy trì phiên đăng nhập, ghi nhớ tùy chọn và cải thiện trải nghiệm sản phẩm.",
        },
        {
          title: "5. Bảo mật dữ liệu",
          text: "Chúng tôi áp dụng biện pháp kỹ thuật và tổ chức để bảo vệ thông tin. Tuy nhiên, không phương thức truyền dữ liệu trực tuyến nào an toàn tuyệt đối.",
        },
        {
          title: "6. Quyền của bạn",
          text: "Bạn có thể truy cập, cập nhật hoặc yêu cầu xóa dữ liệu cá nhân, đồng thời điều chỉnh các tùy chọn liên lạc.",
        },
        {
          title: "7. Dịch vụ bên thứ ba",
          text: "Dịch vụ có thể chứa liên kết đến nền tảng bên thứ ba. Chúng tôi không chịu trách nhiệm cho nội dung hoặc chính sách bảo mật của các nền tảng đó.",
        },
        {
          title: "8. Quyền riêng tư của trẻ em",
          text: "Dịch vụ không dành cho trẻ dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân của trẻ dưới độ tuổi này.",
        },
        {
          title: "9. Thay đổi chính sách",
          text: "Chúng tôi có thể cập nhật chính sách bảo mật theo thời gian. Mọi thay đổi sẽ được đăng tại trang này.",
        },
      ],
      contactTitle: "10. Liên hệ",
      contactPrefix:
        "Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ qua email",
      lastUpdated: "Cập nhật lần cuối: 26/12/2024",
    },
  },
  terms: {
    en: {
      title: "Terms of Service",
      description: "Terms of Service for MovieStream platform",
      sections: [
        {
          title: "1. Acceptance of Terms",
          text: "By accessing and using MovieStream, you agree to these terms. If you do not agree, please do not use the service.",
        },
        {
          title: "2. Use License",
          text: "Permission is granted for personal, non-commercial use only.",
          bullets: [
            "This is a limited license, not transfer of ownership",
            "You may not modify or copy materials without authorization",
            "You may not use materials for commercial or public display",
            "You may not decompile or reverse engineer platform software",
          ],
        },
        {
          title: "3. User Account",
          text: "You are responsible for keeping your account credentials secure and for activities under your account.",
        },
        {
          title: "4. Content and Conduct",
          text: "You agree not to:",
          bullets: [
            "Post unlawful, harmful, or offensive content",
            "Violate applicable laws and regulations",
            "Infringe intellectual property rights",
            "Disrupt service operation or abuse platform resources",
          ],
        },
        {
          title: "5. Disclaimer",
          text: "The service is provided on an 'as is' basis without warranties of any kind.",
        },
        {
          title: "6. Limitations of Liability",
          text: "MovieStream is not liable for damages arising from use or inability to use the service.",
        },
        {
          title: "7. Modifications",
          text: "We may revise these terms at any time. Continued use means acceptance of updated terms.",
        },
      ],
      contactTitle: "8. Contact Information",
      contactPrefix:
        "If you have any questions about these Terms of Service, please contact us at",
      lastUpdated: "Last updated: December 26, 2024",
    },
    vi: {
      title: "Điều Khoản Sử Dụng",
      description: "Điều khoản sử dụng cho nền tảng MovieStream",
      sections: [
        {
          title: "1. Chấp nhận điều khoản",
          text: "Khi truy cập và sử dụng MovieStream, bạn đồng ý với các điều khoản này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.",
        },
        {
          title: "2. Giấy phép sử dụng",
          text: "Bạn chỉ được phép sử dụng dịch vụ cho mục đích cá nhân, phi thương mại.",
          bullets: [
            "Đây là giấy phép giới hạn, không phải chuyển giao quyền sở hữu",
            "Không được sửa đổi hoặc sao chép tài liệu khi chưa được phép",
            "Không được dùng tài liệu cho mục đích thương mại hoặc trình chiếu công khai",
            "Không được dịch ngược hoặc giải mã phần mềm của nền tảng",
          ],
        },
        {
          title: "3. Tài khoản người dùng",
          text: "Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động phát sinh từ tài khoản của mình.",
        },
        {
          title: "4. Nội dung và hành vi",
          text: "Bạn đồng ý không:",
          bullets: [
            "Đăng tải nội dung vi phạm pháp luật, gây hại hoặc phản cảm",
            "Vi phạm quy định pháp luật hiện hành",
            "Xâm phạm quyền sở hữu trí tuệ của bên khác",
            "Can thiệp hoặc làm gián đoạn hoạt động của dịch vụ",
          ],
        },
        {
          title: "5. Tuyên bố miễn trừ",
          text: "Dịch vụ được cung cấp theo hiện trạng ('as is') và không có bất kỳ cam kết bảo đảm nào.",
        },
        {
          title: "6. Giới hạn trách nhiệm",
          text: "MovieStream không chịu trách nhiệm cho thiệt hại phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.",
        },
        {
          title: "7. Thay đổi điều khoản",
          text: "Chúng tôi có thể cập nhật điều khoản bất cứ lúc nào. Việc tiếp tục sử dụng đồng nghĩa bạn chấp nhận điều khoản mới.",
        },
      ],
      contactTitle: "8. Thông tin liên hệ",
      contactPrefix:
        "Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ qua email",
      lastUpdated: "Cập nhật lần cuối: 26/12/2024",
    },
  },
};

export const getLegalPageContent = (
  page: LegalPageKey,
  language: string | undefined
): LegalPageContent => {
  const locale = resolveUiLocale(language);
  return LEGAL_PAGE_CONTENT[page][locale];
};
