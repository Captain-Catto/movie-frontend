"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFooterUiMessages } from "@/lib/ui-messages";

const Footer = () => {
  const { language } = useLanguage();
  const labels = getFooterUiMessages(language);

  return (
    <footer className="mt-16 bg-gray-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center mr-2">
                <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
              </div>
              <span className="ml-2 text-xl font-bold text-white">
                MovieStream
              </span>
            </div>
            <p className="text-gray-400">
              {labels.tagline}
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://facebook.com"
                className="inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-red-500"
                aria-label="Facebook"
                title="Facebook"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">Facebook</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
              <Link
                href="https://x.com"
                className="inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-red-500"
                aria-label="Twitter"
                title="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link
                href="https://instagram.com"
                className="inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-red-500"
                aria-label="Instagram"
                title="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">Instagram</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              </Link>
              <Link
                href="https://youtube.com"
                className="inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-400 transition-colors hover:text-red-500"
                aria-label="YouTube"
                title="YouTube"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">YouTube</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5"
                >
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path>
                  <path d="m10 15 5-3-5-3z"></path>
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {labels.quickLinks}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.home}
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?sort=latest"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.newReleases}
                </Link>
              </li>
              <li>
                <Link
                  href="/movies"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.movies}
                </Link>
              </li>
              <li>
                <Link
                  href="/tv"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.tvSeries}
                </Link>
              </li>
              <li>
                <Link
                  href="/trending"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.trending}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {labels.categories}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/browse?type=movie&genres=28"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.action}
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=movie&genres=10749"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.romance}
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=movie&genres=35"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.comedy}
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=movie&genres=16"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.animation}
                </Link>
              </li>
              <li>
                <Link
                  href="/browse?type=movie&genres=27"
                  className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-gray-400 transition-colors hover:text-red-500"
                >
                  {labels.horror}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">
              {labels.contact}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 mr-2"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
                <span>support@moviestream.com</span>
              </li>
              <li className="flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 mr-2"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>+84 123 456 789</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              {labels.copyright}
            </p>
            <div className="flex space-x-8">
              <Link
                href="/terms"
                className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-sm text-gray-400 transition-colors hover:text-red-500"
              >
                {labels.terms}
              </Link>
              <Link
                href="/privacy"
                className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-sm text-gray-400 transition-colors hover:text-red-500"
              >
                {labels.privacy}
              </Link>
              <Link
                href="/faq"
                className="inline-flex min-h-12 min-w-12 items-center rounded-md px-3 text-sm text-gray-400 transition-colors hover:text-red-500"
              >
                {labels.faq}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
