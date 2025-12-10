import { useEffect, useState } from 'react';
import Head from 'next/head';

const fmt = (n) => n != null ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : null;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [q, setQ] = useState('');
  const [gen, setGen] = useState('all');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState('default');
  const [modalOpen, setModalOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const [gallery, setGallery] = useState([]);
  const [meetsMsg, setMeetsMsg] = useState('');
  const [galleryMsg, setGalleryMsg] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data); setFiltered(data);
    })();
    (async () => {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      setGallery(data);
    })();
  }, []);

  useEffect(() => {
    let list = [...products];
    if (gen !== 'all') list = list.filter(p => p.gen === gen);
    if (cat !== 'all') list = list.filter(p => p.cat === cat);
    if (q) list = list.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.brand.toLowerCase().includes(q.toLowerCase()) ||
      p.gen.includes(q.toLowerCase())
    );
    if (sort === 'price-asc') list.sort((a,b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (sort === 'price-desc') list.sort((a,b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    else if (sort === 'brand-asc') list.sort((a,b) => a.brand.localeCompare(b.brand));
    setFiltered(list);
  }, [q, gen, cat, sort, products]);

  const openModal = (p) => { setCurrent(p); setModalOpen(true); }
  const closeModal = () => setModalOpen(false);

  return (
    <>
      <Head>
        <title>Wentz Designs • E46 M3 Division</title>
        <meta name="description" content="One stop for E46 M3 parts, builds, and community." />
        <link rel="stylesheet" href="/styles.css" />
      </Head>

      <header>
        <div className="container nav">
          <div className="logo">
            <img src="/logo.svg" alt="Wentz Designs M3 Division" />
            <strong>WENTZ DESIGNS • E46 M3 DIVISION</strong>
          </div>
          <nav className="nav-links">
            <a href="#catalog">Catalog</a>
            <a href="#gallery">Gallery</a>
            <a href="#meets">Meets</a>
          </nav>
          <a href="tel:+12193132203" className="cta">Call (219) 313-2203</a>
        </div>
      </header>

      <section className="hero m-stripe">
        <div className="container">
          <h1>BMW E46 M3 parts, curated since 2004</h1>
          <p>Northwest Indiana’s premier specialist — CSL-inspired, track-tested</p>
          <div className="badge">
            <span>E46 M3</span><span>Coupe</span><span>Convertible</span><span>CSL</span>
          </div>
          <p style={{fontSize:16, marginTop:14}}>216 Main Street • Hobart, IN 46342</p>
        </div>
      </section>

      <div className="container controls" id="catalog">
        <input className="input" placeholder="Search brand, part, or generation..." value={q} onChange={e=>setQ(e.target.value)} />
        <select className="select" value={gen} onChange={e=>setGen(e.target.value)}>
          <option value="all">All generations</option>
          <option value="e46">E46</option>
          <option value="f80">F80</option>
        </select>
        <select className="select" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="brand-asc">Brand: A to Z</option>
        </select>
        <div className="chips" style={{gridColumn:'1/-1', marginTop:10}}>
          {['all','wheels','suspension','engine','exhaust','aero','drivetrain','maintenance'].map(c => (
            <button key={c} className={`chip ${cat===c?'active':''}`} onClick={()=>setCat(c)}>
              {c[0].toUpperCase()+c.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="grid">
          {filtered.map(p => (
            <article className="card" key={p.id}>
              <div className="thumb">
                <img src={p.img || '/placeholder.jpg'} alt={p.title} loading="lazy" />
              </div>
              <div className="card-body">
                <div className="title">{p.title} <span style={{color:'#7c8696', fontWeight:700}}>• {p.gen.toUpperCase()}</span></div>
                <div className="brand">{p.brand}</div>
                <div className="meta">
                  {p.price != null ? <div className="price">{fmt(p.price)}</div> : <div className="price unavailable">Contact for price</div>}
                  <button className="btn secondary" onClick={()=>openModal(p)}>Details</button>
                </div>
                <a className="btn" href={p.link} target="_blank" rel="noreferrer">View / Buy</a>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="container" id="gallery" style={{marginTop:20}}>
        <h2 style={{fontWeight:900}}>Community gallery</h2>
        <p style={{color:'var(--muted)', marginBottom:14}}>Submit your E46 M3 to be featured.</p>
        <div className="gallery">
          {gallery.map((g, idx) => (
            <div className="gallery-item" key={idx}>
              <img src={g.imageUrl || '/placeholder.jpg'} alt="Owner car" />
              <div className="meta">{g.name} • {g.car}</div>
            </div>
          ))}
        </div>
        <details style={{marginTop:16}}>
          <summary style={{cursor:'pointer', color:'var(--accent2)', fontWeight:800}}>Submit your car</summary>
          <form className="form" style={{marginTop:12}} onSubmit={async e=>{
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const data = Object.fromEntries(fd.entries());
            const res = await fetch('/api/gallery', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) });
            if (res.ok) {
              setGalleryMsg('Thanks! Your submission will be reviewed.');
              e.currentTarget.reset();
              const fresh = await fetch('/api/gallery'); setGallery(await fresh.json());
            } else setGalleryMsg('Submission error.');
          }}>
            <input className="input" name="name" placeholder="Your name" required />
            <input className="input" name="car" placeholder="Car details" required />
            <input className="input" name="imageUrl" placeholder="Image URL" required />
            <button className="btn" type="submit">Submit to gallery</button>
            <p style={{color:'var(--muted)'}}>{galleryMsg}</p>
          </form>
        </details>
      </div>

      <div className="container" id="meets" style={{marginTop:28}}>
        <h2 style={{fontWeight:900}}>E46 M3 group meets</h2>
        <p style={{color:'var(--muted)', marginBottom:14}}>Sign up to get notified about local events.</p>
        <form className="form" onSubmit={async e=>{
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const data = Object.fromEntries
