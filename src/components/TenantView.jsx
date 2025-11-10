// frontend/src/components/TenantView.jsx
import React, { useEffect, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Row,
  Col,
  Table,
  Spinner,
  Badge,
  Form
} from "react-bootstrap";
import { toast } from "react-toastify";
import TenantService from "../services/TenantService";
import BillService from "../services/BillService";

function fmtDateTime(d) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
}
function fmtShortDate(d) {
  if (!d) return "-";
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return String(d);
  }
}

// compute amount robustly (same logic used elsewhere)
function computeAmountFromBill(b) {
  if (!b) return 0;
  const tryNum = (v) => {
    if (v == null) return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
  };
  const candidates = [b.totalAmount, b.total, b.amount, b.totals?.totalAmount, b.totals?.total];
  for (const c of candidates) {
    const n = tryNum(c);
    if (n != null) return n;
  }
  if (Array.isArray(b.charges) && b.charges.length) {
    let sum = 0;
    b.charges.forEach((c) => {
      const a = tryNum(c.amount);
      if (a != null) sum += a;
    });
    if (sum !== 0) return sum;
  }
  if (b.totals) {
    const rent = tryNum(b.totals.rent) || tryNum(b.totals.rentAmount) || 0;
    const elec = tryNum(b.totals.electricity) || 0;
    const add = tryNum(b.totals.additionalAmount) || tryNum(b.totals.additional) || 0;
    const disc = tryNum(b.totals.discount) || 0;
    const proc = tryNum(b.totals.processingFee) || tryNum(b.totals.processing) || 0;
    const computed = Math.round(rent + elec + add - disc + proc);
    if (computed) return computed;
  }
  return 0;
}

// sum payments that appear to reference a bill (heuristics)
function sumPaymentsForBill(payments = [], billId) {
  if (!Array.isArray(payments) || !billId) return 0;
  const keysToMatch = ["bill", "billId", "referenceBill", "referenceId", "invoiceId", "invoice"];
  let sum = 0;
  for (const p of payments) {
    try {
      const amt = Number(p.amount || p.paidAmount || p.paid || 0);
      const refs = keysToMatch.map((k) => (p[k] ? String(p[k]) : null)).filter(Boolean);
      if (refs.includes(String(billId))) {
        sum += isNaN(amt) ? 0 : amt;
        continue;
      }
      const raw = JSON.stringify(p || {});
      if (raw && raw.includes(String(billId))) {
        sum += isNaN(amt) ? 0 : amt;
        continue;
      }
    } catch (e) {
      /* ignore */
    }
  }
  return sum;
}

