import { useState, useEffect } from "react";
import { api } from "~/api";

interface LLMConfig { provider: string; model: string; api_key_masked: string; has_custom_key: boolean; available_models: { id: string; name: string; description: string; locked: boolean }[]; plan: string; }

const PROVIDERS = [
  { v:"deepseek", l:"DeepSeek", desc:"Fast, cost-effective" },
  { v:"dashscope", l:"DashScope (Qwen)", desc:"Alibaba Cloud AI" },
  { v:"openai", l:"OpenAI", desc:"GPT-4o, GPT-4o Mini" },
];

const VOICES = [
  { v:"friendly", l:"😊 Friendly", desc:"Warm, casual tone" },
  { v:"professional", l:"💼 Professional", desc:"Polished, business-like" },
  { v:"luxury", l:"✨ Luxury", desc:"Exclusive, sophisticated" },
  { v:"playful", l:"🎉 Playful", desc:"Fun, energetic" },
];

function Skeleton({ w="100%", h=20 }: { w?:string; h?:number }) {
  return <div style={{width:w,height:h,borderRadius:6,background:"var(--border)",opacity:.5}} />;
}

function Toggle({ label, checked, onChange, desc }: { label:string; checked:boolean; onChange:(v:boolean)=>void; desc?:string }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:"1px solid var(--border-subtle)"}}>
      <div><div style={{fontSize:13,fontWeight:500,color:"var(--text-primary)"}}>{label}</div>{desc && <div className="faint" style={{fontSize:11,marginTop:2}}>{desc}</div>}</div>
      <button onClick={()=>onChange(!checked)} style={{width:46,height:26,borderRadius:13,border:"none",cursor:"pointer",background:checked?"var(--mint)":"var(--border-strong)",position:"relative",padding:0,transition:"background .2s var(--ease)",flexShrink:0}}>
        <span style={{display:"block",width:22,height:22,borderRadius:"50%",background:"#fff",boxShadow:checked?"0 1px 4px rgba(14,168,122,.3)":"0 1px 3px rgba(0,0,0,.08)",transition:"transform .25s var(--ease)",transform:checked?"translateX(22px)":"translateX(2px)",marginTop:2}}/>
      </button>
    </div>
  );
}

