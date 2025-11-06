// src/pages/ContactUs.jsx
import React, { useState, useRef } from "react";
import { Container, Card, Form, Button, Spinner } from "react-bootstrap";
import ReCAPTCHA from "react-google-recaptcha";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ContactUs = () => {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [recaptchaValue, setRecaptchaValue] = useState(null);
  const recaptchaRef = useRef(null);

  const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recaptchaValue) {
      toast.error("Please complete the reCAPTCHA.");
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          recaptchaToken: recaptchaValue,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Your message has been sent!");
        setFormData({ name: "", email: "", message: "" });
        // reset recaptcha
        recaptchaRef.current?.reset();
        setRecaptchaValue(null);
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error("Contact submit error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-2">
        <h2 className="mb-4">Contact Us</h2>
        <p>Have a question? Fill out the form below and we’ll get back to you.</p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Your Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control as="textarea" rows={4} name="message" value={formData.message} onChange={handleChange} required />
          </Form.Group>

          <div className="mb-3">
            {!SITE_KEY ? (
              <div style={{ color: "orange" }}>
                reCAPTCHA site key not set. Set <code>VITE_RECAPTCHA_SITE_KEY</code> in your frontend .env.
              </div>
            ) : (
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={SITE_KEY}
                onChange={(token) => setRecaptchaValue(token)}
                onExpired={() => setRecaptchaValue(null)}
              />
            )}
          </div>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Send Message"}
          </Button>
        </Form>
        <hr className="my-4" />
        <p>
          📧 <strong>Email:</strong> bank@drbiswasgroup.com<br />
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
      <ToastContainer position="top-right" autoClose={2500} />
    </Container>
  );
};

export default ContactUs;


