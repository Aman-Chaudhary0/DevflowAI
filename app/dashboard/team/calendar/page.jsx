"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { ConfirmDialog, PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { events as seed } from "@/lib/mock/workspace";
export default function CalendarPage() {
  const [events, setEvents] = useState(seed),
    [selected, setSelected] = useState(null),
    [create, setCreate] = useState(false),
    [view, setView] = useState("Month");
  return (
    <div>
      <Crumb items={["Dashboard", "Team", "Calendar"]} />
      <PageHeader
        title="Team Calendar"
        subtitle="Coordinate deadlines, deployments, meetings, milestones, and team tasks."
      >
        <button
          className="btn btn-outline"
          onClick={() => toast("Showing today")}
          type="button"
        >
          Today
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setCreate(true)}
          type="button"
        >
          <Plus size={16} />
          Create Event
        </button>
      </PageHeader>
      <section className="card p-5 mt-6">
        <div className="flex justify-between items-center flex-wrap gap-3 mb-5">
          <div className="flex gap-2">
            <button className="icon-btn" aria-label="Previous" type="button">
              <ChevronLeft />
            </button>
            <button className="icon-btn" aria-label="Next" type="button">
              <ChevronRight />
            </button>
            <b className="ml-2">August 2026</b>
          </div>
          <div className="flex gap-2">
            {["Month", "Week", "Day", "Agenda"].map((x) => (
              <button
                key={x}
                className={`btn ${view === x ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setView(x)}
                type="button"
              >
                {x}
              </button>
            ))}
          </div>
        </div>
        <div className="dash-grid-3">
          {events.map((e) => (
            <button
              key={e.id}
              className="text-left rounded-2xl border border-(--border) p-5 bg-(--bg) hover:border-(--primary)"
              onClick={() => setSelected(e)}
              type="button"
            >
              <span className="badge">{e.type}</span>
              <h3 className="mb-1">{e.title}</h3>
              <p className="muted m-0">
                {e.day} · {e.time}
                <br />
                {e.project}
              </p>
            </button>
          ))}
        </div>
      </section>
      <ConfirmDialog
        open={create}
        title="Create calendar event"
        description="A Deployment event for DevFlow AI will be added to the shared calendar."
        confirmLabel="Create Event"
        onConfirm={() => {
          setEvents((p) => [
            ...p,
            {
              id: Date.now(),
              day: "Thu 27",
              title: "Sprint planning",
              type: "Meeting",
              project: "DevFlow AI",
              time: "11:00 AM",
            },
          ]);
          setCreate(false);
          toast("Event created");
        }}
        onCancel={() => setCreate(false)}
      />
      <Drawer
        open={!!selected}
        title="Event details"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <p>
            <b>{selected.title}</b>
            <br />
            {selected.type} · {selected.project}
            <br />
            {selected.day}, {selected.time}
            <br />
            <button
              className="btn btn-outline mt-4"
              onClick={() => toast("Related item opened")}
              type="button"
            >
              Open Related Item
            </button>
          </p>
        )}
      </Drawer>
    </div>
  );
}
