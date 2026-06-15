import { Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, Component, type ReactNode } from "react";
import { api } from "~/api";
import Dashboard from "~/pages/Dashboard";
import Settings from "~/pages/Settings";
import Analytics from "~/pages/Analytics";
import SalesAgent from "~/pages/SalesAgent";
import SalesAgentSettings from "~/pages/SalesAgentSettings";
import AutoReply from "~/pages/AutoReply";
import CartRecovery from "~/pages/CartRecovery";
import Returns from "~/pages/Returns";
import ProductsPage from "~/pages/ProductsPage";
import Customers from "~/pages/Customers";
import Marketing from "~/pages/Marketing";
import ContentFactory from "~/pages/ContentFactory";
import SeoGeo from "~/pages/SeoGeo";
import Plans from "~/pages/Plans";
import ApiKeys from "~/pages/ApiKeys";
import Inbox from "~/pages/Inbox";
import Observability from "~/pages/Observability";
import Onboarding from "~/pages/Onboarding";
import Notifications from "~/pages/Notifications";
import FloatingChat from "~/components/FloatingChat";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error: Error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div className="empty-state" style={{padding:"60px 20px"}}>
        <div className="empty-icon">⚠</div>
        <div className="empty-title">Something went wrong</div>
        <div className="empty-desc">{this.state.error?.message||"An unexpected error occurred."}</div>
        <button className="btn btn-primary" onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }} style={{marginTop:16}}>Reload Page</button>
      </div>
    );
    return this.props.children;
  }
}

const SHOP = new URLSearchParams(window.location.search).get("shop") || "";

const NAV_GROUPS = [
  { s: "Overview", items: [
    { l: "Dashboard", p: "/", i: "◆" }, { l: "Analytics", p: "/analytics", i: "▤" },
  ]},
  { s: "AI Studio", items: [
    { l: "AI Assistant", p: "/admin-chat", i: "◇" }, { l: "Content Factory", p: "/content-factory", i: "✎" }, { l: "SEO & GEO", p: "/seo-batch", i: "⌘" }, { l: "Sales Agent", p: "/sales-agent-settings", i: "⚡" },
  ]},
  { s: "Operations", items: [
    { l: "Inbox", p: "/inbox", i: "✉" }, { l: "Auto Reply", p: "/review-auto-reply", i: "●" }, { l: "Cart Recovery", p: "/cart-recovery", i: "○" }, { l: "Returns", p: "/returns", i: "↩" }, { l: "Products", p: "/products", i: "☷" }, { l: "可观测", p: "/observability", i: "📊" },
  ]},
  { s: "Customers", items: [
    { l: "RFM 分层", p: "/customers", i: "◎" }, { l: "营销自动化", p: "/marketing", i: "⚡" },
  ]},
  { s: "Account", items: [
    { l: "Plans", p: "/plans", i: "$" }, { l: "API Keys", p: "/api-keys", i: "🔑" }, { l: "Settings", p: "/settings", i: "⚙" },
  ]},
];

export default function App() {
  const loc = useLocation();
  const nav = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api<{ unread_count: number }>("/api/notifications/in-app?unread_only=true").then(d => {
      if (d) setUnread(d.unread_count || 0);
    }).catch(() => {});
  }, []);

  // First-visit onboarding check
  useEffect(() => {
    const completed = localStorage.getItem("vela_onboarding_complete");
    if (!completed && loc.pathname !== "/onboarding") {
      nav("/onboarding", { replace: true });
    }
  }, []);

  // Google Translate widget
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;
    const script = document.createElement("script");
    script.id = "google-translate-script";
    script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.onerror = () => {
      // Silently fail if Google Translate is unreachable
      const el = document.getElementById("google_translate_element");
      if (el) el.style.display = "none";
    };
    (window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en", layout: 0, autoDisplay: false },
          "google_translate_element"
        );
      } catch {
        const el = document.getElementById("google_translate_element");
        if (el) el.style.display = "none";
      }
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand"><div className="sidebar-mark">✦</div><span className="sidebar-name">Vela AI</span></div>
        {NAV_GROUPS.map(g => (
          <div key={g.s}>
            <div className="sidebar-label">{g.s}</div>
            {g.items.map(n => (
              <NavLink key={n.p} to={n.p} end={n.p === "/"} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
                <span className="sidebar-icon">{n.i}</span>{n.l}
              </NavLink>
            ))}
          </div>
        ))}
      </aside>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header className="topbar">
          <div className="topbar-shop">{SHOP || "Vela AI"}</div>
          <div className="topbar-actions">
            <div id="google_translate_element" style={{ marginRight: 12 }} />
            <button className="notif-btn" onClick={() => nav("/notifications")} aria-label="Notifications">
              🔔{unread > 0 && <span className="notif-badge">{unread > 99 ? "99+" : unread}</span>}
            </button>
          </div>
        </header>
        <main className="content">
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin-chat" element={<SalesAgent />} />
            <Route path="/sales-agent-settings" element={<SalesAgentSettings />} />
            <Route path="/content-factory" element={<ContentFactory />} />
            <Route path="/seo-batch" element={<SeoGeo />} />
            <Route path="/review-auto-reply" element={<AutoReply />} />
            <Route path="/cart-recovery" element={<CartRecovery />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/observability" element={<Observability />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/api-keys" element={<ApiKeys />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<div className="empty-state"><div className="empty-icon">⚡</div><div className="empty-title">Not Found</div><div className="empty-desc">This page doesn't exist.</div></div>} />
          </Routes>
          </ErrorBoundary>
        </main>
      </div>
      <FloatingChat />
    </div>
  );
}

