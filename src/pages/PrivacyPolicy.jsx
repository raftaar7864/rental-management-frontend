import React from "react";
import { Container, Card } from "react-bootstrap";


const PrivacyPolicy = () => {

  return (
    <Container className="py-2">
        <h2 className="mb-4">Privacy Policy</h2>
        <p>
          <strong>Last updated:</strong> {new Date().toLocaleDateString()}
        </p>
        <p>
          Welcome to <strong>{import.meta.env.VITE_COMPANY_NAME}</strong>. 
          Your privacy is important to us. This Privacy Policy explains how we collect, 
          use, and safeguard your personal information when you visit our website or 
          use our services.
        </p>

        <h5>1. Information We Collect</h5>
        <p>
          We may collect personal details such as your name, email address, phone number, 
          billing address, and payment details when you register or make a payment through Razorpay.
        </p>

        <h5>2. How We Use Your Information</h5>
        <ul>
          <li>To process your payments and generate invoices</li>
          <li>To communicate updates, receipts, or service changes</li>
          <li>To improve our website and services</li>
        </ul>

        <h5>3. Data Protection</h5>
        <p>
          We follow industry-standard security measures to protect your information. 
          Payment data is handled securely by Razorpay and is not stored on our servers.
        </p>

        <h5>4. Sharing of Information</h5>
        <p>
          We do not sell, rent, or trade your personal information. We may share 
          data only with trusted third-party service providers (like Razorpay) 
          strictly for payment processing and communication.
        </p>

        <h5>5. Contact</h5>
        <p>
          If you have any questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:bank@drbiswasgroup.com">bank@drbiswasgroup.com</a>.
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
};

export default PrivacyPolicy;

