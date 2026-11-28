"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity, Calendar, CheckCircle2, Folder, Github, Mail, Rocket,
  ShieldCheck, Sparkles, UserRound, ListChecks
} from "lucide-react";
import { Avatar, EmptyState, StatCard, toast } from "@/components/dashboard-ui";
import { api } from "@/lib/api";

const panelStyle = {
  minWidth: 0,
  padding: 22,
  border: "1px solid var(--border)",
  borderRadius: 16,
  background: "var(--card)"
};

function formatJoinedDate(value) {
  if (!value) return "Unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function formatBytes(value = 0) {
  const bytes = Number(value) || 0;
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[index]}`;
}

function activityDescription(activity) {
  const action = String(activity.action || "updated").replaceAll("_", " ");
  const subject = activity.metadata?.title || activity.metadata?.name || activity.project?.name;
  return subject ? `${action}: ${subject}` : `${action} ${activity.entityType || "workspace item"}`;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [usage, setUsage] = useState(null);
  const [github, setGithub] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      api.me(),
      api.dashboard.summary(),
      api.ai.usage.summary(),
      api.github.status()
    ]).then(([profileResult, dashboardResult, usageResult, githubResult]) => {
      if (ignore) return;

      if (profileResult.status === "fulfilled") {
        const response = profileResult.value;
        setProfile(response?.data?.user || response?.user || null);
      } else {
        toast(profileResult.reason?.message || "Unable to load your account profile", "error");
      }

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value?.data || dashboardResult.value || null);
      }
      if (usageResult.status === "fulfilled") {
        setUsage(usageResult.value?.data || usageResult.value || null);
      }
      if (githubResult.status === "fulfilled") {
        setGithub(githubResult.value?.data || githubResult.value || null);
      }
    }).finally(() => {
      if (!ignore) setLoading(false);
    });

    return () => { ignore = true; };
  }, []);

  const activities = dashboard?.recentActivity || [];
  const roleLabel = profile?.role === "admin" ? "Workspace administrator" : "Workspace member";
  const accountProvider = profile?.provider ? `${profile.provider[0].toUpperCase()}${profile.provider.slice(1)}` : "Unknown";

  return (
    <div className="real-profile-page" style={{ width: "100%", maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <div className="real-profile-cover" />

      <section className="real-profile-header">
        <div className="real-profile-identity">
          <div className="real-profile-avatar"><Avatar name={profile?.name || "User"} size={84} color="var(--primary)" /></div>
          <div className="real-profile-name-block">
            <h1>{loading ? "Loading profile…" : profile?.name || "Account profile"}</h1>
            <div className="real-profile-role"><span>{roleLabel}</span><span className="real-profile-dot" /><span>{accountProvider} account</span></div>
          </div>
        </div>

        <div className="real-profile-details">
          <span><Mail size={15} />{profile?.email || "Email unavailable"}</span>
          <span><Calendar size={15} />Joined {formatJoinedDate(profile?.createdAt)}</span>
          {profile && <span><ShieldCheck size={15} />{profile.isVerified ? "Email verified" : "Email not verified"}</span>}
        </div>
      </section>

      <section className="real-profile-stats" aria-label="Account activity from your workspace">
        <StatCard label="Projects Managed" value={dashboard ? String(dashboard.totalProjects ?? 0) : "—"} delta={`${dashboard?.activeProjects ?? 0} active`} trend="neutral" icon={Folder} iconBg="rgba(245, 158, 11, 0.15)" />
        <StatCard label="Tasks" value={dashboard ? String(dashboard.taskCount ?? 0) : "—"} delta={`${dashboard?.openTaskCount ?? 0} open`} trend="neutral" icon={ListChecks} iconBg="rgba(59, 130, 246, 0.15)" />
        <StatCard label="AI Requests" value={usage ? String(usage.total ?? 0) : "—"} delta="All time" trend="neutral" icon={Sparkles} iconBg="rgba(139, 92, 246, 0.15)" />
        <StatCard label="Deployments" value={dashboard ? String(dashboard.deploymentCount ?? 0) : "—"} delta={dashboard?.latestDeploymentAt ? `Latest ${new Date(dashboard.latestDeploymentAt).toLocaleDateString()}` : "None yet"} trend="neutral" icon={Rocket} iconBg="rgba(16, 185, 129, 0.15)" />
      </section>

      <nav className="real-profile-tabs" aria-label="Profile sections">
        {[
          ["overview", "Account overview"],
          ["activity", "Recent activity"],
          ["accounts", "Connected accounts"]
        ].map(([id, label]) => (
          <button key={id} type="button" className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)} aria-current={activeTab === id ? "page" : undefined}>{label}</button>
        ))}
      </nav>

      {activeTab === "overview" && (
        <div className="real-profile-panels">
          <section style={panelStyle}>
            <h2 className="real-profile-panel-title">Account details</h2>
            {loading ? <p className="real-profile-muted">Loading your account data…</p> : profile ? (
              <dl className="real-profile-definition-list">
                <div><dt><UserRound size={15} />Name</dt><dd>{profile.name || "—"}</dd></div>
                <div><dt><Mail size={15} />Email</dt><dd>{profile.email || "—"}</dd></div>
                <div><dt><ShieldCheck size={15} />Access</dt><dd>{roleLabel}</dd></div>
                <div><dt><Calendar size={15} />Member since</dt><dd>{formatJoinedDate(profile.createdAt)}</dd></div>
              </dl>
            ) : <p className="real-profile-muted">Account details are unavailable.</p>}
          </section>

          <section style={panelStyle}>
            <h2 className="real-profile-panel-title">Workspace overview</h2>
            {loading ? <p className="real-profile-muted">Loading workspace data…</p> : dashboard ? (
              <div className="real-profile-overview-list">
                <div><span>Active projects</span><strong>{dashboard.activeProjects ?? 0}</strong></div>
                <div><span>Open tasks</span><strong>{dashboard.openTaskCount ?? 0}</strong></div>
                <div><span>Stored files</span><strong>{formatBytes(dashboard.storageBytes)}</strong></div>
              </div>
            ) : <p className="real-profile-muted">Workspace summary is unavailable.</p>}
          </section>
        </div>
      )}

      {activeTab === "activity" && (
        <section style={panelStyle}>
          <h2 className="real-profile-panel-title">Recent workspace activity</h2>
          {loading ? <p className="real-profile-muted">Loading activity…</p> : activities.length ? (
            <div className="real-profile-activity-list">
              {activities.map((activity) => (
                <div className="real-profile-activity-item" key={activity._id || `${activity.action}-${activity.createdAt}`}>
                  <span className="real-profile-activity-icon"><Activity size={16} /></span>
                  <div><strong>{activityDescription(activity)}</strong><span>{activity.actor?.name || "Workspace member"}</span></div>
                  <time dateTime={activity.createdAt}>{activity.createdAt ? new Date(activity.createdAt).toLocaleString() : ""}</time>
                </div>
              ))}
            </div>
          ) : <EmptyState icon={Activity} title="No recent activity" description="Workspace changes will appear here as they happen." />}
        </section>
      )}

      {activeTab === "accounts" && (
        <section style={panelStyle}>
          <h2 className="real-profile-panel-title">Connected accounts</h2>
          <div className="real-profile-connected-account">
            <span className="real-profile-connected-icon"><Github size={19} /></span>
            <div><strong>GitHub</strong><span>{github?.connected ? `Connected as ${github.account?.login || "GitHub user"}` : "Not connected"}</span></div>
            {github?.connected ? <span className="real-profile-connected-status"><CheckCircle2 size={15} />Connected</span> : <Link className="btn btn-outline" href="/dashboard/github">Connect GitHub</Link>}
          </div>
          <div className="real-profile-connected-account">
            <span className="real-profile-connected-icon"><UserRound size={19} /></span>
            <div><strong>Devflow AI account</strong><span>Signed in with {accountProvider}</span></div>
            {profile?.isVerified && <span className="real-profile-connected-status"><CheckCircle2 size={15} />Verified</span>}
          </div>
        </section>
      )}
    </div>
  );
}
