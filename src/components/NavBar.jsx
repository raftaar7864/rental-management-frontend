import React, { useState, useContext, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Navbar, Nav, Container, Button, Offcanvas, Badge, Dropdown } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaSignOutAlt, FaSignInAlt, FaUserCircle, FaBars, FaBell } from "react-icons/fa";

/**
 * Animated SVG clipart components — lightweight, inline, accessible
 * - BuildingIcon: small office/building
 * - KeyIcon: key for access/locks
 * - CoinIcon: coin for payments
 *
 * Each is a motion.svg with bobbing animation and hover scale.
 */

const floatAnim = (delay = 0) => ({
  animate: { y: [0, -6, 0] },
  transition: { duration: 2.6, ease: "easeInOut", repeat: Infinity, repeatType: "loop", delay },
  whileHover: { scale: 1.12 },
});

const IconWrapper = ({ children, label }) => (
  <motion.span
    title={label}
    aria-label={label}
    style={{ display: "inline-flex", marginRight: 8, alignItems: "center", justifyContent: "center" }}
  >
    {children}
  </motion.span>
);

const BuildingIcon = ({ size = 28, delay = 0 }) => (
  <IconWrapper label="Buildings">
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "#0d6efd" }}
      {...floatAnim(delay)}
    >
      <title>Buildings</title>
      <rect x="3" y="3" width="7" height="18" rx="1.2" ry="1.2" fill="rgba(13,110,253,0.08)" />
      <rect x="14" y="7" width="7" height="14" rx="1.2" ry="1.2" fill="rgba(13,110,253,0.06)" />
      <path d="M7 3v18" stroke="rgba(13,110,253,0.22)" />
      <g stroke="rgba(13,110,253,0.6)">
        <path d="M5.5 9h2" />
        <path d="M5.5 13h2" />
        <path d="M16.5 10h2" />
        <path d="M16.5 14h2" />
      </g>
    </motion.svg>
  </IconWrapper>
);

const KeyIcon = ({ size = 26, delay = 0.25 }) => (
  <IconWrapper label="Access">
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "#198754" }}
      {...floatAnim(delay)}
    >
      <title>Key</title>
      <path d="M21 2a7 7 0 0 0-9.9 6.9c0 .6.1 1.1.3 1.6L3.5 18.9 2 20.4 3.6 22 5.1 20.5 7.7 18 10 20.3 12 18.3" stroke="rgba(25,135,84,0.9)"/>
      <circle cx="7" cy="7" r="3" fill="rgba(25,135,84,0.06)" stroke="rgba(25,135,84,0.8)"/>
    </motion.svg>
  </IconWrapper>
);

const CoinIcon = ({ size = 26, delay = 0.5 }) => (
  <IconWrapper label="Payments">
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "#ffc107" }}
      {...floatAnim(delay)}
    >
      <title>Payments</title>
      <circle cx="12" cy="12" r="8" fill="rgba(255,193,7,0.08)" stroke="rgba(255,193,7,0.9)"/>
      <path d="M10 9h4a1.5 1.5 0 0 1 0 3h-2a1.5 1.5 0 0 0 0 3" stroke="rgba(255,193,7,0.95)"/>
      <line x1="12" y1="15" x2="12" y2="17" stroke="rgba(255,193,7,0.9)"/>
    </motion.svg>
  </IconWrapper>
);

