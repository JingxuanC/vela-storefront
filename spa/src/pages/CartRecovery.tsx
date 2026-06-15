import { useState, useEffect } from "react";
import { api } from "~/api";

interface Campaign { id:number; name:string; delay_minutes:number; discount_percent:number; is_active:boolean; recovered_orders?:number; recovery_revenue?:number; emails_sent?:number; }

export default function CartRecovery() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<{total_recovered:number;total_revenue:number;total_sent:number}>({total_recovered:0,total_revenue:0,total_sent:0});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(""); const [delay, setDelay] = useState("60"); const [discount, setDiscount] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    const [cData, aData] = await Promise.all([
      api<{success:boolean; campaigns: Campaign[]}>("/api/cart-recovery/campaigns"),
      api<{success:boolean; total_recovered?:number; total_revenue?:number; total_sent?:number}>("/api/cart-recovery/analytics/overview"),
    ]);
    if (cData?.campaigns) setCampaigns(cData.campaigns);
    if (aData) setStats({total_recovered:aData.total_recovered||0,total_revenue:aData.total_revenue||0,total_sent:aData.total_sent||0});
    setLoading(false);
  }

  async function toggle(id:number, active:boolean) {
    await api(`/api/cart-recovery/campaigns/${id}`, { method:"PUT", body:JSON.stringify({ is_active:!active }) });
    loadData();
  }

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    await api("/api/cart-recovery/campaigns", { method:"POST", body:JSON.stringify({ name, delay_minutes:parseInt(delay), discount_percent:discount, is_active:true }) });
    setSaving(false); setShowModal(false); setName(""); setDelay("60"); setDiscount(10);
    loadData();
  }

  async function remove(id:number) {
    if (!confirm("Delete this campaign?")) return;
    await api(`/api/cart-recovery/campaigns/${id}`, { method:"DELETE" });
    loadData();
  }

  return (
    <div>
      <h1 className="page-title">Cart Recovery</h1>
      <p className="page-subtitle">AI-powered abandoned cart recovery campaigns</p>

      <div className="kpi-grid" style={{ marginTop:0, marginBottom:28 }}>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--mint)"}}/><div className="kpi-icon">○</div><div className="stat-value sm" style={{color:"var(--mint)"}}>{loading?"—":campaigns.filter(c=>c.is_active).length}</div><div className="stat-label">Active Campaigns</div><div className="faint" style={{fontSize:11,marginTop:4}}>of {campaigns.length} total</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--amber)"}}/><div className="kpi-icon">↩</div><div className="stat-value sm" style={{color:"var(--amber)"}}>{loading?"—":stats.total_recovered}</div><div className="stat-label">Orders Recovered</div><div className="faint" style={{fontSize:11,marginTop:4}}>this month</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--sky)"}}/><div className="kpi-icon">$</div><div className="stat-value sm" style={{color:"var(--sky)"}}>${loading?"—":stats.total_revenue.toLocaleString()}</div><div className="stat-label">Recovery Revenue</div><div className="faint" style={{fontSize:11,marginTop:4}}>attributed</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--violet)"}}/><div className="kpi-icon">✉</div><div className="stat-value sm" style={{color:"var(--violet)"}}>{loading?"—":stats.total_sent.toLocaleString()}</div><div className="stat-label">Emails Sent</div><div className="faint" style={{fontSize:11,marginTop:4}}>last 30 days</div></div>
      </div>

      <div className="btn-group" style={{marginBottom:20}}>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ New Campaign</button>
        <button className="btn" onClick={loadData}>Refresh</button>
      </div>

      {loading ? <div className="spinner" /> : campaigns.length === 0 ? (
        <div className="card"><div className="empty-state" style={{padding:40}}><div className="empty-icon">○</div><div className="empty-title">No campaigns yet</div><div className="empty-desc">Create your first cart recovery campaign to start recovering abandoned checkouts.</div></div></div>
      ) : (
        <div className="detail-grid" style={{marginTop:0}}>
          {campaigns.map(c => (
            <div className="card" key={c.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div><h3 style={{fontSize:15,fontWeight:600,marginBottom:4}}>{c.name}</h3><div className="faint" style={{fontSize:12}}>Trigger: after {c.delay_minutes} min</div></div>
                <span className={`badge ${c.is_active?"badge-mint":"badge"}`} style={!c.is_active?{background:"var(--bg-raised)",color:"var(--text-tertiary)"}:{}}>{c.is_active?"Active":"Paused"}</span>
              </div>
              <div className="stat-grid" style={{gap:12,marginBottom:16}}>
                <div><div className="stat-value sm" style={{fontSize:20}}>{c.discount_percent}%</div><div className="stat-label">Discount</div></div>
                <div><div className="stat-value sm" style={{fontSize:20}}>${(c.recovery_revenue||0).toLocaleString()}</div><div className="stat-label">Revenue</div></div>
                <div><div className="stat-value sm" style={{fontSize:20}}>{c.recovered_orders||0}/{c.emails_sent||0}</div><div className="stat-label">Recovered</div></div>
              </div>
              <div className="btn-group" style={{gap:6}}>
                <button className="btn btn-sm" onClick={()=>toggle(c.id,c.is_active)}>{c.is_active?"Pause":"Activate"}</button>
                <button className="btn btn-sm btn-ghost" onClick={()=>remove(c.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowModal(false)}>
          <div className="card" style={{maxWidth:420,width:"100%",animation:"fadeUp .25s var(--ease)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:16,fontWeight:700}}>New Campaign</h3><button onClick={()=>setShowModal(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-tertiary)"}}>×</button></div>
            <div className="form-group"><label className="form-label">Campaign Name</label><input className="form-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. 1-Hour Abandoned Cart" /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div className="form-group"><label className="form-label">Delay (minutes)</label><select className="form-select" value={delay} onChange={e=>setDelay(e.target.value)}><option value="60">60 min</option><option value="120">2 hours</option><option value="1440">24 hours</option><option value="4320">72 hours</option></select></div>
              <div className="form-group"><label className="form-label">Discount %</label><select className="form-select" value={discount} onChange={e=>setDiscount(Number(e.target.value))}><option value="5">5%</option><option value="10">10%</option><option value="15">15%</option><option value="20">20%</option><option value="25">25%</option></select></div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button className="btn" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={create} disabled={saving}>{saving?"Creating...":"Create Campaign"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