export default function Settings() {
  const [cfg, setCfg] = useState<LLMConfig | null>(null);
  const [provider, setProvider] = useState("deepseek"); const [model, setModel] = useState("deepseek-chat"); const [apiKey, setApiKey] = useState("");
  const [savingLLM, setSavingLLM] = useState(false); const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{t:"success"|"error";text:string}|null>(null);
  const [emailReturns, setEmailReturns] = useState(true); const [emailUsage, setEmailUsage] = useState(true); const [inAppNotif, setInAppNotif] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);
  const [saEnabled, setSaEnabled] = useState(true); const [saWelcome, setSaWelcome] = useState("Hi! Welcome to our store. What are you looking for today? 👋"); const [saVoice, setSaVoice] = useState("friendly");
  const [savingSA, setSavingSA] = useState(false);

  useEffect(() => {
    Promise.all([api<LLMConfig & {success:boolean}>("/api/llm/config"), api<any>("/api/notifications/preferences"), api<any>("/api/shop/sales-agent/config")])
      .then(([llm,notif,sa]) => { if(llm){setCfg(llm);setProvider(llm.provider);setModel(llm.model);} if(notif){setEmailReturns(notif.email_return_updates??true);setEmailUsage(notif.email_usage_alerts??true);setInAppNotif(notif.in_app_notifications??true);} if(sa){setSaEnabled(sa.enabled??true);setSaWelcome(sa.welcome_message||"");setSaVoice(sa.brand_voice||"friendly");} setLoading(false); });
  }, []);

  const models = (cfg?.available_models||[]).filter(m => { const p=provider==="dashscope"?"qwen":provider==="deepseek"?"deepseek":"gpt"; return m.id.startsWith(p); });
  useEffect(() => { const a=models.filter(m=>!m.locked); if(a.length>0&&!a.find(m=>m.id===model)) setModel(a[0].id); }, [provider]);

  async function saveLLM() { setSavingLLM(true); setMsg(null); const r=await api<{success:boolean}>("/api/llm/config",{method:"PUT",body:JSON.stringify({provider,model,api_key:apiKey})}); setSavingLLM(false); setMsg(r?.success?{t:"success",text:"AI Model saved"}:{t:"error",text:"Failed — check key or plan limits"}); if(r?.success) setApiKey(""); }
  async function saveNotif() { setSavingNotif(true); await api("/api/notifications/preferences",{method:"PUT",body:JSON.stringify({email_return_updates:emailReturns,email_usage_alerts:emailUsage,in_app_notifications:inAppNotif})}); setSavingNotif(false); setMsg({t:"success",text:"Notifications saved"}); }
  async function saveSA() { setSavingSA(true); await api("/api/shop/sales-agent/config",{method:"PUT",body:JSON.stringify({enabled:saEnabled,welcome_message:saWelcome,brand_voice:saVoice})}); setSavingSA(false); setMsg({t:"success",text:"Sales Agent saved"}); }

  if (loading) return (
    <div style={{maxWidth:960}}><h1 className="page-title">Settings</h1><p className="page-subtitle">Loading your preferences...</p>
      <div className="card"><div style={{display:"flex",flexDirection:"column",gap:14,padding:4}}><Skeleton h={16} w="25%"/><Skeleton h={38}/><Skeleton h={16} w="25%"/><Skeleton h={38}/></div></div>
    </div>
  );

  return (
    <div style={{maxWidth:960}}>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Configure your AI-powered store preferences</p>

      {msg && <div className={`banner banner-${msg.t==="success"?"success":"error"}`}>{msg.t==="success"?"✓":"⚠"} {msg.text}</div>}

      {/* Row 1: AI Model */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:20}}>
          <div style={{width:40,height:40,borderRadius:10,background:"var(--amber-soft)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🤖</div>
          <div><h3 className="section-title" style={{marginBottom:2}}>AI Model</h3><div className="faint" style={{fontSize:12}}>Choose which AI model powers your store's features</div></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Provider</label>
            <select className="form-select" value={provider} onChange={e=>setProvider(e.target.value)}>{PROVIDERS.map(p=><option key={p.v} value={p.v}>{p.l} — {p.desc}</option>)}</select>
          </div>
          <div className="form-group" style={{marginBottom:0}}>
            <label className="form-label">Model</label>
            <select className="form-select" value={model} onChange={e=>setModel(e.target.value)}>{models.map(m=><option key={m.id} value={m.id} disabled={m.locked}>{m.name} — {m.description}{m.locked?" 🔒":""}</option>)}</select>
          </div>
        </div>
        <div className="form-group" style={{marginTop:14,marginBottom:0}}>
          <label className="form-label">Custom API Key <span className="faint">— leave blank to use Vela's key</span></label>
          <input className="form-input" type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder={cfg?.api_key_masked||"sk-••••••••"} autoComplete="off"/>
          {cfg?.has_custom_key && !apiKey && <p style={{fontSize:11,color:"var(--mint)",marginTop:4}}>✓ Custom key active — enter a new one to replace</p>}
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:16,paddingTop:16,borderTop:"1px solid var(--border-subtle)"}}>
          <span className="badge badge-amber">Plan: {cfg?.plan||"free"} · <a href="/app/plans" style={{color:"inherit"}}>Upgrade →</a></span>
          <button className="btn btn-primary" onClick={saveLLM} disabled={savingLLM}>{savingLLM?"Saving...":"Save Model"}</button>
        </div>
      </div>

      {/* Row 2: Notifications + Sales Agent side by side */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:20}}>
        {/* Notifications */}
        <div className="card">
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:20}}>
            <div style={{width:40,height:40,borderRadius:10,background:"var(--mint-soft)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🔔</div>
            <div><h3 className="section-title" style={{marginBottom:2}}>Notifications</h3><div className="faint" style={{fontSize:12}}>Alert preferences</div></div>
          </div>
          <Toggle label="Return status updates" desc="Email when returns change" checked={emailReturns} onChange={setEmailReturns} />
          <Toggle label="Usage alerts (80%+)" desc="Warn before hitting limit" checked={emailUsage} onChange={setEmailUsage} />
          <Toggle label="In-app notifications" desc="Real-time alerts in dashboard" checked={inAppNotif} onChange={setInAppNotif} />
          <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid var(--border-subtle)"}}><button className="btn btn-primary" onClick={saveNotif} disabled={savingNotif}>{savingNotif?"Saving...":"Save"}</button></div>
        </div>

        {/* Sales Agent */}
        <div className="card">
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:20}}>
            <div style={{width:40,height:40,borderRadius:10,background:"var(--violet-soft)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>💬</div>
            <div><h3 className="section-title" style={{marginBottom:2}}>Sales Agent</h3><div className="faint" style={{fontSize:12}}>Storefront AI assistant</div></div>
          </div>
          <Toggle label="Enable Sales Agent" desc="Show on your storefront" checked={saEnabled} onChange={setSaEnabled} />
          {saEnabled && <>
            <div className="form-group" style={{marginTop:14}}>
              <label className="form-label">Welcome Message</label>
              <textarea className="form-input" value={saWelcome} onChange={e=>setSaWelcome(e.target.value)} maxLength={150} rows={2} style={{resize:"vertical"}} />
              <div className="faint" style={{fontSize:10,marginTop:4}}>{saWelcome.length}/150</div>
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label className="form-label">Brand Voice</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {VOICES.map(v=>(<div key={v.v} onClick={()=>setSaVoice(v.v)} style={{padding:"10px 12px",borderRadius:8,border:`1px solid ${saVoice===v.v?"var(--amber-border)":"var(--border)"}`,background:saVoice===v.v?"var(--amber-soft)":"var(--bg-deep)",cursor:"pointer",transition:"all .15s"}}><div style={{fontSize:12,fontWeight:600}}>{v.l}</div><div className="faint" style={{fontSize:10}}>{v.desc}</div></div>))}
              </div>
            </div>
            <div style={{marginTop:16,paddingTop:16,borderTop:"1px solid var(--border-subtle)"}}><button className="btn btn-primary" onClick={saveSA} disabled={savingSA}>{savingSA?"Saving...":"Save"}</button></div>
          </>}
        </div>
      </div>
    </div>
  );
}
