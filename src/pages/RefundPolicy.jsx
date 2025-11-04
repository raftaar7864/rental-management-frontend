import React from "react";
import { Container, Card } from "react-bootstrap";

const RefundPolicy = () => {
  return (
    <Container className="py-2">

        <h2 className="mb-4">Refund & Cancellation Policy</h2>
        <p>
          <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
        </p>

        <h5>1. Payments</h5>
        <p>
          All payments made through Razorpay on our website are confirmed only after 
          successful transaction processing and receipt generation.
        </p>

        <h5>2. Refund Policy</h5>
        <p>
          Refunds are applicable only under specific circumstances such as duplicate 
          payments or transaction errors. Once a payment is confirmed for a valid 
          service, it is generally non-refundable.
        </p>

        <h5>3. Cancellation Policy</h5>
        <p>
          Orders or service requests can be cancelled within 24 hours of placement, 
          provided the service hasn’t been initiated. Please contact us immediately 
          for assistance.
        </p>

        <h5>4. Contact for Refunds</h5>
        <p>
          To request a refund or cancellation, please email{" "}
          <a href="mailto:bank@drbiswasgroup.com">bank@drbiswasgroup.com</a> with your 
          transaction ID and payment details. We will process eligible refunds 
          within 7–10 business days.
        </p>
    </Container>
  );
};

export default RefundPolicy;
