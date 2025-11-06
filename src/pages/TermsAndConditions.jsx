import React from "react";
import { Container, Card } from "react-bootstrap";

export default function TermsAndConditions() {
  return (
      <Container className="py-2">
            <h2 className="mb-4">
              Terms & Conditions
            </h2>
            <p className="mb-4">
              Please read these terms carefully before using our platform.
            </p>

            <h5 className="fw-semibold mt-4">1. Acceptance of Terms</h5>
            <p>
              By accessing or using our website and services, you agree to be
              bound by these Terms and Conditions, our Privacy Policy, and any
              additional policies that may apply.
            </p>

            <h5 className="fw-semibold mt-4">2. Use of Services</h5>
            <p>
              You agree to use our services only for lawful purposes and in a
              manner that does not infringe the rights of others. Misuse,
              unauthorized access, or fraudulent activities are strictly
              prohibited.
            </p>

            <h5 className="fw-semibold mt-4">3. Account Responsibilities</h5>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and all activities that occur under your
              account. Please notify us immediately if you suspect unauthorized
              access.
            </p>

            <h5 className="fw-semibold mt-4">4. Payments and Billing</h5>
            <p>
              All payments made through our platform are processed securely.
              Once a payment is confirmed, refunds are governed by our{" "}
              <a href="/refund-policy" className="text-decoration-none">
                Refund Policy
              </a>
              .
            </p>

            <h5 className="fw-semibold mt-4">5. Intellectual Property</h5>
            <p>
              All content, trademarks, and materials on this website are owned
              by or licensed to our company. You may not copy, reproduce, or
              distribute any part of the website without prior written consent.
            </p>

            <h5 className="fw-semibold mt-4">6. Limitation of Liability</h5>
            <p>
              We are not liable for any direct, indirect, or consequential
              damages arising from the use of our platform. Use our services at
              your own risk.
            </p>

            <h5 className="fw-semibold mt-4">7. Termination</h5>
            <p>
              We reserve the right to suspend or terminate user access at our
              discretion if any terms are violated.
            </p>

            <h5 className="fw-semibold mt-4">8. Changes to These Terms</h5>
            <p>
              We may modify these terms from time to time. Any changes will be
              effective immediately upon posting on this page. Continued use of
              the website constitutes acceptance of the new terms.
            </p>

            <h5 className="fw-semibold mt-4">9. Contact Us</h5>
            <p>
              For any questions or concerns about these terms, please contact us
              via our{" "}
              <a href="/contact" className="text-decoration-none">
                Contact Us
              </a>{" "}
              page.
            </p>

            <p className="mt-4 text-muted text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
                 {/* Digital Stamp */}
          <div
            style={{
              position: "absolute",
              bottom: "52px",
              right: "15px",
              opacity: 0.19,
              border: "3px solid #007bff",
              borderRadius: "50%",
              padding: "10px 20px",
              transform: "rotate(-10deg)",
              fontWeight: "700",
              color: "#007bff",
              fontSize: "0.9rem",
              textAlign:"center",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              fontFamily: "monospace",
              paddingBottom: "20px" 
            }}
          >
            DB WELLNESS<br />PRIVATE LIMITED
          </div>
      </Container>
  );
}

