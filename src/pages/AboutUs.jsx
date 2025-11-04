import React from "react";
import { Container, Card } from "react-bootstrap";

const AboutUs = () => {
  return (
    <Container className="py-2">

        <h2 className="mb-4">About Us</h2>
        <p>
          Welcome to <strong>{import.meta.env.VITE_COMPANY_NAME}</strong>, 
          your trusted partner in rental and property management solutions.
        </p>
        <p>
          We aim to simplify the management of tenants, rooms, and billing with 
          user-friendly digital tools. Our mission is to deliver transparency, 
          convenience, and peace of mind to both tenants and property managers.
        </p>
        <p>
          With seamless Razorpay integration, automated billing, and secure record 
          handling, we’re building a modern, efficient platform for property management.
        </p>
        <p>
          <strong>Our Values:</strong> Trust • Innovation • Simplicity • Transparency
        </p>

    </Container>
  );
};

export default AboutUs;
