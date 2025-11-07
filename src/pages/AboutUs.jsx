import React from "react";
import { Container, Card } from "react-bootstrap";

const AboutUs = () => {
  return (
    <Container className="py-2">

    <h2 className="mb-4">About Us</h2>

    <p>
      Welcome to <strong>{import.meta.env.VITE_COMPANY_NAME}</strong> — a platform we personally built 
      to make rental payments and property management simpler, faster, and more transparent for my tenants.
    </p>

    <p>
      As a property owner, We understand the everyday challenges tenants face when it comes to paying rent 
      or tracking their monthly bills. That’s why we created this online system — to make the entire process 
      effortless, secure, and fully transparent. Through this portal, tenants can easily view their bills, 
      make payments online, and instantly download invoices — all in one place.
    </p>

    <p>
      We personally manage the renting of rooms and the collection of rent every month. The system ensures 
      every payment is properly recorded, and both tenants and We receive clear, organized records. With 
      <strong> Razorpay integration</strong>, each transaction is processed safely and instantly, without 
      confusion or delay.
    </p>

    <p>
      This service is designed entirely for tenants within India — we accept payments only in Indian Rupees (INR). 
      We do not collect or process international payments.
    </p>

    <p>
      My goal has always been to build a transparent and trustworthy relationship with every tenant — 
      one where payments are simple, records are accessible, and communication is open. This platform 
      is an extension of that belief.
    </p>

    <p>
      <strong>{import.meta.env.VITE_COMPANY_NAME}</strong> stands on four key values: 
      <strong> Trust, Transparency, Simplicity, and Reliability.</strong>
    </p>

    <p style={{ marginTop: "10px" }}>
      Thank you for being a part of this journey. Together, we’re making rental management 
      smarter, smoother, and stress-free — one payment at a time.
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

export default AboutUs;
