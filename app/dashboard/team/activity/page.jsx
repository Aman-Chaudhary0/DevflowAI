"use client";
import { useState } from "react";
import { Download, Filter } from "lucide-react";
import {
  Avatar,
  EmptyState,
  PageHeader,
  StatCard,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { activities } from "@/lib/mock/workspace";
export default function TeamActivityPage() {
  const [type, setType] = useState("All"),
    [selected, setSelected] = useState(null);
  const rows = activities.filter((x) => type === "All" || x.type === type);
  return (
    <div>
      <Crumb items={["Dashboard", "Team", "Activity"]} />
      <PageHeader
        title="Team Activity"
        subtitle="Track what your team is building, reviewing, deploying, and discussing."
      >
        <button
          className="btn btn-outline"
          onClick={() => toast("Activity export prepared")}
          type="button"
        >
          <Download size={16} />
          Export
        </button>
      </PageHeader>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Activity today" value="87" />
        <StatCard label="Commits" value="31" />
        <StatCard label="Reviews" value="14" />
        <StatCard label="AI operations" value="36" />
      </div>
      <section className="card p-5 mt-6">
        <div className="flex gap-3 flex-wrap mb-5">
          <Filter size={17} />
          {[
            "All",
            "Commit",
            "Pull Request",
            "Task",
            "AI Generation",
            "Deployment",
          ].map((x) => (
            <button
              key={x}
              className={`btn ${type === x ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setType(x)}
              type="button"
            >
              {x}
            </button>
          ))}
        </div>
        {rows.length ? (
          <div className="timeline">
            {rows.map((a) => (
              <div className="timeline-item" key={a.id}>
                <div className="timeline-dot" />
                <div className="flex-1 rounded-xl border border-(--border) p-4">
                  <div className="flex justify-between gap-3">
                    <div className="flex gap-2">
                      <Avatar name={a.member} size={32} />
                      <div>
                        <b>{a.member}</b> {a.action} <b>{a.resource}</b>
                        <p className="muted text-sm m-0 mt-1">
                          {a.project} · {a.time}
                        </p>
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setSelected(a)}
                      type="button"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No activity found"
            description="No activity matches the selected filters."
            action="Clear filters"
            onAction={() => setType("All")}
          />
        )}
      </section>
      <Drawer
        open={!!selected}
        title="Activity details"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <p>
              <b>{selected.member}</b> {selected.action}{" "}
              <b>{selected.resource}</b>.
            </p>
            <p className="muted">
              Project: {selected.project}
              <br />
              Timestamp: {selected.time}
              <br />
              Related item: {selected.resource}
            </p>
          </>
        )}
      </Drawer>
    </div>
  );
}
