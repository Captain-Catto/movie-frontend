"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const faqsEn = [
  {
    question: "How do I create an account?",
    answer:
      'Click the "Login" button in the top right corner, then select "Sign Up" to create a new account. You can also sign up using your Google account for faster registration.',
  },
  {
    question: "Is MovieStream free to use?",
    answer:
      "Yes, MovieStream offers free access to a wide selection of movies and TV shows. Some premium content may require a subscription in the future.",
  },
  {
    question: "What devices can I watch on?",
    answer:
      "MovieStream is accessible on any device with a web browser, including desktop computers, laptops, tablets, and smartphones. We support all major browsers like Chrome, Firefox, Safari, and Edge.",
  },
  {
    question: "How do I search for movies or TV shows?",
    answer:
      'Click the search icon in the top navigation bar or press Ctrl+K (Cmd+K on Mac) to open the search modal. You can search by title and filter results by Movies, TV Shows, or view all results.',
  },
  {
    question: "Can I download movies to watch offline?",
    answer:
      "Currently, offline viewing is not supported. All content must be streamed online with an active internet connection.",
  },
  {
    question: "How do I add movies to my favorites?",
    answer:
      "Click the heart icon on any movie or TV show card to add it to your favorites. You can view all your favorites by visiting your account page.",
  },
  {
    question: "What video quality is available?",
    answer:
      "We offer multiple video quality options depending on your internet connection and device capabilities. The player will automatically adjust quality for the best viewing experience.",
  },
  {
    question: "How can I track watched episodes for TV series?",
    answer:
      "At the moment, episode tracking is available only inside TV series viewing flow. A dedicated Continue Watching page is not available yet.",
  },
  {
    question: "Can I rate and review movies?",
    answer:
      "Yes, you can rate movies and TV shows on their detail pages. Your ratings help us provide better recommendations.",
  },
  {
    question: "How often is new content added?",
    answer:
      "We regularly update our library with new movies and TV shows. Check the homepage and trending section for the latest additions.",
  },
  {
    question: "I forgot my password. What should I do?",
    answer:
      'Click "Forgot Password" on the login page and follow the instructions to reset your password via email.',
  },
  {
    question: "How do I delete my account?",
    answer:
      "To delete your account, please contact our support team at support@moviestream.com. We will process your request within 48 hours.",
  },
  {
    question: "Why is a video not playing?",
    answer:
      "If a video won't play, try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, please contact support.",
  },
  {
    question: "Can I change my email address?",
    answer:
      "Yes, you can update your email address in your account settings. Make sure to verify the new email address after making changes.",
  },
  {
    question: "How do I report inappropriate content?",
    answer:
      "If you encounter inappropriate content, please contact us immediately at support@moviestream.com with details about the content in question.",
  },
];

const faqsVi = [
  {
    question: "Làm sao để tạo tài khoản?",
    answer:
      'Nhấn nút "Đăng nhập" ở góc trên bên phải, sau đó chọn "Đăng ký". Bạn cũng có thể đăng ký nhanh bằng tài khoản Google.',
  },
  {
    question: "MovieStream có miễn phí không?",
    answer:
      "Có. MovieStream cung cấp nhiều nội dung miễn phí. Một số nội dung cao cấp có thể yêu cầu gói trả phí trong tương lai.",
  },
  {
    question: "Tôi có thể xem trên thiết bị nào?",
    answer:
      "Bạn có thể xem trên mọi thiết bị có trình duyệt web như máy tính, laptop, tablet và điện thoại. Hỗ trợ các trình duyệt phổ biến như Chrome, Firefox, Safari và Edge.",
  },
  {
    question: "Làm sao để tìm phim?",
    answer:
      "Nhấn biểu tượng tìm kiếm trên thanh điều hướng hoặc dùng Ctrl+K (Cmd+K trên Mac) để mở modal tìm kiếm. Bạn có thể tìm theo tên và lọc theo phim lẻ/phim bộ.",
  },
  {
    question: "Tôi có thể tải phim để xem offline không?",
    answer:
      "Hiện tại chưa hỗ trợ xem offline. Nội dung cần được phát trực tuyến khi có kết nối internet.",
  },
  {
    question: "Làm sao để thêm phim vào yêu thích?",
    answer:
      "Nhấn biểu tượng trái tim trên thẻ phim/phim bộ để thêm vào danh sách yêu thích. Bạn có thể xem toàn bộ trong trang tài khoản.",
  },
  {
    question: "Có những mức chất lượng video nào?",
    answer:
      "Chất lượng video phụ thuộc vào thiết bị và tốc độ mạng. Trình phát sẽ tự điều chỉnh để có trải nghiệm phù hợp.",
  },
  {
    question: "Tôi có thể theo dõi tập đã xem của phim bộ không?",
    answer:
      "Hiện tại việc theo dõi tập đã xem hoạt động trong luồng xem phim bộ. Trang Continue Watching riêng đang được phát triển.",
  },
  {
    question: "Tôi có thể đánh giá và nhận xét phim không?",
    answer:
      "Có. Bạn có thể đánh giá và bình luận ở trang chi tiết nội dung.",
  },
  {
    question: "Bao lâu thì có nội dung mới?",
    answer:
      "Kho nội dung được cập nhật thường xuyên. Hãy theo dõi trang chủ và mục thịnh hành để xem nội dung mới nhất.",
  },
  {
    question: "Tôi quên mật khẩu thì làm sao?",
    answer:
      'Nhấn "Quên mật khẩu" ở trang đăng nhập và làm theo hướng dẫn để đặt lại mật khẩu qua email.',
  },
  {
    question: "Làm sao để xóa tài khoản?",
    answer:
      "Vui lòng liên hệ đội ngũ hỗ trợ qua support@moviestream.com. Chúng tôi sẽ xử lý trong vòng 48 giờ.",
  },
  {
    question: "Vì sao video không phát?",
    answer:
      "Hãy thử tải lại trang, xóa cache trình duyệt hoặc kiểm tra kết nối mạng. Nếu vẫn lỗi, vui lòng liên hệ hỗ trợ.",
  },
  {
    question: "Tôi có thể đổi email không?",
    answer:
      "Có. Bạn có thể cập nhật email trong phần cài đặt tài khoản và xác minh email mới sau khi thay đổi.",
  },
  {
    question: "Làm sao để báo cáo nội dung không phù hợp?",
    answer:
      "Nếu gặp nội dung không phù hợp, vui lòng gửi email tới support@moviestream.com kèm thông tin chi tiết.",
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors cursor-pointer"
      >
        <span className="text-lg font-medium text-white">{question}</span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
          <p className="text-gray-300 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const { language } = useLanguage();
  const isVietnamese = language.toLowerCase().startsWith("vi");
  const faqs = isVietnamese ? faqsVi : faqsEn;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            {isVietnamese ? "Câu hỏi thường gặp" : "Frequently Asked Questions"}
          </h1>
          <p className="text-gray-400 text-lg">
            {isVietnamese
              ? "Tìm câu trả lời cho các thắc mắc phổ biến về MovieStream"
              : "Find answers to common questions about MovieStream"}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              {isVietnamese ? "Vẫn còn thắc mắc?" : "Still have questions?"}
            </h2>
            <p className="text-gray-400 mb-6">
              {isVietnamese
                ? "Nếu chưa tìm thấy câu trả lời, hãy liên hệ đội ngũ hỗ trợ của chúng tôi."
                : "Can&apos;t find the answer you&apos;re looking for? Feel free to reach out to our support team."}
            </p>
            <a
              href="mailto:support@moviestream.com"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {isVietnamese ? "Liên hệ hỗ trợ" : "Contact Support"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
