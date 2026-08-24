"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Bot, BookOpen, Check, CheckCircle2,
  ChevronDown, Clipboard, Code2, Copy, Database, Download, FileText,
  FolderKanban, Github, Heart, HelpCircle, KeyRound, Loader2,
  MessageSquare, Plug, Search, Send, Settings2, ShieldCheck, Sparkles,
  Terminal, Users, X
} from "lucide-react";
import {
  ConfirmDialog, EmptyState, FilterBar, PageHeader, StatusBadge,
  ToastContainer, toast
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import {
  helpArticles, integrationData, searchItems, sqlHistory, sqlTables
} from "@/lib/mock/remaining-pages";

const sql = `SELECT\n  u.id,\n  u.name,\n  SUM(o.total) AS total_spent\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE o.created_at >= CURRENT_DATE - INTERVAL '30 days'\nGROUP BY u.id, u.name\nORDER BY total_spent DESC\nLIMIT 10;`;

// ─── SQL Generator ────────────────────────────────────────────────────────────

export function SQLGenerator() {
  const [prompt, setPrompt] = useState(
    "Find the top 10 users by total spending during the last 30 days."
  );
  const [database, setDatabase] = useState("PostgreSQL");
  const [selected, setSelected] = useState(["users", "orders"]);
  const [tab, setTab] = useState("SQL");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(true);
  const [history, setHistory] = useState(sqlHistory);
  const [confirm, setConfirm] = useState(null);

  const generate = () => {
    if (!prompt.trim()) return toast("Describe the data you need first.", "warning");
    setLoading(true);
    setGenerated(false);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
      setHistory(prev => [[prompt, database, "Just now"], ...prev]);
      toast("Query generated successfully.");
    }, 1400);
  };

  const copy = () => {
    navigator.clipboard?.writeText(sql);
    toast("SQL copied to clipboard.");
  };

  const tabContent = {
    SQL: <pre className="sql-code">{sql}</pre>,
    Explanation: (
      <div className="result-copy">
        <p>
          This query joins users to their orders, considers only orders from the
          last 30 days, then totals spending for each user.
        </p>
        <p>
          Results are ordered from highest total spending to lowest and limited
          to the top ten customers.
        </p>
      </div>
    ),
    Optimization: (
      <ul className="result-copy">
        <li>Add an index on <code>orders.user_id</code>.</li>
        <li>Add a composite index on <code>orders.created_at, user_id</code>.</li>
        <li>The selected columns avoid unnecessary payload.</li>
      </ul>
    ),
    Indexes: (
      <pre className="sql-code">{`CREATE INDEX idx_orders_user_id ON orders(user_id);\nCREATE INDEX idx_orders_created_user ON orders(created_at, user_id);`}</pre>
    ),
  };

  return (
    <div className="remaining-dashboard">
      <Crumb items={["Dashboard", "AI", "SQL Generator"]} />
      <PageHeader title="SQL Generator" subtitle="Turn natural language into production-ready SQL.">
        <select
          className="compact-select"
          value={database}
          onChange={e => setDatabase(e.target.value)}
          aria-label="Database"
        >
          <option>PostgreSQL</option>
          <option>MySQL</option>
          <option>MongoDB</option>
          <option>SQLite</option>
          <option>SQL Server</option>
        </select>
        <button className="icon-btn" aria-label="SQL settings">
          <Settings2 size={17} />
        </button>
      </PageHeader>

      <section className="sql-workspace mt-6">
        {/* Input Panel */}
        <div className="card card-pad">
          <h2 className="tool-title">What do you want to query?</h2>
          <textarea
            className="tool-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            aria-label="Query request"
          />

          <div className="tool-row">
            <label>
              Dialect
              <select className="compact-select">
                <option>{database}</option>
                <option>PostgreSQL</option>
                <option>MySQL</option>
              </select>
            </label>
            <span className="badge">
              <Database size={14} /> Project schema
            </span>
          </div>

          <div className="schema-head">
            <strong>Schema context</strong>
            <span className="muted text-xs">{selected.length} selected</span>
          </div>

          <div className="schema-list">
            {sqlTables.map(table => (
              <details key={table.name} open={selected.includes(table.name)}>
                <summary>
                  <button
                    type="button"
                    onClick={e => {
                      e.preventDefault();
                      setSelected(s =>
                        s.includes(table.name)
                          ? s.filter(x => x !== table.name)
                          : [...s, table.name]
                      );
                    }}
                    className={`table-select ${selected.includes(table.name) ? "active" : ""}`}
                  >
                    {selected.includes(table.name) && <Check size={14} />}
                    {table.name}
                  </button>
                  <ChevronDown size={15} />
                </summary>
                <ul>
                  {table.fields.map(field => (
                    <li key={field}><code>{field}</code></li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="options-grid">
            {[
              "Explain query",
              "Optimize query",
              "Add indexes",
              "Include comments",
              "Generate safe parameterized query",
            ].map((label, i) => (
              <label key={label} className="check-row">
                <input type="checkbox" defaultChecked={i !== 3} />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-2 mt-5">
            <button
              className="btn btn-primary"
              onClick={generate}
              disabled={loading}
              type="button"
            >
              {loading ? (
                <><Loader2 className="spin" size={16} /> Analyzing schema...</>
              ) : (
                <><Sparkles size={16} /> Generate SQL</>
              )}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => { setPrompt(""); setGenerated(false); }}
              type="button"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="card sql-output">
          <div className="output-head">
            <div>
              <h2 className="tool-title">Generated SQL</h2>
              <span className="safe-indicator">
                <ShieldCheck size={14} /> Safe query · 98/100
              </span>
            </div>
            <div className="flex gap-1">
              <button onClick={copy} className="icon-btn small-icon" aria-label="Copy SQL">
                <Copy size={15} />
              </button>
              <button
                onClick={() => toast("SQL file downloaded.")}
                className="icon-btn small-icon"
                aria-label="Download SQL"
              >
                <Download size={15} />
              </button>
              <button
                onClick={generate}
                className="icon-btn small-icon"
                aria-label="Regenerate SQL"
              >
                <Sparkles size={15} />
              </button>
            </div>
          </div>

          <div className="result-tabs" role="tablist">
            {Object.keys(tabContent).map(name => (
              <button
                role="tab"
                aria-selected={tab === name}
                className={tab === name ? "active" : ""}
                onClick={() => setTab(name)}
                key={name}
                type="button"
              >
                {name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="result-loading">
              <Loader2 className="spin" size={28} />
              <strong>Analyzing schema...</strong>
              <span>Checking joins, safety, and indexes.</span>
            </div>
          ) : generated ? (
            <div className="result-panel">{tabContent[tab]}</div>
          ) : (
            <EmptyState
              icon={Terminal}
              title="Describe the data you need."
              description="Use the prompt panel to generate a safe query."
            />
          )}

          <div className="safety-box">
            <strong>SQL Safety</strong>
            <span>98/100</span>
            <p>✓ No destructive operations · ✓ Parameterized values · ✓ Reasonable complexity</p>
          </div>
        </div>
      </section>

      {/* History Table */}
      <section className="card card-pad mt-6">
        <div className="flex justify-between items-center">
          <h2 className="tool-title">Recent Queries</h2>
          <span className="muted text-sm">Local workspace history</span>
        </div>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Prompt</th>
                <th>Database</th>
                <th>Generated</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {history.map((row, i) => (
                <tr key={`${row[0]}${i}`}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                  <td><StatusBadge status="success" /></td>
                  <td>
                    <button
                      className="btn btn-ghost min-h-8"
                      onClick={() => setConfirm(i)}
                      type="button"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <ConfirmDialog
        open={confirm !== null}
        title="Delete this query?"
        description="This only removes the query from local mock history."
        danger
        confirmLabel="Delete query"
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          setHistory(h => h.filter((_, i) => i !== confirm));
          setConfirm(null);
          toast("Query deleted.");
        }}
      />
    </div>
  );
}

// ─── Integrations ─────────────────────────────────────────────────────────────

const integrationIcons = {
  GitHub: Github,
  OpenAI: Bot,
  Gemini: Sparkles,
  Vercel: Terminal,
  Slack: MessageSquare,
  Discord: MessageSquare,
  Google: Search,
  Docker: BoxIcon,
  MongoDB: Database,
  Redis: Database,
  ImageKit: FileText,
  Figma: Sparkles,
};

function BoxIcon(props) {
  return <span {...props}>◇</span>;
}

export function Integrations() {
  const [items, setItems] = useState(integrationData);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(null);
  const [working, setWorking] = useState(false);
  const [disconnect, setDisconnect] = useState(false);

  const categories = [
    "All", "Development", "AI", "Deployment",
    "Communication", "Productivity", "Storage",
  ];

  const filtered = items.filter(
    x =>
      (category === "All" || x.category === category) &&
      `${x.name} ${x.category} ${x.description}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  const connect = () => {
    setWorking(true);
    setTimeout(() => {
      setItems(v =>
        v.map(x => x.name === open.name ? { ...x, status: "Connected" } : x)
      );
      setWorking(false);
      setOpen(null);
      toast(`${open.name} connected.`);
    }, 1000);
  };

  return (
    <div className="remaining-dashboard">
      <PageHeader
        title="Integrations"
        subtitle="Connect Devflow AI with the tools your team already uses."
      >
        <label className="inline-search">
          <Search size={16} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search integrations"
            aria-label="Search integrations"
          />
        </label>
      </PageHeader>

      <section className="connected-strip mt-6">
        <strong>Connected</strong>
        {items
          .filter(x => x.status === "Connected")
          .map(x => (
            <button
              className="connected-pill"
              key={x.name}
              onClick={() => setOpen(x)}
              type="button"
            >
              <CheckCircle2 size={14} />
              {x.name}
              <span>
                {x.name === "GitHub"
                  ? "2 repositories"
                  : x.name === "Vercel"
                  ? "4 projects"
                  : "Account"}
              </span>
            </button>
          ))}
      </section>

      <FilterBar
        filters={categories.map(value => ({ label: value, value }))}
        active={category}
        onChange={setCategory}
      />

      <section className="integration-grid">
        {filtered.map(item => {
          const Icon = integrationIcons[item.name] || Plug;
          return (
            <article className="card card-pad integration-card" key={item.name}>
              <div className="integration-icon">
                <Icon size={21} />
              </div>
              <div className="flex justify-between gap-2">
                <div>
                  <span className="badge">{item.category}</span>
                  <h2 className="tool-title mt-3">{item.name}</h2>
                </div>
                <StatusBadge
                  status={
                    item.status === "Connected"
                      ? "success"
                      : item.status === "Coming soon"
                      ? "idle"
                      : "active"
                  }
                />
              </div>
              <p className="muted text-sm">{item.description}</p>
              <button
                className="btn btn-outline mt-auto"
                disabled={item.status === "Coming soon"}
                onClick={() => setOpen(item)}
                type="button"
              >
                {item.status === "Connected"
                  ? "Manage"
                  : item.status === "Coming soon"
                  ? "Coming soon"
                  : "Connect"}
              </button>
            </article>
          );
        })}
      </section>

      {!filtered.length && (
        <EmptyState
          icon={Search}
          title="No integrations found."
          description="Try a different term or category."
        />
      )}

      <Drawer
        open={!!open}
        title={open?.status === "Connected" ? `Manage ${open?.name}` : `Connect ${open?.name}`}
        onClose={() => setOpen(null)}
      >
        {open && open.status === "Connected" ? (
          <>
            <p className="muted">Connected account · devflow-team</p>
            <div className="drawer-section">
              <strong>Permissions</strong>
              <p>
                Read workspace activity, synchronize resources, and send
                configured notifications.
              </p>
              <strong>Last synchronized</strong>
              <p>
                2 minutes ago ·{" "}
                {open?.name === "GitHub" ? "2 repositories" : "4 resources"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => toast("Sync started.")}
                type="button"
              >
                Sync now
              </button>
              <button
                className="btn btn-outline"
                onClick={() => setDisconnect(true)}
                type="button"
              >
                Disconnect
              </button>
            </div>
          </>
        ) : (
          <>
            <p>
              Give Devflow AI the context it needs to improve your developer
              workflow.
            </p>
            <ul className="benefit-list">
              <li>Repository and workspace synchronization</li>
              <li>Relevant activity and deployment context</li>
              <li>Configurable team notifications</li>
            </ul>
            <p className="muted text-sm">
              Permissions are simulated in this frontend preview.
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setOpen(null)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={connect}
                disabled={working}
                type="button"
              >
                {working ? (
                  <><Loader2 className="spin" size={15} /> Connecting...</>
                ) : (
                  `Connect ${open?.name}`
                )}
              </button>
            </div>
          </>
        )}
      </Drawer>

      <ConfirmDialog
        open={disconnect}
        title={`Disconnect ${open?.name}?`}
        description="This mock connection will be removed from the local screen state."
        danger
        confirmLabel="Disconnect"
        onCancel={() => setDisconnect(false)}
        onConfirm={() => {
          setItems(v =>
            v.map(x => x.name === open.name ? { ...x, status: "Available" } : x)
          );
          setDisconnect(false);
          setOpen(null);
          toast("Integration disconnected.");
        }}
      />
    </div>
  );
}

// ─── Help Center ──────────────────────────────────────────────────────────────

export function HelpCenter() {
  const [query, setQuery] = useState("");
  const [article, setArticle] = useState(null);
  const [faq, setFaq] = useState(null);

  useEffect(() => {
    const f = e => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("help-search")?.focus();
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);

  const results = helpArticles.filter(x =>
    `${x.title} ${x.category} ${x.description}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const topics = [
    ["Getting Started", FolderKanban, 12],
    ["AI Tools", Sparkles, 18],
    ["Projects", FolderKanban, 14],
    ["GitHub", Github, 11],
    ["Deployments", Terminal, 9],
    ["Teams", Users, 7],
    ["Billing", Clipboard, 6],
    ["Security", ShieldCheck, 8],
  ];

  const faqs = [
    "How does AI usage work?",
    "How do I connect GitHub?",
    "Can I change my plan?",
    "How do I delete my account?",
    "How does deployment work?",
    "Can I export my data?",
  ];

  return (
    <>
      <div className="public-help">
        <section className="help-hero">
          <span className="eyebrow">Devflow AI Help Center</span>
          <h1 className="h2">How can we help?</h1>
          <p className="lead">
            Find answers, guides, and resources to get the most out of Devflow AI.
          </p>
          <label className="help-search">
            <Search size={20} />
            <input
              id="help-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search help articles..."
            />
            <kbd>/</kbd>
          </label>
        </section>

        {query ? (
          <section className="container section-tight">
            <h2 className="h3">Search results</h2>
            <div className="article-results">
              {results.map(x => (
                <button type="button" onClick={() => setArticle(x)} key={x.id}>
                  <span className="badge">{x.category}</span>
                  <strong>{x.title}</strong>
                  <p>{x.description}</p>
                  <small>{x.updated}</small>
                </button>
              ))}
            </div>
            {!results.length && (
              <EmptyState
                icon={Search}
                title="No help articles found."
                description="Try a broader search term."
              />
            )}
          </section>
        ) : (
          <>
            <section className="container section-tight">
              <h2 className="h3">Popular topics</h2>
              <div className="topic-grid">
                {topics.map(([title, Icon, count]) => (
                  <button
                    className="topic-card"
                    onClick={() => setQuery(title)}
                    type="button"
                    key={title}
                  >
                    <Icon size={22} />
                    <strong>{title}</strong>
                    <p>Guides for your {title.toLowerCase()} workflow</p>
                    <span>{count} articles</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="container section-tight">
              <h2 className="h3">Featured guides</h2>
              <div className="featured-guides">
                {helpArticles.slice(0, 5).map(x => (
                  <button type="button" onClick={() => setArticle(x)} key={x.id}>
                    <BookOpen size={19} />
                    <div>
                      <span>{x.category}</span>
                      <strong>{x.title}</strong>
                      <p>{x.description}</p>
                    </div>
                    <ArrowRight size={17} />
                  </button>
                ))}
              </div>
            </section>

            <section className="container section-tight help-lists">
              <h2 className="h3">Browse all guides</h2>
              {["Getting Started", "AI", "GitHub", "Deployments"].map(cat => (
                <div key={cat}>
                  <h3>{cat}</h3>
                  {helpArticles
                    .filter(x => x.category === cat)
                    .map(x => (
                      <button type="button" onClick={() => setArticle(x)} key={x.id}>
                        {x.title}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                </div>
              ))}
            </section>

            <section className="container section-tight">
              <h2 className="h3">Frequently asked questions</h2>
              <div className="faq-list">
                {faqs.map((item, i) => (
                  <div key={item}>
                    <button
                      onClick={() => setFaq(faq === i ? null : i)}
                      aria-expanded={faq === i}
                      type="button"
                    >
                      {item}
                      <ChevronDown size={18} />
                    </button>
                    {faq === i && (
                      <p>
                        Devflow AI keeps this workflow straightforward. You can
                        manage this from workspace settings, and the appropriate
                        guide will walk you through each step.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <section className="container section-tight">
          <div className="support-cta">
            <div>
              <h2>Still need help?</h2>
              <p>Our support team is ready to help you get unstuck.</p>
            </div>
            <div>
              <Link href="/contact" className="btn btn-primary">
                Contact Support
              </Link>
              <Link href="/feedback" className="btn btn-outline">
                Send Feedback
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Drawer
        open={!!article}
        title={article?.title}
        onClose={() => setArticle(null)}
      >
        {article && (
          <>
            <p className="muted">
              {article.category} · {article.updated} · 4 min read
            </p>
            <p>{article.description}</p>
            <p>
              This simulated guide shows the recommended setup, safe defaults,
              and the next steps for your Devflow AI workspace.
            </p>
          </>
        )}
      </Drawer>

      <ToastContainer />
    </>
  );
}

// ─── Feedback Page ────────────────────────────────────────────────────────────

export function FeedbackPage() {
  const [type, setType] = useState("Feature Request");
  const [rating, setRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [working, setWorking] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    feature: "AI Chat",
  });

  const types = [
    ["Bug Report", AlertTriangle, "Something is not working as expected."],
    ["Feature Request", Sparkles, "Share what you would like to see next."],
    ["Improvement", ArrowRight, "Help us make an existing flow better."],
    ["General Feedback", MessageSquare, "Tell us what is on your mind."],
  ];

  const submit = e => {
    e.preventDefault();
    if (!form.title || !form.description)
      return toast("Add a title and description.", "warning");
    setWorking(true);
    setTimeout(() => {
      setWorking(false);
      setSubmitted(true);
      toast("Feedback submitted.");
    }, 1000);
  };

  if (submitted) {
    return (
      <main className="container section">
        <div className="feedback-success">
          <CheckCircle2 size={46} />
          <h1 className="h2">Thanks for helping us improve Devflow AI.</h1>
          <p>
            Your feedback has been recorded as <strong>FDB-2048</strong>.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSubmitted(false);
              setForm({ ...form, title: "", description: "" });
            }}
            type="button"
          >
            Send More Feedback
          </button>
          <Link className="btn btn-outline" href="/dashboard">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container section feedback-page">
      <header>
        <span className="eyebrow">Product feedback</span>
        <h1 className="h2">Help us improve Devflow AI</h1>
        <p className="lead">
          Tell us what works, what doesn&apos;t, and what you&apos;d like to see next.
        </p>
      </header>

      <div className="feedback-layout">
        <form className="card card-pad feedback-form" onSubmit={submit}>
          <label>Feedback type</label>
          <div className="feedback-types">
            {types.map(([name, Icon, desc]) => (
              <button
                className={type === name ? "active" : ""}
                onClick={() => setType(name)}
                type="button"
                key={name}
              >
                <Icon size={19} />
                <strong>{name}</strong>
                <span>{desc}</span>
              </button>
            ))}
          </div>

          <label htmlFor="feedback-title">Title</label>
          <input
            id="feedback-title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="What would you like us to improve?"
          />

          <label htmlFor="feedback-description">Description</label>
          <textarea
            id="feedback-description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Include enough detail for our team to understand the context."
          />

          <div className="form-two">
            <label>
              Priority
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label>
              Page / feature
              <select
                value={form.feature}
                onChange={e => setForm({ ...form, feature: e.target.value })}
              >
                {["AI Chat", "Projects", "GitHub", "Deployments", "Teams", "Billing", "Other"].map(
                  x => <option key={x}>{x}</option>
                )}
              </select>
            </label>
          </div>

          <div className="upload-ui">
            <FileText size={20} />
            <strong>Drag &amp; drop or browse</strong>
            <span>Screenshot uploads are simulated.</span>
          </div>

          <fieldset>
            <legend>How satisfied are you with Devflow AI?</legend>
            <div className="rating-buttons">
              {[
                ["Very dissatisfied", "😞"],
                ["Dissatisfied", "😕"],
                ["Neutral", "😐"],
                ["Satisfied", "🙂"],
                ["Very satisfied", "🤩"],
              ].map(([label, emoji], i) => (
                <button
                  aria-label={label}
                  title={label}
                  className={rating === i ? "active" : ""}
                  onClick={() => setRating(i)}
                  type="button"
                  key={label}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="btn btn-primary mt-5" disabled={working} type="submit">
            {working ? (
              <><Loader2 size={16} className="spin" /> Submitting...</>
            ) : (
              <><Send size={16} /> Submit Feedback</>
            )}
          </button>
        </form>

        <aside>
          <h2 className="h3">Your recent feedback</h2>
          {[
            ["Feature request", "Submitted 3 days ago", "Under review"],
            ["Bug report", "Submitted 2 weeks ago", "Resolved"],
            ["Improvement", "Submitted Aug 2", "Planned"],
          ].map(x => (
            <article className="recent-feedback" key={x[0]}>
              <span className="badge">{x[2]}</span>
              <strong>{x[0]}</strong>
              <p>{x[1]}</p>
            </article>
          ))}
        </aside>
      </div>

      <ToastContainer />
    </main>
  );
}

// ─── Global Search ────────────────────────────────────────────────────────────

const icons = {
  Projects: FolderKanban,
  Files: FileText,
  Tasks: Clipboard,
  AI: Sparkles,
  GitHub: Github,
  Docs: BookOpen,
  People: Users,
};

export function GlobalSearch() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Relevance");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [q, filter]);

  const results = useMemo(
    () =>
      searchItems
        .filter(
          x =>
            (filter === "All" || x.type === filter) &&
            `${x.title} ${x.description}`
              .toLowerCase()
              .includes(q.toLowerCase())
        )
        .sort((a, b) =>
          sort === "Name" ? a.title.localeCompare(b.title) : 0
        ),
    [q, filter, sort]
  );

  const open = x => toast(`${x.title} opened.`);

  return (
    <main className="container section global-search">
      <header>
        <h1 className="h2">Search</h1>
        <label className="global-search-input">
          <Search size={22} />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search projects, files, tasks, GitHub, AI sessions..."
          />
          <kbd>Ctrl K</kbd>
        </label>
      </header>

      <div className="search-filter-row">
        <FilterBar
          filters={[
            "All", "Projects", "Files", "Tasks",
            "AI", "GitHub", "Docs", "People",
          ].map(value => ({ label: value, value }))}
          active={filter}
          onChange={setFilter}
        />
        <label className="sort-select">
          Sort
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option>Relevance</option>
            <option>Recent</option>
            <option>Name</option>
          </select>
        </label>
      </div>

      {!q ? (
        <section className="search-empty">
          <Search size={34} />
          <h2>Search your workspace</h2>
          <p>
            Find the projects, code, work, and people that move your work forward.
          </p>
          <div>
            <strong>Recent searches</strong>
            {["AI code review", "authentication", "deployment", "GitHub"].map(x => (
              <button key={x} onClick={() => setQ(x)} type="button">
                {x}
              </button>
            ))}
          </div>
          <div>
            <strong>Quick actions</strong>
            <Link href="/dashboard/projects/create">Create project</Link>
            <Link href="/dashboard/ai/chat">Open AI Chat</Link>
            <Link href="/dashboard/tasks">View tasks</Link>
            <Link href="/dashboard/github">Open GitHub</Link>
          </div>
        </section>
      ) : loading ? (
        <div className="search-loading">
          <Loader2 size={24} className="spin" />
          Searching workspace...
        </div>
      ) : results.length ? (
        <section className="search-results">
          {[...new Set(results.map(x => x.type))].map(group => (
            <div key={group}>
              <h2>{group}</h2>
              {results
                .filter(x => x.type === group)
                .map(x => {
                  const Icon = icons[x.type] || Search;
                  return (
                    <button
                      className="search-result"
                      onClick={() => open(x)}
                      key={x.id}
                      type="button"
                    >
                      <span className="search-result-icon">
                        <Icon size={18} />
                      </span>
                      <span>
                        <em>{x.type}</em>
                        <strong>{x.title}</strong>
                        <p>{x.description}</p>
                      </span>
                      <time>{x.time}</time>
                      <ArrowRight size={16} />
                    </button>
                  );
                })}
            </div>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Search}
          title={`No results for "${q}"`}
          description="Check spelling, try a broader search, or search by category."
        />
      )}

      <ToastContainer />
    </main>
  );
}
