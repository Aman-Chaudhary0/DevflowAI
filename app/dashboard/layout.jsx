"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  FolderOpen,
  Github,
  LayoutDashboard,
  LogOut,
  Plus,
  Rocket,
  Search,
  Settings,
  Settings2,
  Sparkles,
  Users,
  Workflow,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, ToastContainer } from "@/components/dashboard-ui";
import { api } from "@/lib/api";
import { mockNotifications, mockUser } from "@/lib/dashboard-data";

const globalNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/projects", label: "Projects", icon: FolderOpen, badge: 6 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/ai", label: "AI Assistant", icon: Bot },
  { href: "/dashboard/tasks", label: "Tasks", icon: Workflow, badge: 8 },
  { href: "/dashboard/files", label: "Files", icon: FileText },
  { href: "/dashboard/github", label: "GitHub", icon: Github },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: 3 }
];

const bottomNav = [
  { href: "/dashboard/profile", label: "Profile", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

const projectNav = [
  { label: "Overview", icon: LayoutDashboard, segment: "" },
  { label: "Files", icon: FolderOpen, segment: "files" },
  { label: "Docs", icon: FileText, segment: "docs" },
  { label: "Team", icon: Users, segment: "team" },
  { label: "Activity", icon: Activity, segment: "activity" },
  { label: "Settings", icon: Settings2, segment: "settings" }
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [user, setUser] = useState(mockUser);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const projectId = params?.projectId;
  const unread = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    api.me()
      .then((res) => { setUser(res.data.user); setAuthChecked(true); })
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!authChecked) {
    return (
      <div style={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div className="logo-mark" style={{ width: 48, height: 48 }}><Rocket size={22} /></div>
          <div className="skeleton" style={{ width: 120, height: 12 }} />
        </div>
      </div>
    );
  }

  async function handleLogout() {
    try { await api.logout(); } catch {}
    router.replace("/login");
  }

  function isActive(href) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const sidebarContent = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 4px 12px", borderBottom: "1px solid var(--border)", marginBottom: 8 }}>
        {!collapsed ? (
          <Link className="logo" href="/dashboard" style={{ fontSize: 15 }}>
            <span className="logo-mark" style={{ width: 30, height: 30 }}><Rocket size={15} /></span>
            <span className="font-display">Devflow AI</span>
          </Link>
        ) : (
          <Link href="/dashboard" style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--info))", color: "white", margin: "0 auto" }}>
            <Rocket size={15} />
          </Link>
        )}
        <button className="icon-btn" onClick={() => setCollapsed((c) => !c)} style={{ width: 28, height: 28, border: "none", background: "transparent", flexShrink: 0 }} type="button">
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {!collapsed ? <span className="sidebar-section">Main</span> : null}

      {globalNav.map(({ href, label, icon: Icon, badge }) => (
        <Link className={`sidebar-item ${isActive(href) ? "active" : ""}`} href={href} key={href} title={collapsed ? label : undefined}>
          <Icon size={18} style={{ flexShrink: 0 }} />
          {!collapsed ? <span className="sidebar-label">{label}</span> : null}
          {!collapsed && badge ? <span className="sidebar-badge">{badge}</span> : null}
        </Link>
      ))}

      {projectId ? (
        <>
          <div className="sidebar-divider" />
          {!collapsed ? <span className="sidebar-section">Project</span> : null}
          {projectNav.map(({ label, icon: Icon, segment }) => {
            const href = `/dashboard/projects/${projectId}${segment ? `/${segment}` : ""}`;
            return (
              <Link className={`sidebar-item ${pathname === href ? "active" : ""}`} href={href} key={label} title={collapsed ? label : undefined}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed ? <span className="sidebar-label">{label}</span> : null}
              </Link>
            );
          })}
        </>
      ) : null}

      <div style={{ flex: 1 }} />
      <div className="sidebar-divider" />

      {bottomNav.map(({ href, label, icon: Icon }) => (
        <Link className={`sidebar-item ${isActive(href) ? "active" : ""}`} href={href} key={href} title={collapsed ? label : undefined}>
          <Icon size={18} style={{ flexShrink: 0 }} />
          {!collapsed ? <span className="sidebar-label">{label}</span> : null}
        </Link>
      ))}
    </>
  );

  return (
    <div className={`dash-shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      {/* Navbar */}
      <header className="dash-navbar">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="dash-search">
            <Search size={16} color="var(--muted)" />
            <input placeholder="Search anything..." readOnly />
            <kbd>⌘K</kbd>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link className="btn btn-primary" href="/dashboard/projects/create" style={{ minHeight: 36, padding: "0 14px", fontSize: 13, gap: 6 }}>
            <Plus size={16} /> New
          </Link>
          <Link className="icon-btn" href="/dashboard/ai" title="AI Assistant">
            <Sparkles size={18} />
          </Link>
          <ThemeToggle />

          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button className="icon-btn" onClick={() => { setNotifOpen((o) => !o); setUserMenuOpen(false); }} type="button" style={{ position: "relative" }}>
              <Bell size={18} />
              {unread > 0 ? <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", border: "2px solid var(--bg)" }} /> : null}
            </button>
            {notifOpen ? (
              <div style={{ position: "absolute", right: 0, top: 52, width: 340, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, boxShadow: "0 16px 48px rgba(0,0,0,0.3)", zIndex: 50, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong style={{ fontSize: 15 }}>Notifications</strong>
                  <button onClick={() => setNotifOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }} type="button"><X size={16} /></button>
                </div>
                {mockNotifications.slice(0, 5).map((n) => (
                  <div key={n._id} style={{ padding: "12px 20px", borderBottom: "1px solid color-mix(in srgb, var(--border) 50%, transparent)", background: n.read ? "transparent" : "color-mix(in srgb, var(--primary) 5%, transparent)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                    {!n.read ? <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", marginTop: 5, flexShrink: 0 }} /> : <div style={{ width: 7, flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600 }}>{n.title}</p>
                      <p className="muted" style={{ margin: "0 0 2px", fontSize: 12 }}>{n.desc}</p>
                      <span style={{ fontSize: 11, color: "var(--soft)" }}>{n.time}</span>
                    </div>
                  </div>
                ))}
                <div style={{ padding: "12px 20px" }}>
                  <Link href="/dashboard/notifications" className="muted" style={{ fontSize: 13, fontWeight: 600 }} onClick={() => setNotifOpen(false)}>View all notifications</Link>
                </div>
              </div>
            ) : null}
          </div>

          {/* User Menu */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { setUserMenuOpen((o) => !o); setNotifOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} type="button">
              <Avatar name={user?.name || "U"} size={36} color="#3b82f6" />
            </button>
            {userMenuOpen ? (
              <div style={{ position: "absolute", right: 0, top: 48, width: 220, background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 16px 48px rgba(0,0,0,0.3)", zIndex: 50, overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                  <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14 }}>{user?.name}</p>
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>{user?.email}</p>
                </div>
                <Link href="/dashboard/profile" className="sidebar-item" style={{ borderRadius: 0 }} onClick={() => setUserMenuOpen(false)}><Users size={16} /><span>Profile</span></Link>
                <Link href="/dashboard/settings" className="sidebar-item" style={{ borderRadius: 0 }} onClick={() => setUserMenuOpen(false)}><Settings size={16} /><span>Settings</span></Link>
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  <button className="sidebar-item" onClick={handleLogout} style={{ borderRadius: 0, color: "var(--danger)", width: "100%" }} type="button">
                    <LogOut size={16} /><span>Logout</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="dash-sidebar">{sidebarContent}</aside>

      {/* Mobile Overlay */}
      {mobileOpen ? (
        <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)" }} onClick={() => setMobileOpen(false)} />
          <aside style={{ position: "relative", width: 260, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "16px 12px", gap: 4, overflowY: "auto", zIndex: 1 }}>
            <button onClick={() => setMobileOpen(false)} style={{ alignSelf: "flex-end", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", marginBottom: 8 }} type="button"><X size={20} /></button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <main className="dash-main">{children}</main>
      <ToastContainer />
    </div>
  );
}
