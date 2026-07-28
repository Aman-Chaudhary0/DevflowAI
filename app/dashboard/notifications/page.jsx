"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell, CheckCheck, Trash2, Github, Bot, ShieldAlert, UserPlus, MessageSquare,
  Sparkles, CheckCircle2, AlertTriangle, ExternalLink, Filter, Settings, RefreshCw
} from "lucide-react";
import { PageHeader, Avatar, toast } from "@/components/dashboard-ui";

const initialNotifications = [
  { id: "notif-1", type: "github", icon: Github, title: "Pull Request Review Requested", body: "Sarah Chen requested your review on PR #142: Fix memory leak in WebSocket connection.", time: "10 minutes ago", read: false, link: "/dashboard/github/pull-requests", category: "github" },
  { id: "notif-2", type: "ai", icon: Sparkles, title: "AI Docs Generation Completed", body: "Documentation generated for Devflow Core module with 98% coverage score.", time: "42 minutes ago", read: false, link: "/dashboard/ai/docs-generator", category: "ai" },
  { id: "notif-3", type: "system", icon: ShieldAlert, title: "Security Vulnerability Detected", body: "Dependabot alerted moderate severity vulnerability in cross-spawn package.", time: "2 hours ago", read: false, link: "/dashboard/projects/p1/settings", category: "system" },
  { id: "notif-4", type: "mention", icon: MessageSquare, title: "Alex Rivera mentioned you in Task #14", body: "@Aman Chaudhary can you inspect the Redis cache connection parameters?", time: "5 hours ago", read: true, link: "/dashboard/tasks", category: "mentions" },
  { id: "notif-5", type: "system", icon: UserPlus, title: "New Team Member Joined", body: "Elena Rostova joined Devflow AI workspace as DevOps Lead.", time: "Yesterday", read: true, link: "/dashboard/team", category: "system" },
  { id: "notif-6", type: "github", icon: Github, title: "Commit Pushed to Main Branch", body: "Marcus Vance pushed 3 commits to branch main [5e8f12a].", time: "Yesterday", read: true, link: "/dashboard/github/commits", category: "github" },
  { id: "notif-7", type: "ai", icon: Bot, title: "AI Code Review Summary Ready", body: "Code review report for commit 89f21a is ready. 2 optimizations suggested.", time: "2 days ago", read: true, link: "/dashboard/ai/code-review", category: "ai" }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === "unread") return !n.read;
    if (activeTab === "mentions") return n.category === "mentions";
    if (activeTab === "github") return n.category === "github";
    if (activeTab === "ai") return n.category === "ai";
    if (activeTab === "system") return n.category === "system";
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast("All notifications marked as read", "success");
  };

  const toggleReadStatus = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast("Notification dismissed", "info");
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "github": return <Github size={18} style={{ color: "#3b82f6" }} />;
      case "ai": return <Sparkles size={18} style={{ color: "#a855f7" }} />;
      case "system": return <ShieldAlert size={18} style={{ color: "#f59e0b" }} />;
      case "mention": return <MessageSquare size={18} style={{ color: "#10b981" }} />;
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
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: "48px 20px", textAlign: "center", color: "var(--muted)" }}>
            <Bell size={36} style={{ marginBottom: 12, opacity: 0.5 }} />
            <h4 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700, color: "var(--fg)" }}>No notifications found</h4>
            <p style={{ margin: 0, fontSize: 13 }}>There are no alerts matching the selected category.</p>
          </div>
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
                  onClick={() => toggleReadStatus(notif.id)}
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
