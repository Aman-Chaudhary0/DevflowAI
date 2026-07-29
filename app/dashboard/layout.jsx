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
      <div className="grid place-items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
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
      <div className="flex items-center justify-between pb-3 border-b border-(--border) mb-2" style={{ padding: "4px 4px 12px" }}>
        {!collapsed ? (
          <Link className="logo" href="/dashboard" style={{ fontSize: 15 }}>
            <span className="logo-mark" style={{ width: 30, height: 30 }}><Rocket size={15} /></span>
            <span className="font-display">Devflow AI</span>
          </Link>
        ) : (
          <Link href="/dashboard" className="grid place-items-center rounded-[10px] w-7.5 h-7.5 bg-linear-to-br from-(--primary) to-(--info) text-white mx-auto">
            <Rocket size={15} />
          </Link>
        )}
        <button className="icon-btn w-7 h-7 border-0 bg-transparent shrink-0" onClick={() => setCollapsed((c) => !c)} type="button">
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

      <div className="flex-1" />
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
        <div className="flex items-center gap-3">
          <div className="dash-search">
            <Search size={16} color="var(--muted)" />
            <input placeholder="Search anything..." readOnly />
            <kbd>⌘K</kbd>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link className="btn btn-primary" href="/dashboard/projects/create" style={{ minHeight: 36, padding: "0 14px", fontSize: 13, gap: 6 }}>
            <Plus size={16} /> New
          </Link>
          <Link className="icon-btn" href="/dashboard/ai" title="AI Assistant">
            <Sparkles size={18} />
          </Link>
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button className="icon-btn relative" onClick={() => { setNotifOpen((o) => !o); setUserMenuOpen(false); }} type="button">
              <Bell size={18} />
              {unread > 0 ? <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-(--danger) border-2 border-(--bg)" /> : null}
            </button>
            {notifOpen ? (
              <div className="absolute right-0 top-13 w-85 bg-(--card) border border-(--border) rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.3)] z-50 overflow-hidden">
                <div className="flex justify-between items-center px-5 py-4 border-b border-(--border)">
                  <strong className="text-[15px]">Notifications</strong>
                  <button onClick={() => setNotifOpen(false)} className="bg-transparent border-0 cursor-pointer text-(--muted)" type="button"><X size={16} /></button>
                </div>
                {mockNotifications.slice(0, 5).map((n) => (
                  <div key={n._id} className="flex gap-2.5 items-start px-5 py-3 border-b border-(--border)/50" style={{ background: n.read ? "transparent" : "color-mix(in srgb, var(--primary) 5%, transparent)" }}>
                    {!n.read ? <div className="w-1.75 h-1.75 rounded-full bg-(--primary) mt-1.25 shrink-0" /> : <div className="w-1.75 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="m-0 mb-0.5 text-[13px] font-semibold">{n.title}</p>
                      <p className="muted m-0 mb-0.5 text-xs">{n.desc}</p>
                      <span className="text-[11px] text-(--soft)">{n.time}</span>
                    </div>
                  </div>
                ))}
                <div className="px-5 py-3">
                  <Link href="/dashboard/notifications" className="muted text-[13px] font-semibold" onClick={() => setNotifOpen(false)}>View all notifications</Link>
                </div>
              </div>
            ) : null}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button onClick={() => { setUserMenuOpen((o) => !o); setNotifOpen(false); }} className="bg-transparent border-0 cursor-pointer p-0" type="button">
              <Avatar name={user?.name || "U"} size={36} color="#3b82f6" />
            </button>
            {userMenuOpen ? (
              <div className="absolute right-0 top-12 w-55 bg-(--card) border border-(--border) rounded-[14px] shadow-[0_16px_48px_rgba(0,0,0,0.3)] z-50 overflow-hidden">
                <div className="px-4 py-3.5 border-b border-(--border)">
                  <p className="m-0 mb-0.5 font-bold text-sm">{user?.name}</p>
                  <p className="muted m-0 text-xs">{user?.email}</p>
                </div>
                <Link href="/dashboard/profile" className="sidebar-item rounded-none" onClick={() => setUserMenuOpen(false)}><Users size={16} /><span>Profile</span></Link>
                <Link href="/dashboard/settings" className="sidebar-item rounded-none" onClick={() => setUserMenuOpen(false)}><Settings size={16} /><span>Settings</span></Link>
                <div className="border-t border-(--border)">
                  <button className="sidebar-item rounded-none text-(--danger) w-full" onClick={handleLogout} type="button">
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
        <div className="fixed inset-0 z-60 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-65 bg-(--surface) border-r border-(--border) flex flex-col p-4 gap-1 overflow-y-auto z-1">
            <button onClick={() => setMobileOpen(false)} className="self-end bg-transparent border-0 cursor-pointer text-(--muted) mb-2" type="button"><X size={20} /></button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      <main className="dash-main">{children}</main>
      <ToastContainer />
    </div>
  );
}
