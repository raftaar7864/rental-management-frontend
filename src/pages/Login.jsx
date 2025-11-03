import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";

// Redesigned Login component
// - Removed "Forgot password"
// - Responsive 2-column layout (illustration + form) on desktop, stacked on mobile
// - Clean, accessible form with focused styling and subtle animation
// - Keeps existing AuthContext login behavior and role-based redirect

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emailRef = useRef(null);

  useEffect(() => {
    // autofocus on desktop
    const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
    if (!isMobile) setTimeout(() => emailRef.current?.focus?.(), 120);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await login(email, password, { remember });
      const role = (data?.user?.role || "").toLowerCase();
      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "manager") navigate("/manager/dashboard");
      else navigate("/");
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <motion.div
        className="login-wrapper"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Card className="shadow-sm overflow-hidden" style={{ maxWidth: 920, borderRadius: 12 }}>
          <Row className="g-0">
            {/* Left visual column - hidden on small screens */}
            <Col md={5} className="d-none d-md-flex bg-gradient align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg,#0d6efd22,#19875411)' }}>
              <div className="text-center px-3">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=60&auto=format&fit=crop"
                  alt="office illustration"
                  style={{ width: '100%', maxWidth: 260, borderRadius: 8 }}
                />
                <h4 className="mt-3 mb-0">Rental Admin</h4>
                <p className="text-muted small">Manage buildings, rooms and tenants with ease.</p>
              </div>
            </Col>

            {/* Right form column */}
            <Col xs={12} md={7} className="p-4">
              <div className="d-flex flex-column h-100">
                <div className="mb-3 text-center text-md-start">
                  <h3 className="mb-1">Welcome back</h3>
                  <div className="text-muted">Sign in to your Rental Admin account</div>
                </div>

                <Form onSubmit={handleSubmit} className="mt-2" noValidate>
                  {error && (
                    <div className="alert alert-danger py-2" role="alert">{error}</div>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label className="small text-muted d-flex align-items-center gap-2">
                      <Mail size={14} /> Email
                    </Form.Label>
                    <Form.Control
                      ref={emailRef}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      required
                      aria-label="Email"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <label className="small text-muted d-flex align-items-center gap-2 mb-0"><Lock size={14} /> Password</label>
                    </div>

                    <div className="input-group">
                      <Form.Control
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        aria-label="Password"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPw((s) => !s)}
                        aria-pressed={showPw}
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </Form.Group>

                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <Form.Check
                      type="checkbox"
                      id="rememberMe"
                      label="Remember me"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />
                    {/* Forgot password intentionally removed per request */}
                  </div>

                  <div className="d-grid">
                    <Button variant="primary" type="submit" disabled={loading} className="d-flex align-items-center justify-content-center gap-2">
                      {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : <LogIn size={16} />}
                      <span>{loading ? 'Signing in...' : 'Sign in'}</span>
                    </Button>
                  </div>

                  <div className="mt-3 text-center small text-muted">Only Admins and Managers can sign in here.</div>
                </Form>

                <footer className="mt-auto pt-3 text-center text-muted small">© {new Date().getFullYear()} Rental Manager</footer>
              </div>
            </Col>
          </Row>
        </Card>
      </motion.div>
    </div>
  );
}
