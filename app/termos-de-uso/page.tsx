"use client";
/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { PUBLIC_ASSETS } from "@/lib/public-assets";

export default function TermsOfUse() {
  return (
    <div className="landing-shell">
      <header className="site-header">
        <div className="brand-wrap">
          <Link href="/" className="brand-link">
            <img src={PUBLIC_ASSETS.logo} alt="Logo Fluenverse" className="site-logo" />
          </Link>
        </div>
        <nav className="header-actions">
          <Link href="/" className="contact-nav-button">
            Back to Home
          </Link>
        </nav>
      </header>

      <main className="legal-container">
        <div className="legal-inner">
          <section className="legal-content">
            <h1>Terms of Use</h1>
            <p className="last-updated">Last updated: March 12, 2026</p>

          <p>
            Welcome to <strong>Fluenverse</strong>. By accessing our website or using our English conversation session services, you agree to comply with and be bound by the following terms and conditions.
          </p>

          <h2>1. Service Description</h2>
          <p>
            Fluenverse provides one-on-one online English conversation sessions led by specialized instructors. The sessions focus on developing speaking ability, pronunciation adjustment, and confidence in interpersonal communication in English.
          </p>

          <h2>2. Scheduling and Cancellation</h2>
          <p>
            To ensure the best experience for all students, we follow these scheduling rules:
          </p>
          <ul>
            <li>Sessions must be scheduled through the official platform or designated support channels;</li>
            <li><strong>Rescheduling and Cancellations:</strong> Must be requested at least 24 hours in advance;</li>
            <li>Cancellations made less than 24 hours in advance or no-shows may result in full session charges or deduction from your contracted package.</li>
          </ul>

          <h2>3. User Responsibilities</h2>
          <p>As a user and student, you agree to:</p>
          <ul>
            <li>Provide accurate and up-to-date contact information;</li>
            <li>Maintain respectful and professional conduct during sessions;</li>
            <li>Have the minimum required setup for online sessions (stable internet connection, working camera, and microphone).</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            All content available on the Fluenverse website and in provided learning materials, including text, logos, graphics, images, and videos, is the exclusive property of Fluenverse and its creators. Reproduction, distribution, or commercial use of this content without express written authorization is prohibited.
          </p>

          <h2>5. Payments and Refunds</h2>
          <p>
            Pricing and payment terms are agreed upon at the time of purchase. If you are dissatisfied with the service, please contact us so we can evaluate your case individually.
          </p>

          <h2>6. Limitation of Liability</h2>
          <p>
            Fluenverse is committed to providing the best tools and support for your language development. However, progress and fluency outcomes depend directly on the student's effort, practice, and consistency, and Fluenverse cannot guarantee specific results within defined timeframes.
          </p>

          <h2>7. Changes to the Terms</h2>
          <p>
            We reserve the right to modify these Terms of Use at any time. Any changes will take effect immediately upon publication on the website. Continued use of the service after such changes constitutes acceptance of the updated terms.
          </p>

            <h2>8. Contact</h2>
            <p>
              If you have questions about these Terms of Use, contact us at: <a href="mailto:info@fluenverse.com">info@fluenverse.com</a>.
            </p>
          </section>
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <Link href="/">
              <img src={PUBLIC_ASSETS.logo} alt="Fluenverse" className="footer-logo" />
            </Link>
          </div>
          <p className="footer-copyright">© 2026 Fluenverse - All rights reserved</p>
          <div className="footer-contact">
             <a href="mailto:info@fluenverse.com" className="email-text-link">info@fluenverse.com</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .legal-container {
          background: #ffffff;
          padding-top: 110px;
          padding-bottom: 80px;
          min-height: 70vh;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          box-sizing: border-box;
        }
        .legal-inner {
          width: 100%;
          padding-inline: var(--layout-gutter);
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
        }
        .legal-content {
          max-width: 900px;
          width: 100%;
          color: #1a1f34;
          line-height: 1.6;
          margin: 0;
          padding-inline: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .legal-content > * {
          width: 100%;
        }
        .legal-content h1 {
          font-family: var(--font-display), sans-serif;
          font-size: 2.5rem;
          color: #12051f;
          margin-bottom: 0.5rem;
          text-align: left;
        }
        .last-updated {
          color: #6b7280;
          font-size: 0.9rem;
          margin-bottom: 2.5rem;
          text-align: left;
        }
        .legal-content h2 {
          font-family: var(--font-display), sans-serif;
          font-size: 1.5rem;
          color: #5b47d6;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .legal-content p, .legal-content li {
          font-size: 1.05rem;
          margin-bottom: 1rem;
        }
        .legal-content ul {
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .legal-content a {
          color: #5b47d6;
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .legal-content h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
