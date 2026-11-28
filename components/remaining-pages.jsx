"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowRight, Bot, BookOpen, Check, CheckCircle2,
  ChevronDown, Clipboard, Code2, Copy, Database, Download, FileText,
  FolderKanban, Github, Heart, HelpCircle, KeyRound, Loader2,
  MessageSquare, Plug, Search, Send, Settings2, ShieldCheck, Sparkles,
  Terminal, Users, X, Frown, Meh, Smile, ThumbsUp
} from "lucide-react";
import {
  ConfirmDialog, EmptyState, FilterBar, PageHeader, StatusBadge,
  ToastContainer, toast
} from "@/components/dashboard-ui";
import { Crumb, Drawer } from "@/components/workspace-primitives";
import { helpArticles, integrationData, searchItems, sqlTables } from "@/lib/mock/remaining-pages";
import { api } from "@/lib/api";

// ─── SQL Generator ────────────────────────────────────────────────────────────

export function SQLGenerator() {
  const [prompt, setPrompt] = useState(
    "Find the top 10 users by total spending during the last 30 days."
  );
  const [database, setDatabase] = useState("PostgreSQL");
  const [selected, setSelected] = useState(["users", "orders"]);
  const [expandedTable, setExpandedTable] = useState(null);
  const [tab, setTab] = useState("SQL");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [confirm, setConfirm] = useState(null);

  const generate = async () => {
    if (!prompt.trim()) return toast("Describe the data you need first.", "warning");
    if (loading) return;
    setLoading(true);
    setGenerated(false);
    try {
      const schema = sqlTables.filter((table) => selected.includes(table.name)).map((table) => `${table.name}(${table.fields.join(", ")})`).join("\n");
      const response = await api.ai.tools.generateSQL({ prompt, dialect: database, schema });
      setResult(response.data?.result);
      setLoading(false);
      setGenerated(true);
      setHistory(prev => [[prompt, database, "Just now"], ...prev]);
      toast("Query generated successfully.");
    } catch (error) { setLoading(false); toast(error.message || "SQL generation failed", "error"); }
  };

  const copy = () => {
    navigator.clipboard?.writeText(result?.sql || "");
    toast("SQL copied to clipboard.");
  };

  const tabContent = {
    SQL: <pre className="sql-code">{result?.sql || ""}</pre>,
    Explanation: (
      <div className="result-copy">
        <p>
          {result?.explanation || "No explanation provided."}
        </p>
        <p>
          Tables: {(result?.tables || []).join(", ") || "Not specified"}. Joins: {(result?.joins || []).join(", ") || "Not specified"}.
        </p>
      </div>
    ),
    Optimization: (
      <ul className="result-copy">
        {(result?.performanceConcerns || []).map((item, index) => <li key={index}>{item}</li>)}
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

          <div className="tool-row sql-context-row">
            <span className="sql-dialect-pill"><Database size={14} />{database} dialect</span>
            <span className="badge">
              <Database size={14} /> Example schema
            </span>
          </div>

          <div className="schema-head">
            <div><strong>Schema context</strong><span className="sql-schema-help">Choose the tables this query can use.</span></div>
            <span className="muted text-xs">{selected.length} selected</span>
          </div>

          <div className="schema-list">
            {sqlTables.map(table => (
              <div className={`schema-item ${selected.includes(table.name) ? "is-selected" : ""}`} key={table.name}>
                <div className="schema-table-row">
                  <button
                    type="button"
                    onClick={() => setSelected(s =>
                      s.includes(table.name)
                        ? s.filter(x => x !== table.name)
                        : [...s, table.name]
                    )}
                    className={`table-select ${selected.includes(table.name) ? "active" : ""}`}
                    aria-pressed={selected.includes(table.name)}
                  >
                    {selected.includes(table.name) && <Check size={14} />}
                    <span>{table.name}</span>
                  </button>
                  <button
                    type="button"
                    className="schema-expand"
                    aria-label={`${expandedTable === table.name ? "Hide" : "Show"} columns for ${table.name}`}
                    aria-expanded={expandedTable === table.name}
                    onClick={() => setExpandedTable(current => current === table.name ? null : table.name)}
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>
                {expandedTable === table.name && (
                  <ul>
                    {table.fields.map(field => {
                      const [fieldName, ...fieldType] = field.split(" ");
                      return <li key={field}><span className="schema-field-name">{fieldName}</span><span className="schema-field-type">{fieldType.join(" ")}</span></li>;
                    })}
                  </ul>
                )}
              </div>
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

          <div className="sql-input-actions">
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
                <ShieldCheck size={14} /> {result ? `AI classification: ${result.safety.classification}` : "Safety assessment appears after generation"}
              </span>
            </div>
            <div className="flex gap-1">
              <button onClick={copy} className="icon-btn small-icon" aria-label="Copy SQL">
                <Copy size={15} />
              </button>
              <button
                onClick={() => { if (!result?.sql) return; const blob = new Blob([result.sql], { type: "text/sql" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "generated-query.sql"; link.click(); URL.revokeObjectURL(url); }}
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
            <span>{result?.safety.classification || "Not assessed"}</span>
            <p>{(result?.safety.warnings || []).join(" · ") || "Generated SQL is untrusted and has not been executed"}</p>
          </div>
        </div>
      </section>

      {/* History Table */}
      <section className="card card-pad mt-6">
        <div className="flex justify-between items-center">
          <h2 className="tool-title">Recent Queries</h2>
          <span className="muted text-sm">This session</span>
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
              {history.length === 0 && <tr><td className="sql-history-empty" colSpan={5}>Generated queries from this session will appear here.</td></tr>}
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
  const [catalog, setCatalog] = useState([]);
  const [connected, setConnected] = useState({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(null);
  const [working, setWorking] = useState(false);
  const [disconnect, setDisconnect] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    try {
      setLoading(true);
      const catalogRes = await api.integrations.catalog();
      setCatalog(catalogRes.data || []);
      
      const listRes = await api.integrations.list();
      const connectedMap = {};
      (listRes.data || []).forEach(int => {
        connectedMap[int.provider] = int;
      });
      setConnected(connectedMap);
    } catch (error) {
      toast(error.message || "Failed to load integrations", "error");
    } finally {
      setLoading(false);
    }
  }

  async function connectIntegration() {
    if (!open) return;
    try {
      setWorking(true);
      await api.integrations.connect(open.provider, {});
      await loadIntegrations();
      setOpen(null);
      toast(`${open.name} connected successfully`);
    } catch (error) {
      toast(error.message || "Failed to connect integration", "error");
    } finally {
      setWorking(false);
    }
  }

  async function disconnectIntegration() {
    if (!open) return;
    try {
      await api.integrations.disconnect(open.provider);
      await loadIntegrations();
      setDisconnect(false);
      setOpen(null);
      toast(`${open.name} disconnected successfully`);
    } catch (error) {
      toast(error.message || "Failed to disconnect integration", "error");
    }
  }

  const categories = [
    "All", "Development", "AI", "Deployment",
    "Communication", "Productivity", "Storage",
  ];

  const filtered = catalog.filter(
    x =>
      (category === "All" || x.category === category) &&
      `${x.name} ${x.category} ${x.description}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  const connectedList = catalog.filter(x => connected[x.provider]);

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

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Loader2 size={32} className="spin" style={{ margin: "0 auto" }} />
        </div>
      ) : (
        <>
          {connectedList.length > 0 && (
            <section className="connected-strip mt-6">
              <strong>Connected</strong>
              {connectedList.map(x => (
                <button
                  className="connected-pill"
                  key={x.provider}
                  onClick={() => setOpen(x)}
                  type="button"
                >
                  <CheckCircle2 size={14} />
                  {x.name}
                  <span>Connected</span>
                </button>
              ))}
            </section>
          )}

          <FilterBar
            filters={categories.map(value => ({ label: value, value }))}
            active={category}
            onChange={setCategory}
          />

          <section className="integration-grid">
            {filtered.map(item => {
              const Icon = integrationIcons[item.name] || Plug;
              const isConnected = !!connected[item.provider];
              return (
                <article className="card card-pad integration-card" key={item.provider}>
                  <div className="integration-icon">
                    <Icon size={21} />
                  </div>
                  <div className="flex justify-between gap-2">
                    <div>
                      <span className="badge">{item.category}</span>
                      <h2 className="tool-title mt-3">{item.name}</h2>
                    </div>
                    <StatusBadge
                      status={isConnected ? "success" : "active"}
                    />
                  </div>
                  <p className="muted text-sm">{item.description}</p>
                  <button
                    className="btn btn-outline mt-auto"
                    onClick={() => setOpen(item)}
                    type="button"
                  >
                    {isConnected ? "Manage" : "Connect"}
                  </button>
                </article>
              );
            })}
          </section>

          {!filtered.length && (
            <EmptyState
              icon={Search}
              title="No integrations found"
              description="Try a different term or category"
            />
          )}
        </>
      )}

      <Drawer
        open={!!open}
        title={connected[open?.provider] ? `Manage ${open?.name}` : `Connect ${open?.name}`}
        onClose={() => setOpen(null)}
      >
        {open && connected[open.provider] ? (
          <>
            <p className="muted">Connected account</p>
            <div className="drawer-section">
              <strong>Status</strong>
              <p>This integration is active and ready to use.</p>
            </div>
            <div className="flex gap-2">
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
              <li>Workspace synchronization</li>
              <li>Relevant activity and context</li>
              <li>Configurable notifications</li>
            </ul>
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
                onClick={connectIntegration}
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
        description="This integration will be removed from your workspace."
        danger
        confirmLabel="Disconnect"
        onCancel={() => setDisconnect(false)}
        onConfirm={disconnectIntegration}
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
          <h1 className="h2">How can we help</h1>
          <p className="lead">
            Find answers, guides, and resources to get the most out of Devflow AI.
          </p>
          <label className="help-search">
            <Search size={20} />
            <input
              id="help-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search articles..."
            />
            <kbd>Cmd K</kbd>
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
                title="No help articles found"
                description="Try a broader search term"
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
  const [submissionReference, setSubmissionReference] = useState("");
  const [emailDelivered, setEmailDelivered] = useState(null);
  const [working, setWorking] = useState(false);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState("");
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

  useEffect(() => {
    let active = true;
    api.feedback.mine()
      .then((response) => {
        if (active) setRecentFeedback(response?.data?.feedback || []);
      })
      .catch((error) => {
        if (!active) return;
        if (error.message?.toLowerCase().includes("auth")) setRecentError("Sign in to view feedback submitted from your account.");
        else {
          setRecentError(error.message || "Unable to load your feedback history.");
          toast(error.message || "Unable to load your feedback history.", "error");
        }
      })
      .finally(() => { if (active) setRecentLoading(false); });
    return () => { active = false; };
  }, []);

  const submit = async e => {
    e.preventDefault();
    if (form.title.trim().length < 3 || form.description.trim().length < 10)
      return toast("Add a title and a description of at least 10 characters.", "warning");
    setWorking(true);
    try {
      const response = await api.feedback.submit({
        type,
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority.toLowerCase(),
        feature: form.feature,
        satisfaction: rating
      });
      const feedback = response?.data?.feedback;
      setSubmissionReference(feedback?.reference || `FDB-${String(feedback?._id || "").slice(-6).toUpperCase()}`);
      setEmailDelivered(Boolean(response?.data?.emailSent));
      if (feedback?.createdBy) setRecentFeedback((current) => [feedback, ...current].slice(0, 20));
      setSubmitted(true);
      if (response?.data?.emailSent) toast("Feedback submitted and emailed successfully", "success");
      else toast("Feedback was saved, but the email notification could not be delivered. Check backend SMTP settings.", "warning");
    } catch (error) {
      toast(error.message || "Unable to submit feedback. Please try again.", "error");
    } finally {
      setWorking(false);
    }
  };

  if (submitted) {
    return (
      <main className="container section">
        <div className="feedback-success">
          <CheckCircle2 size={46} />
          <h1 className="h2">Thanks for helping us improve Devflow AI</h1>
          <p>
            Your feedback has been saved{emailDelivered ? " and sent to the project inbox" : ", but the email notification was not delivered"}. Reference: <strong>{submissionReference}</strong>.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSubmitted(false);
              setEmailDelivered(null);
              setForm({ ...form, title: "", description: "" });
              setRating(null);
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
                aria-pressed={type === name}
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
            name="title"
            required
            minLength={3}
            maxLength={160}
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="What would you like to improve?"
          />

          <label htmlFor="feedback-description">Description</label>
          <textarea
            id="feedback-description"
            name="description"
            required
            minLength={10}
            maxLength={5000}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Include enough detail for context."
          />

          <div className="form-two">
            <label>
              Priority
              <select
                name="priority"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <label>
              Page / feature
              <select
                name="feature"
                value={form.feature}
                onChange={e => setForm({ ...form, feature: e.target.value })}
              >
                {["AI Chat", "Projects", "GitHub", "Deployments", "Teams", "Billing", "Other"].map(
                  x => <option key={x}>{x}</option>
                )}
              </select>
            </label>
          </div>

          <fieldset>
            <legend>How satisfied are you with Devflow AI?</legend>
            <div className="rating-buttons">
              {[
                ["Very dissatisfied", Frown],
                ["Dissatisfied", Meh],
                ["Neutral", Smile],
                ["Satisfied", Heart],
                ["Very satisfied", ThumbsUp],
              ].map(([label, Icon], i) => (
                <button
                  aria-label={label}
                  title={label}
                  aria-pressed={rating === i}
                  className={rating === i ? "active" : ""}
                  onClick={() => setRating(i)}
                  type="button"
                  key={label}
                >
                  <Icon size={20} />
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
          {recentLoading ? <p className="muted">Loading your submissions...</p> : recentError ? <p className="muted">{recentError}</p> : recentFeedback.length ? recentFeedback.map((item) => (
            <article className="recent-feedback" key={item._id}>
              <div className="recent-feedback-top"><span className={`feedback-status status-${item.status || "received"}`}>{String(item.status || "received").replaceAll("_", " ")}</span><time>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Just now"}</time></div>
              <strong>{item.title}</strong>
              <p>{item.type}<span aria-hidden="true"> · </span>{item.feature}</p>
            </article>
          )) : <p className="muted">Your submitted feedback will appear here.</p>}
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
            placeholder="Search projects, files, tasks, GitHub, AI..."
          />
          <kbd>Cmd K</kbd>
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
          description="Check spelling, try a broader search, or search by category"
        />
      )}

      <ToastContainer />
    </main>
  );
}
