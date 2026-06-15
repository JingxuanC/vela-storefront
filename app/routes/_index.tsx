// ============================================================================
// Vela AI — Landing Page v2
// Multi-language + Loss Calculator + Tool Comparison + Product Showcase
// ============================================================================

import { useNavigate, useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useState, useEffect, useRef, useCallback } from "react";
import { t, detectLanguage, LANGUAGES, type Lang } from "~/i18n/translations";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const lang = (data as { lang: Lang } | null)?.lang || "en";
  const title = lang === "zh" ? "Vela AI — Shopify AI 增长平台" :
    lang === "ja" ? "Vela AI — Shopify AI成長プラットフォーム" :
    lang === "de" ? "Vela AI — Shopify KI-Wachstumsplattform" :
    lang === "fr" ? "Vela AI — Plateforme de croissance IA Shopify" :
    lang === "es" ? "Vela AI — Plataforma de crecimiento IA para Shopify" :
    "Vela AI — Shopify AI Growth Platform";
  const description = lang === "zh" ? "Vela AI — Shopify 一站式 AI 增长平台。客服、营销、SEO、内容——一次安装，全天候运行。" :
    lang === "ja" ? "Vela AI — ShopifyオールインワンAI成長プラットフォーム。カスタマーサポート、マーケティング、SEO、コンテンツ——1回のインストールで24時間365日。" :
    lang === "de" ? "Vela AI — All-in-One KI-Wachstumsplattform für Shopify. Kundenservice, Marketing, SEO, Content — eine Installation, 24/7." :
    lang === "fr" ? "Vela AI — Plateforme de croissance IA tout-en-un pour Shopify. Support client, marketing, SEO, contenu — une installation, 24h/24." :
    lang === "es" ? "Vela AI — Plataforma de crecimiento IA todo en uno para Shopify. Soporte al cliente, marketing, SEO, contenido — una instalación, 24/7." :
    "Vela AI — All-in-one AI growth platform for Shopify. Customer support, marketing, SEO, content — one install, 24/7.";
  return [{ title }, { name: "description", content: description }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hasShop = url.searchParams.has("shop") || url.searchParams.has("hmac") || url.searchParams.has("id_token");
  if (hasShop) return redirect("/app" + url.search);
  const lang = detectLanguage(request);
  return { lang };
}

// ── Design Tokens ──
const C = {
  bg: "#08090a", surface: "#0f1011", elevated: "#161718",
  text: "#f7f8f8", text2: "#a0a4ab", text3: "#6b6f76",
  amber: "#d48018", amberLight: "#f5a623",
  amberSoft: "rgba(212,128,24,0.10)", amberBorder: "rgba(212,128,24,0.20)",
  border: "rgba(255,255,255,0.06)", borderV: "rgba(255,255,255,0.10)",
  mint: "#10b981", rose: "#f43f5e",
  radius: 12, radiusSm: 8,
  maxW: 1200,
};

// ── Hero Canvas (Particle Network) ──
function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = 800, h = 600, raf: number;
    const particles: { x: number; y: number; vx: number; vy: number; s: number; o: number }[] = [];
    function resize() {
      const r = canvas!.getBoundingClientRect();
      w = canvas!.width = r.width; h = canvas!.height = r.height;
    }
    resize(); window.addEventListener("resize", resize);
    for (let i = 0; i < 60; i++) {
      particles.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, s: Math.random() * 2 + 0.5, o: Math.random() * 0.35 + 0.08 });
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w || p.y < 0 || p.y > h) { p.x = Math.random() * w; p.y = Math.random() * h; }
        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x, dy = p.y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 80) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y); ctx.strokeStyle = `rgba(212,128,24,${0.07 * (1 - d / 80)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fillStyle = `rgba(212,128,24,${p.o})`; ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />;
}

// ── Animated Counter ──
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const start = performance.now();
      const dur = 2000;
      function tick(now: number) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(target * eased);
        if (p < 1) requestAnimationFrame(tick); else setVal(target);
      }
      requestAnimationFrame(tick);
      obs.unobserve(el);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.unobserve(el);
  }, [target]);
  return <span ref={ref}>{target % 1 !== 0 ? val.toFixed(1) : Math.floor(val)}{suffix}</span>;
}

// ── Data Flywheel SVG Animation ──
function Flywheel() {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current; if (!svg) return;
    let tick = 0;
    const arrows = svg.querySelectorAll(".fw-arrow");
    const nodes = svg.querySelectorAll(".fw-node");
    const interval = setInterval(() => {
      tick++;
      const angle = (tick * 0.8) % 360;
      arrows.forEach((a, i) => {
        const cx = 200, cy = 130, r = 80;
        const rad = ((angle + i * 90) * Math.PI) / 180;
        (a as SVGGElement).setAttribute("transform", `translate(${cx + r * Math.cos(rad)},${cy + r * Math.sin(rad)})`);
        (a as SVGGElement).setAttribute("opacity", String(0.3 + 0.7 * Math.abs(Math.sin((angle + i * 90) * Math.PI / 180))));
      });
      nodes.forEach((n, i) => {
        (n as SVGCircleElement).setAttribute("opacity", i === Math.floor(tick / 30) % 4 ? "1" : "0.5");
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);
  return (
    <svg ref={ref} viewBox="0 0 400 260" style={{ width: "100%", maxWidth: 500 }}>
      <circle cx="200" cy="130" r="45" fill="none" stroke={C.amber} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.4" />
      <circle cx="200" cy="130" r="18" fill={C.amberSoft} stroke={C.amberBorder} strokeWidth="1" />
      <text x="200" y="135" textAnchor="middle" fill={C.amber} fontSize="10" fontWeight="700">DATA</text>
      {[
        { x: 200, y: 45, label: "Sync", sub: "Shopify", icon: "📦" },
        { x: 305, y: 130, label: "AI", sub: "Qwen", icon: "🧠" },
        { x: 200, y: 215, label: "Insight", sub: "RAG", icon: "📊" },
        { x: 95, y: 130, label: "Act", sub: "Reply", icon: "⚡" },
      ].map((n, i) => (
        <g key={i} className="fw-node">
          <circle cx={n.x} cy={n.y} r="22" fill={C.surface} stroke={i === 0 ? C.amberBorder : C.border} strokeWidth="1" />
          <text x={n.x} y={n.y - 2} textAnchor="middle" fill={C.text} fontSize="8" fontWeight="700">{n.label}</text>
          <text x={n.x} y={n.y + 9} textAnchor="middle" fill={C.text3} fontSize="6">{n.sub}</text>
        </g>
      ))}
      {[0, 1, 2, 3].map(i => (
        <text key={i} className="fw-arrow" fontSize="12" fill={C.amber} textAnchor="middle">→</text>
      ))}
      <circle r="3" fill={C.amberLight} opacity="0.8">
        <animateMotion dur="4s" repeatCount="indefinite" path="M200,85 a45,45 0 1,1 0,90 a45,45 0 1,1 0,-90" />
      </circle>
    </svg>
  );
}

// ── Scroll Reveal ──
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.unobserve(el); } }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    obs.observe(el);
    return () => obs.unobserve(el);
  }, []);
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity .7s cubic-bezier(.16,1,.3,1) ${delay}s, transform .7s cubic-bezier(.16,1,.3,1) ${delay}s`, height: "100%" }}>{children}</div>;
}

