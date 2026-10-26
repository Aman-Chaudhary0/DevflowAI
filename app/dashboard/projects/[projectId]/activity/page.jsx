"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Activity, Bot, CheckCircle2, Download, GitCommit, Rocket, Search, Upload, UserPlus } from "lucide-react";
import { EmptyState, FilterBar, PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { getProjectByKey } from "@/lib/dashboard-data";
import { api } from "@/lib/api";
import { connectRealtime } from "@/lib/realtime";

const typeFilters = [
  { label: "All", value: "all" },
  { label: "AI", value: "ai" },
  { label: "Git", value: "git" },
  { label: "Deploy", value: "deploy" },
  { label: "Tasks", value: "task" },
  { label: "Files", value: "file" },
  { label: "Team", value: "team" }
];

const iconMap = {
  bot: Bot, "git-merge": Activity, "git-commit": GitCommit,
  rocket: Rocket, "check-circle": CheckCircle2, upload: Upload, "user-plus": UserPlus
};

const colorMap = {
  ai: "var(--purple)", git: "var(--primary)", deploy: "var(--success)",
  task: "var(--warning)", file: "var(--info)", team: "var(--pink)"
};

export default function ProjectActivityPage() {
  const { projectId } = useParams();
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [activity, setActivity] = useState([]);
  const projectName = getProjectByKey(projectId)?.name || projectId;

  const loadActivity = useCallback(async () => {
    try {
      const response = await api.projects.activity(projectId);
      const rows = response?.data?.activity || response?.activity || [];
      setActivity(rows.map((row) => ({
        _id: String(row._id),
        type: row.entityType === "task" ? "task" : row.entityType,
        icon: row.entityType === "task" ? "check-circle" : "upload",
        title: `${String(row.action || "updated").replaceAll("_", " ")}${row.metadata?.title ? `: ${row.metadata.title}` : ""}`,
        user: row.actor?.name || "Team member",
        occurredAt: row.createdAt,
        time: new Date(row.createdAt).toLocaleString()
      })));
    } catch (error) {
      setActivity([]);
      toast(error.message || "Unable to load project activity", "error");
    }
  }, [projectId]);

  useEffect(() => { loadActivity(); }, [loadActivity]);
  useEffect(() => {
    const socket = connectRealtime();
    const refresh = (event) => {
      if (String(event?.projectId || "") === String(projectId)) loadActivity();
    };
    socket.on("activity.created", refresh);
    socket.on("connect", loadActivity);
    return () => {
      socket.off("activity.created", refresh);
      socket.off("connect", loadActivity);
    };
  }, [projectId, loadActivity]);

  const filterItems = (items) => items
    .filter((a) => typeFilter === "all" || a.type === typeFilter)
    .filter((a) => a.title.toLowerCase().includes(search.toLowerCase()));

  const dateGroup = (value) => {
    const date = new Date(value);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    return date.toDateString() === yesterday.toDateString() ? "Yesterday" : "Earlier";
  };
  const grouped = activity.reduce((result, item) => {
    const label = dateGroup(item.occurredAt);
    result[label] ||= [];
    result[label].push(item);
    return result;
  }, {});
  const visibleGroups = ["Today", "Yesterday", "Earlier"].map((label) => ({ label, items: filterItems(grouped[label] || []) }));
  const hasResults = visibleGroups.some(({ items }) => items.length > 0);

  return (
    <>
      <Crumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Projects", href: "/dashboard/projects" }, { label: projectName, href: `/dashboard/projects/${projectId}` }, { label: "Activity" }]} />
      <PageHeader title="Activity" subtitle="Full project history">
        <button className="btn btn-outline" onClick={() => toast("Exported as CSV", "success")} style={{ minHeight: 38, fontSize: 13 }} type="button"><Download size={16} /> Export CSV</button>
        <button className="btn btn-outline" onClick={() => toast("Exported as PDF", "success")} style={{ minHeight: 38, fontSize: 13 }} type="button"><Download size={16} /> Export PDF</button>
      </PageHeader>

      {/* Stats */}
      <div className="dash-grid-3">
        {[["Total Events", activity.length, "var(--primary)"], ["AI Actions", activity.filter((a) => a.type === "ai").length, "var(--purple)"], ["Deployments", activity.filter((a) => a.type === "deploy").length, "var(--success)"]].map(([label, val, color]) => (
          <div key={label} className="stat-card" style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `color-mix(in srgb, ${color} 15%, transparent)`, display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Activity size={20} color={color} />
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 800, fontFamily: "Space Grotesk, Inter, sans-serif" }}>{val}</p>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div className="dash-search" style={{ flex: 1, maxWidth: 320 }}>
          <Search size={15} color="var(--muted)" />
          <input placeholder="Search activity..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <FilterBar filters={typeFilters} active={typeFilter} onChange={setTypeFilter} />

      {!hasResults ? (
        <EmptyState
          icon={Activity}
          title="No activity found"
          description="Clear filters or search a different keyword to reveal project history."
          action="Reset filters"
          onAction={() => { setTypeFilter("all"); setSearch(""); }}
        />
      ) : visibleGroups.map(({ label, items }) => {
        if (items.length === 0) return null;
        return (
          <div key={label}>
            <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--soft)" }}>{label}</p>
            <div className="stat-card" style={{ gap: 0, padding: 0, overflow: "hidden" }}>
              {items.map((a, i) => {
                const Icon = iconMap[a.icon] || Activity;
                const color = colorMap[a.type] || "var(--primary)";
                return (
                  <div key={a._id} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 20px", borderBottom: i < items.length - 1 ? "1px solid color-mix(in srgb, var(--border) 50%, transparent)" : "none" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `color-mix(in srgb, ${color} 15%, transparent)`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Icon size={18} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600 }}>{a.title}</p>
                      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <span className="muted" style={{ fontSize: 12 }}>{a.user}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--soft)", display: "inline-block" }} />
                        <span style={{ fontSize: 12, color: "var(--soft)" }}>{a.time}</span>
                      </div>
                    </div>
                    <span className="badge" style={{ padding: "2px 8px", fontSize: 11, flexShrink: 0 }}>{a.type}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
