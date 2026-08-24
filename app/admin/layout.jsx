import Link from "next/link";
const links = [
  ["Overview", "/admin"],
  ["Users", "/admin/users"],
  ["AI Usage", "/admin/ai-usage"],
  ["Subscriptions", "/admin/subscriptions"],
  ["Reports", "/admin/reports"],
  ["Audit Logs", "/admin/audit-logs"],
];
export default function Layout({ children }) {
  return (
    <div className="admin-shell">
      <aside>
        <b>DevFlow AI</b>
        <span className="badge">Administration</span>
        {links.map(([label, href]) => (
          <Link href={href} key={href}>
            {label}
          </Link>
        ))}
      </aside>
      <main>{children}</main>
    </div>
  );
}
