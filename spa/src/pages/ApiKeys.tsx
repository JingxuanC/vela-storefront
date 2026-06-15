import { useState, useEffect } from "react";
import { api } from "~/api";

interface ApiKey { id:string; label:string; prefix:string; key_last_four:string; rate_limit:number; is_active:boolean; }

export default function ApiKeys() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [label, setLabel] = useState(""); const [rateLimit, setRateLimit] = useState(60);
  const [newKey, setNewKey] = useState<string|null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadKeys(); }, []);

  async function loadKeys() {
    setLoading(true);
    const d = await api<{success:boolean; keys:ApiKey[]}>("/api/enterprise/keys");
    if (d?.keys) setKeys(d.keys);
    setLoading(false);
  }

  async function create() {
    if (!label.trim()) return;
    setSaving(true);
    const d = await api<{success:boolean; full_key:string; id:string}>("/api/enterprise/keys", { method:"POST", body:JSON.stringify({ label, scopes:["read","write"], rate_limit:rateLimit }) });
    setSaving(false);
    if (d?.full_key) { setNewKey(d.full_key); setLabel(""); setRateLimit(60); loadKeys(); }
    else { setNewKey("failed"); setTimeout(()=>setNewKey(null),3000); }
  }

  async function revoke(id:string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    await api(`/api/enterprise/keys/${id}`, { method:"DELETE" });
    loadKeys();
  }

  return (
    <div>
      <h1 className="page-title">API Keys</h1>
      <p className="page-subtitle">Manage API keys for programmatic access to Vela AI</p>

      {newKey && (
        <div className={`banner ${newKey==="failed"?"banner-error":"banner-success"}`} style={{wordBreak:"break-all"}}>
          {newKey==="failed"?"Failed to create key.":<><strong>Key created — save it now! It won't be shown again.</strong><br/>{newKey}</>}
          <button className="btn btn-sm" style={{marginLeft:12}} onClick={()=>{navigator.clipboard.writeText(newKey);alert("Copied!");}}>Copy</button>
        </div>
      )}

      <div className="btn-group" style={{marginBottom:20}}>
        <button className="btn btn-primary" onClick={()=>{setShowModal(true);setNewKey(null);}}>+ Create API Key</button>
        <button className="btn" onClick={loadKeys}>Refresh</button>
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : keys.length === 0 ? (
          <div className="empty-state" style={{padding:40}}><div className="empty-icon">🔑</div><div className="empty-title">No API keys yet</div><div className="empty-desc">Create an API key to access Vela AI programmatically.</div></div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:"2px solid var(--border)"}}>{["Label","Prefix","Last 4","Rate Limit","Status",""].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:600,color:"var(--text-tertiary)",fontSize:11,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}</tr></thead>
              <tbody>{keys.map(k => (
                <tr key={k.id} style={{borderBottom:"1px solid var(--border-subtle)"}}>
                  <td style={{padding:"10px 12px",fontWeight:500}}>{k.label}</td>
                  <td style={{padding:"10px 12px",fontFamily:"var(--font-mono)",fontSize:12}}>{k.prefix}</td>
                  <td style={{padding:"10px 12px",fontFamily:"var(--font-mono)",fontSize:12}}>{k.key_last_four||"****"}</td>
                  <td style={{padding:"10px 12px"}}>{k.rate_limit}/min</td>
                  <td style={{padding:"10px 12px"}}><span className={`badge ${k.is_active?"badge-mint":"badge"}`}>{k.is_active?"Active":"Revoked"}</span></td>
                  <td style={{padding:"10px 12px"}}>{k.is_active && <button className="btn btn-sm" style={{color:"var(--rose)"}} onClick={()=>revoke(k.id)}>Revoke</button>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowModal(false)}>
          <div className="card" style={{maxWidth:420,width:"100%",animation:"fadeUp .25s var(--ease)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:16,fontWeight:700}}>Create API Key</h3><button onClick={()=>setShowModal(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-tertiary)"}}>×</button></div>
            <div className="form-group"><label className="form-label">Label</label><input className="form-input" value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Production API Key" /></div>
            <div className="form-group"><label className="form-label">Rate Limit (req/min)</label><select className="form-select" value={rateLimit} onChange={e=>setRateLimit(Number(e.target.value))}><option value={60}>60/min</option><option value={300}>300/min</option><option value={1000}>1000/min</option></select></div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button className="btn" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={create} disabled={saving}>{saving?"Creating...":"Create Key"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
