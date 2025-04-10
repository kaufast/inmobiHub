import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link href="/">
          <Button variant="outline" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-gray-500">Last updated: April 10, 2025</p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <h2>1. Introduction</h2>
        <p>
          Inmobi® ("we", "our", or "us") uses cookies and similar technologies on our website. This Cookie Policy explains how we use cookies, how they work, and your rights to control our use of them.
        </p>
        <p>
          Please read this Cookie Policy carefully. By using our website, you consent to our use of cookies as described in this policy. This policy is incorporated into and forms part of our <Link href="/privacy-policy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
        </p>

        <h2>2. What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit websites. They are widely used to make websites work more efficiently and provide information to the website owners. Cookies enhance user experience by remembering your preferences and actions.
        </p>
        <p>
          Cookies may be set by us (first-party cookies) or by third parties providing services to us, such as analytics providers (third-party cookies).
        </p>

        <h2>3. Types of Cookies We Use</h2>
        <p>We use the following types of cookies on our website:</p>

        <h3>3.1 Necessary Cookies</h3>
        <p>
          These cookies are essential for the website to function properly. They enable basic functions like page navigation, secure areas access, and maintaining user sessions. The website cannot function properly without these cookies.
        </p>
        <p><strong>Examples:</strong> Authentication cookies, security cookies, load balancing cookies.</p>

        <h3>3.2 Preference Cookies</h3>
        <p>
          Preference cookies enable our website to remember information that changes the way the website behaves or looks, like your preferred language or the region you are in.
        </p>
        <p><strong>Examples:</strong> Language preferences, theme settings, layout preferences.</p>

        <h3>3.3 Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. Analytics cookies help us improve our website based on user behavior.
        </p>
        <p><strong>Examples:</strong> Google Analytics cookies that track page views, navigation paths, time spent on pages, bounce rates, and user demographics.</p>

        <h3>3.4 Marketing Cookies</h3>
        <p>
          Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for individual users, making them more valuable for publishers and third-party advertisers.
        </p>
        <p><strong>Examples:</strong> Cookies used by advertising networks like Google AdSense, Facebook Pixel, etc.</p>

        <h2>4. Cookie Duration</h2>
        <p>Based on their duration, cookies can be:</p>
        <ul>
          <li><strong>Session Cookies:</strong> These are temporary cookies that expire when you close your browser.</li>
          <li><strong>Persistent Cookies:</strong> These remain on your device for a set period or until you delete them manually.</li>
        </ul>

        <h2>5. Specific Cookies We Use</h2>
        <p>Below is a detailed list of the primary cookies we use:</p>

        <table className="min-w-full border border-gray-300 mt-4 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border text-left">Cookie Name</th>
              <th className="px-4 py-2 border text-left">Type</th>
              <th className="px-4 py-2 border text-left">Purpose</th>
              <th className="px-4 py-2 border text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border">cookieConsent</td>
              <td className="px-4 py-2 border">Necessary</td>
              <td className="px-4 py-2 border">Stores your cookie consent preferences</td>
              <td className="px-4 py-2 border">1 year</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-2 border">sessionID</td>
              <td className="px-4 py-2 border">Necessary</td>
              <td className="px-4 py-2 border">Maintains your session while browsing the website</td>
              <td className="px-4 py-2 border">Session</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border">_ga</td>
              <td className="px-4 py-2 border">Analytics</td>
              <td className="px-4 py-2 border">Google Analytics cookie used to distinguish users</td>
              <td className="px-4 py-2 border">2 years</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-2 border">_gid</td>
              <td className="px-4 py-2 border">Analytics</td>
              <td className="px-4 py-2 border">Google Analytics cookie used to distinguish users</td>
              <td className="px-4 py-2 border">24 hours</td>
            </tr>
            <tr>
              <td className="px-4 py-2 border">_fbp</td>
              <td className="px-4 py-2 border">Marketing</td>
              <td className="px-4 py-2 border">Facebook Pixel cookie used for advertising</td>
              <td className="px-4 py-2 border">90 days</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-4 py-2 border">ui_preferences</td>
              <td className="px-4 py-2 border">Preference</td>
              <td className="px-4 py-2 border">Stores UI preferences like dark/light mode</td>
              <td className="px-4 py-2 border">1 year</td>
            </tr>
          </tbody>
        </table>

        <h2>6. Third-Party Cookies</h2>
        <p>
          Some cookies are placed by third parties on our website. These third parties may include analytics providers, advertising networks, and social media platforms. We do not control these third-party cookies.
        </p>
        <p>
          The third parties we work with who may place cookies on our website include:
        </p>
        <ul>
          <li>Google Analytics (for website analytics)</li>
          <li>Google AdSense (for advertising)</li>
          <li>Facebook (for social media integration and marketing)</li>
          <li>Twitter (for social media integration)</li>
          <li>LinkedIn (for social media integration)</li>
        </ul>
        <p>
          Please note that these third parties may change their cookies at any time. For the most up-to-date information about their cookies, please consult their respective privacy policies.
        </p>

        <h2>7. Your Cookie Choices</h2>
        <p>You have the following rights regarding our use of cookies:</p>

        <h3>7.1 Cookie Consent Banner</h3>
        <p>
          When you first visit our website, you will see a cookie consent banner that allows you to:
        </p>
        <ul>
          <li>Accept all cookies</li>
          <li>Accept only necessary cookies</li>
          <li>Customize your cookie preferences</li>
        </ul>
        <p>
          You can change your cookie preferences at any time by clicking on the "Cookie Settings" button at the bottom of our website.
        </p>

        <h3>7.2 Browser Controls</h3>
        <p>
          Most web browsers also allow you to manage your cookie preferences. You can:
        </p>
        <ul>
          <li>Delete cookies from your device</li>
          <li>Block cookies by activating the setting on your browser that allows you to refuse all or some cookies</li>
          <li>Set your browser to notify you when you receive a cookie</li>
        </ul>
        <p>
          Please note that if you choose to block or delete cookies, you may not be able to access certain areas or features of our website, and some services may not function properly.
        </p>
        <p>
          Here are links to cookie management instructions for common browsers:
        </p>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Microsoft Edge</a></li>
        </ul>

        <h3>7.3 Opt-Out of Specific Third-Party Cookies</h3>
        <p>
          You can opt out of third-party cookies using the following tools:
        </p>
        <ul>
          <li><a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Analytics Opt-out Browser Add-on</a></li>
          <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Your Online Choices (for managing behavioral advertising cookies)</a></li>
          <li><a href="https://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Network Advertising Initiative Opt-out</a></li>
        </ul>

        <h2>8. GDPR and Cookie Compliance</h2>
        <p>
          We comply with the EU General Data Protection Regulation (GDPR) and the ePrivacy Directive (ePR) regarding our use of cookies. This means:
        </p>
        <ul>
          <li>We obtain your consent before placing non-essential cookies on your device</li>
          <li>We provide clear information about the cookies we use</li>
          <li>We give you control over your cookie preferences</li>
          <li>We document your consent</li>
          <li>We allow you to withdraw your consent at any time</li>
        </ul>

        <h2>9. Changes to Our Cookie Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page and updating the "Last updated" date at the top of this policy.
        </p>
        <p>
          We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies.
        </p>

        <h2>10. Contact Us</h2>
        <p>
          If you have any questions about our Cookie Policy, please contact us:
        </p>
        <ul>
          <li>By email: <a href="mailto:privacy@inmobi.mobi" className="text-blue-600 hover:underline">privacy@inmobi.mobi</a></li>
          <li>By phone: +34 679 680 000</li>
          <li>By mail: Inmobi, c. de la Ribera 14, 08003 Barcelona, Spain</li>
        </ul>
      </div>
    </div>
  );
}