import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - MovieStream",
  description: "Terms of Service for MovieStream platform",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Terms of Service
        </h1>

        <div className="space-y-6 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using MovieStream, you accept and agree to be
              bound by the terms and provision of this agreement. If you do not
              agree to these Terms of Service, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              2. Use License
            </h2>
            <p className="leading-relaxed mb-4">
              Permission is granted to temporarily access the materials
              (information or software) on MovieStream for personal,
              non-commercial transitory viewing only.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>This is the grant of a license, not a transfer of title</li>
              <li>
                You may not modify or copy the materials without authorization
              </li>
              <li>
                You may not use the materials for any commercial purpose or
                public display
              </li>
              <li>
                You may not attempt to decompile or reverse engineer any
                software contained on MovieStream
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              3. User Account
            </h2>
            <p className="leading-relaxed">
              You are responsible for maintaining the confidentiality of your
              account and password. You agree to accept responsibility for all
              activities that occur under your account or password.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              4. Content and Conduct
            </h2>
            <p className="leading-relaxed mb-4">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Upload, post, or transmit any content that is unlawful,
                harmful, or objectionable
              </li>
              <li>Violate any applicable laws or regulations</li>
              <li>
                Infringe upon the rights of others, including copyright and
                intellectual property rights
              </li>
              <li>
                Engage in any activity that interferes with or disrupts our
                services
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              5. Disclaimer
            </h2>
            <p className="leading-relaxed">
              The materials on MovieStream are provided on an &apos;as is&apos;
              basis. MovieStream makes no warranties, expressed or implied, and
              hereby disclaims and negates all other warranties including,
              without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or
              non-infringement of intellectual property or other violation of
              rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              6. Limitations
            </h2>
            <p className="leading-relaxed">
              In no event shall MovieStream or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on MovieStream.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              7. Modifications
            </h2>
            <p className="leading-relaxed">
              MovieStream may revise these terms of service at any time without
              notice. By using this website you are agreeing to be bound by the
              then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">
              8. Contact Information
            </h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please
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
