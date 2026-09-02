"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingDown,
  TrendingUp,
  X,
  XCircle
} from "lucide-react";
import { HeaderCopy } from "@/components/header-copy";

// ─── Skeleton ──────────────────────────────────────────────────
export function Skeleton({ width = "100%", height = 16, style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: 8, ...style }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="stat-card gap-4">
      <div className="flex justify-between">
        <Skeleton width={80} height={13} />
        <Skeleton width={40} height={40} className="rounded-xl" />
      </div>
      <Skeleton width={60} height={32} />
      <Skeleton width={100} height={12} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton height={14} width={i === 1 ? 140 : 80} />
        </td>
      ))}
    </tr>
  );
}

// ─── Empty State ───────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        {Icon ? <Icon size={32} /> : null}
      </div>
      <div>
        <p className="font-bold text-base mb-1.5 m-0">{title}</p>
        <p className="muted text-sm m-0">{description}</p>
      </div>
      {action ? (
        <button className="btn btn-primary min-h-[38px] px-5 text-sm" onClick={onAction} type="button">
          {action}
        </button>
      ) : null}
    </div>
  );
}

// ─── Toast ─────────────────────────────────────────────────────
const toastListeners = new Set();
let toastId = 0;

export function toast(message, type = "success") {
  const id = ++toastId;
  toastListeners.forEach((fn) => fn({ id, message, type }));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), 3500);
    };
    toastListeners.add(handler);
    return () => toastListeners.delete(handler);
  }, []);

  const icons = {
    success: <CheckCircle2 size={18} color="var(--success)" />,
    error: <XCircle size={18} color="var(--danger)" />,
    warning: <AlertTriangle size={18} color="var(--warning)" />,
    info: <Info size={18} color="var(--info)" />
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div className={`toast ${t.type}`} key={t.id}>
          {icons[t.type]}
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="bg-transparent border-0 cursor-pointer p-0 text-(--muted)"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────
export function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div>
          <p className="font-extrabold text-lg m-0 mb-2">{title}</p>
          <p className="muted m-0 text-sm">{description}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button className="btn btn-outline min-h-[40px]" onClick={onCancel} type="button">Cancel</button>
          <button
            className="btn btn-primary min-h-[40px]"
            onClick={onConfirm}
            type="button"
            style={{ background: danger ? "var(--danger)" : undefined }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Card ────────────────────────────────────────────────
export function StatCard({ label, value, delta, trend, icon: Icon, iconBg, suffix, children }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        {Icon ? (
          <div className="stat-icon" style={{ background: iconBg || "color-mix(in srgb, var(--primary) 15%, transparent)", color: "var(--primary)" }}>
            <Icon size={20} />
          </div>
        ) : null}
      </div>
      <div className="stat-value">{value}{suffix ? <span className="text-base font-semibold text-(--muted) ml-1">{suffix}</span> : null}</div>
      {delta ? (
        <span className={`stat-delta ${trend}`}>
          {trend === "up" ? <TrendingUp size={13} /> : trend === "down" ? <TrendingDown size={13} /> : null}
          {delta}
        </span>
      ) : null}
      {children}
    </div>
  );
}

// ─── Progress Bar ──────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{ width: `${pct}%`, background: color || undefined }}
      />
    </div>
  );
}

// ─── Progress Ring ─────────────────────────────────────────────
export function ProgressRing({ value, max = 100, size = 64, stroke = 6, color = "var(--primary)" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, (value / max) * 100);
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, var(--border) 70%, transparent)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 400ms ease" }}
      />
    </svg>
  );
}

// ─── Avatar ────────────────────────────────────────────────────
export function Avatar({ name = "", size = 32, color }) {
  const bg = color || "#3b82f6";
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
      title={name}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export function AvatarGroup({ members = [], max = 4, size = 32 }) {
  const visible = members.slice(0, max);
  const extra = members.length - max;
  return (
    <div className="avatar-stack items-center">
      {visible.map((m) => (
        <Avatar key={m._id || m.name} name={m.name} size={size} color={m.color} />
      ))}
      {extra > 0 ? (
        <div
          className="avatar text-[11px] border-2 border-(--border) -ml-2"
          style={{ width: size, height: size, background: "var(--border)", color: "var(--muted)" }}
        >
          +{extra}
        </div>
      ) : null}
    </div>
  );
}

// ─── Status Badge ──────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    running: "status-success",
    active: "status-success",
    online: "status-success",
    done: "status-success",
    success: "status-success",
    warning: "status-warning",
    away: "status-warning",
    "in-progress": "status-info",
    idle: "status-muted",
    offline: "status-muted",
    archived: "status-muted",
    failed: "status-danger",
    overdue: "status-danger",
    todo: "status-muted",
    high: "status-danger",
    medium: "status-warning",
    low: "status-info"
  };
  return <span className={`status ${map[status] || "status-muted"}`}>{status}</span>;
}

// ─── Page Header ───────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <HeaderCopy title={title} description={subtitle} />
      {children ? <div className="flex gap-2.5 items-center flex-wrap">{children}</div> : null}
    </div>
  );
}

// ─── Filter Bar ────────────────────────────────────────────────
export function FilterBar({ filters, active, onChange }) {
  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <button
          className={`filter-chip ${active === f.value ? "active" : ""}`}
          key={f.value}
          onClick={() => onChange(f.value)}
          type="button"
        >
          {f.label}
          {f.count !== undefined ? <span className="opacity-70 ml-1">{f.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

// ─── Mini Bar Chart ────────────────────────────────────────────
export function MiniBarChart({ data = [], color = "var(--primary)", height = 48 }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.75" style={{ height }}>
      {data.map((v, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1 ? color : `color-mix(in srgb, ${color} 40%, transparent)`,
            borderRadius: "3px 3px 0 0",
            minHeight: 3,
            transition: "height 400ms ease"
          }}
        />
      ))}
    </div>
  );
}

// ─── Simple Line Sparkline ─────────────────────────────────────
export function Sparkline({ data = [], color = "var(--primary)", width = 80, height = 32 }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
