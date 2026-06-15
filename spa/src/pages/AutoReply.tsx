import { useState, useEffect } from "react";
import { api } from "~/api";

const MOCK = [
  { id:1, customer:"Sarah M.", product:"Linen Summer Dress", rating:2, text:"Fabric was scratchy and shrunk after one wash. Not happy.", status:"sent", reply:"Hi Sarah, we're so sorry...", date:"2026-06-10" },
  { id:2, customer:"James K.", product:"Wool Blazer", rating:1, text:"Way too small. Ordered XL but fits like M.", status:"draft", reply:"", date:"2026-06-11" },
  { id:3, customer:"Maria L.", product:"Silk Scarf", rating:3, text:"Color doesn't match the photos. Disappointed.", status:"pending", reply:"", date:"2026-06-11" },
  { id:4, customer:"Tom H.", product:"Cotton T-Shirt", rating:2, text:"Faded after first wash.", status:"sent", reply:"Hi Tom, thank you for letting us know...", date:"2026-06-09" },
  { id:5, customer:"Anna W.", product:"Denim Jacket", rating:4, text:"Great quality but sleeves too long.", status:"draft", reply:"", date:"2026-06-12" },
];

const statusBadge = (s: string) => {
  const map: Record<string,{c:string;l:string}> = { sent:{c:"var(--mint)",l:"Sent"}, draft:{c:"var(--amber)",l:"Draft"}, pending:{c:"var(--text-tertiary)",l:"Pending"} };
  const m = map[s]||map.pending; return <span className="badge" style={{background:m.c+"15",color:m.c,borderColor:m.c+"30"}}>{m.l}</span>;
};

export default function AutoReply() {
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState<{total_reviews:number;replies_sent:number;recovery_revenue:number;pending:number}>({total_reviews:0,replies_sent:0,recovery_revenue:0,pending:0});
  const filtered = filter === "all" ? MOCK : MOCK.filter(r => r.status === filter);

  useEffect(() => {
    Promise.all([
      api<{success:boolean;total_reviews?:number;replies_sent?:number;recovery_revenue?:number;pending_approval?:number}>("/api/review/analytics/overview"),
      api<{success:boolean;total_revenue?:number;attributed_orders?:number}>("/api/review/analytics/value"),
    ]).then(([o, v]) => {
      const rev = v?.total_revenue || o?.recovery_revenue || 0;
      if (o) setStats({total_reviews:o.total_reviews||0,replies_sent:o.replies_sent||0,recovery_revenue:rev,pending:o.pending_approval||0});
    });
  }, []);

  return (
    <div>
      <h1 className="page-title">Auto Reply</h1>
      <p className="page-subtitle">AI-powered review monitoring and automated responses</p>

      <div className="kpi-grid" style={{ marginTop: 0, marginBottom: 28 }}>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--amber)"}}/><div className="kpi-icon">★</div><div className="stat-value sm" style={{color:"var(--amber)"}}>{stats.total_reviews}</div><div className="stat-label">Total Reviews</div><div className="faint" style={{fontSize:11,marginTop:4}}>synced from Judge.me</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--mint)"}}/><div className="kpi-icon">✓</div><div className="stat-value sm" style={{color:"var(--mint)"}}>{stats.replies_sent}</div><div className="stat-label">AI Replies Sent</div><div className="faint" style={{fontSize:11,marginTop:4}}>auto-generated</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--sky)"}}/><div className="kpi-icon">$</div><div className="stat-value sm" style={{color:"var(--sky)"}}>${stats.recovery_revenue.toLocaleString()}</div><div className="stat-label">Recovery Revenue</div><div className="faint" style={{fontSize:11,marginTop:4}}>from discount codes</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--text-tertiary)"}}/><div className="kpi-icon">◷</div><div className="stat-value sm" style={{color:"var(--text-tertiary)"}}>{stats.pending}</div><div className="stat-label">Pending Approval</div><div className="faint" style={{fontSize:11,marginTop:4}}>needs your review</div></div>
      </div>

      <div className="card" style={{marginBottom:20}}>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {["all","pending","draft","sent"].map(s => <button key={s} className={`btn ${filter===s?"btn-primary":"btn-ghost"} btn-sm`} onClick={()=>setFilter(s)} style={{textTransform:"capitalize"}}>{s}</button>)}
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{borderBottom:"2px solid var(--border)"}}>{["Customer","Product","Rating","Review","Reply Status","Date"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:600,color:"var(--text-tertiary)",fontSize:11,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(r => <tr key={r.id} style={{borderBottom:"1px solid var(--border-subtle)"}}>
                <td style={{padding:"10px 12px",fontWeight:500}}>{r.customer}</td>
                <td style={{padding:"10px 12px"}}>{r.product}</td>
                <td style={{padding:"10px 12px"}}>{r.rating <= 2 ? "🔴" : "🟡"} {r.rating}/5</td>
                <td style={{padding:"10px 12px",maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.text}</td>
                <td style={{padding:"10px 12px"}}>{statusBadge(r.status)}</td>
                <td style={{padding:"10px 12px"}}><button className="btn btn-sm" onClick={()=>alert(`Opening review #${r.id}: ${r.customer} — ${r.product}`)}>{r.status==="pending"?"Review":"View"}</button></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
