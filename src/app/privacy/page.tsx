import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - MovieStream",
  description: "Privacy Policy for MovieStream platform",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Information We Collect
            </h2>
            <p className="leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Account information (name, email address, password)</li>
              <li>Profile information and preferences</li>
              <li>Watch history and viewing preferences</li>
              <li>Comments and ratings</li>
              <li>Communication preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience and content recommendations</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Monitor and analyze trends, usage, and activities</li>
              <li>
                Detect, prevent, and address technical issues and security
                threats
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. Information Sharing
            </h2>
            <p className="leading-relaxed mb-4">
              We do not sell or rent your personal information to third parties.
              We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With your consent or at your direction</li>
              <li>
                With service providers who perform services on our behalf
              </li>
              <li>To comply with legal obligations</li>
              <li>
                To protect the rights, property, and safety of MovieStream and
                our users
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Cookies and Tracking Technologies
            </h2>
            <p className="leading-relaxed">
              We use cookies and similar tracking technologies to track activity
              on our service and hold certain information. Cookies are files
              with small amount of data which may include an anonymous unique
              identifier. You can instruct your browser to refuse all cookies or
              to indicate when a cookie is being sent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Data Security
            </h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational security
              measures to protect your personal information. However, no method
              of transmission over the Internet or electronic storage is 100%
              secure. While we strive to protect your personal information, we
              cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Your Rights and Choices
            </h2>
            <p className="leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access and update your personal information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of marketing communications</li>
              <li>Disable cookies through your browser settings</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Third-Party Services
            </h2>
            <p className="leading-relaxed">
              Our service may contain links to third-party websites or services
              that are not owned or controlled by MovieStream. We have no
              control over, and assume no responsibility for, the content,
              privacy policies, or practices of any third-party websites or
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="leading-relaxed">
              Our service is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If you are a parent or guardian and believe your child has
              provided us with personal information, please contact us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page
              and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              10. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:support@moviestream.com"
                className="text-red-500 hover:text-red-400"
              >
                support@moviestream.com
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-700">
            <p className="text-gray-500 text-sm">
              Last updated: December 26, 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
