import React, { useEffect, useState, useMemo, useRef, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import { getRoomsForManager } from "../services/RoomService";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Modal,
  Form,
  InputGroup,
  ToggleButton,
  ButtonGroup,
} from "react-bootstrap";
import TenantForm from "./TenantForm";
import TenantView from "./TenantView";
import RoomView from "./RoomView";
import IconDropdown from "./IconDropdown";
import {
  House,
  User,
  Phone,
  Eye,
  Search,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { markLeaveTenant } from "../services/ManagerTenantService";
import "react-toastify/dist/ReactToastify.css";

/** ========== Room Card Component ========== */
const RoomCard = ({
  r,
  getActiveTenant,
  formattedRent,
  openRoomView,
  openEditTenant,
  openMarkLeave,
}) => {
  const t = getActiveTenant(r);

  const buildingName =
    (typeof r.building === "object" ? r.building?.name : r.building) || "-";
  const roomNumber = r.number || r.roomNumber || "-";
  const phone = t?.phone || t?.mobile || r.phone || r.mobile || "-";
  const tenantName = t?.fullName || t?.name || "—";

  const moveIn = t?.moveInDate ? new Date(t.moveInDate).toLocaleDateString() : "-";
  const moveOut = t?.moveOutDate ? new Date(t.moveOutDate).toLocaleDateString() : null;

  const status = t && t.moveOutDate ? "Left" : r.isBooked ? "Booked" : "Available";

  const pastelStyle = t?.moveOutDate
    ? { backgroundColor: "#fdecea", border: "1px solid #f5c2c7", color: "#6c757d" }
    : r.isBooked
    ? { backgroundColor: "#fff4e5", border: "1px solid #ffd699", color: "#995c00" }
    : { backgroundColor: "#e8f8ef", border: "1px solid #b4e2c1", color: "#146c43" };

  return (
    <Card
      className="h-100 shadow-sm border-0"
      style={{
        borderRadius: 12,
        cursor: "pointer",
        transition: "transform .12s ease, box-shadow .12s ease",
        ...pastelStyle,
      }}
      onClick={() => openRoomView(r)}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <Card.Body className="d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <House size={18} className="text-muted" />
            <div>
              <div className="small text-muted">Location</div>
              <div className="fw-medium text-truncate">{buildingName} - {roomNumber}</div>
            </div>
          </div>

          <div className="text-end">
            <Badge
              bg={status === "Booked" ? "danger" : status === "Left" ? "secondary" : "success"}
              className="py-1 px-2"
              style={{ borderRadius: 999 }}
            >
              {status}
            </Badge>

            <IconDropdown
              actions={[
                {
                  icon: Eye,
                  label: "View",
                  handler: (e) => {
                    e.stopPropagation();
                    openRoomView(r);
                  },
                },
                {
                  icon: LogOut,
                  label: "Mark Leave",
                  handler: (e) => {
                    e.stopPropagation();
                    openMarkLeave(r);
                  },
                },
              ].filter(Boolean)}
              showText
            />
          </div>
        </div>

        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <User size={16} className="text-muted" />
              <div className="fw-bold text-truncate">{tenantName}</div>
            </div>
            <Badge
              bg="dark"
              text="light"
              className="border"
              title="Click to copy ID"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(t?.tenantId || t?._id || "");
                toast.info("Tenant ID copied");
              }}
            >
              ID: <span className="fw-medium ms-1">{t?.tenantId || t?._id || "-"}</span>
            </Badge>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="small text-muted">{moveOut ? "Move out" : "Move in"}</div>
          <div className="fw-medium">{moveOut || moveIn}</div>
        </div>
      </Card.Body>
    </Card>
  );
};

