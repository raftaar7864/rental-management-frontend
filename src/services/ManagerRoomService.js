// frontend/src/services/ManagerRoomService.js
import axios from "../api/axios"; // match your app's configured axios
import { toast } from "react-toastify";

const BASE = "/rooms";

/**
 * Normalize a room object — keep same logic as RoomService
 */
const normalizeRoom = (r) => {
  if (!r) return r;

  const activeTenant = Array.isArray(r.tenants) ? r.tenants.find((t) => !t.moveOutDate) : null;

  return {
    _id: r._id,
    building: r.building || "", // building object or name
    number: r.number,
    roomNumber: r.roomNumber,
    // Keep same rent fallback as admin: use room.rent or activeTenant.rentAmount (Number) or 0
    rent: r.rent ?? (activeTenant?.rentAmount ? Number(activeTenant.rentAmount) : 0),
    tenants: r.tenants || [],
    tenantHistory: r.tenantHistory || [],
    isBooked: r.isBooked ?? false,
    tenant: activeTenant,
    updatedAt: r.updatedAt,
  };
};

/**
 * Get rooms for logged-in manager (normalized)
 */
export const getRoomsForManager = async () => {
  try {
    const res = await axios.get("/manager/rooms");
    const data = Array.isArray(res.data) ? res.data.map(normalizeRoom) : normalizeRoom(res.data);
    return { ...res, data };
  } catch (err) {
    console.error("getRoomsForManager:", err);
    toast.error(err?.response?.data?.message || "Failed to fetch rooms");
    throw err;
  }
};

/**
 * Get tenants for a manager/room (normalized passthrough)
 */
export const getTenantsByRoom = async (roomId) => {
  if (!roomId) throw new Error("roomId required");
  try {
    const res = await axios.get(`/manager/tenants/${roomId}`);
    return res;
  } catch (err) {
    console.error("getTenantsByRoom:", err);
    toast.error(err?.response?.data?.message || "Failed to fetch tenants");
    throw err;
  }
};

export const getRoomsByBuilding = async (buildingId) => {
  if (!buildingId) throw new Error("Building ID is required");
  const res = await axios.get(`${BASE}/building/${buildingId}`);
  const data = Array.isArray(res.data) ? res.data.map(normalizeRoom) : normalizeRoom(res.data);
  return { ...res, data };
};

// export default for compatibility
export default {
  getRoomsForManager,
  getTenantsByRoom,
  getRoomsByBuilding,
};
