import { useState, useEffect } from "react";
import { api, shopId } from "~/api";

interface ContentJob { id:string; job_type:string; status:string; created_at:string; result?:string; error_message?:string; source_product_ids?:string[]; }

const typeBadge = (t:string) => { const m:Record<string,{c:string;l:string}>={desc:{c:"var(--violet)",l:"Description"},blog:{c:"var(--amber)",l:"Blog Post"},social:{c:"var(--sky)",l:"Social"}}; const b=m[t]||m.desc; return <span className="badge" style={{background:b.c+"15",color:b.c,borderColor:b.c+"30"}}>{b.l}</span>; };
const statusBadge = (s:string) => { const m:Record<string,{c:string;l:string}>={completed:{c:"var(--mint)",l:"Done"},processing:{c:"var(--amber)",l:"Running"},pending:{c:"var(--text-tertiary)",l:"Queued"},failed:{c:"var(--rose)",l:"Failed"}}; const b=m[s]||{c:"var(--text-tertiary)",l:s}; return <span className="badge" style={{background:b.c+"15",color:b.c,borderColor:b.c+"30"}}>{b.l}</span>; };

export default function ContentFactory() {
  const [jobs, setJobs] = useState<ContentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [jobType, setJobType] = useState("desc");
  const [productIds, setProductIds] = useState("");
  const [tone, setTone] = useState("professional");
  const [lang, setLang] = useState("en");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { loadJobs(); }, []);

  async function loadJobs() {
    setLoading(true);
    const d = await api<{success:boolean; pieces?:ContentJob[]}>("/api/content/pieces?limit=20");
    if (d?.pieces) setJobs(d.pieces);
    setLoading(false);
  }

  async function generate() {
    if (!productIds.trim()) { setMsg("Enter at least one product ID"); return; }
    setSubmitting(true); setMsg("");
    const ids = productIds.split(",").map(s=>s.trim()).filter(Boolean);
    const res = await api<{success:boolean;job_id:string;error?:string}>("/api/content/generate", {
      method:"POST", body:JSON.stringify({ shop_id: shopId(), job_type:jobType, product_ids:ids, tone, language:lang }),
    });
    setSubmitting(false);
    if (res?.success) { setMsg(`Job created: ${res.job_id}`); setShowModal(false); setProductIds(""); loadJobs(); }
    else setMsg(res?.error||"Failed to create job");
  }

  return (
    <div>
      <h1 className="page-title">Content Factory</h1>
      <p className="page-subtitle">AI-generated product descriptions, blog posts, and social media content</p>

      {msg && <div className={`banner ${msg.includes("Failed")||msg.includes("Enter")?"banner-error":"banner-success"}`}>{msg.includes("Failed")||msg.includes("Enter")?"⚠":"✓"} {msg}</div>}

      <div className="kpi-grid" style={{ marginTop:0, marginBottom:28 }}>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--violet)"}}/><div className="kpi-icon">✎</div><div className="stat-value sm" style={{color:"var(--violet)"}}>{loading?"—":jobs.length}</div><div className="stat-label">Content Pieces</div><div className="faint" style={{fontSize:11,marginTop:4}}>generated</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--mint)"}}/><div className="kpi-icon">📢</div><div className="stat-value sm" style={{color:"var(--mint)"}}>—</div><div className="stat-label">Published</div><div className="faint" style={{fontSize:11,marginTop:4}}>to social platforms</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--amber)"}}/><div className="kpi-icon">$</div><div className="stat-value sm" style={{color:"var(--amber)"}}>—</div><div className="stat-label">Attributed Revenue</div><div className="faint" style={{fontSize:11,marginTop:4}}>from UTM tracking</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--sky)"}}/><div className="kpi-icon">👁</div><div className="stat-value sm" style={{color:"var(--sky)"}}>—</div><div className="stat-label">Impressions</div><div className="faint" style={{fontSize:11,marginTop:4}}>Pinterest + Instagram</div></div>
      </div>

      <div className="btn-group" style={{marginBottom:20}}>
        <button className="btn btn-primary" onClick={()=>setShowModal(true)}>+ Generate Content</button>
        <button className="btn" onClick={()=>loadJobs()}>Refresh</button>
      </div>

      <div className="card">
        {loading ? <div className="spinner" /> : jobs.length === 0 ? (
          <div className="empty-state" style={{padding:40}}><div className="empty-icon">✎</div><div className="empty-title">No content jobs yet</div><div className="empty-desc">Click "+ Generate Content" to create your first AI-generated content.</div></div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{borderBottom:"2px solid var(--border)"}}>{["Job ID","Type","Status","Products","Date"].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:600,color:"var(--text-tertiary)",fontSize:11,textTransform:"uppercase",letterSpacing:".5px"}}>{h}</th>)}</tr></thead>
              <tbody>{jobs.map(j => <tr key={j.id} style={{borderBottom:"1px solid var(--border-subtle)"}}>
                <td style={{padding:"10px 12px",fontFamily:"var(--font-mono)",fontSize:12}}>{j.id.slice(0,8)}</td>
                <td style={{padding:"10px 12px"}}>{typeBadge(j.job_type)}</td>
                <td style={{padding:"10px 12px"}}>{statusBadge(j.status)}</td>
                <td style={{padding:"10px 12px"}}>{j.source_product_ids?.length||"—"}</td>
                <td style={{padding:"10px 12px"}}>{j.created_at?.slice(0,10)||"—"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setShowModal(false)}>
          <div className="card" style={{maxWidth:460,width:"100%",animation:"fadeUp .25s var(--ease)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:16,fontWeight:700}}>Generate Content</h3><button onClick={()=>setShowModal(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-tertiary)"}}>×</button></div>
            <div className="form-group"><label className="form-label">Content Type</label>
              <select className="form-select" value={jobType} onChange={e=>setJobType(e.target.value)}>
                <option value="desc">Product Description</option><option value="blog">Blog Post</option><option value="social">Social Media Caption</option>
              </select></div>
            <div className="form-group"><label className="form-label">Product IDs <span className="faint">— comma-separated</span></label>
              <input className="form-input" value={productIds} onChange={e=>setProductIds(e.target.value)} placeholder="1001, 1002, 1003" /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div className="form-group"><label className="form-label">Tone</label><select className="form-select" value={tone} onChange={e=>setTone(e.target.value)}><option value="professional">Professional</option><option value="casual">Casual</option><option value="luxury">Luxury</option></select></div>
              <div className="form-group"><label className="form-label">Language</label><select className="form-select" value={lang} onChange={e=>setLang(e.target.value)}><option value="en">English</option><option value="zh">Chinese</option><option value="ja">Japanese</option></select></div>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}>
              <button className="btn" onClick={()=>setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={generate} disabled={submitting}>{submitting?"Generating...":"Generate"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