export default function NavBar({ user: propUser, onLogout: propLogout }) {
  const ctx = useContext(AuthContext);

  // robust user detection (prefer propUser, then ctx.user, then ctx if it looks like a user)
  const contextUser = ctx && (ctx.user ?? (ctx.name || ctx.fullName || ctx.email ? ctx : null));
  const user = propUser ?? contextUser ?? null;
  const logout = propLogout ?? (ctx && ctx.logout) ?? (() => {});

  const [showMobile, setShowMobile] = useState(false);
  const location = useLocation();

  const handleClose = () => setShowMobile(false);
  const handleShow = () => setShowMobile(true);

  // keyboard shortcut: press 'm' to toggle mobile menu (only when not typing)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key.toLowerCase() === "m" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        setShowMobile((s) => !s);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const adminLinks = [
    { name: "Dashboard", path: "/admin/dashboard" },

    { name: "Rooms", path: "/admin/rooms" },
    { name: "Tenants", path: "/admin/tenants" },
    { name: "All Bills", path: "/admin/bills" },
    { name: "Generate Bill", path: "/admin/generate-bill" },
    { name: "Managers", path: "/admin/managers" },
  ];
  const managerLinks = [
    { name: "Dashboard", path: "/manager/dashboard" },
    { name: "Rooms", path: "/manager/rooms" },
    { name: "Tenants", path: "/manager/tenants" },
    { name: "Generate Bill", path: "/manager/generate-bill" },
  ];
  const publicLinks = [
    { name: "About Us", path: "/about" },
    { name: "Refund Policy", path: "/refund-policy" },
    { name: "Terms & Conditions", path: "/terms-and-conditions" },
    { name: "Privacy Policy", path: "/privacy-policy" },
    { name: "Contact Us", path: "/contact" },
  ];

  // choose links: logged-in users get role-specific links, otherwise public links
  const navLinks = user
    ? ((user?.role || "").toLowerCase() === "admin" ? adminLinks : managerLinks)
    : publicLinks;

  const isActive = (path) => location.pathname === path;
  // pick a color name for badges/buttons; default to 'primary' for public (no user)
  const roleColor = user?.role === "admin" ? "danger" : (user ? "success" : "primary");

  // small helper to pick the actual hex for underline/background
  const roleHex = roleColor === "danger" ? "#dc3545" : (roleColor === "success" ? "#198754" : "#0d6efd");

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm" fixed="top" style={{ height: 72 }}>
      <Container fluid>
        <div className="d-flex align-items-center gap-2">
          <Button
            variant="outline-primary"
            className="d-lg-none border-0"
            onClick={handleShow}
            aria-label="Open menu"
            title="Open menu (press 'm')"
          >
            <FaBars size={20} />
          </Button>

          <Navbar.Brand
            as={Link}
            to={"/"}
            className="fw-bold d-flex align-items-center gap-3 mb-0"
            style={{ display: "flex", alignItems: "center" }}
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-circle text-white px-3 py-2 fw-bold d-flex align-items-center justify-content-center"
              style={{ backgroundColor: roleHex, minWidth: 44, minHeight: 44 }}
              aria-hidden
            >
              RM
            </motion.div>
            <div style={{ marginLeft: 8 }}>
              <div>Rent Collection Manager</div>
              <small className="text-muted d-none d-sm-block">{import.meta.env.VITE_COMPANY_NAME}</small>
            </div>            {/* Animated clipart cluster */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <BuildingIcon delay={0} />
              <KeyIcon delay={0.18} />
              <CoinIcon delay={0.36} />
            </div>
          </Navbar.Brand>
        </div>

        {/* Desktop: always render navLinks; show profile or sign-in on the right */}
        <div className="d-none d-lg-flex ms-auto align-items-center gap-3">
          <Nav className="d-flex align-items-center gap-2">
            {navLinks.map((link) => (
              <div key={link.path} style={{ position: "relative" }}>
                <Nav.Link
                  as={Link}
                  to={link.path}
                  className={`px-3 ${isActive(link.path) ? `fw-bold` : "text-dark"}`}
                  style={{
                    color: isActive(link.path) ? roleHex : undefined,
                    paddingTop: 10,
                    paddingBottom: 10,
                    transition: "color 180ms ease",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  aria-current={isActive(link.path) ? "page" : undefined}
                >
                  <motion.span whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} style={{ display: "inline-block" }}>
                    {link.name}
                  </motion.span>
                </Nav.Link>

                {/* animated underline */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "20%",
                    right: "20%",
                    bottom: 6,
                    height: isActive(link.path) ? 3 : 0,
                    background: roleHex,
                    borderRadius: 999,
                    transition: "height 180ms ease, opacity 180ms ease",
                    opacity: isActive(link.path) ? 1 : 0,
                  }}
                />
              </div>
            ))}
          </Nav>

          {/* small notification bell if user has unreadNotifications property */}
          {user && (user.unreadNotifications || user.unreadNotifications === 0) && (
            <Button
              variant="outline-secondary"
              className="position-relative"
              title="Notifications"
              aria-label="Notifications"
              onClick={() => {
                // navigate to notifications page if exists, otherwise noop
                if (typeof window !== "undefined") window.location.href = `/${(user.role || "user").toLowerCase()}/notifications`;
              }}
            >
              <FaBell />
              {user.unreadNotifications > 0 && (
                <Badge pill bg="danger" style={{ position: "absolute", top: -6, right: -6 }}>{user.unreadNotifications}</Badge>
              )}
            </Button>
          )}

          {user ? (
            <>
              {/* Profile Dropdown */}
              <Dropdown align="end" className="ms-2">
                <Dropdown.Toggle
                  as={motion.div}
                  whileHover={{ scale: 1.03 }}
                  className="d-flex align-items-center gap-2 text-dark bg-transparent border-0"
                  style={{ cursor: "pointer", padding: "6px 8px" }}
                  aria-label="User menu"
                >
                  <FaUserCircle size={28} className="text-secondary" />
                  <div className="d-none d-md-block text-end">
                    <Badge bg={roleColor} className="text-uppercase">{user.role}</Badge>
                  </div>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Header>
                    <div className="fw-bold">{user.fullName || user.name}</div>
                    <small className="text-muted text-uppercase">{user.role}</small>
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    onClick={() => {
                      logout();
                    }}
                    className="text-danger d-flex align-items-center gap-2"
                    role="menuitem"
                  >
                    <FaSignOutAlt /> Sign Out
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <Button as={Link} to="/login" variant="primary" className="d-flex align-items-center gap-2" aria-label="Sign in">
              <FaSignInAlt /> Sign In
            </Button>
          )}
        </div>

        {/* Mobile Offcanvas */}
        <Offcanvas show={showMobile} onHide={handleClose} placement="end">
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              {user ? (
                <>
                  <FaUserCircle className="me-2 text-primary" />
                  {user.fullName || user.name}
                </>
              ) : (
                "Menu"
              )}
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              {/* Mobile: always show navLinks */}
              <div className="mb-3">
                {navLinks.map((link) => (
                  <Nav.Link
                    as={Link}
                    to={link.path}
                    key={link.path}
                    onClick={handleClose}
                    className={`mb-2 ${isActive(link.path) ? `text-${roleColor} fw-bold` : "text-dark"}`}
                    style={{ paddingTop: 10, paddingBottom: 10 }}
                  >
                    {link.name}
                  </Nav.Link>
                ))}
              </div>

              {user ? (
                <>
                  <Badge bg={roleColor} className="align-self-start mb-3 text-uppercase">
                    {user.role}
                  </Badge>

                  <div className="mt-3">
                    <Button
                      variant={roleColor}
                      className="w-100 d-flex align-items-center justify-content-center gap-2"
                      onClick={() => {
                        logout();
                        handleClose();
                      }}
                    >
                      <FaSignOutAlt /> Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <Button as={Link} to="/login" variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2" onClick={handleClose}>
                  <FaSignInAlt /> Sign In
                </Button>
              )}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>
      </Container>
    </Navbar>
  );
}
