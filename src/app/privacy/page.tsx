import type { Metadata } from "next";
import { getServerPreferredLanguage } from "@/lib/server-language";

type PrivacySection = {
  title: string;
  text?: string;
  bullets?: string[];
};

const PRIVACY_CONTENT = {
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
    ] as PrivacySection[],
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
    ] as PrivacySection[],
    contactTitle: "10. Liên hệ",
    contactPrefix:
      "Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ qua email",
    lastUpdated: "Cập nhật lần cuối: 26/12/2024",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const content = isVietnamese ? PRIVACY_CONTENT.vi : PRIVACY_CONTENT.en;

  return {
    title: `${content.title} - MovieStream`,
    description: content.description,
  };
}

export default async function PrivacyPage() {
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const content = isVietnamese ? PRIVACY_CONTENT.vi : PRIVACY_CONTENT.en;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">{content.title}</h1>

        <div className="space-y-6 text-gray-300">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold text-white mb-4">
                {section.title}
              </h2>
              {section.text ? <p className="leading-relaxed mb-4">{section.text}</p> : null}
              {section.bullets ? (
                <ul className="list-disc list-inside space-y-2 ml-4">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              {content.contactTitle}
            </h2>
            <p className="leading-relaxed">
              {content.contactPrefix}{" "}
              <a
                href="mailto:support@moviestream.com"
                className="text-red-500 hover:text-red-400"
              >
                support@moviestream.com
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-500 text-sm">{content.lastUpdated}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
