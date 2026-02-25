import type { Metadata } from "next";
import { getServerPreferredLanguage } from "@/lib/server-language";
import { getLegalPageContent } from "@/lib/legal-page-content";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerPreferredLanguage();
  const content = getLegalPageContent("privacy", language);

  return {
    title: `${content.title} - MovieStream`,
    description: content.description,
  };
}

export default async function PrivacyPage() {
  const language = await getServerPreferredLanguage();
  const content = getLegalPageContent("privacy", language);

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
