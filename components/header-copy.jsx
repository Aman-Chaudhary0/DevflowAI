"use client";

export function HeaderCopy({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`stack ${centered ? "center" : ""}`} style={centered ? { textAlign: "center" } : undefined}>
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h1 className={centered ? "h1" : "page-title"} style={centered ? { marginInline: "auto" } : undefined}>
        {title}
      </h1>
      {description ? (
        <p className={centered ? "lead" : "page-subtitle"} style={centered ? { marginInline: "auto" } : undefined}>
          {description}
        </p>
      ) : null}
    </div>
  );
}