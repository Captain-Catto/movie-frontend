import type { Metadata } from "next";
import { getServerPreferredLanguage } from "@/lib/server-language";

type TermsSection = {
  title: string;
  text?: string;
  bullets?: string[];
};

const TERMS_CONTENT = {
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
    ] as TermsSection[],
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
    ] as TermsSection[],
    contactTitle: "8. Thông tin liên hệ",
    contactPrefix:
      "Nếu bạn có câu hỏi về điều khoản sử dụng, vui lòng liên hệ qua email",
    lastUpdated: "Cập nhật lần cuối: 26/12/2024",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const content = isVietnamese ? TERMS_CONTENT.vi : TERMS_CONTENT.en;

  return {
    title: `${content.title} - MovieStream`,
    description: content.description,
  };
}

export default async function TermsPage() {
  const language = await getServerPreferredLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const content = isVietnamese ? TERMS_CONTENT.vi : TERMS_CONTENT.en;

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
