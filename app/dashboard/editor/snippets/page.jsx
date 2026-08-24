"use client";
import { useState } from "react";
import { Copy, Heart, Plus, Search } from "lucide-react";
import {
  ConfirmDialog,
  PageHeader,
  StatCard,
  toast,
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { snippets as seed } from "@/lib/mock/workspace";
export default function SnippetsPage() {
  const [items, setItems] = useState(seed),
    [q, setQ] = useState(""),
    [selected, setSelected] = useState(null),
    [create, setCreate] = useState(false);
  const rows = items.filter((s) =>
    `${s.title} ${s.tags}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div>
      <Crumb items={["Dashboard", "Editor", "Snippets"]} />
      <PageHeader
        title="Code Snippets"
        subtitle="Save, organize, search, and reuse your most useful code."
      >
        <button
          className="btn btn-outline"
          onClick={() => toast("Import ready")}
          type="button"
        >
          Import
        </button>
        <button
          className="btn btn-primary"
          onClick={() => setCreate(true)}
          type="button"
        >
          <Plus size={16} />
          New Snippet
        </button>
      </PageHeader>
      <div className="dash-grid-4 mt-6">
        <StatCard label="Total Snippets" value="128" />
        <StatCard label="Favorites" value="24" />
        <StatCard label="Languages" value="11" />
        <StatCard label="Recently Used" value="18" />
      </div>
      <section className="mt-6">
        <label className="dash-search mb-4">
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search snippets…"
          />
        </label>
        <div className="dash-grid-2">
          {rows.map((s) => (
            <article className="card p-5" key={s.id}>
              <div className="flex justify-between">
                <span className="badge">{s.language}</span>
                <button
                  className="icon-btn"
                  onClick={() => toast("Added to favorites")}
                  aria-label="Favorite"
                  type="button"
                >
                  <Heart size={16} />
                </button>
              </div>
              <h3>{s.title}</h3>
              <p className="muted text-sm">{s.description}</p>
              <pre className="code-preview">{s.code}</pre>
              <div className="flex justify-between items-center mt-4">
                <small className="muted">
                  {s.framework} · {s.uses} uses
                </small>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      navigator.clipboard?.writeText(s.code);
                      toast("Snippet copied.");
                    }}
                    type="button"
                  >
                    <Copy size={15} />
                    Copy
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setSelected(s)}
                    type="button"
                  >
                    Open
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Drawer
        open={!!selected}
        title="Snippet editor"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <input className="input w-full" defaultValue={selected.title} />
            <textarea
              className="input w-full mt-3 font-code"
              rows="14"
              defaultValue={selected.code}
            />
            <button
              className="btn btn-primary mt-3"
              onClick={() => toast("Snippet saved.")}
              type="button"
            >
              Save Snippet
            </button>
          </>
        )}
      </Drawer>
      <ConfirmDialog
        open={create}
        title="Create snippet"
        description="A new JavaScript snippet will be added to your library."
        confirmLabel="Save Snippet"
        onConfirm={() => {
          setItems((p) => [
            ...p,
            { ...seed[0], id: Date.now(), title: "New utility snippet" },
          ]);
          setCreate(false);
          toast("Snippet saved.");
        }}
        onCancel={() => setCreate(false)}
      />
    </div>
  );
}
