"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Play, RefreshCw, Save, Share2 } from "lucide-react";
import { PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
import { api } from "@/lib/api";

const defaultTemplate = {
  title: "Starter Playground",
  description: "A simple HTML/CSS/JS preview.",
  html: '<div class="app">\n  <h1>Hello DevFlow AI</h1>\n  <button id="btn">Click me</button>\n</div>',
  css: ".app { padding: 32px; font-family: Inter; }\nh1 { color: #3b82f6; }\nbutton { margin-top: 12px; }",
  javascript: "document.querySelector('#btn').textContent = 'Ready to build';\ndocument.querySelector('#btn').addEventListener('click', () => {\n  document.body.style.background = '#111827';\n});",
};

export default function Playground() {
  const [playgrounds, setPlaygrounds] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState("html");
  const [source, setSource] = useState(defaultTemplate);
  const [previewHtml, setPreviewHtml] = useState("");
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPlaygrounds = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.playgrounds.list({ page: 1, limit: 50 });
      const items = response?.data?.playgrounds || response?.playgrounds || [];
      setPlaygrounds(items);
      if (items.length && !items.some((item) => item._id === selectedId)) {
        setSelectedId(items[0]._id);
      }
      if (!items.length && !selectedId) {
        setSource(defaultTemplate);
      }
    } catch (err) {
      toast(err.message || "Unable to load playgrounds", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    loadPlaygrounds();
  }, [loadPlaygrounds]);

  const selectedPlayground = useMemo(
    () => playgrounds.find((item) => item._id === selectedId) || null,
    [playgrounds, selectedId],
  );

  useEffect(() => {
    if (selectedPlayground) {
      setSource({
        title: selectedPlayground.title || "Starter Playground",
        description: selectedPlayground.description || "",
        html: selectedPlayground.html || "",
        css: selectedPlayground.css || "",
        javascript: selectedPlayground.javascript || "",
      });
    }
  }, [selectedPlayground]);

  const previewDoc = useMemo(() => {
    return `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>${source.css || ""}</style>
        </head>
        <body>
          ${source.html || ""}
          <script>
            try {
              ${source.javascript || ""}
            } catch (error) {
              console.error(error);
            }
          <\/script>
        </body>
      </html>`;
  }, [source]);

  useEffect(() => {
    setPreviewHtml(previewDoc);
  }, [previewDoc]);

  const savePlayground = async () => {
    try {
      setSaving(true);
      const payload = {
        title: source.title || selectedPlayground?.title || defaultTemplate.title,
        description: source.description || selectedPlayground?.description || defaultTemplate.description,
        html: source.html,
        css: source.css,
        javascript: source.javascript,
      };

      if (selectedPlayground) {
        const response = await api.playgrounds.update(selectedPlayground._id, payload);
        const updated = response?.data?.playground || response?.playground || { ...selectedPlayground, ...payload };
        setPlaygrounds((prev) => prev.map((item) => item._id === selectedPlayground._id ? { ...item, ...updated } : item));
        setSelectedId(updated._id || selectedPlayground._id);
      } else {
        const response = await api.playgrounds.create(payload);
        const created = response?.data?.playground || response?.playground;
        if (created) {
          setPlaygrounds((prev) => [created, ...prev]);
          setSelectedId(created._id);
        }
      }

      toast("Playground saved.", "success");
    } catch (err) {
      toast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetPlayground = () => {
    setSource(defaultTemplate);
    setSelectedId("");
    toast("Template reset.", "info");
  };

  const runPreview = () => {
    setRunning(true);
    setTimeout(() => {
      setPreviewHtml(previewDoc);
      setRunning(false);
      toast("Preview updated.", "success");
    }, 450);
  };

  const sharePreview = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Share link copied.", "success");
    } catch {
      toast("Copy failed; please share the current page URL manually.", "error");
    }
  };

  return (
    <div>
      <Crumb items={["Dashboard", "Editor", "Playground"]} />
      <PageHeader title="Code Playground" subtitle="Experiment with HTML, CSS, and JavaScript in a live workspace.">
        <button className="btn btn-outline" onClick={resetPlayground} type="button">
          <RefreshCw size={15} /> Reset
        </button>
        <button className="btn btn-outline" onClick={sharePreview} type="button">
          <Share2 size={15} /> Share
        </button>
        <button className="btn btn-primary" onClick={savePlayground} disabled={saving} type="button">
          <Save size={15} /> {saving ? "Saving..." : "Save"}
        </button>
        <button className="btn btn-primary" onClick={runPreview} type="button">
          <Play size={15} /> {running ? "Building…" : "Run"}
        </button>
      </PageHeader>

      {loading ? (
        <div className="card p-6 mt-6 text-sm text-(--muted)">Loading playgrounds…</div>
      ) : (
        <section className="card mt-6 overflow-hidden">
          <div className="flex gap-1 p-3 border-b border-(--border)">
            {Object.keys({ html: 1, css: 1, javascript: 1 }).map((key) => (
              <button key={key} className={`btn ${activeTab === key ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveTab(key)} type="button">
                {key === "html" ? "index.html" : key === "css" ? "style.css" : "script.js"}
              </button>
            ))}
          </div>

          <div className="playground-grid">
            <textarea
              className="playground-editor"
              value={source[activeTab] || ""}
              onChange={(event) => setSource((prev) => ({ ...prev, [activeTab]: event.target.value }))}
            />

            <div className="playground-preview">
              <div className="browser-bar">
                ● ● ● <span>Preview · Desktop</span>
              </div>
              <iframe
                title="playground-preview"
                sandbox="allow-scripts"
                srcDoc={previewHtml}
                style={{ width: "100%", height: "100%", border: 0, background: "#fff" }}
              />
            </div>
          </div>

          <div className="terminal-panel">
            Console <span className="muted">› Preview refreshed · sandboxed execution enabled</span>
          </div>
        </section>
      )}
    </div>
  );
}
