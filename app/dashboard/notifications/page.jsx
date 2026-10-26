"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell, CheckCheck, Trash2, Github, ShieldAlert, MessageSquare,
  Sparkles, CheckCircle2, ExternalLink, Settings
} from "lucide-react";
import { EmptyState, PageHeader, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";
import { connectRealtime } from "@/lib/realtime";

function present(notification) {
  const type = notification.type || "system";
  const category = type === "comment" ? "mentions" : type;
  return {
    id: String(notification._id || notification.id),
    type,
    category,
    title: typeof notification.title === "string" ? notification.title : "Notification",
    body: typeof notification.message === "string" ? notification.message : "",
    time: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : "Just now",
    read: Boolean(notification.readAt || notification.read),
    link: notification.targetUrl?.startsWith("/dashboard") ? notification.targetUrl : "/dashboard/tasks"
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    let mounted = true;
    const socket = connectRealtime();
    const load = async () => {
      try {
        const response = await api.notifications.list();
        const rows = response?.data?.notifications || response?.notifications || [];
        if (mounted) setNotifications(rows.map(present));
      } catch (error) {
        if (mounted) toast(error.message || "Unable to load notifications", "error");
      }
    };
    const add = (payload) => {
      if (!payload?.notification?._id) return;
      setNotifications((current) => current.some((item) => item.id === String(payload.notification._id)) ? current : [present(payload.notification), ...current]);
    };
    const markRead = (payload) => {
      if (typeof payload?.notificationId !== "string") return;
      setNotifications((rows) => rows.map((item) => item.id === payload.notificationId ? { ...item, read: Boolean(payload.readAt) } : item));
    };
    const markAllRead = () => setNotifications((rows) => rows.map((item) => ({ ...item, read: true })));
    const removeNotification = (payload) => {
      if (typeof payload?.notificationId !== "string") return;
      setNotifications((rows) => rows.filter((item) => item.id !== payload.notificationId));
    };
    socket.on("notification.created", add);
    socket.on("notification.read", markRead);
    socket.on("notification.read-all", markAllRead);
    socket.on("notification.deleted", removeNotification);
    socket.on("connect", load);
    load();
    return () => {
      mounted = false;
      socket.off("notification.created", add);
      socket.off("notification.read", markRead);
      socket.off("notification.read-all", markAllRead);
      socket.off("notification.deleted", removeNotification);
      socket.off("connect", load);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "mentions") return n.category === "mentions";
    if (activeTab === "github") return n.category === "github";
    if (activeTab === "ai") return n.category === "ai";
    if (activeTab === "system") return n.category === "system";
    return true;
  });

  const markAllAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((rows) => rows.map((n) => ({ ...n, read: true })));
      toast("All notifications marked as read", "success");
    } catch (error) { toast(error.message || "Unable to update notifications", "error"); }
  };

  const toggleReadStatus = async (notification) => {
    try {
      if (notification.read) await api.notifications.markUnread(notification.id);
      else await api.notifications.markRead(notification.id);
      setNotifications((rows) => rows.map((n) => n.id === notification.id ? { ...n, read: !notification.read } : n));
    } catch (error) { toast(error.message || "Unable to update notification", "error"); }
  };

  const deleteNotification = async (id) => {
    try {
      await api.notifications.delete(id);
      setNotifications((rows) => rows.filter((n) => n.id !== id));
      toast("Notification dismissed", "info");
    } catch (error) { toast(error.message || "Unable to delete notification", "error"); }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "github": return <Github size={18} style={{ color: "#3b82f6" }} />;
      case "ai": return <Sparkles size={18} style={{ color: "#a855f7" }} />;
      case "system": return <ShieldAlert size={18} style={{ color: "#f59e0b" }} />;
      case "comment": return <MessageSquare size={18} style={{ color: "#10b981" }} />;
      default: return <Bell size={18} style={{ color: "var(--primary)" }} />;
    }
  };

  return (
    <div style={{ padding: "24px", maxWidth: 1100, margin: "0 auto" }}>
      <PageHeader title="Notifications Center" subtitle="Stay updated with system alerts, GitHub events, and AI triggers">
        <div style={{ display: "flex", gap: 10 }}>
          {unreadCount > 0 && (
            <button className="btn btn-outline" onClick={markAllAsRead} style={{ minHeight: 38, fontSize: 13, gap: 6 }}>
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
          <Link className="btn btn-outline" href="/dashboard/settings" style={{ minHeight: 38, fontSize: 13, gap: 6 }}>
            <Settings size={16} /> Notification Settings
          </Link>
        </div>
      </PageHeader>

      {/* Unread Counter Banner */}
      <div style={{ background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Bell size={18} style={{ color: "#3b82f6" }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "You are all caught up!"}
          </span>
        </div>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>Total: {notifications.length} alerts</span>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { id: "all", label: "All Alerts", count: notifications.length },
          { id: "unread", label: "Unread", count: unreadCount },
          { id: "mentions", label: "Mentions", count: notifications.filter(n => n.category === "mentions").length },
          { id: "github", label: "GitHub", count: notifications.filter(n => n.category === "github").length },
          { id: "ai", label: "AI Workspace", count: notifications.filter(n => n.category === "ai").length },
          { id: "system", label: "System", count: notifications.filter(n => n.category === "system").length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid",
              borderColor: activeTab === tab.id ? "var(--primary)" : "transparent",
              background: activeTab === tab.id ? "var(--primary)" : "rgba(255,255,255,0.03)",
              color: activeTab === tab.id ? "#fff" : "var(--muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 10, background: activeTab === tab.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)" }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications Stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredNotifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications found" description="There are no alerts matching the selected category." />
        ) : (
          filteredNotifications.map(notif => (
            <div
              key={notif.id}
              style={{
                background: notif.read ? "var(--card)" : "rgba(59, 130, 246, 0.05)",
                border: "1px solid",
                borderColor: notif.read ? "var(--border)" : "rgba(59, 130, 246, 0.3)",
                borderRadius: 16,
                padding: 18,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                transition: "all 0.15s ease"
              }}
            >
              <div style={{ display: "flex", gap: 14, flex: 1 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {getNotificationIcon(notif.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--fg)" }}>{notif.title}</h4>
                    {!notif.read && (
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: "var(--primary)", color: "#fff", fontWeight: 700 }}>NEW</span>
                    )}
                  </div>

                  <p style={{ margin: "0 0 10px 0", fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
                    {notif.body}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12 }}>
                    <span style={{ color: "var(--muted)" }}>{notif.time}</span>
                    <Link href={notif.link} style={{ color: "var(--primary)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                      View Details <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  className="icon-btn"
                  onClick={() => toggleReadStatus(notif)}
                  title={notif.read ? "Mark as unread" : "Mark as read"}
                >
                  <CheckCircle2 size={16} style={{ color: notif.read ? "var(--muted)" : "var(--success)" }} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => deleteNotification(notif.id)}
                  style={{ color: "var(--danger)" }}
                  title="Dismiss notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
