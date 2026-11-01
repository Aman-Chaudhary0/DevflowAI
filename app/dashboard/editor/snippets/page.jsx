"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Heart, Plus, Search } from "lucide-react";
import { ConfirmDialog, PageHeader, StatCard, toast } from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

const emptySnippetDraft = {
  title: "",
  description: "",
  code: "",
  language: "javascript",
  framework: "",
  tags: [],
};

const createSnippetDraft = () => ({
  ...emptySnippetDraft,
  title: "",
  description: "",
  code: "",
  language: "javascript",
  framework: "",
  tags: [],
});

export default function SnippetsPage() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, favorites: 0, languages: 0, recentlyUsed: 0 });
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(null);
  const [create, setCreate] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSnippets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [listResponse, statsResponse] = await Promise.all([
        api.snippets.list({ page: 1, limit: 50 }),
        api.snippets.stats(),
      ]);
      const snippets = listResponse?.data?.snippets || listResponse?.snippets || [];
      const statsData = statsResponse?.data || statsResponse || {};
      setItems(snippets);
      setStats({
        total: statsData.total ?? snippets.length,
        favorites: statsData.favorites ?? 0,
        languages: statsData.languages ?? 0,
        recentlyUsed: statsData.recentlyUsed ?? 0,
      });
    } catch (err) {
      setError(err.message || "Unable to load snippets");
      toast(err.message || "Unable to load snippets", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSnippets();
  }, [loadSnippets]);

  const rows = useMemo(() => {
    const term = q.toLowerCase();
    return items.filter((snippet) => `${snippet.title} ${snippet.description} ${(snippet.tags || []).join(" ")}`.toLowerCase().includes(term));
  }, [items, q]);

  const openEditor = (snippet) => {
    setSelected(snippet);
    setDraft({
      title: snippet.title,
      description: snippet.description || "",
      code: snippet.code,
      language: snippet.language || "javascript",
      framework: snippet.framework || "",
      tags: snippet.tags || [],
    });
  };

  const openCreateDialog = () => {
    setCreate(true);
    setSelected(null);
    setDraft(createSnippetDraft());
  };

  const saveSnippet = async () => {
    if (!draft || !draft.title.trim()) {
      toast("Snippet title is required before saving.", "error");
      return;
    }

    if (!draft.code.trim()) {
      toast("Snippet code cannot be empty.", "error");
      return;
    }

    if (!selected || !draft) return;
    try {
      const response = await api.snippets.update(selected._id, draft);
      const updated = response?.data?.snippet || response?.snippet || { ...selected, ...draft };
      setItems((prev) => prev.map((snippet) => (snippet._id === selected._id ? { ...snippet, ...updated } : snippet)));
      setSelected(null);
      setDraft(null);
      toast("Snippet saved.", "success");
      await loadSnippets();
    } catch (err) {
      toast(err.message || "Snippet update failed", "error");
    }
  };

  const saveNewSnippet = async () => {
    if (!draft || !draft.title.trim()) {
      toast("Please enter a snippet title before saving.", "error");
      return;
    }

    if (!draft.code.trim()) {
      toast("Snippet content cannot be empty.", "error");
      return;
    }

    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description?.trim() || "",
        code: draft.code,
        language: draft.language || "javascript",
        framework: draft.framework || "",
        tags: (draft.tags || []).filter(Boolean),
      };
      await api.snippets.create(payload);
      setCreate(false);
      setDraft(null);
      toast("Snippet created.", "success");
      await loadSnippets();
    } catch (err) {
      toast(err.message || "Snippet creation failed", "error");
    }
  };

  const createSnippet = async () => {
    return saveNewSnippet();
  };

  const toggleFavorite = async (snippet) => {
    try {
      await api.snippets.favorite(snippet._id, !snippet.isFavorite);
      setItems((prev) => prev.map((item) => item._id === snippet._id ? { ...item, isFavorite: !item.isFavorite } : item));
      toast(snippet.isFavorite ? "Removed from favorites" : "Added to favorites", "success");
      await loadSnippets();
    } catch (err) {
      toast(err.message || "Unable to update favorites", "error");
    }
  };

  const deleteSnippet = async (snippet) => {
    try {
      await api.snippets.delete(snippet._id);
      setItems((prev) => prev.filter((item) => item._id !== snippet._id));
      setDeleteDialog(null);
      toast("Snippet deleted.", "success");
      await loadSnippets();
    } catch (err) {
      toast(err.message || "Delete failed", "error");
    }
  };

  const copySnippet = async (snippet) => {
    try {
      await navigator.clipboard.writeText(snippet.code || "");
      toast("Snippet copied to clipboard", "success");
    } catch {
      toast("Clipboard access is unavailable", "error");
    }
  };

  return (
    <div>
      <Crumb items={["Dashboard", "Editor", "Snippets"]} />
      <PageHeader title="Code Snippets" subtitle="Save, organize, search, and reuse your most useful code.">
        <button className="btn btn-outline" onClick={() => loadSnippets()} type="button">Refresh</button>
        <button className="btn btn-primary" onClick={openCreateDialog} type="button">
          <Plus size={16} />
          New Snippet
        </button>
      </PageHeader>

      <div className="dash-grid-4 mt-6">
        <StatCard label="Total Snippets" value={String(stats.total)} />
        <StatCard label="Favorites" value={String(stats.favorites)} />
        <StatCard label="Languages" value={String(stats.languages)} />
        <StatCard label="Recently Used" value={String(stats.recentlyUsed)} />
      </div>

      <section className="mt-6">
        {error ? <div className="card p-4 mb-4 text-(--danger)">{error}</div> : null}

        <label className="dash-search mb-4">
          <Search size={16} />
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search snippets…" />
        </label>

        {loading ? (
          <div className="card p-6 text-sm text-(--muted)">Loading snippets…</div>
        ) : rows.length === 0 ? (
          <div className="card p-6 text-sm text-(--muted)">No snippets found for this query.</div>
        ) : (
          <div className="dash-grid-2">
            {rows.map((snippet) => (
              <article className="card p-5" key={snippet._id}>
                <div className="flex justify-between">
                  <span className="badge">{snippet.language || "javascript"}</span>
                  <button className="icon-btn" onClick={() => toggleFavorite(snippet)} aria-label="Favorite" type="button">
                    <Heart size={16} fill={snippet.isFavorite ? "currentColor" : "none"} />
                  </button>
                </div>
                <h3>{snippet.title}</h3>
                <p className="muted text-sm">{snippet.description || "No description provided."}</p>
                <pre className="code-preview">{snippet.code}</pre>
                <div className="flex justify-between items-center mt-4">
                  <small className="muted">{snippet.framework || "General"} · {snippet.tags?.length || 0} tags</small>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost" onClick={() => copySnippet(snippet)} type="button">
                      <Copy size={15} /> Copy
                    </button>
                    <button className="btn btn-outline" onClick={() => openEditor(snippet)} type="button">Open</button>
                    <button className="btn btn-ghost" onClick={() => setDeleteDialog(snippet)} type="button">Delete</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <Drawer open={!!selected} title="Snippet editor" onClose={() => { setSelected(null); setDraft(null); }}>
        {selected && draft && (
          <>
            <input className="input w-full" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <textarea className="input w-full mt-3" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} />
            <input className="input w-full mt-3" value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })} />
            <textarea className="input w-full mt-3 font-code" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} rows={14} />
            <button className="btn btn-primary mt-3" onClick={saveSnippet} type="button">Save Snippet</button>
          </>
        )}
      </Drawer>

      <Drawer open={create} title="Create snippet" onClose={() => { setCreate(false); setDraft(null); }}>
        {create && draft && (
          <>
            <input className="input w-full" placeholder="Snippet title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <textarea className="input w-full mt-3" placeholder="Description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} rows={3} />
            <input className="input w-full mt-3" placeholder="Language" value={draft.language} onChange={(event) => setDraft({ ...draft, language: event.target.value })} />
            <textarea className="input w-full mt-3 font-code" placeholder="Write your snippet here…" value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} rows={14} />
            <button className="btn btn-primary mt-3" onClick={saveNewSnippet} type="button">Save Snippet</button>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteDialog}
        title="Delete snippet"
        description={deleteDialog ? `This will permanently remove “${deleteDialog.title}” from your snippet library.` : "This snippet will be permanently deleted."}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteSnippet(deleteDialog)}
        onCancel={() => setDeleteDialog(null)}
      />
    </div>
  );
}