export default function TenantView({ tenant: initialTenant, onClose }) {
  const [tenant, setTenant] = useState(initialTenant || null);
  const [loading, setLoading] = useState(!initialTenant);
  const [refreshing, setRefreshing] = useState(false);

  const [editingMoveOut, setEditingMoveOut] = useState(false);
  const [moveOutValue, setMoveOutValue] = useState("");
  const [savingMoveOut, setSavingMoveOut] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchTenant = useCallback(async (id) => {
    if (!id) return;
    try {
      setRefreshing(true);
      // fetch tenant core object
      const res = await TenantService.getTenant(id);
      const tenantData = res?.data || res || null;

      // fetch bills that belong to this tenant (limit=0 to get all)
      let bills = [];
      try {
        const billResp = await BillService.getBills({ tenant: id, limit: 0 });
        bills = billResp?.data || billResp || [];
      } catch (e) {
        // if BillService doesn't support that signature, ignore and continue
        console.warn("TenantView: failed to fetch bills for tenant", e);
        bills = tenantData?.bills || tenantData?.generatedBills || [];
      }

      // normalize payments: prefer tenant.payments if present, else try to derive from bills.payment field(s)
      let payments = Array.isArray(tenantData?.payments) ? [...tenantData.payments] : [];
      if (payments.length === 0) {
        // derive from bills: look for b.payment or b.payments entries
        bills.forEach((b) => {
          if (b.payment && typeof b.payment === "object") {
            payments.push({
              date: b.payment.createdAt || b.payment.paidAt || b.payment.date || b.updatedAt,
              amount: b.payment.amount || b.paidAmount || 0,
              method: b.payment.method || b.payment.paymentMethod || undefined,
              receiptNumber: b.payment.receiptNumber || b.payment.paymentRef || undefined,
              // attach bill id for matching
              bill: b._id || b.billId,
            });
          }
          // sometimes bill has paidAmount directly
          if (b.paidAmount) {
            payments.push({
              date: b.paidAt || b.paidDate || b.updatedAt || b.createdAt,
              amount: b.paidAmount,
              method: undefined,
              receiptNumber: b.receiptNumber || b.paymentRef || undefined,
              bill: b._id || b.billId,
            });
          }
        });
      }

      // attach bills and derived payments to tenant object so UI can use them
      const tenantWithExtras = {
        ...tenantData,
        bills: bills,
        payments: payments,
      };

      setTenant(tenantWithExtras);
    } catch (err) {
      console.error("TenantView.fetchTenant:", err);
      toast.error(err?.response?.data?.message || "Failed to fetch tenant");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialTenant) return;
    const id = initialTenant._id || initialTenant.tenantId;
    fetchTenant(id);
  }, [initialTenant, fetchTenant]);

  useEffect(() => {
    setEditingMoveOut(false);
    setSavingMoveOut(false);
    setMoveOutValue(tenant?.moveOutDate ? fmtShortDate(tenant.moveOutDate) : "");
  }, [tenant]);

  if (!tenant && loading) {
    return (
      <Modal show centered onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Tenant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-5">
          <Spinner animation="border" />
        </Modal.Body>
      </Modal>
    );
  }

  // payments (individual payment records) - copy so we can safely sum
  const payments = Array.isArray(tenant?.payments) ? [...tenant.payments] : [];
  payments.sort((a, b) => new Date(b.date) - new Date(a.date));

  // bills (generated bills) — fetched from BillService
  const billsRaw = Array.isArray(tenant?.bills) ? [...tenant.bills] : [];

  // Build enhanced bills with computed amount, paid sum (heuristics) and outstanding
  const bills = billsRaw
    .map((b) => {
      const amount = computeAmountFromBill(b) || Number(b.totalAmount ?? b.amount ?? 0);
      // Try multiple ways to detect paid amount:
      const paidFromBillFields = Number(b.paidAmount ?? b.amountPaid ?? b.paid ?? 0) || 0;
      // Some bills contain 'payment' object as you showed — try that too
      const paidFromPaymentObj = (b.payment && (Number(b.payment.amount || b.payment.paidAmount || b.payment.paid) || 0)) || 0;
      const paidFromPayments = sumPaymentsForBill(payments, b._id || b.billId);
      const paid = Math.max(paidFromBillFields, paidFromPaymentObj, paidFromPayments || 0);
      const outstanding = Math.max(0, amount - paid);
      const possible = b._generatedDate || b.generatedAt || b.createdAt || b.billingMonth || b.date || null;
      const generatedIso = possible ? new Date(possible).toISOString() : null;
      return {
        ...b,
        _computedAmount: amount,
        _paid: paid,
        _outstanding: outstanding,
        _generatedIso: generatedIso,
      };
    })
    .sort((a, b) => {
      const da = a._generatedIso ? new Date(a._generatedIso).getTime() : 0;
      const db = b._generatedIso ? new Date(b._generatedIso).getTime() : 0;
      return db - da;
    });

  // total due across all bills (derived). fallback to tenant.duePayment if no bills
  const totalDueFromBills = bills.reduce((s, x) => s + Number(x._outstanding || 0), 0);
  const totalDueDisplay = bills.length > 0 ? totalDueFromBills : (tenant?.duePayment?.pendingAmount || 0);

  const canEditMoveOut = !!tenant?.moveOutDate;

  const startEditMoveOut = () => {
    setMoveOutValue(tenant.moveOutDate ? fmtShortDate(tenant.moveOutDate) : "");
    setEditingMoveOut(true);
  };

  const cancelEditMoveOut = () => {
    setEditingMoveOut(false);
    setMoveOutValue(tenant.moveOutDate ? fmtShortDate(tenant.moveOutDate) : "");
  };

  const saveMoveOut = async () => {
    if (!tenant || !tenant._id) return;
    const payload = { moveOutDate: moveOutValue ? new Date(moveOutValue) : null };
    try {
      setSavingMoveOut(true);
      await TenantService.updateTenant(tenant._id, payload);
      toast.success("Move-out date updated");
      await fetchTenant(tenant._id);
      setEditingMoveOut(false);
    } catch (err) {
      console.error("TenantView.saveMoveOut:", err);
      toast.error(err?.response?.data?.message || "Failed to update move-out date");
    } finally {
      setSavingMoveOut(false);
    }
  };

  const handlePrint = () => {
    try {
      const printUrl = `${window.location.origin}/print/tenant/${tenant._id}`;
      const w = window.open(printUrl, "_blank", "noopener,noreferrer");
      if (!w) {
        toast.warning("Popup blocked — opening in-app print preview. Use your browser's print button.");
        setShowPrintModal(true);
        return;
      }
      try { w.focus(); } catch {}
    } catch (err) {
      console.error("handlePrint error:", err);
      toast.error("Failed to open print view. Showing in-app preview.");
      setShowPrintModal(true);
    }
  };

  return (
    <>
      <Modal show centered size="lg" onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            Tenant: {tenant?.fullName || tenant?.tenantId || "-"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row className="mb-3">
            <Col md={6}>
              <h6>Profile</h6>
              <div><strong>ID:</strong> {tenant.tenantId || "-"}</div>
              <div><strong>Email:</strong> {tenant.email || "-"}</div>
              <div><strong>Phone:</strong> {tenant.phone || "-"}</div>
              <div><strong>Gender:</strong> {tenant.gender || "-"}</div>
              <div style={{ marginTop: 6 }}><strong>Address:</strong><div className="small text-muted">{tenant.address || "-"}</div></div>
            </Col>

            <Col md={6}>
              <h6>Financials</h6>
              <div><strong>Rent Amount:</strong> ₹{tenant.rentAmount ? Number(tenant.rentAmount).toFixed(2) : "0.00"}</div>
              <div><strong>Advanced:</strong> ₹{tenant.advancedAmount ? Number(tenant.advancedAmount).toFixed(2) : "0.00"}</div>
              <div style={{ marginTop: 6 }}>
                <strong>Last Payment:</strong>{" "}
                {tenant.lastPayment?.amount ? `₹${tenant.lastPayment.amount} on ${fmtShortDate(tenant.lastPayment.date)}` : "-"}
              </div>
              <div>
                <strong>Due:</strong>{" "}
                <span style={{ fontWeight: 700 }}>
                  ₹{Number(totalDueDisplay || 0).toFixed(2)}
                </span>
                {tenant?.duePayment?.pendingAmount && bills.length > 0 && (
                  <div className="small text-muted"> (tenant.duePayment: ₹{Number(tenant.duePayment.pendingAmount).toFixed(2)})</div>
                )}
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <h6>Room</h6>
              <div><strong>Room:</strong> {tenant.room?.number || "-"}</div>
              <div><strong>Building:</strong> {tenant.room?.building?.name || "-"}</div>
              <div><strong>Move-in:</strong> {tenant.moveInDate ? fmtShortDate(tenant.moveInDate) : "-"}</div>

              <div className="mt-2 d-flex align-items-center">
                <strong className="me-2">Move-out:</strong>
                {editingMoveOut ? (
                  <>
                    <Form.Control
                      type="date"
                      value={moveOutValue || ""}
                      onChange={(e) => setMoveOutValue(e.target.value)}
                      style={{ maxWidth: 200 }}
                      disabled={savingMoveOut}
                    />
                    <div className="ms-2">
                      <Button size="sm" variant="success" onClick={saveMoveOut} disabled={savingMoveOut}>
                        {savingMoveOut ? <Spinner animation="border" size="sm" /> : "Save"}
                      </Button>{' '}
                      <Button size="sm" variant="secondary" onClick={cancelEditMoveOut} disabled={savingMoveOut}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>{tenant.moveOutDate ? fmtShortDate(tenant.moveOutDate) : <span className="text-muted">-</span>}</div>
                    {canEditMoveOut && (
                      <div className="ms-3">
                        <Button size="sm" variant="outline-primary" onClick={startEditMoveOut}>Edit</Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="mt-2"><strong>No. of Persons:</strong> {tenant.numberOfPersons || "-"}</div>
            </Col>

            <Col md={6}>
              <h6>Metadata</h6>
              <div><strong>Tenant Created:</strong> {fmtDateTime(tenant.createdAt)}</div>
              <div><strong>Record ID:</strong> <small className="text-muted">{tenant._id}</small></div>
              <div className="mt-2"><strong>Status:</strong> {tenant.moveOutDate ? <Badge bg="secondary">Moved Out</Badge> : <Badge bg="success">Active</Badge>}</div>
            </Col>
          </Row>

          <hr />

          {/* Payment History (payments array) */}
          <h6>Payment History</h6>
          {payments.length === 0 ? (
            <div className="text-muted mb-3">No payments recorded</div>
          ) : (
            <Table size="sm" bordered responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount (₹)</th>
                  <th>Method</th>
                  <th>Receipt</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ whiteSpace: "nowrap" }}>{fmtDateTime(p.date)}</td>
                    <td style={{ textAlign: "right" }}>{Number(p.amount || 0).toFixed(2)}</td>
                    <td>{p.method || "-"}</td>
                    <td>{p.receiptNumber || "-"}</td>
                    <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <hr />

          {/* Generated Bills */}
          <h6>Generated Bills</h6>
          {bills.length === 0 ? (
            <div className="text-muted mb-3">No generated bills for this tenant</div>
          ) : (
            <Table size="sm" bordered responsive>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount (₹)</th>
                  <th>Paid (₹)</th>
                  <th>Due (₹)</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b, idx) => {
                  const dateStr = b._generatedDate || b.generatedAt || b.createdAt || b.billingMonth || "-";
                  const dateDisplay = b.billingMonth
                    ? (new Date(b.billingMonth).toLocaleString(undefined, { month: "long", year: "numeric" }))
                    : (b._generatedIso ? fmtDateTime(b._generatedIso) : (dateStr ? fmtDateTime(dateStr) : "-"));
                  const amount = Number(b._computedAmount ?? b.totalAmount ?? b.amount ?? 0);
                  const paid = Number(b._paid || 0);
                  const due = Number(b._outstanding || 0);
                  const statusRaw = (b.paymentStatus || b.status || "").toString().toLowerCase();
                  const status = statusRaw === "paid" ? "Paid" : (statusRaw === "partial" ? "Partial" : (paid > 0 && paid < amount ? "Partial" : (due > 0 ? "Not paid" : "Unknown")));
                  const receipt = b.receiptNumber || b.paymentRef || b.transactionId || (b.payment && (b.payment.receiptNumber || b.payment.paymentRef)) || "-";
                  const note = b.notes || (Array.isArray(b.charges) ? (b.charges.map(c => c.title).join(", ")) : "");

                  return (
                    <tr key={b._id || b.billId || idx}>
                      <td style={{ whiteSpace: "nowrap" }}>{dateDisplay}</td>
                      <td style={{ textAlign: "right" }}>{Number(amount || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "right" }}>{Number(paid || 0).toFixed(2)}</td>
                      <td style={{ textAlign: "right", fontWeight: 700 }}>{Number(due || 0).toFixed(2)}</td>
                      <td>
                        {status === "Paid" ? <Badge bg="success">Paid</Badge> : status === "Partial" ? <Badge bg="warning">Partial</Badge> : <Badge bg="danger">Not paid</Badge>}
                      </td>
                      <td>{receipt}</td>
                      <td style={{ maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}

        </Modal.Body>

        <Modal.Footer>
          <div className="me-auto text-muted small">
            <Button variant="link" onClick={() => fetchTenant(tenant._id)} disabled={refreshing}>
              {refreshing ? <Spinner animation="border" size="sm" /> : "Refresh"}
            </Button>
          </div>

          <Button variant="outline-secondary" onClick={handlePrint}>Print</Button>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* In-app Print Modal Fallback */}
      {showPrintModal && (
        <Modal show centered size="lg" onHide={() => setShowPrintModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Print Preview - {tenant?.fullName || tenant?.tenantId}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #tenant-print-area, #tenant-print-area * { visibility: visible !important; }
                #tenant-print-area { position: absolute; left:0; top:0; width:100%; }
              }
              #tenant-print-area table { width: 100%; border-collapse: collapse; }
              #tenant-print-area th, #tenant-print-area td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              #tenant-print-area th { background: #f6f6f6; }
            `}</style>

            <div id="tenant-print-area" style={{ fontFamily: "Arial, sans-serif", color: "#222" }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0 }}>{tenant?.fullName || "Tenant"}</h3>
                <div style={{ color: "#666" }}>{tenant?.tenantId || ""}</div>
              </div>

              <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                  <table>
                    <tbody>
                      <tr><th>Full name</th><td>{tenant?.fullName || "-"}</td></tr>
                      <tr><th>Tenant ID</th><td>{tenant?.tenantId || "-"}</td></tr>
                      <tr><th>Email</th><td>{tenant?.email || "-"}</td></tr>
                      <tr><th>Phone</th><td>{tenant?.phone || "-"}</td></tr>
                      <tr><th>Gender</th><td>{tenant?.gender || "-"}</td></tr>
                    </tbody>
                  </table>
                </div>

                <div style={{ flex: 1 }}>
                  <table>
                    <tbody>
                      <tr><th>Building</th><td>{tenant?.room?.building?.name || "-"}</td></tr>
                      <tr><th>Room</th><td>{tenant?.room?.number || "-"}</td></tr>
                      <tr><th>Rent</th><td>₹{tenant?.rentAmount ? Number(tenant.rentAmount).toFixed(2) : "0.00"}</td></tr>
                      <tr><th>Advance</th><td>₹{tenant?.advancedAmount ? Number(tenant.advancedAmount).toFixed(2) : "0.00"}</td></tr>
                      <tr><th>Move-in</th><td>{tenant?.moveInDate ? fmtShortDate(tenant.moveInDate) : "-"}</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <h5>Payments</h5>
              <table>
                <thead>
                  <tr><th>Date</th><th>Amount</th><th>Method</th><th>Receipt</th></tr>
                </thead>
                <tbody>
                  {(payments || []).length === 0 ? (
                    <tr><td colSpan="4" style={{ color: "#666" }}>No payments</td></tr>
                  ) : (payments || []).map((p, i) => (
                    <tr key={i}>
                      <td>{new Date(p.date).toLocaleString()}</td>
                      <td>₹{Number(p.amount).toFixed(2)}</td>
                      <td>{p.method || "-"}</td>
                      <td>{p.receiptNumber || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 12, color: "#666", fontSize: 12 }}>
                Printed: {new Date().toLocaleString()}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPrintModal(false)}>Close</Button>
            <Button variant="primary" onClick={() => window.print()}>Print</Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}

TenantView.propTypes = {
  tenant: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};
