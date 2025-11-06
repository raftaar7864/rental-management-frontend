import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Card,
  Spinner,
  Row,
  Col,
  Badge,
  Alert,
} from "react-bootstrap";
import BillService from "../services/BillService";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  FileText,
  CreditCard,
  Search,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  Building2,
  Receipt,
  RefreshCw,
  Copy,
  Info, ShieldCheck, AlertCircle, Mail,
  AlignLeft
} from "lucide-react";

// Simple Typewriter component
function Typewriter({ texts = [], speed = 60, pause = 1200, loop = true, className = "" }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [blink, setBlink] = useState(true);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (!texts.length) return;
    const interval = setInterval(() => {
      if (!reverse) {
        if (subIndex < texts[index].length) setSubIndex((s) => s + 1);
        else {
          setReverse(true);
          clearInterval(interval);
          setTimeout(() => setReverse(true), pause);
        }
      } else {
        if (subIndex > 0) setSubIndex((s) => s - 1);
        else {
          setReverse(false);
          setIndex((i) => (i + 1) % texts.length);
        }
      }
    }, reverse ? Math.max(30, speed / 2) : speed);
    return () => clearInterval(interval);
  }, [subIndex, index, reverse, texts, speed, pause]);

  useEffect(() => {
    const blinkInterval = setInterval(() => setBlink((b) => !b), 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <span className={className} aria-hidden={false}>
      {texts.length ? texts[index].substring(0, subIndex) : ""}
      <span style={{ opacity: blink ? 1 : 0 }}>|</span>
    </span>
  );
}

export default function TenantBills() {
  const [tenantId, setTenantId] = useState("");
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);
  const [copied, setCopied] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const navigate = useNavigate();

  const introTexts = [
    "DB WELLNESS PRIVATE LIMITED — Trusted rental & property management.",
    "Secure billing, instant payments and tenant-first support.",
    "Transparent records. Easy payments. Peace of mind for tenants and owners.",
  ];

  // Stats derived from bills
  const stats = React.useMemo(() => {
    const totalDue = bills.reduce((acc, b) => acc + (b.paymentStatus !== "Paid" ? Number(b.totalAmount || 0) : 0), 0);
    const overdueCount = bills.filter(b => {
      if (!b.dueDate) return false;
      const due = new Date(b.dueDate);
      return b.paymentStatus !== "Paid" && due < new Date();
    }).length;
    const recentlyPaid = bills.filter(b => b.paymentStatus === "Paid").slice(0, 3);
    return { totalDue, overdueCount, recentlyPaid };
  }, [bills]);

  // Normalize tenant id helper
  function normalizeTenantId(input) {
    const trimmed = (input || "").trim().toUpperCase();
    return trimmed ? (trimmed.startsWith("T") ? trimmed : `T${trimmed}`) : "";
  }

  async function fetchBills() {
    setLoading(true);
    setSearched(true);
    setCurrentBill(null);
    setToastMsg(null);
    try {
      let normalizedId = normalizeTenantId(tenantId);

      // If no tenant id provided, CLEAR existing results and show warning
      if (!normalizedId) {
        // clear previous results so stale bills are not shown
        setBills([]);
        setCurrentBill(null);
        setSearched(false);          // no active search results
        setToastMsg({ type: "warning", text: "Please enter a Tenant ID (e.g. T0001 or 0001)." });
        setLoading(false);
        return;
      }

      const params = { tenantId: normalizedId };
      const res = await BillService.getBillsPublic(params);

      if (res && res.length > 0) {
        const sorted = [...res].sort((a, b) => new Date(b.billingMonth) - new Date(a.billingMonth));
        setBills(sorted);
        setCurrentBill(sorted[0]);
        setToastMsg({ type: "success", text: `Found ${sorted.length} bill(s) for ${normalizedId}` });
      } else {
        setBills([]);
        setCurrentBill(null);
        setToastMsg({ type: "info", text: `No bills found for ${normalizedId}` });
      }
      setLastChecked(new Date());
    } catch (err) {
      console.error(err);
      setToastMsg({ type: "danger", text: err.response?.data?.message || "Failed to fetch bills" });
    } finally {
      setLoading(false);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  async function downloadPdf(billId) {
    try {
      const blob = await BillService.getBillPdf(billId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `bill_${billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setToastMsg({ type: "danger", text: "Failed to download PDF" });
    }
  }

  function copyTenantId() {
    const id = normalizeTenantId(tenantId);
    if (!id) {
      setToastMsg({ type: "warning", text: "Nothing to copy — enter a Tenant ID first." });
      return;
    }
    navigator.clipboard?.writeText(id).then(() => {
      setCopied(true);
      setToastMsg({ type: "success", text: `${id} copied to clipboard` });
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const previousBills = bills.length > 1 ? bills.slice(1, 4) : [];
  // If you prefer to centralize, use these JS style objects (paste above the component)
// required style objects (place above the footer JSX in the same file)
const footerLinkStyle = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  textDecoration: "none",
  color: "#212529",
  padding: "6px 8px",
  borderRadius: 8,
  transition: "all .15s ease",
};
const footerLinkText = { fontWeight: 600, fontSize: "0.95rem", marginRight: 8 };
const footerLinkHint = { fontSize: "0.78rem", color: "#6c757d", marginTop: 2 };


  return (
    <div style={{ background: "#f4f7fb", minHeight: "100vh", paddingTop: "60px" }}>
      <Container className="pb-5 text-center">

        {/* Typewriter intro */}
        <p
          className="mb-0 golden-typewriter"
          style={{
            minHeight: 26,
            fontWeight: "700",
            fontSize: "1.08rem",
            letterSpacing: "0.4px",
            marginBottom: 14
          }}
          aria-hidden={false}
        >
          <Typewriter texts={introTexts} speed={45} pause={1400} />
        </p>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-3">
          <img
            src="https://pub-06b02bc70d584ecab7ff7b2f8384dc0e.r2.dev/assets/home.gif"
            alt="Tenant Dashboard"
            style={{ width: 86, marginBottom: 8 }}
          />
          <h2 className="fw-bold text-primary">
            <Home size={22} className="me-2" />
            Tenant Billing Portal
          </h2>
          <p className="text-muted mb-0 mt-2" style={{ fontSize: "0.95rem" }}>
            Enter your Tenant ID to view bills, download invoices, and pay quickly and securely.
          </p>
        </motion.div>

        {/* Search + quick actions */}
        <motion.div className="mx-auto mb-3" style={{ maxWidth: 680 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-3 shadow-sm border-0 rounded-4">
            <Form onSubmit={(e) => { e.preventDefault(); fetchBills(); }}>
              <Row className="align-items-center g-2">
                <Col xs={8} sm={9}>
                  <Form.Control
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    placeholder="Enter Tenant ID (e.g. T0001 or 0001)"
                    aria-label="Tenant ID"
                    className="rounded-3 text-left"
                    style={{ fontSize: "1.05rem", letterSpacing: "0.5px", height: "45px" }}
                  />
                </Col>

                <Col xs={4} sm={3} className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-100 fw-semibold rounded-3"
                    disabled={loading}
                    aria-label="Search bills"
                    style={{ height: "45px" }}
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : <Search size={18} />}
                  </Button>

                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => {
                    setTenantId("");
                    setBills([]);
                    setCurrentBill(null);
                    setSearched(false);
                    setToastMsg(null);
                  }}
                >
                  Clear
                </Button>
                </Col>
              </Row>
            </Form>

            <Row className="mt-3 gx-2">
              <Col md={8} className="text-start">
                <small className="text-muted">Tip: Tenant ID is printed on your welcome letter and rent receipts.</small>
                <div className="d-flex gap-2 mt-2">

                </div>
              </Col>
              <Col md={4} className="text-end">
                <small className="text-muted">
                  Last checked: {lastChecked ? new Date(lastChecked).toLocaleString() : "—"}
                </small>
                <Button title="Refresh" variant="link" onClick={() => { if (tenantId) fetchBills(); }} aria-label="Refresh">
                  <RefreshCw size={18} />
                </Button>
              </Col>
            </Row>
          </Card>
        </motion.div>


        {/* Results */}
        <AnimatePresence>
          {searched && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Current Bill */}
              {currentBill ? (
                <Card
                  className="shadow-lg border-0 rounded-4 p-4 text-start mx-auto"
                  style={{ maxWidth: 700, background: "#ffffff" }}
                >
                  <Row>
                    <Col sm={8}>
                      <h5 className="fw-bold text-primary mb-1">
                        <Receipt size={18} className="me-2" />
                        Current Bill -{" "}
                        {new Date(currentBill.billingMonth).toLocaleString("default", {
                          month: "long",
                          year: "numeric",
                        })}
                      </h5>
                      <p className="text-muted mb-1">
                        <Building2 size={14} className="me-1" />
                        {currentBill.building?.name || "Building"} — Room{" "}
                        {currentBill.room?.number || "N/A"}
                      </p>
                        <p className="text-muted mb-2">
                          <User size={14} className="me-1" />
                          {currentBill.tenant?.fullName ||
                            currentBill.tenantName ||
                            "Tenant Name Not Available"}
                        </p>
                        <p className="text-muted mb-2">
                          <Badge bg="secondary">
                            ID: {currentBill.tenant?.tenantId || tenantId || "N/A"}
                          </Badge>
                        </p>
                          {currentBill.paymentStatus === "Paid" && (
                            <>
                              <p className="text-muted mb-1">
                                <strong>Paid Date:</strong>{" "}
                                {currentBill.payment?.paidAt
                                  ? new Date(currentBill.payment.paidAt).toLocaleString()
                                  : "N/A"}
                              </p>
                              <p className="text-muted mb-2">
                                <strong>Reference ID:</strong>{" "}
                                {currentBill.payment?.reference || currentBill.paymentRef || "N/A"}
                              </p>
                            </>
                          )}


                    </Col>
                    <Col
                      sm={4}
                      className="d-flex flex-column align-items-end justify-content-between text-end"
                    >
                      <div>
                        <h4 className="fw-bold text-dark mb-1">
                          ₹{Number(currentBill.totalAmount).toFixed(0)}
                        </h4>
                        <Badge
                          bg={currentBill.paymentStatus === "Paid" ? "success" : "warning"}
                          className="mb-2"
                        >
                          {currentBill.paymentStatus || "Pending"}
                        </Badge>

                        {/* ✅ Paid Date and Reference ID (only if available) */}
                        {currentBill.paymentStatus === "Paid" && (
                          <>
                            {currentBill.paidDate && (
                              <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                                Paid on: {new Date(currentBill.paidDate).toLocaleDateString()}
                              </p>
                            )}
                            {currentBill.referenceId && (
                              <p className="text-muted mb-2" style={{ fontSize: "0.85rem" }}>
                                Ref ID: {currentBill.referenceId}
                              </p>
                            )}
                          </>
                        )}
                      </div>

                      {/* ✅ Action Buttons - PDF on left, Pay Now on right */}
                      <div className="d-flex justify-content-end mt-2">
                        <Button
                          variant="outline-secondary"
                          className="me-2"
                          onClick={() => downloadPdf(currentBill._id)}
                        >
                          <FileText size={16} className="me-1" /> PDF
                        </Button>

                        {currentBill.paymentStatus !== "Paid" && (
                          <Button
                            variant="success"
                            onClick={() => navigate(`/payment/public/${currentBill._id}`)}
                          >
                            <CreditCard size={16} className="me-1" /> Pay Now
                          </Button>
                        )}
                      </div>
                    </Col>

                    </Row>
                </Card>
              ) : (
                <p className="text-muted">No current bill found.</p>
              )}

              {/* Previous Bills */}
              {bills.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-5 text-start mx-auto"
                  style={{ maxWidth: 700 }}
                >
                  <h5 className="text-primary fw-bold mb-3">
                    <Clock size={18} className="me-2" /> Previous Payment History
                  </h5>
                  {bills.slice(1).map((bill) => (
                    <Card
                      key={bill._id}
                      className="shadow-sm border-0 p-3 mb-3 rounded-3 hover-shadow"
                      style={{
                        borderLeft: `5px solid ${
                          bill.paymentStatus === "Paid" ? "#28a745" : "#ffc107"
                        }`,
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "scale(1.02)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                      }
                    >
                      <Row>
                        <Col sm={8}>
                          <strong>
                            {new Date(bill.billingMonth).toLocaleString("default", {
                              month: "long",
                              year: "numeric",
                            })}
                          </strong>
                          <p className="text-muted mb-1">
                            {bill.building?.name || "Building"} — Room{" "}
                            {bill.room?.number || "N/A"}
                          </p>
                          <p className="text-muted mb-2">
                            <User size={14} className="me-1" />
                            {bill.tenant?.fullName || bill.tenantName || "Tenant Name Not Available"}
                            <Badge bg="secondary" className="ms-2">
                              ID: {bill.tenant?.tenantId || tenantId || "N/A"}
                            </Badge>
                          </p>
                          <p className="mb-0">
                            ₹{Number(bill.totalAmount).toFixed(0)} —{" "}
                            {bill.paymentStatus === "Paid" ? (
                              <CheckCircle size={15} color="green" className="me-1" />
                            ) : (
                              <XCircle size={15} color="orange" className="me-1" />
                            )}
                            <strong>{bill.paymentStatus || "Pending"}</strong>
                          </p>
                          {bill.paymentStatus === "Paid" && (
                            <small className="text-muted d-block mt-1">
                              Paid: {" "}
                              {bill.payment?.paidAt
                                ? new Date(bill.payment.paidAt).toLocaleString()
                                : "N/A"} {" "}
                              | Ref: {bill.payment?.reference || bill.paymentRef || "N/A"}
                            </small>
                          )}
                        </Col>
                        <Col
                          sm={4}
                          className="d-flex justify-content-end align-items-center"
                        >
                          {/* Always show PDF */}
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => downloadPdf(bill._id)}
                          >
                            <FileText size={14} className="me-1" /> PDF
                          </Button>

                          {/* Show Pay Now only if NOT paid */}
                          {bill.paymentStatus !== "Paid" && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => navigate(`/payment/public/${bill._id}`)}
                            >
                              <CreditCard size={14} className="me-1" /> Pay Now
                            </Button>
                          )}
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick help + FAQ */}
{/* Quick help + FAQ — hide when a bill is open (currentBill present) */}
{!currentBill && (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ delay: 0.2 }}
    className="mx-auto mt-4"
    style={{ maxWidth: 920 }}
  >
    <Row className="g-3">
      <Col md={6}>
        <Card className="p-3 shadow-sm border-0">
          <h6 className="mb-2">How to find your Tenant ID</h6>
          <ul className="mb-0" style={{ textAlign: "left" }}>
            <li>Check your welcome letter or rent agreement.</li>
            <li>We have shared ID via WhatsApp & E-mail</li>
            <li>Contact us if unsure — we can share the ID.</li>
          </ul>
          <hr />
          <small className="text-muted">
            If you still can't find it, click <strong>Contact support</strong> (top-right)
          </small>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="p-3 shadow-sm border-0">
          <h6 className="mb-2">Why pay via this portal?</h6>
          <ul className="mb-0" style={{ textAlign: "left" }}>
            <li>Instant, secure Razorpay payments with receipt generation.</li>
            <li>One-click PDF download for records and your purposes.</li>
            <li>Transparent history so you can track payments & references.</li>
          </ul>
          <hr />
          <small className="text-muted">Tip: Save the PDF receipt after payment for quicker reconciliations.</small>
        </Card>
      </Col>
    </Row>
  </motion.div>
        )}

        {/* Redesigned Footer (Left Aligned) */}
        <footer
          style={{
            marginTop: "60px",
            padding: "36px 20px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
        marginBottom: -50
          }}
        >
          <div
            style={{
              maxWidth: "1100px",
              margin: "0 auto",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "flex-start", // ✅ Left align
              textAlign: "left", // ✅ Force left text alignment
              gap: "40px",
              flexWrap: "wrap",
            }}
          >
            {/* Left: company info */}
            <div
              style={{
                flex: "1 1 520px",
                minWidth: "280px",
                color: "#495057",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
                textAlign: "left", // ✅ left align content
              }}
            >
              <div>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "1.08rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center", // ✅ proper flex alignment
                    justifyContent: "flex-start", // ✅ ensure left align
                    gap: "10px",
                    textAlign: "left",
                  }}
                >
                  <span
                    className="golden-shimmer"
                    style={{
                      display: "inline-block",
                      letterSpacing: "0.3px",
                    }}
                  >
                    DB WELLNESS PRIVATE LIMITED
                  </span>
                </h4>

                <div
                  style={{
                    marginTop: "8px",
                    color: "#6c757d",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    textAlign: "left",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      color: "#343a40",
                      marginBottom: 6,
                      textAlign: "left",
                    }}
                  >
                    Rental Management Syatem
                  </strong>

                  <p style={{ margin: "0 0 8px 0", textAlign: "left" }}>
                    We deliver simple, secure and transparent rental billing for tenants and property owners.
                    Instant Razorpay payments, downloadable invoices, and tenant-focused support help you stay organized.
                  </p>

                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      color: "#6c757d",
                      fontSize: "0.92rem",
                      marginTop: 8,
                      textAlign: "left",
                    }}
                  >
                    <li>Automated monthly billing & receipts</li>
                    <li>Secure online payments with transaction references</li>
                    <li>Tenant & owner portals for easy record access</li>
                  </ul>
                </div>
              </div>

              {/* Contact / registration / hours block */}
              <div
                style={{
                  display: "flex",
                  gap: "18px",
                  flexWrap: "wrap",
                  alignItems: "flex-start",
                  justifyContent: "flex-start", // ✅ all boxes start from left
                  textAlign: "left",
                }}
              >
                {/* Address */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    minWidth: 180,
                    textAlign: "left",
                  }}
                >
                  <div style={{ color: "#0d6efd", marginTop: 3 }}>
                    <Building2 size={18} />
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#6c757d", textAlign: "left" }}>
                    <div style={{ fontWeight: 600, color: "#343a40" }}>Registered Office</div>
                    <div style={{ marginTop: 3 }}>J.L. NO 89, PLOT NO. 165, L R KHATIAN, NO. 441, MOUJA KANTABELE,<br/> P.S. KALYANI, NADIA, Nadia, West Bengal, India, PIN: 741245</div>
                                <div style={{ marginTop: 8, fontSize: "0.85rem", color: "#6c757d" }}>
                      <span style={{ verticalAlign: "middle" }}>
                        CIN: <strong style={{ color: "#343a40" }}>U24230WB2019PTC234670</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    minWidth: 180,
                    textAlign: "left",
                  }}
                >
                  <div style={{ color: "#0d6efd", marginTop: 3 }}>
                    <User size={18} />
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#6c757d", textAlign: "left" }}>
                    <div style={{ fontWeight: 600, color: "#343a40" }}>Contact</div>
                    <div style={{ marginTop: 3 }}>
                      Phone:{" "}
                      <a
                        href="tel:+919971699942"
                        style={{ color: "#0d6efd", textDecoration: "none" }}
                      >
                        +91 99716 99942
                      </a>
                      <br />
                      Email:{" "}
                      <a
                        href="mailto:bill@drbiswasgroup.com"
                        style={{ color: "#0d6efd", textDecoration: "none" }}
                      >
                        bill@drbiswasgroup.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hours + Registration */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    minWidth: 180,
                    textAlign: "left",
                  }}
                >
                </div>
              </div>
            </div>

            {/* Right: legal links */}
            <div style={{ flex: "0 0 260px", minWidth: "200px", textAlign: "left" }}>
              <h6 style={{ marginBottom: "12px", fontSize: "0.95rem", color: "#343a40", fontWeight: "600" }}>
                Legal & Support
              </h6>

              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                <li>
                  <Link to="/about" style={footerLinkStyle}>
                    <Info size={16} /> <span style={footerLinkText}>About Us</span>
                    <div style={footerLinkHint} >Who we are</div>
                  </Link>
                </li>
                <li>
                  <Link to="/terms-and-conditions" style={footerLinkStyle}>
                    <FileText size={16} /> <span style={footerLinkText}>Terms & Conditions</span>
                    <div style={footerLinkHint}>Usage & rules</div>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" style={footerLinkStyle}>
                    <ShieldCheck size={16} /> <span style={footerLinkText}>Privacy Policy</span>
                    <div style={footerLinkHint}>How we use data</div>
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" style={footerLinkStyle}>
                    <AlertCircle size={16} /> <span style={footerLinkText}>Refund & Cancellation</span>
                    <div style={footerLinkHint}>Return & cancel policy</div>
                  </Link>
                </li>
                <li>
                  <a href="/contact" style={footerLinkStyle}>
                    <Mail size={16} /> <span style={footerLinkText}>Contact</span>
                    <div style={footerLinkHint}>Get support</div>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </Container>
    </div>
  );
}
