"use client";

import { io } from "socket.io-client";
import { api } from "@/lib/api";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
let socket;
let refreshInFlight = false;

export function connectRealtime() {
  if (!socket) {
    socket = io(SOCKET_URL, { autoConnect: false, withCredentials: true, transports: ["websocket", "polling"], reconnection: true });
    socket.on("connect_error", async () => {
      if (refreshInFlight) return;
      refreshInFlight = true;
      try {
        await api.me(); // The shared API client refreshes an expired access cookie once.
        if (socket && !socket.connected) socket.connect();
      } catch {
        socket?.disconnect();
      } finally {
        refreshInFlight = false;
      }
    });
  }
  if (!socket.connected) socket.connect();
  return socket;
}

export function getRealtimeSocket() {
  return socket;
}

export function disconnectRealtime() {
  if (!socket) return;
  socket.disconnect();
  socket = undefined;
}
