import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Privacy() {
  useEffect(() => { document.title = "RideBuddy — Privacy Policy"; }, []);

  return (
    <div className="legal-wrapper">
      <div className="legal-card fade-up">
        <p className="brand">RIDEBUDDY</p>
        <h2>Privacy Policy</h2>
        <p className="legal-date">Last updated: September 2026</p>

        <section>
          <h3>1. Introduction</h3>
          <p>
            RideBuddy ("we", "us", "our") is committed to protecting your personal information.
            This Privacy Policy explains what data we collect, how we use it, and your rights
            regarding that data.
          </p>
        </section>

        <section>
          <h3>2. Data We Collect</h3>
          <ul>
            <li><strong>Account information:</strong> your name and email address when you register.</li>
            <li><strong>Ride data:</strong> pickup and drop-off locations, travel dates and times you enter when requesting a ride.</li>
            <li><strong>Usage data:</strong> basic interaction logs (e.g., login times) to maintain service quality.</li>
          </ul>
        </section>

        <section>
          <h3>3. How We Use Your Data</h3>
          <ul>
            <li>To match you with compatible ride partners.</li>
            <li>To operate, maintain, and improve the RideBuddy platform.</li>
            <li>To communicate service updates or important notices.</li>
            <li>To enforce our Terms &amp; Conditions and prevent misuse.</li>
          </ul>
        </section>

        <section>
          <h3>4. Data Sharing</h3>
          <p>
            We do not sell your personal data. We only share information with third parties
            when necessary to operate the service (e.g., Firebase for authentication and
            database hosting) or when required by law.
          </p>
        </section>

        <section>
          <h3>5. Data Retention</h3>
          <p>
            We retain your account data for as long as your account is active. Ride requests
            are automatically expired and cleaned up after their travel date has passed. You
            may request deletion of your account and associated data at any time.
          </p>
        </section>

        <section>
          <h3>6. Security</h3>
          <p>
            We use industry-standard measures, including Firebase Authentication and secure
            HTTPS connections, to protect your data. However, no system is perfectly secure,
            and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h3>7. Your Rights</h3>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Withdraw consent at any time (which may require closing your account).</li>
          </ul>
        </section>

        <section>
          <h3>8. Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant
            changes via the app or email. Continued use of RideBuddy after changes are posted
            means you accept the updated policy.
          </p>
        </section>

        <section>
          <h3>9. Contact</h3>
          <p>
            If you have questions or requests regarding your data, please contact us through
            the app or at the contact information provided on our website.
          </p>
        </section>

        <div className="legal-back">
          <Link to="/signup">← Back to Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
