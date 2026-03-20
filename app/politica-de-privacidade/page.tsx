"use client";
/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import { PUBLIC_ASSETS } from "@/lib/public-assets";

export default function PrivacyPolicy() {
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
            <h1>Privacy Policy</h1>
            <p className="last-updated">Last updated: March 12, 2026</p>

          <p>
            <strong>Fluenverse</strong> ("we", "our", "us") values your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and English conversation session services.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly when interacting with our platform, such as:</p>
          <ul>
            <li>Full name;</li>
            <li>Email address;</li>
            <li>Contact phone number (WhatsApp);</li>
            <li>English learning goals and current proficiency level.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>The collected information is used exclusively to:</p>
          <ul>
            <li>Schedule and deliver one-on-one conversation sessions;</li>
            <li>Contact you for technical support or scheduling notifications;</li>
            <li>Improve our services and personalize your learning experience;</li>
            <li>Comply with legal obligations or respond to legal proceedings.</li>
          </ul>

          <h2>3. Data Sharing</h2>
          <p>
            We do not sell, rent, or share your personal information with third parties for commercial or marketing purposes. Your data is accessed only by Fluenverse's internal team to provide the contracted service.
          </p>

          <h2>4. Security</h2>
          <p>
            We implement technical and organizational security measures to protect your data against unauthorized access, loss, or alteration. Although no system is 100% secure, we continuously work to preserve the integrity of your information.
          </p>

          <h2>5. Cookies and Tracking Technologies</h2>
          <p>
            Our website uses cookies and analytics tools (such as Google Analytics and Facebook Pixel) to understand how users interact with the site, helping us improve navigation and communication effectiveness.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            In accordance with Brazil's General Data Protection Law (LGPD), you have the right to request access, correction, anonymization, or deletion of your personal data at any time. To exercise these rights, contact us at: <a href="mailto:info@fluenverse.com">info@fluenverse.com</a>.
          </p>

            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. We recommend reviewing this page regularly to stay informed about any changes.
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