/** ========== Main Component ========== */
const ManagerRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null); // selected room for RoomView
  const [showMarkLeaveModal, setShowMarkLeaveModal] = useState(false);
  const [markLeaveTarget, setMarkLeaveTarget] = useState(null);
  const [markLeaveDate, setMarkLeaveDate] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const searchRef = useRef(null);

  useEffect(() => { fetchRooms(); }, []);
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await getRoomsForManager();
      setRooms(res.data || []);
    } catch (err) {
      console.error("fetchRooms:", err);
      setRooms([]);
      toast.error("Failed to load rooms", { position: "top-right" });
    } finally { setLoading(false); }
  };

  const normalizeTenants = (r) => Array.isArray(r.tenants) ? r.tenants : (Array.isArray(r.tenant) ? r.tenant : []);
  const getActiveTenant = (r) => normalizeTenants(r).find((t) => !t.moveOutDate) || null;
  const formattedRent = (r, t) => {
    const rent = Number(t?.rentAmount ?? t?.rent ?? r?.rent ?? 0);
    return rent ? `₹${rent.toFixed(2)}` : "-";
  };

  const openAddTenant = (room) => setSelectedTenant({ room, mode: "add" });
  const openViewTenant = (room) => setSelectedTenant({ room, mode: "view", tenant: getActiveTenant(room) });
  const openEditTenant = (room) => {
    const tenant = getActiveTenant(room);
    if (!tenant) return toast.info("No active tenant to edit.");
    setSelectedTenant({ room, mode: "edit", tenant });
  };

  // RoomView handlers
  const openRoomView = (room) => {
    const fresh = rooms.find((x) => x._id === room._id) || room;
    setSelectedRoom(fresh);
  };
  const closeRoomView = () => setSelectedRoom(null);

  const openMarkLeave = (room) => {
    const tenant = (Array.isArray(room.tenants) ? room.tenants.find(t => !t.moveOutDate) : null) || getActiveTenant(room);
    if (!tenant) return toast.info("No active tenant to mark leave.");
    setMarkLeaveTarget(tenant);
    setMarkLeaveDate(new Date().toISOString().split("T")[0]);
    setShowMarkLeaveModal(true);
  };

  const confirmMarkLeave = async () => {
    if (!markLeaveTarget || !markLeaveDate) return toast.warn("Select leave date");
    try {
      await markLeaveTenant(markLeaveTarget._id, markLeaveDate);
      await fetchRooms();
      setShowMarkLeaveModal(false);
      closeRoomView();
      toast.success("Tenant marked as left", { position: "top-right" });
    } catch (err) {
      console.error("confirmMarkLeave:", err);
      toast.error("Failed to mark leave");
    }
  };

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch((search || "").trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const filteredRooms = useMemo(() => {
    let data = [...rooms];
    if (statusFilter !== "all") data = data.filter((r) => (statusFilter === "booked" ? r.isBooked : !r.isBooked));
    if (debouncedSearch) {
      const q = debouncedSearch;
      data = data.filter((r) => {
        const b = (r.building?.name || r.building || "").toString().toLowerCase();
        const rn = (r.number || r.roomNumber || "").toString().toLowerCase();
        const t = getActiveTenant(r);
        const tn = (t?.fullName || t?.name || "").toString().toLowerCase();
        const id = ((t?.tenantId || t?._id || "") + "").toString().toLowerCase();
        return rn.includes(q) || b.includes(q) || tn.includes(q) || id.includes(q);
      });
    }
    return data;
  }, [rooms, statusFilter, debouncedSearch]);

  return (
    <Container fluid className="page-container py-2">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />

      {/* Header */}
      <div className="page-header d-flex justify-content-between flex-wrap align-items-start mb-2">
        <div>
          <h3 className="mb-1">Manager Dashboard</h3>
          <div className="small text-muted">Manage rooms & tenants</div>
        </div>

        <div className="d-flex gap-2 align-items-center mt-2">
          <InputGroup style={{ width: 360 }} className="search-input">
            <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
              <Search size={16} className="text-muted" />
            </div>
            <Form.Control
              style={{ paddingLeft: 36, borderRadius: 10 }}
              placeholder="Search by room, building, tenant or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              ref={searchRef}
            />
            <Button variant="outline-secondary" onClick={() => { setSearch(""); if (searchRef.current) searchRef.current.value = ""; }}>
              Clear
            </Button>
          </InputGroup>
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        <Card className="rooms-card mb-3">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <strong>Rooms</strong>
                <div className="small text-muted">{filteredRooms.length} / {rooms.length} shown</div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <ButtonGroup>
                  {['all','booked','available'].map((f) => (
                    <ToggleButton key={f} id={`status-${f}`} type="radio"
                      variant={statusFilter === f ? "secondary" : "outline-secondary"}
                      name="status"
                      value={f}
                      checked={statusFilter === f}
                      onChange={() => setStatusFilter(f)}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </ToggleButton>
                  ))}
                </ButtonGroup>

                <Button variant="outline-secondary" className="ms-2" onClick={fetchRooms}>
                  <RefreshCw size={16} className="me-1" />
                </Button>
              </div>
            </div>

            <div className="inner-scroll">
              {loading ? (
                <div className="text-center py-4"><Spinner /></div>
              ) : rooms.length === 0 ? (
                <div className="text-center text-muted py-4">No rooms found</div>
              ) : filteredRooms.length === 0 ? (
                <div className="text-center text-muted py-4">No rooms match your filter</div>
              ) : (
                <Row xs={1} sm={1} md={2} lg={3} className="g-3">
                  {filteredRooms.map((r) => (
                    <Col key={r._id || r.id} className="room-col">
                      <RoomCard
                        r={r}
                        getActiveTenant={getActiveTenant}
                        formattedRent={formattedRent}
                        openRoomView={openRoomView}
                        openEditTenant={openEditTenant}
                        openMarkLeave={openMarkLeave}
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Tenant Modals */}
      {selectedTenant && ["add", "edit"].includes(selectedTenant.mode) && (
        <TenantForm
          key={selectedTenant.room._id}
          room={selectedTenant.room}
          tenant={selectedTenant.tenant}
          onClose={() => setSelectedTenant(null)}
          onRefresh={() => { fetchRooms(); setSelectedTenant(null); }}
        />
      )}

      {selectedTenant?.mode === "view" && selectedTenant.tenant && (
        <TenantView tenant={selectedTenant.tenant} onClose={() => setSelectedTenant(null)} />
      )}

      {/* Room View Modal */}
      {selectedRoom && (
        <RoomView
          room={selectedRoom}
          tenant={getActiveTenant(selectedRoom)}
          onClose={() => setSelectedRoom(null)}
          onOpenTenant={(tenant) => setSelectedTenant({ room: selectedRoom, mode: "view", tenant })}
          onOpenAdd={() => setSelectedTenant({ room: selectedRoom, mode: "add" })}
          onEdit={(room) => openEditTenant(room)}
          onMarkLeave={(room) => openMarkLeave(room)}
        />
      )}

      {/* Mark Leave */}
      <Modal show={showMarkLeaveModal} onHide={() => setShowMarkLeaveModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Mark Leave</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Leave Date</Form.Label>
            <Form.Control type="date" value={markLeaveDate} onChange={(e) => setMarkLeaveDate(e.target.value)} />
          </Form.Group>
          <div className="mt-3">
            <div><strong>Tenant:</strong> {markLeaveTarget?.fullName || "-"}</div>
            <div className="small text-muted">ID: {markLeaveTarget?.tenantId || "-"}</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMarkLeaveModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={confirmMarkLeave}>Confirm</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManagerRooms;
