import { useState, useEffect } from "react";
import { api } from "~/api";

interface Product { id:string; title:string; product_type:string; vendor:string; status:string; image?:string; variants?:any[]; tags?:string; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [funnel, setFunnel] = useState<{views:number;tryons:number;adds:number;orders:number}|null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    Promise.all([
      api<{success:boolean; products:Product[]}>("/api/shop/products"),
      api<{success:boolean; views:number; tryons:number; adds_to_cart:number; orders:number}>("/api/shop/funnel"),
    ]).then(([p, f]) => {
      if (p?.products) setProducts(p.products);
      if (f?.views) setFunnel({views:f.views,tryons:f.tryons||0,adds:f.adds_to_cart||0,orders:f.orders||0});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = search ? products.filter(p => p.title?.toLowerCase().includes(search.toLowerCase())) : products;
  const optimized = products.filter(p => p.tags?.includes("vela-optimized")).length;
  const active = products.filter(p => p.status === "active").length;

  return (
    <div>
      <h1 className="page-title">Products</h1>
      <p className="page-subtitle">AI-powered catalog optimization and virtual try-on</p>

      <div className="kpi-grid" style={{ marginTop:0, marginBottom:28 }}>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--text-tertiary)"}}/><div className="kpi-icon">☷</div><div className="stat-value sm">{loading?"—":products.length}</div><div className="stat-label">Total Products</div><div className="faint" style={{fontSize:11,marginTop:4}}>synced from Shopify</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--violet)"}}/><div className="kpi-icon">✦</div><div className="stat-value sm" style={{color:"var(--violet)"}}>{loading?"—":optimized}</div><div className="stat-label">AI-Optimized</div><div className="faint" style={{fontSize:11,marginTop:4}}>descriptions enhanced</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--mint)"}}/><div className="kpi-icon">●</div><div className="stat-value sm" style={{color:"var(--mint)"}}>{loading?"—":active}</div><div className="stat-label">Active</div><div className="faint" style={{fontSize:11,marginTop:4}}>in stock & visible</div></div>
        <div className="card kpi-card"><div className="kpi-accent-line" style={{background:"var(--amber)"}}/><div className="kpi-icon">🏷️</div><div className="stat-value sm" style={{color:"var(--amber)"}}>{loading?"—":products.filter(p=>p.variants&&p.variants.length>0).length}</div><div className="stat-label">With Variants</div><div className="faint" style={{fontSize:11,marginTop:4}}>size/color options</div></div>
      </div>

      {funnel && (
        <div className="card" style={{marginBottom:20,padding:"16px 24px"}}>
          <div style={{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
            <div className="faint" style={{fontSize:11,textTransform:"uppercase",letterSpacing:".5px"}}>Funnel</div>
            <div><span className="mono" style={{fontWeight:600}}>{funnel.views}</span> <span className="faint" style={{fontSize:11}}>Views</span></div>
            <span className="faint">→</span>
            <div><span className="mono" style={{fontWeight:600}}>{funnel.tryons}</span> <span className="faint" style={{fontSize:11}}>Try-Ons</span></div>
            <span className="faint">→</span>
            <div><span className="mono" style={{fontWeight:600}}>{funnel.adds}</span> <span className="faint" style={{fontSize:11}}>Adds to Cart</span></div>
            <span className="faint">→</span>
            <div><span className="mono" style={{fontWeight:600,color:"var(--mint)"}}>{funnel.orders}</span> <span className="faint" style={{fontSize:11}}>Orders</span></div>
          </div>
        </div>
      )}

      <div style={{display:"flex",gap:8,marginBottom:20}}>
        <input className="form-input" placeholder="Search products..." style={{maxWidth:320}} value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="btn" onClick={()=>{setLoading(true);api("/api/shop/products").then(d=>{if(d?.products)setProducts(d.products);setLoading(false)});}}>Refresh</button>
        <a href="/app/seo-batch" className="btn">Bulk SEO</a>
      </div>

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="card"><div className="empty-state" style={{padding:40}}><div className="empty-icon">☷</div><div className="empty-title">No products found</div><div className="empty-desc">{products.length===0?"Sync your store to load products.":"Try a different search term."}</div></div></div>
      ) : (
        <div className="detail-grid" style={{marginTop:0}}>
          {filtered.map(p => {
            const price = p.variants?.[0]?.price ? `$${p.variants[0].price}` : "—";
            const stock = p.variants?.[0]?.inventory_quantity ?? "—";
            return (
              <div className="card" key={p.id} style={{cursor:"pointer"}} onClick={()=>setSelected(p)}>
                <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:56,height:56,borderRadius:12,background:"var(--bg-deep)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0}}>{p.image ? <img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:12}} /> : "📦"}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div><h3 style={{fontSize:14,fontWeight:600,marginBottom:2}}>{p.title}</h3><div className="faint" style={{fontSize:12}}>{p.product_type||"Uncategorized"} · {p.vendor||""}</div></div>
                      <span className="mono" style={{fontSize:14,fontWeight:600}}>{price}</span>
                    </div>
                    <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
                      {p.tags?.includes("vela-optimized") && <span className="badge" style={{fontSize:9,background:"var(--violet-soft)",color:"var(--violet)"}}>✦ Optimized</span>}
                      {p.variants && p.variants.length > 0 && <span className="badge" style={{fontSize:9,background:"var(--amber-soft)",color:"var(--amber)"}}>👗 Try-On</span>}
                      <span className="badge" style={{fontSize:9,background:p.status==="active"?"var(--mint-soft)":"var(--rose-soft)",color:p.status==="active"?"var(--mint)":"var(--rose)"}}>{p.status==="active"?`● ${stock} in stock`:"○ Archived"}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.4)",backdropFilter:"blur(4px)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setSelected(null)}>
          <div className="card" style={{maxWidth:480,width:"100%",animation:"fadeUp .25s var(--ease)",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><h3 style={{fontSize:16,fontWeight:700}}>{selected.title}</h3><button onClick={()=>setSelected(null)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"var(--text-tertiary)"}}>×</button></div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div className="metric-row"><span className="metric-key">Type</span><span className="metric-val">{selected.product_type||"—"}</span></div>
              <div className="metric-row"><span className="metric-key">Vendor</span><span className="metric-val">{selected.vendor||"—"}</span></div>
              <div className="metric-row"><span className="metric-key">Status</span><span className="metric-val">{selected.status}</span></div>
              <div className="metric-row"><span className="metric-key">Tags</span><span className="metric-val">{selected.tags||"—"}</span></div>
              {selected.variants && selected.variants.length > 0 && (
                <div><div className="form-label" style={{marginBottom:8}}>Variants</div>
                  {selected.variants.map((v:any,i:number) => (
                    <div key={i} className="metric-row"><span className="metric-key">{v.title||`Variant ${i+1}`}</span><span className="metric-val">{v.price?`$${v.price}`:"—"} · {v.inventory_quantity??"?"} in stock</span></div>
                  ))}
                </div>
              )}
              <div className="btn-group" style={{marginTop:8}}>
                <button className="btn btn-primary btn-sm" onClick={()=>setSelected(null)}>Close</button>
                <button className="btn btn-sm" onClick={() => { api("/api/tryon/preview", { method: "POST", body: JSON.stringify({ product_id: selected.id }) }); alert("Try-on triggered"); }}>Virtual Try-On</button>
                <button className="btn btn-sm" onClick={() => { api("/api/seo/batch", { method: "POST", body: JSON.stringify({ product_ids: [selected.id], tasks: ["meta_title","meta_description","alt_text"] }) }).then(r => { if (r) alert("SEO batch created"); else alert("Failed"); }); }}>Optimize SEO</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