// ── Section ──
function Section({ id, alt, children }: { id?: string; alt?: boolean; children: React.ReactNode }) {
  return (
    <section id={id} style={{ padding: "6rem 0", background: alt ? C.surface : "transparent" }}>
      <div style={{ maxWidth: C.maxW, margin: "0 auto", padding: "0 1.5rem" }}>{children}</div>
    </section>
  );
}

// ── Language Switcher (client-only) ──
function LangSwitcher({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];
  const switchLang = (code: Lang) => {
    document.cookie = `vela_lang=${code};path=/;max-age=31536000;samesite=lax`;
    window.location.reload();
  };
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{ padding: "0.35rem 0.6rem", borderRadius: C.radiusSm, border: `1px solid ${C.borderV}`, background: "transparent", color: C.text2, cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.35rem", whiteSpace: "nowrap" }}>
        {current.flag} <span style={{ fontSize: "0.75rem" }}>{current.code.toUpperCase()}</span>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "110%", right: 0, background: C.elevated, border: `1px solid ${C.border}`, borderRadius: C.radiusSm, padding: "0.35rem 0", zIndex: 100, minWidth: 140, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => { switchLang(l.code); setOpen(false); }}
                style={{ display: "block", width: "100%", padding: "0.45rem 0.8rem", border: "none", background: l.code === lang ? C.amberSoft : "transparent", color: l.code === lang ? C.amberLight : C.text2, cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem", textAlign: "left", whiteSpace: "nowrap" }}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Loss Calculator (client-only, uses refs for robust DOM reading) ──
function LossCalculator({ lang }: { lang: Lang }) {
  const ordersRef = useRef<HTMLInputElement>(null);
  const aovRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<{ abandoned: number; recoverable: number; reviews: number } | null>(null);
  const calculate = () => {
    const o = parseInt(ordersRef.current?.value || "0") || 0;
    const a = parseFloat(aovRef.current?.value || "0") || 0;
    if (o <= 0 || a <= 0) return;
    const abandoned = Math.round(o * a * 0.70);
    const recoverable = Math.round(abandoned * 0.25);
    const reviews = Math.round(o * 0.15 * 0.05);
    setResults({ abandoned, recoverable, reviews });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <input ref={ordersRef} type="number" placeholder={t("calc.orders_label", lang)} defaultValue=""
          style={{ flex: "1 1 140px", padding: "10px 14px", borderRadius: C.radiusSm, background: C.bg, border: `1px solid ${C.borderV}`, color: C.text, fontSize: "0.9rem", fontFamily: "inherit", outline: "none" }} />
        <input ref={aovRef} type="number" placeholder={t("calc.aov_label", lang)} defaultValue=""
          style={{ flex: "1 1 140px", padding: "10px 14px", borderRadius: C.radiusSm, background: C.bg, border: `1px solid ${C.borderV}`, color: C.text, fontSize: "0.9rem", fontFamily: "inherit", outline: "none" }} />
        <button onClick={calculate}
          style={{ padding: "10px 20px", borderRadius: C.radiusSm, border: "none", background: C.amber, color: "#fff", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          {t("calc.button", lang)}
        </button>
      </div>
      {results && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: t("calc.result.abandoned", lang), value: `$${results.abandoned.toLocaleString()}` },
            { label: t("calc.result.recoverable", lang), value: `$${results.recoverable.toLocaleString()}`, highlight: true },
            { label: t("calc.result.reviews", lang), value: results.reviews.toString() },
          ].map((r, i) => (
            <div key={i} style={{ textAlign: "center", padding: "0.75rem", borderRadius: C.radiusSm, background: r.highlight ? C.amberSoft : C.bg, border: r.highlight ? `1px solid ${C.amberBorder}` : `1px solid ${C.border}` }}>
              <div style={{ fontSize: "0.75rem", color: C.text3, marginBottom: "0.25rem" }}>{r.label}</div>
              <div style={{ fontSize: "1.3rem", fontWeight: 700, color: r.highlight ? C.amberLight : C.text }}>{r.value}</div>
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "0.5rem" }}>
            <span style={{ fontSize: "0.95rem", color: C.amberLight, fontWeight: 600 }}>
              {t("calc.cta", lang).replace("${amount}", `$${results.recoverable.toLocaleString()}`)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tool Comparison Table ──
function ToolComparison({ lang }: { lang: Lang }) {
  const tools = [
    { need: t("compare.salesbot", lang), others: t("compare.salesbot.others", lang), vela: t("compare.salesbot.vela", lang) },
    { need: t("compare.fulfillment", lang), others: t("compare.fulfillment.others", lang), vela: t("compare.fulfillment.vela", lang) },
    { need: lang === "zh" ? "评价管理" : lang === "ja" ? "レビュー管理" : "Reviews", others: "Yotpo $19/mo", vela: lang === "zh" ? "AI 回复 + 主动邀请" : lang === "ja" ? "AI返信 + 自動依頼" : "AI Reply + Invite" },
    { need: lang === "zh" ? "弃购恢复" : lang === "ja" ? "カゴ落ち回復" : "Cart Recovery", others: "Klaviyo $45/mo", vela: lang === "zh" ? "内置 · 自动" : lang === "ja" ? "内蔵 · 自動" : "Built-in · Auto" },
    { need: lang === "zh" ? "SEO 优化" : lang === "ja" ? "SEO最適化" : "SEO/GEO", others: "Plug in SEO $20/mo", vela: lang === "zh" ? "AI 自动优化" : lang === "ja" ? "AI自動最適化" : "AI Auto Optimize" },
    { need: lang === "zh" ? "营销自动化" : lang === "ja" ? "マーケティング自動化" : "Marketing Automation", others: "Omnisend $59/mo", vela: lang === "zh" ? "RFM + 触发器" : lang === "ja" ? "RFM + トリガー" : "RFM + Triggers" },
  ];
  const totalOthers = 233;
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.borderV}` }}>
            <th style={{ padding: "0.75rem 1rem", textAlign: "left", color: C.text3, fontWeight: 500, fontSize: "0.8rem" }}>{lang === "zh" ? "你需要" : lang === "ja" ? "必要なもの" : "You Need"}</th>
            <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: C.text3, fontWeight: 500, fontSize: "0.8rem" }}>{lang === "zh" ? "其他 App" : lang === "ja" ? "他のアプリ" : "Other Apps"}</th>
            <th style={{ padding: "0.75rem 1rem", textAlign: "center", color: C.amber, fontWeight: 600, fontSize: "0.8rem" }}>Vela AI</th>
          </tr>
        </thead>
        <tbody>
          {tools.map((t, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
              <td style={{ padding: "0.7rem 1rem", color: C.text, fontWeight: 500 }}>{t.need}</td>
              <td style={{ padding: "0.7rem 1rem", textAlign: "center", color: C.text3 }}>{t.others}</td>
              <td style={{ padding: "0.7rem 1rem", textAlign: "center", color: C.mint, fontWeight: 600 }}>{t.vela}</td>
            </tr>
          ))}
          <tr style={{ background: C.amberSoft }}>
            <td style={{ padding: "0.8rem 1rem", color: C.text, fontWeight: 700 }}>{lang === "zh" ? "每月合计" : lang === "ja" ? "月額合計" : "Monthly Total"}</td>
            <td style={{ padding: "0.8rem 1rem", textAlign: "center", color: C.rose, fontWeight: 700, textDecoration: "line-through" }}>${totalOthers}+</td>
            <td style={{ padding: "0.8rem 1rem", textAlign: "center", color: C.mint, fontWeight: 700, fontSize: "1.1rem" }}>$29{lang === "zh" ? "/月" : lang === "ja" ? "/月" : "/mo"}</td>
          </tr>
        </tbody>
      </table>
      <div style={{ textAlign: "center", marginTop: "0.75rem", color: C.text3, fontSize: "0.85rem" }}>
        {t("compare.monthly_savings", lang)}: <strong style={{ color: C.mint }}>${totalOthers - 29}</strong>{lang === "zh" ? "/月" : lang === "ja" ? "/月" : "/mo"}
      </div>
    </div>
  );
}

// ── Product Showcase Carousel ──
function ProductShowcase({ lang }: { lang: Lang }) {
  const items = [
    { icon: "⭐", title: lang === "zh" ? "评价生成" : lang === "ja" ? "レビュー生成" : "Review Generation", desc: lang === "zh" ? "订单发货后自动邀请顾客评价，追踪转化率与营收归因——从被动防守到主动进攻" : lang === "ja" ? "注文発送後に自動レビュー依頼、コンバージョン率と収益を追跡——守りから攻めへ" : "Auto-invite reviews after fulfillment. Track conversion & revenue attribution — from defense to offense.", color: "#d48018" },
    { icon: "🤖", title: lang === "zh" ? "AI 运营助手" : lang === "ja" ? "AI運用アシスタント" : "AI Ops Assistant", desc: lang === "zh" ? "问任何关于店铺的问题——'退货为什么多了？''该补什么货？'AI 从你的真实数据中找答案" : lang === "ja" ? "ストアについて何でも質問——「返品が増えた理由は？」「何を再入荷すべき？」AIが実データから回答" : "Ask anything about your store. AI gets real answers from your actual data — not generic advice.", color: "#d48018" },
    { icon: "🤖", title: t("showcase.salesbot.title", lang), desc: t("showcase.salesbot.desc", lang), color: "#d48018" },
    { icon: "📦", title: t("showcase.fulfillment.title", lang), desc: t("showcase.fulfillment.desc", lang), color: "#f59e0b" },
    { icon: "💬", title: t("showcase.chat.title", lang), desc: t("showcase.chat.desc", lang), color: "#3b82f6" },
    { icon: "📊", title: lang === "zh" ? "数据分析面板" : lang === "ja" ? "分析ダッシュボード" : "Analytics Dashboard", desc: lang === "zh" ? "实时收入、转化率、弃购恢复——所有关键指标一目了然" : lang === "ja" ? "リアルタイム収益・コンバージョン率・カゴ落ち回復——重要指標を一目で" : "Real-time revenue, conversion rates, cart recovery. Every metric that matters, in one place.", color: "#f43f5e" },
    { icon: "⚡", title: lang === "zh" ? "营销自动化" : lang === "ja" ? "マーケティング自動化" : "Marketing Automation", desc: lang === "zh" ? "RFM 客户分层 + Flow 触发器——设定规则后自动执行，不用手动操作" : lang === "ja" ? "RFM顧客セグメント + フロートリガー——ルール設定後は自動実行" : "RFM segmentation + Flow triggers. Set the rules, AI executes automatically.", color: "#6366f1" },
    { icon: "📝", title: lang === "zh" ? "内容工厂" : lang === "ja" ? "コンテンツ工場" : "Content Factory", desc: lang === "zh" ? "产品描述、博客、社交媒体文案——AI 批量生成，追踪 UTM 转化" : lang === "ja" ? "商品説明・ブログ・SNS投稿——AIが一括生成、UTMコンバージョン追跡" : "Product descriptions, blog posts, social captions. AI generates in bulk, tracks UTM conversions.", color: "#8b5cf6" },
    { icon: "🔄", title: lang === "zh" ? "智能退货" : lang === "ja" ? "スマート返品" : "Smart Returns", desc: lang === "zh" ? "自助退货门户 + AI 换货推荐 + 原因分析——降低退货率" : lang === "ja" ? "セルフ返品ポータル + AI交換レコメンド + 理由分析——返品率を低減" : "Self-service portal + AI exchange recommendations + reason analytics. Reduce return rates.", color: "#0891b2" },
    { icon: "🔍", title: lang === "zh" ? "AI 可见层" : lang === "ja" ? "AI可視化" : "AI Visibility", desc: lang === "zh" ? "Schema + LLMs.txt + Geo feed——让 ChatGPT/Perplexity/Gemini 找到你的产品" : lang === "ja" ? "Schema + LLMs.txt + Geoフィード——ChatGPT/Perplexity/Geminiが製品を発見" : "Schema + LLMs.txt + Geo feeds. Make your products discoverable by ChatGPT, Perplexity, Gemini.", color: "#ca8a04" },
    { icon: "🛒", title: lang === "zh" ? "购物车恢复" : lang === "ja" ? "カート回復" : "Cart Recovery", desc: lang === "zh" ? "自动检测弃购 → 智能折扣码 → 邮件提醒 → 归因追踪。你什么都不用做" : lang === "ja" ? "放棄カート自動検出 → スマート割引コード → メール通知 → 成果追跡。何もしなくてOK" : "Auto-detect abandonment → Smart discount → Email reminder → Attribution tracking. You do nothing.", color: "#059669" },
  ];
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = items.length;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive(prev => (prev + 1) % total), 5000);
  }, [total]);
  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  useEffect(() => { startTimer(); return stopTimer; }, [startTimer]);

  const go = (i: number) => { setActive(i); startTimer(); };

  return (
    <div style={{ position: "relative", maxWidth: 700, margin: "0 auto" }} onMouseEnter={stopTimer} onMouseLeave={startTimer}>
      {/* Slide */}
      <div style={{ overflow: "hidden", borderRadius: C.radius, background: C.elevated, border: `1px solid ${C.border}`, minHeight: 280 }}>
        <div style={{ display: "flex", transition: "transform .5s cubic-bezier(.16,1,.3,1)", transform: `translateX(-${active * 100}%)` }}>
          {items.map((s, i) => (
            <div key={i} style={{ flex: "0 0 100%", display: "flex", flexDirection: "column" }}>
              {/* Gradient header */}
              <div style={{ height: 180, background: `linear-gradient(135deg, ${s.color}18 0%, ${s.color}06 100%)`, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `${s.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                  {s.icon}
                </div>
              </div>
              {/* Text */}
              <div style={{ padding: "1.5rem 2rem 2rem", textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: C.text, marginBottom: "0.5rem" }}>{s.title}</h4>
                <p style={{ fontSize: "0.9rem", color: C.text3, lineHeight: 1.6, maxWidth: 480, margin: "0 auto" }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => go((active - 1 + total) % total)}
        style={{ position: "absolute", left: -16, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.borderV}`, background: C.elevated, color: C.text, fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, transition: "all .2s", lineHeight: 1 }}>
        ‹
      </button>
      <button onClick={() => go((active + 1) % total)}
        style={{ position: "absolute", right: -16, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: `1px solid ${C.borderV}`, background: C.elevated, color: C.text, fontSize: "1.1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, transition: "all .2s", lineHeight: 1 }}>
        ›
      </button>

      {/* Dots */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.25rem" }}>
        {items.map((_, i) => (
          <button key={i} onClick={() => go(i)}
            style={{ width: i === active ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: i === active ? C.amber : C.borderV, cursor: "pointer", transition: "all .3s", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}

// ── Tabbed Feature Showcase ──
function TabbedFeatures({ lang }: { lang: Lang }) {
  const tabs = [
    { key: "marketing", label: lang === "zh" ? "AI 营销" : lang === "ja" ? "AIマーケティング" : "AI Marketing" },
    { key: "operations", label: lang === "zh" ? "AI 运营" : lang === "ja" ? "AIオペレーション" : "AI Operations" },
    { key: "growth", label: lang === "zh" ? "AI 增长" : lang === "ja" ? "AI成長" : "AI Growth" },
    { key: "platform", label: lang === "zh" ? "平台能力" : lang === "ja" ? "プラットフォーム" : "Platform" },
  ];

  const features: Record<string, { icon: string; title: string; desc: string; isNew?: boolean }[]> = {
    marketing: [
      { icon: "🛒", title: lang === "zh" ? "购物车恢复" : lang === "ja" ? "カート回復" : "Cart Recovery", desc: lang === "zh" ? "自动检测弃购 → 智能折扣码 → 邮件提醒 → 归因追踪" : lang === "ja" ? "放棄カート自動検出 → スマート割引コード → メール通知" : "Auto-detect abandonment → Smart discount → Email reminder → Attribution tracking" },
      { icon: "📊", title: lang === "zh" ? "数据分析面板" : lang === "ja" ? "分析ダッシュボード" : "Analytics Dashboard", desc: lang === "zh" ? "实时收入、转化率、弃购恢复——所有关键指标一览" : lang === "ja" ? "リアルタイム収益・コンバージョン率・カゴ落ち回復" : "Real-time revenue, conversion rates, cart recovery — all key metrics in one place" },
      { icon: "⚡", title: lang === "zh" ? "营销自动化" : lang === "ja" ? "マーケティング自動化" : "Marketing Automation", desc: lang === "zh" ? "RFM 客户分层 + Flow 触发器——设定规则，AI 自动执行" : lang === "ja" ? "RFM顧客セグメント + フロートリガー——設定後はAIが自動実行" : "RFM segmentation + Flow triggers. Set the rules, AI executes automatically." },
      { icon: "⭐", title: lang === "zh" ? "评价生成" : lang === "ja" ? "レビュー生成" : "Review Generation", desc: lang === "zh" ? "订单发货 → 自动邀请顾客写评价 → 追踪转化率和营收归因" : lang === "ja" ? "注文発送 → 自動レビュー依頼 → コンバージョン率と収益を追跡" : "Order fulfilled → Auto invite reviews → Track conversion & revenue attribution", isNew: true },
      { icon: "🔍", title: lang === "zh" ? "爆品发现" : lang === "ja" ? "トレンド発見" : "Trend Discovery", desc: lang === "zh" ? "Google Trends 真实数据，发现市场趋势和潜在爆品" : lang === "ja" ? "Google Trendsの実データで市場トレンドを発見" : "Real Google Trends data to spot market trends and winning products", isNew: true },
    ],
    operations: [
      { icon: "🤖", title: t("features.cards.0.title", lang), desc: t("features.cards.0.desc", lang) },
      { icon: "⭐", title: t("features.cards.2.title", lang), desc: t("features.cards.2.desc", lang) },
      { icon: "📝", title: t("features.cards.3.title", lang), desc: t("features.cards.3.desc", lang) },
      { icon: "🔔", title: lang === "zh" ? "通知中心" : lang === "ja" ? "通知センター" : "Notification Center", desc: lang === "zh" ? "站内通知 + 邮件提醒，不错过重要事件" : lang === "ja" ? "アプリ内通知 + メールアラートで重要イベントを見逃さない" : "In-app + email alerts. Never miss important events.", isNew: true },
    ],
    growth: [
      { icon: "🤖", title: t("features.salesbot.title", lang), desc: t("features.salesbot.desc", lang) },
      { icon: "🔍", title: lang === "zh" ? "AI 可见层" : lang === "ja" ? "AI可視化" : "AI Visibility", desc: lang === "zh" ? "Schema + LLMs.txt + Geo feed——让 ChatGPT/Perplexity/Gemini 找到你的产品" : lang === "ja" ? "Schema + LLMs.txt + Geoフィード——ChatGPT/Perplexity/Geminiが製品を発見" : "Schema + LLMs.txt + Geo feeds. Make products discoverable by ChatGPT, Perplexity, Gemini." },
      { icon: "🔄", title: t("features.cards.4.title", lang), desc: t("features.cards.4.desc", lang) },
    ],
    platform: [
      { icon: "📦", title: t("features.cards.6.title", lang), desc: t("features.cards.6.desc", lang) },
      { icon: "💬", title: t("features.cards.7.title", lang), desc: t("features.cards.7.desc", lang) },
      { icon: "🚀", title: lang === "zh" ? "安装向导" : lang === "ja" ? "セットアップウィザード" : "Onboarding Wizard", desc: lang === "zh" ? "3 步完成设置，零学习成本，即刻启动 AI 团队" : lang === "ja" ? "3ステップで設定完了、学習不要、AIチームを即起動" : "3-step setup. Zero learning curve. Launch your AI team instantly.", isNew: true },
    ],
  };

  const [active, setActive] = useState("marketing");

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "2rem", justifyContent: "center", marginBottom: "2rem", flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActive(t.key)}
            style={{
              padding: "0.5rem 0.25rem", border: "none", background: "none",
              color: active === t.key ? C.amberLight : C.text3,
              borderBottom: active === t.key ? `2px solid ${C.amberLight}` : "2px solid transparent",
              fontSize: "1rem", fontWeight: active === t.key ? 700 : 500,
              cursor: "pointer", fontFamily: "inherit",
              transition: "all .2s", letterSpacing: "-0.01em",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards — animated fade-in on tab switch */}
      <div key={active} style={{ animation: "fadeUp .4s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {features[active].map((f, i) => (
            <div key={i} style={{
              padding: "1.5rem", borderRadius: C.radiusSm, background: C.surface,
              border: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
              height: "100%", position: "relative",
              transition: "border-color .2s, transform .15s",
            }}>
              {f.isNew && (
                <span style={{
                  position: "absolute", top: 10, right: 10, fontSize: "0.6rem",
                  fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                  background: C.amber, color: "#fff",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>NEW</span>
              )}
              <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{f.icon}</div>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 600, color: C.text, marginBottom: "0.35rem" }}>{f.title}</h4>
              <p style={{ fontSize: "0.85rem", color: C.text3, lineHeight: 1.5, flex: 1 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Trust Bar ──
function TrustBar({ lang }: { lang: Lang }) {
  const items = [
    { icon: "🔒", text: t("trust.gdpr", lang) },
    { icon: "⚡", text: t("trust.speed", lang) },
    { icon: "🤝", text: t("trust.privacy", lang) },
    { icon: "🗑️", text: t("trust.uninstall", lang) },
    { icon: "🧠", text: t("trust.ai", lang) },
  ];
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center", padding: "1.5rem", borderRadius: C.radius, background: C.elevated, border: `1px solid ${C.border}` }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.8rem", borderRadius: C.radiusSm, background: C.surface, fontSize: "0.8rem", color: C.text2 }}>
          <span>{item.icon}</span>
          <span>{item.text}</span>
          {i < items.length - 1 && <span style={{ color: C.borderV, marginLeft: "0.5rem" }}>|</span>}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════
// Feature toggle: set to true to re-enable Virtual Try-On across all frontend surfaces
// Keep in sync with: apps.proxy.tsx, vtron-embeds.liquid, try-on-button.liquid, shopify.extension.toml
const SHOW_TRYON = false;

export default function LandingPage() {
  const navigate = useNavigate();
  const { lang: serverLang } = useLoaderData<typeof loader>();
  const [L, setL] = useState<Lang>(serverLang);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  // Sync language on client-side (cookie might have changed from LangSwitcher)
  useEffect(() => {
    const cookie = document.cookie.match(/vela_lang=([a-z]{2})/);
    if (cookie && ["en","zh","ja","de","fr","es"].includes(cookie[1])) {
      setL(cookie[1] as Lang);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { setFormError(t("contact.error", L)); return; }
    setSubmitting(true); setFormError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
    } catch { setFormError(t("contact.failed", L)); }
    finally { setSubmitting(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 16px", borderRadius: C.radiusSm,
    background: C.bg, border: `1px solid ${C.borderV}`, color: C.text,
    fontSize: "0.95rem", fontFamily: "inherit", outline: "none",
    transition: "border-color .2s", boxSizing: "border-box",
  };

  const painCards = [
    { icon: "😰", title: t("pain.cards.0.title", L), desc: t("pain.cards.0.desc", L) },
    { icon: "📉", title: t("pain.cards.1.title", L), desc: t("pain.cards.1.desc", L) },
    { icon: "🔍", title: t("pain.cards.2.title", L), desc: t("pain.cards.2.desc", L) },
  ];

  const resultsCards = [
    { n: "92%", labelL: t("results.cards.0.label", L), title: t("results.cards.0.title", L), desc: t("results.cards.0.desc", L) },
    { n: "23%", labelL: t("results.cards.1.label", L), title: t("results.cards.1.title", L), desc: t("results.cards.1.desc", L) },
    { n: "2.4M", labelL: t("results.cards.2.label", L), title: t("results.cards.2.title", L), desc: t("results.cards.2.desc", L) },
  ];

  const statsRow = [
    { v: "500+", l: t("stats.0.label", L) },
    { v: "2.4M", l: t("stats.1.label", L) },
    { v: 98, l: t("stats.2.label", L), suffix: "%" },
    { v: 15, l: t("stats.3.label", L), suffix: "%" },
  ];

  const pricingCards = [
    { name: t("pricing.free.name", L), price: "$0", features: ["Shopping Assistant (50/day)", "Operations Assistant (20/day)", "Content Factory (5/day)", "Returns & Exchange", "Dashboard & Analytics"], featured: false },
    { name: t("pricing.growth.name", L), price: "$29", features: ["Everything in Free", "Content Factory (50/day)", "Auto Reply to Reviews", "Virtual Try-On (20/day)", "Cart Recovery", "Priority Support"], featured: true },
    { name: t("pricing.pro.name", L), price: "$79", features: ["Unlimited Everything", "AI Visibility Suite", "Multi-store Management", "API Access", "Virtual Try-On (Unlimited)", "Dedicated Support"], featured: false },
  ];

  const faqItems = [
    { q: t("faq.items.0.q", L), a: t("faq.items.0.a", L) },
    { q: t("faq.items.1.q", L), a: t("faq.items.1.a", L) },
    { q: t("faq.items.2.q", L), a: t("faq.items.2.a", L) },
    { q: t("faq.items.3.q", L), a: t("faq.items.3.a", L) },
    { q: t("faq.items.4.q", L), a: t("faq.items.4.a", L) },
  ];

  return (
    <div style={{ background: C.bg, color: C.text2, fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh", overflowX: "hidden", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        input:focus,textarea:focus{border-color:${C.amber} !important;box-shadow:0 0 0 3px ${C.amberSoft}}
        ::selection{background:${C.amber};color:#fff}
        @media(max-width:768px){section{padding:4rem 0!important}}
        @media(max-width:480px){section{padding:3rem 0!important}}
        .mobile-cta{display:none;position:fixed;bottom:0;left:0;right:0;z-index:99;padding:0.75rem 1rem;background:rgba(8,9,10,0.95);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,0.06)}
        @media(max-width:768px){.mobile-cta{display:flex;gap:0.75rem}}
      `}</style>

      {/* ── Nav ── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, background: "rgba(8,9,10,0.85)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: C.maxW, margin: "0 auto", padding: "0 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.1rem", color: C.text }}>
            <div style={{ width: 26, height: 26, background: C.amber, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13 }}>✦</div>
            Vela AI
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <a href="#features" style={{ color: C.text2, textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>{t("nav.features", L)}</a>
            <a href="#pricing" style={{ color: C.text2, textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>{t("nav.pricing", L)}</a>
            <a href="#contact" style={{ color: C.text2, textDecoration: "none", fontSize: "0.9rem", fontWeight: 500 }}>{t("nav.contact", L)}</a>
            <LangSwitcher lang={L} />
            <button onClick={() => navigate("/app")} style={{ padding: "0.55rem 1.3rem", borderRadius: C.radiusSm, border: "none", background: C.amber, color: "#fff", fontSize: "0.9rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              {t("nav.dashboard", L)}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: 80, overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-10%", top: "15%", width: "55%", height: "60%", opacity: 0.5, zIndex: 0 }}>
          <HeroCanvas />
        </div>
        <div style={{ maxWidth: C.maxW, margin: "0 auto", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "1rem" }}>{t("hero.badge", L)}</div>
            <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.2rem)", fontWeight: 700, color: C.text, lineHeight: 1.08, letterSpacing: "-0.03em", marginBottom: "1.5rem", maxWidth: 700 }}>
              {t("hero.title1", L)}<br />
              <span style={{ color: C.amber }}>{t("hero.title2", L)}</span>
            </h1>
            <p style={{ fontSize: "1.1rem", color: C.text3, maxWidth: 520, lineHeight: 1.7, marginBottom: "2.5rem" }}>
              {t("hero.subtitle", L)}
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button onClick={() => navigate("/app")} style={{ padding: "0.85rem 2rem", borderRadius: C.radius, border: "none", background: C.amber, color: "#fff", fontSize: "1rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all .2s" }}>
                {t("hero.cta.install", L)}
              </button>
              <a href="#contact" style={{ display: "inline-flex", alignItems: "center", padding: "0.85rem 2rem", borderRadius: C.radius, border: `1px solid ${C.borderV}`, color: C.text, fontSize: "1rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", fontFamily: "inherit", transition: "all .2s" }}>
                {t("hero.cta.contact", L)}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Loss Calculator ── */}
      <Section alt>
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("calc.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("calc.heading", L)}</h2>
        </div></Reveal>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <Reveal><LossCalculator lang={L} /></Reveal>
        </div>
      </Section>

      {/* ── Pain Points ── */}
      <Section>
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("pain.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("pain.heading", L)}</h2>
        </div></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {painCards.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ padding: "2rem", borderRadius: C.radius, background: C.elevated, border: `1px solid ${C.border}`, transition: "all .3s", display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{p.icon}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: C.text, marginBottom: "0.5rem" }}>{p.title}</h3>
                <p style={{ fontSize: "0.9rem", color: C.text3, lineHeight: 1.6, flex: 1 }}>{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Tool Comparison ── */}
      <Section alt>
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("compare.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("compare.heading", L)}</h2>
        </div></Reveal>
        <div style={{ maxWidth: 650, margin: "0 auto" }}>
          <Reveal><ToolComparison lang={L} /></Reveal>
        </div>
      </Section>

      {/* ── Product Showcase ── */}
      <Section>
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("showcase.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("showcase.heading", L)}</h2>
        </div></Reveal>
        <Reveal><ProductShowcase lang={L} /></Reveal>
      </Section>

      {/* ── How It Works ── */}
      <Section alt id="features">
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("how.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("how.heading", L)}</h2>
        </div></Reveal>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", flexWrap: "wrap", padding: "2rem", borderRadius: C.radius, background: C.surface, border: `1px solid ${C.border}` }}>
            {[
              { icon: "📦", title: t("how.steps.0.title", L), desc: t("how.steps.0.desc", L) },
              { icon: "🧠", title: t("how.steps.1.title", L), desc: t("how.steps.1.desc", L) },
              { icon: "🚀", title: t("how.steps.2.title", L), desc: t("how.steps.2.desc", L) },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "1.5rem 2rem", borderRadius: C.radiusSm, background: C.elevated, border: `1px solid ${C.border}`, minWidth: 200, flex: "1 1 200px", height: "100%" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                <div style={{ fontWeight: 600, fontSize: "0.95rem", color: C.text, marginBottom: "0.25rem" }}>{s.title}</div>
                <div style={{ fontSize: "0.8rem", color: C.text3 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ── Data Flywheel ── */}
      <Section>
        <Reveal><div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("flywheel.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("flywheel.heading", L)}</h2>
          <p style={{ color: C.text3, maxWidth: 500, margin: "0.75rem auto 0", lineHeight: 1.6 }}>{t("flywheel.desc", L)}</p>
        </div></Reveal>
        <Reveal><div style={{ display: "flex", justifyContent: "center" }}><Flywheel /></div></Reveal>
        <Reveal delay={0.2}><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginTop: "2rem" }}>
          {["0","1","2","3"].map(i => (
            <div key={i} style={{ padding: "1rem", borderRadius: C.radiusSm, background: C.surface, border: `1px solid ${C.border}`, textAlign: "center" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: C.text, marginBottom: "0.35rem" }}>{t(`flywheel.pillars.${i}.t`, L)}</div>
              <div style={{ fontSize: "0.8rem", color: C.text3, lineHeight: 1.4 }}>{t(`flywheel.pillars.${i}.d`, L)}</div>
            </div>
          ))}
        </div></Reveal>
      </Section>

      {/* ── Results ── */}
      <Section alt>
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("results.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("results.heading", L)}</h2>
        </div></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
          {resultsCards.map((b, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ padding: "2rem", borderRadius: C.radius, background: C.elevated, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, color: C.amber, lineHeight: 1, marginBottom: "0.25rem" }}>{b.n}</div>
                <div style={{ fontSize: "0.8rem", color: C.text3, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>{b.labelL}</div>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 600, color: C.text, marginBottom: "0.5rem" }}>{b.title}</h3>
                <p style={{ fontSize: "0.9rem", color: C.text3, lineHeight: 1.6, flex: 1 }}>{b.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Features Grid ── */}
      <Section>
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("features.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("features.heading", L)}</h2>
        </div></Reveal>
        <Reveal><TabbedFeatures lang={L} /></Reveal>
      </Section>

      {/* ── Trust Bar ── */}
      <Section>
        <Reveal><TrustBar lang={L} /></Reveal>
      </Section>

      {/* ── Stats ── */}
      <Section alt>
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("stats.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("stats.heading", L)}</h2>
        </div></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {statsRow.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ textAlign: "center", padding: "2rem 1rem", borderRadius: C.radiusSm, background: C.elevated, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ fontSize: "2.2rem", fontWeight: 800, color: C.text, lineHeight: 1, marginBottom: "0.4rem" }}>
                  {typeof s.v === "number" ? <Counter target={s.v} suffix={(s as any).suffix || ""} /> : s.v}
                </div>
                <div style={{ fontSize: "0.85rem", color: C.text3 }}>{s.l}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── Pricing ── */}
      <Section id="pricing">
        <Reveal><div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("pricing.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("pricing.heading", L)}</h2>
        </div></Reveal>
        <div style={{ display: "flex", gap: "1.25rem", justifyContent: "center", flexWrap: "wrap" }}>
          {pricingCards.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ flex: "1 1 280px", maxWidth: 340, height: "100%", padding: "2rem 1.75rem", borderRadius: C.radius, border: p.featured ? `2px solid ${C.amberBorder}` : `1px solid ${C.border}`, background: p.featured ? `linear-gradient(180deg, ${C.amberSoft} 0%, ${C.surface} 30%)` : C.surface, textAlign: "center" }}>
                {p.featured && <div style={{ display: "inline-block", padding: "3px 12px", borderRadius: 12, background: C.amber, color: "#fff", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.75rem" }}>{t("pricing.popular", L)}</div>}
                <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: C.text, marginBottom: "0.25rem" }}>{p.name}</h3>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, color: C.text, margin: "0.5rem 0" }}>{p.price}<span style={{ fontSize: "1rem", color: C.text3, fontWeight: 400 }}>/mo</span></div>
                <ul style={{ listStyle: "none", padding: 0, margin: "1.25rem 0 1.75rem", textAlign: "left" }}>
                  {p.features.filter(f => SHOW_TRYON || !f.includes("Virtual Try-On")).map((f, j) => <li key={j} style={{ padding: "0.4rem 0", fontSize: "0.88rem", color: C.text2, display: "flex", alignItems: "center", gap: "0.5rem" }}><span style={{ color: C.mint, fontWeight: 700 }}>✓</span> {f}</li>)}
                </ul>
                <button onClick={() => navigate("/app/plans")} style={{ width: "100%", padding: "0.75rem", borderRadius: C.radiusSm, background: p.featured ? C.amber : "transparent", color: p.featured ? "#fff" : C.text, fontSize: "0.95rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", border: p.featured ? "none" : `1px solid ${C.borderV}` }}>
                  {p.featured ? t("pricing.cta.popular", L) : t("pricing.cta.default", L)}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section id="faq" alt>
        <Reveal><div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("faq.label", L)}</div>
          <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{t("faq.heading", L)}</h2>
        </div></Reveal>
        <Reveal><div style={{ maxWidth: 680, margin: "0 auto" }}>
          {faqItems.map((faq, i) => (
            <details key={i} style={{ marginBottom: "0.5rem", borderRadius: C.radiusSm, background: C.surface, border: `1px solid ${C.border}`, overflow: "hidden" }}>
              <summary style={{ padding: "1rem 1.25rem", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", color: C.text, listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {faq.q}
                <span style={{ fontSize: "0.8rem", color: C.text3, transition: "transform .2s" }}>▾</span>
              </summary>
              <div style={{ padding: "0 1.25rem 1.25rem", fontSize: "0.9rem", color: C.text2, lineHeight: 1.6 }}>{faq.a}</div>
            </details>
          ))}
        </div></Reveal>
      </Section>

      {/* ── Contact ── */}
      <Section id="contact">
        <Reveal>
          <div style={{ maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: C.amber, marginBottom: "0.75rem" }}>{t("contact.label", L)}</div>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginBottom: "1rem" }}>{t("contact.heading", L)}</h2>
            <p style={{ color: C.text3, marginBottom: "2rem", lineHeight: 1.6 }}>{t("contact.desc", L)}</p>
            {sent ? (
              <div style={{ padding: "2rem", borderRadius: C.radius, background: C.elevated, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>✅</div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: C.text, marginBottom: "0.5rem" }}>{t("contact.sent_title", L)}</h3>
                <p style={{ color: C.text3 }}>{t("contact.sent_desc", L)}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ padding: "2rem", borderRadius: C.radius, background: C.elevated, border: `1px solid ${C.border}`, textAlign: "left" }}>
                {formError && <div style={{ padding: "0.6rem 1rem", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: C.radiusSm, color: C.rose, fontSize: "0.85rem", marginBottom: "1rem" }}>{formError}</div>}
                <div style={{ marginBottom: "0.75rem" }}>
                  <input name="name" placeholder={t("contact.name", L)} required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ marginBottom: "0.75rem" }}>
                  <input name="email" type="email" placeholder={t("contact.email", L)} required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <textarea name="message" placeholder={t("contact.message", L)} rows={4} required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <button type="submit" disabled={submitting} style={{ width: "100%", padding: "0.8rem", borderRadius: C.radiusSm, border: "none", background: C.amber, color: "#fff", fontSize: "0.95rem", fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, fontFamily: "inherit" }}>
                  {submitting ? t("contact.sending", L) : t("contact.submit", L)}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </Section>

      {/* ── Mobile Sticky CTA ── */}
      <div className="mobile-cta">
        <button onClick={() => navigate("/app")} style={{ flex:1, padding:"0.7rem", borderRadius:C.radiusSm, border:"none", background:C.amber, color:"#fff", fontSize:"0.9rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          {t("mobile.install", L)}
        </button>
        <a href="#contact" style={{ flex:1, padding:"0.7rem", borderRadius:C.radiusSm, border:`1px solid ${C.borderV}`, color:C.text, fontSize:"0.9rem", fontWeight:600, cursor:"pointer", textDecoration:"none", fontFamily:"inherit", textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {t("mobile.contact", L)}
        </a>
      </div>

      {/* ── Footer ── */}
      <footer style={{ padding: "3rem 0", borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
        <div style={{ fontSize: "0.85rem", color: C.text3 }}>
          <strong style={{ color: C.text }}>Vela AI</strong> — {t("footer.tagline", L)} &copy; 2026 &nbsp;|&nbsp;
          <a href="mailto:hello@velagrow.com" style={{ color: C.text3, textDecoration: "none" }}>hello@velagrow.com</a>
        </div>
      </footer>
    </div>
  );
}
