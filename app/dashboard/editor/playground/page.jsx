"use client";
import { useState } from "react";
import { Copy, Play, RefreshCw, Save, Share2 } from "lucide-react";
import { ConfirmDialog, PageHeader, toast } from "@/components/dashboard-ui";
import { Crumb } from "@/components/workspace-primitives";
const initial = {
  "index.html":
    '<div class="app">\n  <h1>Hello DevFlow AI</h1>\n  <button id="btn">Click me</button>\n</div>',
  "style.css":
    ".app { padding: 32px; font-family: Inter; }\nh1 { color: #3b82f6; }",
  "script.js": "document.querySelector('#btn').textContent = 'Ready to build';",
};
export default function Playground() {
  const [file, setFile] = useState("index.html"),
    [files, setFiles] = useState(initial),
    [running, setRunning] = useState(false),
    [save, setSave] = useState(false);
  function run() {
    setRunning(true);
    setTimeout(() => {
      setRunning(false);
      toast("Preview updated.");
    }, 700);
  }
  return (
    <div>
      <Crumb items={["Dashboard", "Editor", "Playground"]} />
      <PageHeader
        title="Code Playground"
        subtitle="Experiment with HTML, CSS, and JavaScript in a live workspace."
      >
        <button
          className="btn btn-outline"
          onClick={() => setFiles(initial)}
          type="button"
        >
          <RefreshCw size={15} />
          Reset
        </button>
        <button
          className="btn btn-outline"
          onClick={() =>
            toast("Share link copied: devflow.app/playground/p_4821")
          }
          type="button"
        >
          <Share2 size={15} />
          Share
        </button>
        <button className="btn btn-primary" onClick={run} type="button">
          <Play size={15} />
          {running ? "Building…" : "Run"}
        </button>
      </PageHeader>
      <section className="card mt-6 overflow-hidden">
        <div className="flex gap-1 p-3 border-b border-(--border)">
          {Object.keys(files).map((x) => (
            <button
              key={x}
              className={`btn ${file === x ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFile(x)}
              type="button"
            >
              {x}
            </button>
          ))}
        </div>
        <div className="playground-grid">
          <textarea
            className="playground-editor"
            value={files[file]}
            onChange={(e) =>
              setFiles((p) => ({ ...p, [file]: e.target.value }))
            }
          />
          <div className="playground-preview">
            <div className="browser-bar">
              ● ● ● <span>Preview · Desktop</span>
            </div>
            <div className="preview-body">
              <h1>Hello DevFlow AI</h1>
              <p>
                Your mock preview updates safely without executing arbitrary
                code.
              </p>
              <button className="btn btn-primary" type="button">
                Click me
              </button>
            </div>
          </div>
        </div>
        <div className="terminal-panel">
          Console{" "}
          <span className="muted">
            › Application started · Button event listener attached
          </span>
        </div>
      </section>
      <ConfirmDialog
        open={save}
        title="Save playground"
        description="Save this private playground to DevFlow AI."
        confirmLabel="Save"
        onConfirm={() => {
          setSave(false);
          toast("Playground saved");
        }}
        onCancel={() => setSave(false)}
      />
    </div>
  );
}
