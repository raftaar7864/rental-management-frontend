// frontend/src/components/RoomView.jsx
import React from "react";
import { Modal, Button, Badge, Row, Col, ListGroup } from "react-bootstrap";
import { House } from "lucide-react";

/**
 * RoomView.jsx (updated)
 * - Removed all "due" calculations and UI
 * - Keeps tenant list, room meta and actions
 */

const RoomView = ({
  room = {},
  tenant = null,
  onClose = () => {},
  onMarkLeave,
  onOpenTenant,
  onOpenAdd,
}) => {
  const roomId = room._id || room.id || "-";
  const building = room.building?.name || room.building || "-";
  const number = room.number || room.roomNumber || "-";

  // tenants list (newest moveIn first)
  const tenantsAll = Array.isArray(room.tenants) ? [...room.tenants] : [];
  const tenants = tenantsAll.slice().sort((a, b) => {
    const da = a.moveInDate ? new Date(a.moveInDate).getTime() : 0;
    const db = b.moveInDate ? new Date(b.moveInDate).getTime() : 0;
    return db - da;
  });

  // active tenant (prop or from room)
  const activeTenant = tenant || tenantsAll.find((t) => !t.moveOutDate) || null;

  const status =
    activeTenant && !activeTenant.moveOutDate
      ? room.isBooked
        ? "Booked"
        : "Occupied"
      : activeTenant && activeTenant.moveOutDate
      ? "Left"
      : room.isBooked
      ? "Booked"
      : "Available";

  const formattedRent = () => {
    const r = Number(
      activeTenant?.rentAmount ?? activeTenant?.rent ?? room?.rent ?? room?.rentAmount ?? room?.monthlyRent ?? 0
    );
    return r ? `₹${r.toFixed(2)}` : "-";
  };

  return (
    <Modal show onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <div className="d-flex align-items-center gap-2">
            <House size={18} />
            <div>
              Room {number}
              <div className="small text-muted">{building}</div>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="mb-3">
          <Col>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="small text-muted">Status</div>
                <div className="fw-medium">{status}</div>
              </div>

              <div className="text-end">
                <Badge
                  bg={status === "Booked" || status === "Occupied" ? "danger" : status === "Left" ? "secondary" : "success"}
                  className="py-1 px-2"
                  style={{ borderRadius: 999 }}
                >
                  {status}
                </Badge>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="small text-muted">Room ID</div>
            <div className="fw-medium">{roomId}</div>
          </Col>

          <Col md={6}>
            <div className="small text-muted">Rent</div>
            <div className="fw-medium">{formattedRent()}</div>
          </Col>
        </Row>

        <hr />

        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Tenants</h6>
          <div>
            {!activeTenant && (
              <Button size="sm" variant="outline-primary" onClick={() => onOpenAdd && onOpenAdd()}>
                Add Tenant
              </Button>
            )}
          </div>
        </div>

        {tenants.length === 0 ? (
          <div className="text-muted">No tenants for this room yet.</div>
        ) : (
          <ListGroup>
            {tenants.map((t) => (
              <ListGroup.Item
                key={t._id || t.tenantId || t.id}
                action
                onClick={() => onOpenTenant && onOpenTenant(t)}
                className={`d-flex justify-content-between align-items-center ${!t.moveOutDate ? "bg-light" : ""}`}
              >
                <div>
                  <div className="fw-semibold">{t.fullName || t.name || "-"}</div>
                  <div className="small text-muted">ID: {t.tenantId || t._id || "-"}</div>
                  <div className="small text-muted">Move-in: {t.moveInDate ? new Date(t.moveInDate).toLocaleDateString() : "-"}</div>
                </div>

                <div className="text-end" style={{ minWidth: 160 }}>
                  <div className="small text-muted">Phone</div>
                  <div className="fw-medium">{t.phone || t.mobile || "-"}</div>

                  <div className="small mt-1">
                    {t.moveOutDate ? (
                      <Badge bg="secondary">Moved out {t.moveOutDate ? new Date(t.moveOutDate).toLocaleDateString() : ""}</Badge>
                    ) : (
                      <Badge bg="success">Current</Badge>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}

        {room.description && (
          <>
            <hr />
            <div>
              <div className="small text-muted">Description</div>
              <div className="fw-medium">{room.description}</div>
            </div>
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        {onMarkLeave && activeTenant && (
          <Button variant="warning" onClick={() => onMarkLeave(room)}>
            Mark Leave
          </Button>
        )}

        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomView;
