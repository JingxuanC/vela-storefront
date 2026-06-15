import { useState, useEffect } from "react";
import { api } from "~/api";

interface ReturnItem { id:string; order_name:string; customer_name:string; product_title?:string; return_reason:string; status:string; created_at:string; items?:{product_title:string;reason:string}[]; }

const statusBadge = (s:string) => { const m:Record<string,{c:string;l:string}>={pending:{c:"var(--amber)",l:"Pending"},approved:{c:"var(--sky)",l:"Approved"},received:{c:"var(--mint)",l:"Received"},exchanged:{c:"var(--violet)",l:"Exchanged"}}; const b=m[s]||{c:"var(--text-tertiary)",l:s}; return <span className="badge" style={{background:b.c+"15",color:b.c,borderColor:b.c+"30"}}>{b.l}</span>; };

export default function Returns() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    api<{success:boolean; returns:ReturnItem[]}>("/api/returns").then(d => {
      if (d?.returns) setReturns(d.returns);
      setLoading(false);
    }).catch(() => setLoading(false));
    api<{orders:number}>("/api/shop/funnel").then(d => { if (d?.orders) setOrdersCount(d.orders); });
  }, []);

  const filtered = filter==="all"?returns:returns.filter(r=>r.status===filter);
  const pending = returns.filter(r=>r.status==="pending").length;
  const returnRate = returns.length > 0 && ordersCount > 0 ? `${Math.round((returns.length / ordersCount) * 100)}%` : "—";

  return (
    <div>
      <h1 className="page-title">Returns & Exchange</h1>
      <p className="page-subtitle">AI-assisted return processing and smart exchange recommendations</p>

      <div className="kpi-grid" style={{ marginTop:0, marginBottom:28 }}>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--text-tertiary)"}}/><div className="kpi-icon">↩</div><div className="stat-value sm">{loading?"—":returns.length}</div><div className="stat-label">Total Returns</div><div className="faint" style={{fontSize:11,marginTop:4}}>this month</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--rose)"}}/><div className="kpi-icon">%</div><div className="stat-value sm" style={{color:"var(--rose)"}}>{returnRate}</div><div className="stat-label">Return Rate</div><div className="faint" style={{fontSize:11,marginTop:4}}>vs orders</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--amber)"}}/><div className="kpi-icon">◷</div><div className="stat-value sm" style={{color:"var(--amber)"}}>{loading?"—":pending}</div><div className="stat-label">Pending</div><div className="faint" style={{fontSize:11,marginTop:4}}>needs action</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--mint)"}}/><div className="kpi-icon">🔄</div><div className="stat-value sm" style={{color:"var(--mint)"}}>—</div><div className="stat-label">Exchanges Rec'd</div><div className="faint" style={{fontSize:11,marginTop:4}}>AI-powered</div></div>
      </div>

      <div className="card">
        <div className="btn-group" style={{marginBottom:20,gap:6}}>
          {["all","pending","approved","received"].map(s => <button key={s} className={`btn btn-sm ${filter===s?"btn-primary":""}`} style={{textTransform:"capitalize"}} onClick={()=>setFilter(s)}>{s}</button>)}
          <button className="btn btn-sm" onClick={()=>{setLoading(true);api("/api/returns").then(d=>{if(d?.returns)setReturns(d.returns);setLoading(false)});}}>Refresh</button>
        </div>
        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty-state" style={{padding:40}}><div className="empty-icon">↩</div><div className="empty-title">{returns.length===0?"No returns yet":"No matches"}</div><div className="empty-desc">{returns.length===0?"Return data will appear when customers request returns.":"Try a different filter."}</div></div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:"2px solid var(--border)"}}>{["Order","Customer","Product","Reason","Status","Date"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:600,color:"var(--text-tertiary)",fontSize:11,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}</tr></thead>
              <tbody>{filtered.map(r => {
                const product = r.items?.[0]?.product_title || r.product_title || "—";
                return (
                  <tr key={r.id} style={{borderBottom:"1px solid var(--border-subtle)"}}>
                    <td style={{padding:"10px 12px",fontWeight:500,fontFamily:"var(--font-mono)",fontSize:12}}>{r.order_name||r.id}</td>
                    <td style={{padding:"10px 12px"}}>{r.customer_name||"—"}</td>
                    <td style={{padding:"10px 12px"}}>{product}</td>
                    <td style={{padding:"10px 12px"}}>{r.return_reason||r.items?.[0]?.reason||"—"}</td>
                    <td style={{padding:"10px 12px"}}>{statusBadge(r.status)}</td>
                    <td style={{padding:"10px 12px"}}>{r.created_at?.slice(0,10)||"—"}</td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
