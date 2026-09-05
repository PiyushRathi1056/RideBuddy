import { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Terms() {
  useEffect(() => { document.title = "RideBuddy — Terms & Conditions"; }, []);

  return (
    <div className="legal-wrapper">
      <div className="legal-card fade-up">
        <p className="brand">RIDEBUDDY</p>
        <h2>Terms &amp; Conditions</h2>
        <p className="legal-date">Last updated: September 2026</p>

        <section>
          <h3>1. Acceptance of Terms</h3>
          <p>
            By creating an account or using RideBuddy, you agree to be bound by these Terms &amp;
            Conditions. If you do not agree, please do not use the service.
          </p>
        </section>

        <section>
          <h3>2. Description of Service</h3>
          <p>
            RideBuddy is a ride-matching platform that connects users traveling similar routes so
            they can share rides. We do not operate vehicles, employ drivers, or act as a
            transportation provider.
          </p>
        </section>

        <section>
          <h3>3. Eligibility</h3>
          <p>
            You must be at least 18 years old to use RideBuddy. By signing up, you confirm that
            you meet this requirement and that the information you provide is accurate.
          </p>
        </section>

        <section>
          <h3>4. User Responsibilities</h3>
          <p>You agree to:</p>
          <ul>
            <li>Provide accurate and truthful information when creating your account.</li>
            <li>Treat other users with respect and not engage in harassment or abuse.</li>
            <li>Not use the platform for any unlawful purpose.</li>
            <li>Keep your login credentials secure and not share them with others.</li>
          </ul>
        </section>

        <section>
          <h3>5. Ride Matching</h3>
          <p>
            RideBuddy matches users based on route and timing preferences. We do not guarantee
            a match for every request. All arrangements between matched users are made independently,
            and RideBuddy is not responsible for the conduct of any user during a shared ride.
          </p>
        </section>

        <section>
          <h3>6. Limitation of Liability</h3>
          <p>
            RideBuddy provides this service "as is." To the maximum extent permitted by applicable
            law, we are not liable for any damages arising from your use of the platform, including
            incidents occurring during a matched ride.
          </p>
        </section>

        <section>
          <h3>7. Termination</h3>
          <p>
            We reserve the right to suspend or terminate any account that violates these terms or
            that we determine, at our sole discretion, poses a risk to the community.
          </p>
        </section>

        <section>
          <h3>8. Changes to These Terms</h3>
          <p>
            We may update these Terms from time to time. Continued use of RideBuddy after changes
            are posted constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h3>9. Contact</h3>
          <p>
            For questions about these Terms, please reach out to us through the app or at the
            contact information provided on our website.
          </p>
        </section>

        <div className="legal-back">
          <Link to="/signup">← Back to Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
