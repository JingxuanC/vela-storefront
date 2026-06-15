import { useState, useEffect } from "react";
import { api } from "~/api";

const SCORES = [
  { label:"SEO Score", value:72, color:"var(--amber)" },
  { label:"GEO Visibility", value:65, color:"var(--violet)" },
  { label:"UCP Compliance", value:88, color:"var(--mint)" },
  { label:"Content Quality", value:80, color:"var(--sky)" },
];

export default function SeoGeo() {
  const [msg, setMsg] = useState("");
  const [scores, setScores] = useState(SCORES);

  useEffect(() => {
    api<{success:boolean; seo_score?:number; geo_score?:number; ucp_score?:number; content_score?:number}>("/api/geo/settings").then(d => {
      if (d) setScores([
        {label:"SEO Score",value:d.seo_score||72,color:"var(--amber)"},
        {label:"GEO Visibility",value:d.geo_score||65,color:"var(--violet)"},
        {label:"UCP Compliance",value:d.ucp_score||88,color:"var(--mint)"},
        {label:"Content Quality",value:d.content_score||80,color:"var(--sky)"},
      ]);
    });
  }, []);

  async function newBatch() {
    setMsg("");
    const res = await api<{success:boolean;error?:string}>("/api/seo/batch", {
      method:"POST",
      body:JSON.stringify({ product_ids: [], tasks: ["meta_title","meta_description","alt_text"] }),
    });
    setMsg(res?.success?"Batch created!":"Failed to create batch");
  }

  async function regenerateGeo() {
    setMsg("");
    const res = await api<{success:boolean}>("/api/geo/regenerate", { method:"POST" });
    setMsg(res?.success?"llms.txt regenerated!":"Failed to regenerate");
  }

  return (
    <div>
      <h1 className="page-title">SEO & GEO</h1>
      <p className="page-subtitle">Search engine and generative engine optimization for your product catalog</p>

      {msg && <div className={`banner ${msg.includes("Failed")?"banner-error":"banner-success"}`}>{msg.includes("Failed")?"⚠":"✓"} {msg}</div>}

      <div className="detail-grid" style={{ marginTop:0, marginBottom:28 }}>
        {scores.map((s,i) => (
          <div className="card" key={s.label}>
            <div className="faint" style={{fontSize:11,textTransform:"uppercase",letterSpacing:".5px",marginBottom:12}}>{s.label}</div>
            <div className="stat-value" style={{color:s.color}}>{s.value}</div>
            <div className="attr-bar-bg" style={{marginTop:10}}><div className="attr-bar-fill" style={{width:`${s.value}%`,background:s.color}}/></div>
          </div>
        ))}
      </div>

      <div className="btn-group" style={{marginBottom:20}}>
        <button className="btn btn-primary" onClick={newBatch}>+ New Batch</button>
        <button className="btn" onClick={regenerateGeo}>Regenerate llms.txt</button>
        <button className="btn" onClick={()=>alert("Full visibility scan would analyze all products against SEO/GEO/UCP checks.")}>Full Scan</button>
      </div>

      <div className="card">
        <h3 className="section-title">Recent Batches</h3>
        <div className="empty-state" style={{padding:32}}><div className="empty-icon">⌘</div><div className="empty-title">No batches yet</div><div className="empty-desc">Click "+ New Batch" to run your first SEO optimization.</div></div>
      </div>
    </div>
  );
}
