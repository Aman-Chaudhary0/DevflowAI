"use client";
import { X } from "lucide-react";
export function Crumb({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="muted text-xs mb-3 flex items-center gap-1 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-40">/</span>}
          {i < items.length - 1 ? (
            <span className="hover:text-(--text) cursor-default transition-colors">{item}</span>
          ) : (
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{item}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function Drawer({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <aside
        className="dialog"
        style={{
          width: "min(100%, 560px)",
          maxHeight: "calc(100vh - 40px)",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="m-0 text-lg">{title}</h2>
          <button
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <X size={17} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
