"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
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
    question: "How do I continue watching where I left off?",
    answer:
      'Your watch progress is automatically saved. Visit the "Continue Watching" page to pick up where you left off on any movie or show.',
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800 transition-colors"
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 text-lg">
            Find answers to common questions about MovieStream
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
              Still have questions?
            </h2>
            <p className="text-gray-400 mb-6">
              Can&apos;t find the answer you&apos;re looking for? Feel free to
              reach out to our support team.
            </p>
            <a
              href="mailto:support@moviestream.com"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
