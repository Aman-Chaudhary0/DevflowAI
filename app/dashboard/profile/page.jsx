"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User, Mail, MapPin, Calendar, Globe, Github, Twitter, ShieldCheck,
  Edit3, Key, Sparkles, GitCommit, GitPullRequest, Folder, Award, Code2, Check, Copy
} from "lucide-react";
import { PageHeader, StatCard, Avatar, toast } from "@/components/dashboard-ui";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "Aman Chaudhary",
    username: "@amanchaudhary",
    role: "Full Stack Engineer & AI Developer",
    email: "aman@devflow.ai",
    location: "San Francisco, CA",
    joined: "January 2024",
    website: "https://amanchaudhary.dev",
    bio: "Passionate developer building AI-powered workspace tools, dark-mode design systems, and cloud infrastructure.",
    github: "amanchaudhary",
    twitter: "amanchaudhary_ai"
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setShowEditModal(false);
    toast("Profile information updated successfully!", "success");
  };

  const skills = [
    { name: "Next.js 15 / React", level: "Expert" },
    { name: "Node.js & MongoDB", level: "Expert" },
    { name: "TypeScript / JavaScript", level: "Advanced" },
    { name: "AI & LLM Integration", level: "Advanced" },
    { name: "Tailwind CSS & Design Systems", level: "Expert" },
    { name: "Docker & CI/CD Pipelines", level: "Intermediate" }
  ];

  const recentActivity = [
    { type: "commit", text: "Merged PR #142 into main branch", time: "2 hours ago" },
    { type: "ai", text: "Generated 12 TypeScript interfaces with AI Generator", time: "5 hours ago" },
    { type: "project", text: "Created new project 'Devflow AI Core'", time: "Yesterday" },
    { type: "review", text: "Completed AI Code Review for backend API routes", time: "2 days ago" }
  ];

  return (
    <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Cover Banner */}
      <div style={{ height: 180, background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)", borderRadius: "18px 18px 0 0", position: "relative" }} />

      {/* Profile Header Info */}
      <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderTop: "none", borderRadius: "0 0 18px 18px", padding: "0 28px 24px", marginBottom: 24, position: "relative" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", marginTop: -50, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
            <div style={{ border: "4px solid var(--card)", borderRadius: "50%", background: "var(--card)", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", position: "relative" }}>
              <Avatar name={profile.name} size={96} color="#3b82f6" />
              <span style={{ position: "absolute", bottom: 6, right: 6, width: 18, height: 18, borderRadius: "50%", background: "#10b981", border: "3px solid var(--card)" }} title="Online" />
            </div>

            <div>
              <h1 style={{ margin: "0 0 4px 0", fontSize: 22, fontWeight: 800 }}>{profile.name}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)" }}>
                <span>{profile.username}</span>
                <span>•</span>
                <span style={{ color: "var(--primary)", fontWeight: 600 }}>{profile.role}</span>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={() => setShowEditModal(true)} style={{ minHeight: 38, fontSize: 13, gap: 6, marginTop: 16 }}>
            <Edit3 size={15} /> Edit Profile
          </button>
        </div>

        {/* Bio & Details */}
        <p style={{ margin: "0 0 20px 0", fontSize: 14, color: "var(--fg)", lineHeight: 1.6, maxWidth: 800 }}>
          {profile.bio}
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 20, fontSize: 13, color: "var(--muted)", paddingTop: 16, borderTop: "1px solid color-mix(in srgb, var(--border) 50%, transparent)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={15} /> {profile.location}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Mail size={15} /> {profile.email}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Globe size={15} /> <a href={profile.website} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>{profile.website}</a></span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Calendar size={15} /> Joined {profile.joined}</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Commits Pushed" value="342" delta="+28 this month" trend="up" icon={GitCommit} iconBg="rgba(59, 130, 246, 0.15)" />
        <StatCard label="Pull Requests" value="48" delta="12 merged" trend="up" icon={GitPullRequest} iconBg="rgba(16, 185, 129, 0.15)" />
        <StatCard label="AI Prompts Used" value="1,280" delta="Top 5% user" trend="up" icon={Sparkles} iconBg="rgba(139, 92, 246, 0.15)" />
        <StatCard label="Projects Managed" value="14" delta="6 active" trend="neutral" icon={Folder} iconBg="rgba(245, 158, 11, 0.15)" />
      </div>

      {/* Profile Tabs Navigation */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid var(--border)", paddingBottom: 12, marginBottom: 24 }}>
        {[
          { id: "overview", label: "Overview & Bio" },
          { id: "skills", label: "Skills & Stack" },
          { id: "activity", label: "Recent Activity" },
          { id: "accounts", label: "Connected Accounts" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              border: "1px solid",
              borderColor: activeTab === tab.id ? "var(--primary)" : "transparent",
              background: activeTab === tab.id ? "var(--primary)" : "rgba(255,255,255,0.03)",
              color: activeTab === tab.id ? "#fff" : "var(--muted)",
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700 }}>About Developer</h3>
            <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "0 0 20px 0" }}>
              Senior Full Stack Architect specializing in React, Next.js, WebSockets, and AI developer tooling. Currently architecting Devflow AI platform to streamline developer workflows and automate documentation generation.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", fontWeight: 600 }}>Frontend Architecture</span>
              <span style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, background: "rgba(16, 185, 129, 0.15)", color: "#10b981", fontWeight: 600 }}>AI Integration</span>
              <span style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, background: "rgba(139, 92, 246, 0.15)", color: "#8b5cf6", fontWeight: 600 }}>DevOps Pipelines</span>
            </div>
          </div>

          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 16, fontWeight: 700 }}>Workspace Badges</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Award size={20} style={{ color: "#f59e0b" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Early Contributor</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Founding workspace developer</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ShieldCheck size={20} style={{ color: "#10b981" }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>2FA Verified</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>Secure authentication enabled</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "skills" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 18px 0", fontSize: 16, fontWeight: 700 }}>Technical Proficiencies</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {skills.map((s, i) => (
              <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 16, background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Code2 size={18} style={{ color: "var(--primary)" }} />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                </div>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(59, 130, 246, 0.15)", color: "#3b82f6", fontWeight: 600 }}>{s.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 18px 0", fontSize: 16, fontWeight: 700 }}>Activity Feed</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {recentActivity.map((act, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 12, borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(59, 130, 246, 0.15)", display: "grid", placeItems: "center" }}>
                    <GitCommit size={16} style={{ color: "#3b82f6" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{act.text}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "accounts" && (
        <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 16, padding: 24 }}>
          <h3 style={{ margin: "0 0 18px 0", fontSize: 16, fontWeight: 700 }}>Connected Accounts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Github size={20} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>GitHub Account</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Connected as github.com/{profile.github}</div>
                </div>
              </div>
              <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Check size={14} /> Connected</span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 999, display: "grid", placeItems: "center", padding: 20 }}>
          <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 18, width: "100%", maxWidth: 520, padding: 24 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 700 }}>Edit Profile</h3>
            <p style={{ margin: "0 0 20px 0", fontSize: 13, color: "var(--muted)" }}>Update your workspace profile details.</p>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Role Title</label>
                <input
                  type="text"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Bio</label>
                <textarea
                  rows={3}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13, resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 6, color: "var(--muted)" }}>Website</label>
                  <input
                    type="text"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)", color: "var(--fg)", fontSize: 13 }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)} style={{ minHeight: 36, fontSize: 13 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ minHeight: 36, fontSize: 13 }}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
