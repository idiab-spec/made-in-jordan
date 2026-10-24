(() => {
  'use strict';
  const D = window.MIJ, I = window.I18N;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const byId = arr => Object.fromEntries(arr.map(x => [x.id, x]));
  const P = byId(D.products), F = byId(D.factories), S = byId(D.sectors), E = byId(D.estates);
  const LANGS = D.languages.map(l => l[0]).filter(c => I[c]);
  const FEATURED = ['p07', 'p01', 'p11', 'p18', 'p09', 'p05', 'p03', 'p16'];
  const SECTOR_PHOTO = { food: 'p01', pharma: 'p03', chemicals: 'p27', mining: 'p24', machinery: 'p09', electrical: 'p13', plastics: 'p14', textiles: 'p16', building: 'p18', furniture: 'p21', cosmetics: 'p05', paper: 'p22' };
  const OPP_PHOTO = { o1: 'p24', o2: 'p13', o3: 'p03', o4: 'p04', o5: 'p16', o6: 'p09' };
  const TOUR = [['home', '.hero-inner'], ['search', '.filters'], ['p07', '.p-head'], ['f02', '.f-head'], ['invest', '.opps'], ['insights', '.kpis'], ['join', '.plans'], ['admin', '.queue-panel'], ['model', '.flow']];
  const PAGES = ['home', 'search', 'factories', 'invest', 'insights', 'join', 'admin', 'model'];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fineHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const store = {
    get(k) { try { return localStorage.getItem('mij.' + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem('mij.' + k, v); } catch (e) { /* storage blocked */ } }
  };

  const blankFilters = () => ({ sector: '', estate: '', cert: '', priced: false });
  const state = {
    lang: initialLang(),
    cur: store.get('cur') === 'USD' ? 'USD' : 'JOD',
    route: 'home',
    q: '', qKey: '', qMatch: '',
    f: blankFilters(), sort: 'relevance', filtersOpen: false, menuOpen: false,
    tour: -1,
    queue: D.queue.map(q => q.id),
    calc: { starter: 720, growth: 410, export: 110, disc: false },
    estate: 'sahab', factorySector: '',
    sent: {}, requested: {}, joined: false, joinPlan: 'growth'
  };

  function initialLang() {
    const saved = store.get('lang');
    if (saved && I[saved]) return saved;
    const prefs = (navigator.languages || [navigator.language || 'en']).map(l => String(l).slice(0, 2).toLowerCase());
    return prefs.find(l => I[l]) || 'en';
  }

  // ---------- text and numbers ----------
  function t(key, vars) {
    let s = I[state.lang] && I[state.lang][key];
    if (s == null) s = I.en[key];
    if (s == null) return key;
    if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m));
    return s;
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const loc = () => t('meta.locale');
  const nf = (n, o) => { try { return new Intl.NumberFormat(loc(), o).format(n); } catch (e) { return String(n); } };
  const num = n => nf(n);
  const compact = n => nf(n, { notation: 'compact', maximumFractionDigits: 1 });
  const tn = (key, n) => t(n === 1 && I[state.lang] && I[state.lang][key + '1'] ? key + '1' : key, { n: num(n) });
  const NBSP = ' ';
  const isolate = s => '⁨' + s + '⁩';
  const dn = {};
  function country(code) {
    if (code === 'other') return t('ins.other');
    const l = loc();
    try { dn[l] = dn[l] || new Intl.DisplayNames([l], { type: 'region' }); return dn[l].of(code) || code; } catch (e) { return code; }
  }

  function moneyParts(jd, isCompact) {
    const usd = state.cur === 'USD';
    const v = usd ? jd * D.usdPerJod : jd;
    const o = { style: 'currency', currency: usd ? 'USD' : 'JOD', currencyDisplay: 'code' };
    if (isCompact) { o.notation = 'compact'; o.maximumSignificantDigits = 3; }
    else { const d = v >= 100 || v === 0 ? 0 : 2; o.minimumFractionDigits = d; o.maximumFractionDigits = v > 0 && v < 1 ? 3 : d; }
    let parts;
    try { parts = new Intl.NumberFormat(loc(), o).formatToParts(v); } catch (e) { parts = [{ type: 'integer', value: String(v) }]; }
    const ci = parts.findIndex(p => p.type === 'currency');
    const ni = parts.findIndex(p => p.type === 'integer');
    const n = parts.filter(p => p.type !== 'currency').map(p => (p.type === 'literal' ? p.value.replace(/[‎‏]/g, '').replace(/[\s  ]+/g, NBSP) : p.value)).join('').replace(/^ +| +$/g, '');
    return { n, cur: t(usd ? 'cur.USD' : 'cur.JOD'), prefix: ci !== -1 && ci < ni };
  }
  function joinMoney(cur, n, prefix) {
    const tight = prefix && cur.length === 1;
    return prefix ? cur + (tight ? '' : NBSP) + isolate(n) : isolate(n) + NBSP + cur;
  }
  function money(jd, isCompact) { const p = moneyParts(jd, isCompact); return joinMoney(p.cur, p.n, p.prefix); }
  function range(a, b) { const pa = moneyParts(a), pb = moneyParts(b); return joinMoney(pa.cur, pa.n + '–' + pb.n, pa.prefix); }

  const pName = p => t(p.id + '.n');
  const pDesc = p => t(p.id + '.d');
  const fName = f => (state.lang === 'ar' ? f.name.ar : f.name.en);
  const secName = id => t('sec.' + id);
  const estName = id => t('est.' + id);
  const city = id => t('city.' + id);
  const unitName = u => t('u.' + u);
  const qty = ([q, u]) => num(q) + NBSP + (q === 1 ? unitName(u) : t('us.' + u));
  const qtyCompact = ([q, u]) => (q >= 1e6 ? compact(q) : num(q)) + NBSP + t('us.' + u);
  function specVal(v) {
    if (typeof v === 'object') return t(v.k, { n: num(v.n) });
    if (v[0] === '@') return t(v.slice(1));
    return `<bdi dir="ltr">${esc(v)}</bdi>`;
  }
  function splitTitle(s) {
    const m = s.match(/^(.*[,،，、])\s*(.+)$/);
    return m ? [m[1], m[2]] : [s, ''];
  }

  // Animated numbers: the final value is in the markup; it counts up when it comes into view.
  const FMT = { num: v => num(Math.round(v)), compact: v => compact(v), money: v => money(v), moneyc: v => money(v, true), pct: v => nf(v / 100, { style: 'percent' }) };
  const counter = (value, kind) => `<span data-count="${value}" data-kind="${kind}">${FMT[kind](value)}</span>`;

  // ---------- icons ----------
  const ICONS = {
    food: '<path d="M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
    pharma: '<rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><path d="M9.9 9.9l4.2 4.2"/>',
    chemicals: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7.5 15h9"/>',
    mining: '<path d="M3 20l6-11 4 6 2-3 6 8z"/><path d="M9 9l2 3.5"/>',
    machinery: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    electrical: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    plastics: '<path d="M10 2h4v3l2 3v12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V8l2-3z"/><path d="M8 12h8"/>',
    textiles: '<path d="M8 3 3 6l2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
    building: '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 5v4.7M6 9.7v4.6M12 9.7v4.6M18 9.7v4.6M9 14.3V19M15 14.3V19"/>',
    furniture: '<path d="M7 3v9h10V3M5 12h14v3H5zM7 15v6M17 15v6"/>',
    cosmetics: '<rect x="5" y="9" width="14" height="11" rx="2"/><rect x="6" y="4" width="12" height="5" rx="1"/><path d="M9 14h6"/>',
    paper: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    check: '<path d="M5 12.5 9.5 17 19 7.5"/>',
    shield: '<path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2.2"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    fwd: '<path d="M9 6l6 6-6 6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    menu: '<path d="M4 8h16M4 16h16"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    factory: '<path d="M3 21V10l6 3.5V10l6 3.5V5h4v16z"/><path d="M7 17h2M12 17h2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"/>',
    trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .6 3.3 2.4 3.5 5.2"/>',
    cart: '<path d="M3 4h2l2.4 11h11l2-8H6.2"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
    signal: '<path d="M5 19a10 10 0 0 1 0-14M19 5a10 10 0 0 1 0 14M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7"/><circle cx="12" cy="12" r="1.5"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    estate: '<path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6M4 21h16"/>',
    alert: '<path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/>',
    minus: '<path d="M6 12h12"/>',
    doc: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>'
  };
  const icon = (n, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n] || ''}</svg>`;
  function starPoints(cx, cy, R, r, n = 7) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / n, rad = i % 2 ? r : R;
      pts.push((cx + rad * Math.cos(a)).toFixed(2) + ',' + (cy + rad * Math.sin(a)).toFixed(2));
    }
    return pts.join(' ');
  }
  const STAR = starPoints(12, 12, 11, 4.9);
  const starMark = () => `<svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="${starPoints(12, 12, 10.5, 4.6)}" fill="#fff"/></svg>`;
  const ratingStars = r => `<span class="stars" aria-hidden="true">${[1, 2, 3, 4, 5].map(i => `<svg viewBox="0 0 24 24" style="opacity:${i <= Math.round(r) ? 1 : 0.3}"><polygon points="${starPoints(12, 12.5, 11, 4.6, 5)}"/></svg>`).join('')}</span>`;
  const ring = p => `<svg class="ring" viewBox="0 0 40 40" aria-hidden="true"><circle class="ring-bg" cx="20" cy="20" r="15" pathLength="100"/><circle class="ring-fg" cx="20" cy="20" r="15" pathLength="100" style="--p:${p.toFixed(3)}"/></svg>`;

  // ---------- photos ----------
  const photoSrc = id => `img/${id}.jpg`;
  function photo(p, { cls = '', chips = true, eager = false, src = null } = {}) {
    return `<div class="photo ${cls}" style="--h:${S[p.sector].hue}">${icon(p.sector)}<img src="${src || photoSrc(p.id)}" alt="${esc(pName(p))}" ${eager ? '' : 'loading="lazy"'} decoding="async">${chips ? `<span class="photo-chip hs"><bdi dir="ltr">HS ${p.hs}</bdi></span><span class="photo-chip sample">${t('ui.sample')}</span>` : ''}</div>`;
  }

  // ---------- map of Jordan ----------
  const MX = lon => (lon - 34.8) * 85.26, MY = lat => (33.5 - lat) * 100;
  const DEAD_SEA = [[35.47, 31.76], [35.585, 31.72], [35.6, 31.45], [35.55, 31.1], [35.42, 31.12], [35.4, 31.45]];
  const pointsOf = arr => arr.map(([lon, lat]) => MX(lon).toFixed(1) + ',' + MY(lat).toFixed(1)).join(' ');
  function mapSVG({ sel = null, pulse = false, interactive = false } = {}) {
    const dots = D.estates.map((e, i) => {
      const x = MX(e.lon).toFixed(1), y = MY(e.lat).toFixed(1), on = e.id === sel;
      return `<g ${interactive ? `data-estate="${e.id}" style="cursor:pointer"` : ''}>${pulse ? `<circle class="jo-pulse" cx="${x}" cy="${y}" r="5" style="animation-delay:${(i * 0.32).toFixed(2)}s"/>` : ''}<circle class="jo-dot${on ? ' sel' : ''}" cx="${x}" cy="${y}" r="${on ? 7.5 : 5.5}"><title>${esc(estName(e.id))}</title></circle></g>`;
    }).join('');
    let label = '';
    if (sel && E[sel]) {
      const e = E[sel], x = (MX(e.lon) + 13).toFixed(1), y = MY(e.lat);
      label = `<text class="jo-label" x="${x}" y="${(y + 1).toFixed(1)}" direction="ltr">${esc(city(e.id))}</text><text class="jo-label-sub" x="${x}" y="${(y + 16).toFixed(1)}" direction="ltr">${esc(t('home.map.listed', { n: num(e.listed) }))}</text>`;
    }
    return `<svg viewBox="0 0 390 445" role="img" aria-label="${esc(t('inv.map.title'))}"><polygon class="jo-land" points="${pointsOf(D.outline)}"/><polygon class="jo-sea" points="${pointsOf(DEAD_SEA)}"/>${dots}${label}</svg>`;
  }

  // ---------- shared pieces ----------
  function priceLine(p) {
    if (!p.price) return `<div class="pcard-price req">${t('p.priceOnRequest')}</div>`;
    const [a, b, u] = p.price;
    return `<div class="pcard-price">${range(a, b)} <small>${t('p.perUnit', { unit: unitName(u) })}</small></div>`;
  }
  function priceBig(p) {
    if (!p.price) return `<div class="price-big req grad">${t('p.priceOnRequest')}</div>`;
    const [a, b, u] = p.price;
    return `<div class="price-big">${range(a, b)} <small>${t('p.perUnit', { unit: unitName(u) })}</small></div>`;
  }
  const rv = i => `data-reveal style="--d:${Math.min(i, 8) * 70}ms"`;

  function productCard(p, i = 0) {
    const f = F[p.f];
    return `<a class="pcard glass tilt" href="#${p.id}" data-go="${p.id}" ${rv(i)}>
      ${photo(p)}
      <div class="pcard-body">
        <span class="pcard-sector">${secName(p.sector)}</span>
        <span class="pcard-name">${pName(p)}</span>
        <span class="pcard-factory">${icon('shield')}<span>${esc(fName(f))} · ${city(f.estate)}</span></span>
        ${priceLine(p)}
        <div class="pcard-meta"><span class="chip">${t('p.moq')}: ${qty(p.moq)}</span></div>
      </div>
    </a>`;
  }

  function factoryCard(f, i = 0) {
    const prods = D.products.filter(p => p.f === f.id);
    return `<a class="fcard glass tilt" href="#${f.id}" data-go="${f.id}" ${rv(i)}>
      ${photo(prods[0], { chips: false })}
      <div class="fcard-in">
        <div class="fcard-top"><span class="f-avatar" style="--h:${S[f.sector].hue}">${icon(f.sector)}</span>
          <div style="min-width:0"><h3>${esc(fName(f))}</h3><span class="small muted">${secName(f.sector)} · ${city(f.estate)}</span></div></div>
        <p class="small" style="color:var(--ink-2)">${t(f.id + '.d')}</p>
        <div class="fcard-stats"><span>${t('f.employees')} <b>${num(f.employees)}</b></span><span>${t('f.founded')} <b>${nf(f.founded, { useGrouping: false })}</b></span><span>${t('f.products')} <b>${num(prods.length)}</b></span></div>
        <div class="f-tags"><span class="badge">${icon('shield')}${t('p.verified')}</span>${f.open ? `<span class="pill pill-sand">${t('f.open.' + f.open)}</span>` : ''}</div>
      </div>
    </a>`;
  }

  const sectionHead = (title, sub, extra = '', center = false) => `<div class="section-head${center ? ' center' : ''}" data-reveal><div><h2>${title}</h2>${sub ? `<p class="lead">${sub}</p>` : ''}</div>${extra}</div>`;
  const pageHead = (kicker, title, sub, center = true) => `<div class="page-head${center ? ' center' : ''}">${kicker ? `<span class="kicker">${kicker}</span>` : ''}<h1>${title}</h1>${sub ? `<p class="lead">${sub}</p>` : ''}</div>`;

  function nationalBento() {
    const n = D.national;
    return `<div class="bento">
      <div class="tile glass t-map tilt" ${rv(0)}>
        <div class="grid" style="gap:6px"><span class="tile-label">${t('stat.estates')}</span><span class="tile-num">${counter(n.estates, 'num')}</span></div>
        ${mapSVG({ pulse: true })}
      </div>
      <div class="tile glass t-wide tilt" ${rv(1)}><span class="tile-label">${t('stat.exports')}</span><span class="tile-num xl grad">${counter(n.exports, 'moneyc')}</span></div>
      <div class="tile glass t-ring tilt" ${rv(2)}>${ring(n.exportsShare / 100)}<div class="grid" style="gap:6px"><span class="tile-num" style="font-size:clamp(32px,3.4vw,44px)">${counter(n.exportsShare, 'pct')}</span><span class="tile-label">${t('stat.exportsShare')}</span></div></div>
      <div class="tile glass tilt" ${rv(3)}><span class="tile-label">${t('stat.establishments')}</span><span class="tile-num">${counter(n.establishments, 'compact')}</span></div>
      <div class="tile glass t-wide tilt" ${rv(4)}><span class="tile-label">${t('stat.workers')}</span><span class="tile-num">${counter(n.workers, 'compact')}</span></div>
      <div class="tile glass t-wide tilt" ${rv(5)}><span class="tile-label">${t('stat.estateCos')}</span><span class="tile-num">${counter(n.estateCompanies, 'num')}</span></div>
    </div><p class="source">${t('stat.source')}</p>`;
  }

  // ---------- header, footer, tour ----------
  function group() {
    const r = state.route;
    if (P[r]) return 'search';
    if (F[r]) return 'factories';
    return r;
  }
  const NAV = [['search', 'nav.products'], ['factories', 'nav.factories'], ['invest', 'nav.invest'], ['insights', 'nav.insights'], ['join', 'nav.join']];

  function header() {
    const g = group();
    const cur = r => (g === r ? 'aria-current="page"' : '');
    return `<div class="ribbon"><div class="wrap">
        <span>${t('demo.banner')}</span>
        <button data-go="model" ${cur('model')}>${t('nav.model')}</button>
        <button data-go="admin" ${cur('admin')}>${t('nav.admin')}</button>
      </div></div>
      <header class="nav"><div class="wrap">
        <a class="brand" href="#home" data-go="home"><span class="brand-mark">${starMark()}</span><span class="brand-name">${t('brand')}</span></a>
        <nav class="nav-links" aria-label="${t('nav.menu')}">${NAV.map(([r, k]) => `<button data-go="${r}" ${cur(r)}>${t(k)}</button>`).join('')}</nav>
        <div class="controls">
          <select class="select" id="lang" aria-label="${t('ui.language')}">${D.languages.filter(([c]) => I[c]).map(([c, n]) => `<option value="${c}" ${c === state.lang ? 'selected' : ''}>${n}</option>`).join('')}</select>
          <div class="seg" role="group" aria-label="${t('ui.currency')}"><button data-cur="JOD" aria-pressed="${state.cur === 'JOD'}">JOD</button><button data-cur="USD" aria-pressed="${state.cur === 'USD'}">USD</button></div>
          <button class="btn btn-primary tour-btn" data-tour="start" aria-label="${t('nav.tour')}">${icon('play')}<span>${t('nav.tour')}</span></button>
          <button class="menu-btn" data-menu aria-label="${t('nav.menu')}" aria-expanded="${state.menuOpen}">${icon(state.menuOpen ? 'x' : 'menu')}</button>
        </div>
      </div>
      <div class="sheet" data-open="${state.menuOpen}"><div class="wrap">
        ${[...NAV, ['model', 'nav.model'], ['admin', 'nav.admin']].map(([r, k]) => `<button data-go="${r}" ${cur(r)}>${t(k)}</button>`).join('')}
        <button data-cur="JOD" aria-pressed="${state.cur === 'JOD'}">${t('ui.currency')}: JOD</button>
        <button data-cur="USD" aria-pressed="${state.cur === 'USD'}">${t('ui.currency')}: USD</button>
      </div></div>
      </header>`;
  }

  function footer() {
    return `<footer class="footer"><div class="wrap">
      <strong>${t('brand')}</strong>
      <p>${t('foot.text')}</p>
      <p>${t('foot.sample')}</p>
      <p>${t('foot.photos')}</p>
      <details class="credits" id="credits"><summary>${t('foot.credits')}</summary><ul id="credits-list"></ul></details>
      <p>${t('ui.sources')}: <a href="https://jordantimes.com/news/local/industrial-exports-reach-record-jd89b-in-2025-jci" target="_blank" rel="noopener">Jordan Chamber of Industry (2025)</a> · <a href="https://jordantimes.com/news/business/industrial-sector-sees-strong-growth-in-2025-jci" target="_blank" rel="noopener">JCI, workers (2025)</a> · <a href="https://www.jordannews.jo/Section-109/News/JIEC-s-investments-at-JD3-235bln-seeks-to-expand-volume-Director-37989" target="_blank" rel="noopener">JIEC (2024)</a></p>
    </div></footer>`;
  }

  function tourPanel() {
    if (state.tour < 0) return '';
    const i = state.tour, n = TOUR.length, last = i === n - 1;
    return `<div class="tour glass" role="dialog" aria-label="${t('tour.title')}">
      <div class="tour-top"><span class="kicker">${icon('play')}${t('tour.title')} · ${t('tour.step', { a: num(i + 1), b: num(n) })}</span><button class="tour-x" data-tour="exit" aria-label="${t('tour.exit')}">${icon('x')}</button></div>
      <p class="tour-text">${t('tour.s' + (i + 1))}</p>
      <div class="tour-bar"><i style="width:${(((i + 1) / n) * 100).toFixed(1)}%"></i></div>
      <div class="tour-btns">${i > 0 ? `<button class="btn btn-glass btn-sm" data-tour="back">${t('tour.back')}</button>` : ''}<button class="btn btn-primary btn-sm" data-tour="${last ? 'exit' : 'next'}">${last ? t('tour.end') : t('tour.next')}</button></div>
    </div>`;
  }

  // ---------- views ----------
  function viewHome() {
    const [ta, tb] = splitTitle(t('home.title'));
    const chips = D.chips.map(([k]) => `<button class="chip chip-btn" data-chip="${k}">${t('q.' + k)}</button>`).join('');
    const mcards = D.products.map(p => { const f = F[p.f]; return `<a class="mcard" href="#${p.id}" data-go="${p.id}" style="--h:${S[p.sector].hue}">${icon(p.sector)}<img src="${photoSrc(p.id)}" alt="" loading="lazy" decoding="async"><span class="mcard-label"><b>${pName(p)}</b><span>${esc(fName(f))} · ${city(f.estate)}</span></span></a>`; }).join('');
    const who = [['cart', 'buyers', ''], ['trend', 'investors', 'gold'], ['factory', 'factories', 'teal']];
    return `<section class="hero">
        <svg class="hero-star" viewBox="0 0 24 24" aria-hidden="true"><polygon points="${STAR}" fill="none" stroke="var(--line-2)" stroke-width=".05"/><polygon points="${starPoints(12, 12, 7.5, 3.3)}" fill="none" stroke="var(--line)" stroke-width=".05"/></svg>
        <div class="wrap hero-inner">
          <span class="pill-glass" style="animation:rise 1s var(--ease) both"><i class="dot"></i>${t('home.eyebrow')}</span>
          <h1 class="hero-title"><span class="hl a">${ta}</span>${tb ? ` <span class="hl b grad">${tb}</span>` : ''}</h1>
          <p class="lead hero-sub">${t('home.sub')}</p>
          <form class="search glass" id="hero-search" role="search">${icon('search')}<input id="hero-q" type="search" placeholder="${t('search.placeholder')}" autocomplete="off" aria-label="${t('search.button')}"><button class="btn btn-primary" type="submit">${t('search.button')}</button></form>
          <div class="popular"><span>${t('home.popular')}</span>${chips}</div>
        </div>
        <div class="marquee" dir="ltr"><div class="marquee-track">${mcards}${mcards.replace(/href="#/g, 'tabindex="-1" aria-hidden="true" href="#')}</div></div>
      </section>

      <section class="section"><div class="wrap">
        ${sectionHead(t('home.stats.title'), t('home.map.caption'), '', true)}
        ${nationalBento()}
      </div></section>

      <section class="section" style="padding-top:0">
        <div class="wrap">${sectionHead(t('home.sectors.title'), t('home.sectors.sub'), `<div class="shelf-nav"><button class="btn-glass" data-shelf="prev" aria-label="${t('tour.back')}">${icon('back', 'flip-rtl')}</button><button class="btn-glass" data-shelf="next" aria-label="${t('tour.next')}">${icon('fwd', 'flip-rtl')}</button></div>`)}</div>
        <div class="shelf" id="shelf">${D.sectors.map((s, i) => `<button class="scard tilt" data-sector="${s.id}" style="--h:${s.hue}" ${rv(i)}>${icon(s.id)}<img src="${photoSrc(SECTOR_PHOTO[s.id])}" alt="" loading="lazy" decoding="async"><span class="scard-top"><b>${secName(s.id)}</b><span>${t('home.listings', { n: num(s.listings) })}</span></span><span class="scard-go">${icon('fwd', 'flip-rtl')}</span></button>`).join('')}</div>
      </section>

      <section class="section" style="padding-top:0"><div class="wrap">
        ${sectionHead(t('home.featured.title'), '', `<button class="link-more" data-go="search">${t('home.featured.all')} ${icon('fwd', 'flip-rtl')}</button>`)}
        <div class="products">${FEATURED.map((id, i) => productCard(P[id], i)).join('')}</div>
      </div></section>

      <section class="section" style="padding-top:0"><div class="wrap">
        ${sectionHead(t('home.who.title'), '', '', true)}
        <div class="grid g3">${who.map(([ic, k, tone], i) => `<div class="who glass tilt" ${rv(i)}><span class="ico-ball ${tone}">${icon(ic)}</span><h3>${t('who.' + k + '.title')}</h3><p>${t('who.' + k + '.text')}</p></div>`).join('')}</div>
      </div></section>

      <section class="band section"><img class="band-photo" src="img/hero.jpg" alt="" loading="lazy" decoding="async"><div class="wrap">
        ${sectionHead(t('home.partner.title'), t('mdl.sub'), '', true)}
        <div class="partner">
          <div class="card band-glass tilt" ${rv(0)}><span class="ico-ball ink">${icon('lock')}</span><h3>${t('home.partner.us.title')}</h3><p class="muted">${t('home.partner.us.text')}</p></div>
          <div class="card band-glass tilt" ${rv(1)}><span class="ico-ball gold">${icon('estate')}</span><h3>${t('home.partner.jiec.title')}</h3><p class="muted">${t('home.partner.jiec.text')}</p></div>
          <div class="card band-glass hl-card tilt" ${rv(2)}><span class="ico-ball">${icon('eye')}</span><h3>${t('home.partner.gets.title')}</h3><p class="muted">${t('home.partner.gets.text')}</p></div>
        </div>
        <div class="cta-row center" data-reveal><button class="btn btn-primary" data-tour="start">${icon('play')}${t('home.cta.tour')}</button><button class="btn btn-glass" data-go="join">${t('home.cta.join')}</button></div>
      </div></section>`;
  }

  const allCerts = () => [...new Set(D.products.flatMap(p => p.certs))].sort();
  function filtersHTML() {
    const opt = (v, label, cur) => `<option value="${v}" ${cur === v ? 'selected' : ''}>${label}</option>`;
    return `<h3>${t('filter.title')}</h3>
      <div class="field"><label for="f-sector">${t('filter.sector')}</label><select id="f-sector">${opt('', t('filter.all'), state.f.sector)}${D.sectors.map(s => opt(s.id, secName(s.id), state.f.sector)).join('')}</select></div>
      <div class="field"><label for="f-estate">${t('filter.estate')}</label><select id="f-estate">${opt('', t('filter.all'), state.f.estate)}${D.estates.map(e => opt(e.id, city(e.id), state.f.estate)).join('')}</select></div>
      <div class="field"><label for="f-cert">${t('filter.cert')}</label><select id="f-cert">${opt('', t('filter.all'), state.f.cert)}${allCerts().map(c => opt(c, c, state.f.cert)).join('')}</select></div>
      <label class="check"><input type="checkbox" id="f-priced" ${state.f.priced ? 'checked' : ''}>${t('filter.priceOnly')}</label>
      <button class="btn btn-glass btn-sm" data-clear>${t('filter.clear')}</button>`;
  }

  function viewSearch() {
    return `<div class="wrap">
      ${pageHead('', t('search.title'), t('search.demoNote'), false)}
      <div class="search-layout">
        <aside class="filters glass" data-open="${state.filtersOpen}">${filtersHTML()}</aside>
        <section style="min-width:0">
          <div class="results-bar">
            <form class="search glass" id="search-form" role="search">${icon('search')}<input id="q" type="search" value="${esc(state.q)}" placeholder="${t('search.placeholder')}" autocomplete="off" aria-label="${t('search.button')}"></form>
            <div class="results-tools">
              <button class="btn btn-glass btn-sm filter-toggle" data-filters aria-expanded="${state.filtersOpen}">${t('filter.show')}</button>
              <select class="select" id="sort" aria-label="${t('sort.label')}">${['relevance', 'priceLow', 'lead', 'rating'].map(s => `<option value="${s}" ${state.sort === s ? 'selected' : ''}>${t('sort.' + s)}</option>`).join('')}</select>
            </div>
          </div>
          <p class="results-count" id="count" aria-live="polite"></p>
          <div id="results"></div>
        </section>
      </div>
    </div>`;
  }

  const norm = s => String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ًͯ-ٰٟ]/g, '').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
  function haystack(p) {
    if (!p._hay) {
      const f = F[p.f];
      const parts = [p.tags, p.hs, f.name.en, f.name.ar];
      LANGS.forEach(l => { const d = I[l]; parts.push(d[p.id + '.n'], d['sec.' + p.sector], d['city.' + f.estate]); });
      p._hay = norm(parts.join(' '));
    }
    return p._hay;
  }
  function searchResults() {
    const q = norm(state.q.trim()), qm = norm(state.qMatch);
    const toks = q.split(/\s+/).filter(Boolean);
    const list = D.products.filter(p => {
      const f = F[p.f];
      if (state.f.sector && p.sector !== state.f.sector) return false;
      if (state.f.estate && f.estate !== state.f.estate) return false;
      if (state.f.cert && !p.certs.includes(state.f.cert)) return false;
      if (state.f.priced && !p.price) return false;
      if (!toks.length) return true;
      const h = haystack(p);
      return toks.every(tk => h.includes(tk)) || (qm && h.includes(qm));
    });
    const score = p => (q ? (norm(pName(p)).includes(q) ? 2 : 0) + (p.tags.includes(q) ? 1 : 0) : 0);
    const sorts = {
      relevance: (a, b) => score(b) - score(a),
      priceLow: (a, b) => (a.price ? a.price[0] : Infinity) - (b.price ? b.price[0] : Infinity),
      lead: (a, b) => a.lead - b.lead,
      rating: (a, b) => b.rating[0] - a.rating[0]
    };
    return list.slice().sort(sorts[state.sort] || sorts.relevance);
  }
  function fillResults() {
    const box = $('#results'), count = $('#count');
    if (!box) return;
    const list = searchResults();
    count.textContent = tn('search.results', list.length);
    if (list.length) {
      box.innerHTML = `<div class="products">${list.map((p, i) => productCard(p, i)).join('')}</div>`;
      setupMotion(box);
      return;
    }
    const q = state.q.trim();
    box.innerHTML = q
      ? `<div class="empty glass"><span class="ico-ball gold">${icon('signal')}</span><h3>${t('search.empty.title', { q: esc(q) })}</h3><p class="muted">${t('search.empty.text')}</p><span class="pill pill-green">${icon('check')}${t('search.empty.logged')}</span><div class="cta-row" style="margin-top:4px"><button class="btn btn-primary btn-sm" data-go="invest">${t('search.empty.invest')}</button><button class="btn btn-glass btn-sm" data-clear>${t('search.empty.reset')}</button></div></div>`
      : `<div class="empty glass"><span class="ico-ball">${icon('search')}</span><button class="btn btn-glass btn-sm" data-clear>${t('search.empty.reset')}</button></div>`;
  }

  const COUNTRY_CODES = ['SA', 'AE', 'IQ', 'KW', 'QA', 'OM', 'BH', 'EG', 'PS', 'LB', 'US', 'CA', 'GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'TR', 'RU', 'CN', 'JP', 'IN'];
  function quoteForm(p) {
    const f = F[p.f];
    if (state.sent[p.id]) return `<h2 style="font-size:28px">${t('p.quote.title')}</h2><div class="success">${icon('check')}<div><b>${t('p.quote.sent', { f: esc(fName(f)) })}</b><p class="small muted">${t('p.quote.demo')}</p></div></div>`;
    let coll;
    try { coll = new Intl.Collator(loc()); } catch (e) { coll = new Intl.Collator('en'); }
    const countries = COUNTRY_CODES.map(c => [c, country(c)]).sort((a, b) => coll.compare(a[1], b[1]));
    return `<h2 style="font-size:28px">${t('p.quote.title')}</h2>
      <form id="quote-form" class="form-grid">
        <div class="field"><label for="qf-name">${t('p.quote.name')}</label><input class="input" id="qf-name" required value="Sara Haddad"></div>
        <div class="field"><label for="qf-company">${t('p.quote.company')}</label><input class="input" id="qf-company" value="Gulf Build Supply"></div>
        <div class="field"><label for="qf-country">${t('p.quote.country')}</label><select id="qf-country">${countries.map(([c, n]) => `<option value="${c}" ${c === 'SA' ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <div class="field"><label for="qf-qty">${t('p.quote.qty')}</label><input class="input" id="qf-qty" value="${qty(p.moq)}"></div>
        <div class="field full"><label for="qf-msg">${t('p.quote.msg')}</label><textarea id="qf-msg" placeholder="${t('p.quote.msgPh')}"></textarea></div>
        <div class="full" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><button class="btn btn-primary" type="submit">${t('p.quote.send')}</button><span class="small muted">${t('p.quote.demo')}</span></div>
      </form>`;
  }

  function viewProduct(p) {
    const f = F[p.f];
    const facts = [
      [t('p.moq'), qty(p.moq)],
      [t('p.lead'), t('p.days', { n: num(p.lead) })],
      [t('p.capacity'), qtyCompact(p.cap)],
      [t('p.hs'), `<bdi dir="ltr" class="mono">${p.hs}</bdi>`]
    ];
    let sim = D.products.filter(x => x.sector === p.sector && x.id !== p.id);
    FEATURED.map(id => P[id]).forEach(x => { if (x.id !== p.id && !sim.includes(x)) sim.push(x); });
    sim = sim.slice(0, 4);
    return `<div class="wrap">
      <div class="page-head" style="padding-bottom:0;padding-top:28px"><button class="back" data-go="search">${icon('back', 'flip-rtl')}${t('p.back')}</button></div>
      <div class="p-top">
        <div class="p-photo glass">${photo(p, { eager: true })}</div>
        <div class="p-head">
          <div class="chips"><span class="chip">${secName(p.sector)}</span><span class="chip">${icon('pin')}${city(f.estate)}</span></div>
          <h1>${pName(p)}</h1>
          <div class="p-factory"><span class="muted">${t('p.madeBy')}</span><a href="#${f.id}" data-go="${f.id}">${esc(fName(f))}</a><span class="badge">${icon('shield')}${t('p.verified')}</span></div>
          <div class="rating">${ratingStars(p.rating[0])}<span>${t('p.rating', { r: nf(p.rating[0], { minimumFractionDigits: 1 }), n: num(p.rating[1]) })}</span></div>
          <p style="color:var(--ink-2);font-size:18px;max-width:52ch">${pDesc(p)}</p>
          <div class="price-box glass">${priceBig(p)}${p.price ? `<span class="small muted">${t('p.priceNote')}</span>` : ''}</div>
          <div class="facts">${facts.map(([k, v]) => `<div class="fact glass"><span class="fact-k">${k}</span><span class="fact-v">${v}</span></div>`).join('')}</div>
          <div class="p-actions"><button class="btn btn-primary" data-scroll="quote">${t('p.quote.title')}</button><button class="btn btn-glass" data-go="${f.id}">${t('p.viewFactory')}</button></div>
        </div>
      </div>
      <div class="p-detail">
        <section class="glass panel" data-reveal><h2>${t('p.specs')}</h2>
          <table class="specs"><tbody>${p.specs.map(([k, v]) => `<tr><th scope="row">${t('spec.' + k)}</th><td>${specVal(v)}</td></tr>`).join('')}</tbody></table>
        </section>
        <section class="glass panel" ${rv(1)}><h2>${t('p.quality')}</h2>
          <div class="verified">${icon('shield')}<div><b>${t('p.verified')}</b><p class="small muted">${t('p.verifiedText')}</p></div></div>
          <div class="field"><span class="label">${t('p.certs')}</span><div class="certs">${p.certs.map(c => `<span class="cert">${icon('check')}<bdi dir="ltr">${c}</bdi></span>`).join('')}</div></div>
          <div class="field"><span class="label">${t('p.trade')}</span><div class="chips">${p.trade.map(x => `<span class="chip"><bdi dir="ltr">${x}</bdi></span>`).join('')}</div></div>
          <div class="field"><span class="label">${t('p.exportsTo')}</span><div class="chips">${p.markets.map(c => `<span class="chip">${country(c)}</span>`).join('')}</div></div>
        </section>
      </div>
      <section class="glass quote" id="quote" data-reveal>${quoteForm(p)}</section>
      <section class="section">${sectionHead(t('p.similar'))}<div class="products">${sim.map((x, i) => productCard(x, i)).join('')}</div></section>
    </div>`;
  }

  function viewFactory(f) {
    const prods = D.products.filter(p => p.f === f.id);
    const stats = [
      [t('f.founded'), `<span>${nf(f.founded, { useGrouping: false })}</span>`],
      [t('f.employees'), counter(f.employees, 'num')],
      [t('f.area'), t('f.m2', { n: counter(f.area, 'num') })],
      [t('f.lines'), counter(f.lines, 'num')]
    ];
    return `<div class="wrap">
      <div class="page-head" style="padding-bottom:0;padding-top:28px"><button class="back" data-go="factories">${icon('back', 'flip-rtl')}${t('f.back')}</button></div>
      <div class="f-cover" style="--h:${S[f.sector].hue}"><img src="${photoSrc(prods[0].id)}" alt="" decoding="async"></div>
      <section class="f-head glass">
        <span class="f-avatar" style="--h:${S[f.sector].hue}">${icon(f.sector)}</span>
        <div class="f-title">
          <h1>${esc(fName(f))}</h1>
          <span class="f-loc">${icon('pin')}${estName(f.estate)}</span>
          <div class="f-tags"><span class="badge">${icon('shield')}${t('p.verified')}</span><span class="chip">${secName(f.sector)}</span>${f.open ? `<span class="pill pill-sand">${icon('trend')}${t('f.open.' + f.open)}</span>` : ''}</div>
        </div>
        <button class="btn btn-primary" data-scroll="contact">${t('f.contact')}</button>
      </section>
      <p class="lead" style="margin-block:30px 24px;max-width:60ch;color:var(--ink-2)">${t(f.id + '.d')}</p>
      <div class="f-stats">
        ${stats.map(([k, v], i) => `<div class="glass kpi tilt" ${rv(i)}><span class="kpi-label">${k}</span><span class="kpi-val">${v}</span></div>`).join('')}
        <div class="glass kpi ring-kpi tilt" ${rv(4)}>${ring(f.use / 100)}<div class="grid" style="gap:4px"><span class="kpi-label">${t('f.use')}</span><span class="kpi-val">${counter(f.use, 'pct')}</span><span class="small muted">${t('f.free', { n: num(100 - f.use) })}</span></div></div>
      </div>
      <div class="f-body section">
        <section style="min-width:0">${sectionHead(t('f.products'))}<div class="products">${prods.map((p, i) => productCard(p, i)).join('')}</div></section>
        <aside class="grid">
          <div class="glass panel" data-reveal id="contact"><h3>${t('f.contact')}</h3><p class="small muted">${t('f.contactNote')}</p><button class="btn btn-primary btn-sm" data-go="${prods[0].id}" style="justify-self:start">${t('p.quote.title')}</button></div>
          <div class="glass panel" data-reveal><h3>${t('f.certs')}</h3><div class="certs">${f.certs.map(c => `<span class="cert">${icon('check')}<bdi dir="ltr">${c}</bdi></span>`).join('')}</div></div>
          <div class="glass panel" data-reveal><h3>${t('f.markets')}</h3><div class="chips">${f.markets.map(c => `<span class="chip">${country(c)}</span>`).join('')}</div></div>
          <div class="glass panel" data-reveal><h3>${t('f.location')}</h3><p class="small muted">${estName(f.estate)}</p>${mapSVG({ sel: f.estate })}</div>
        </aside>
      </div>
    </div>`;
  }

  function viewFactories() {
    const list = D.factories.filter(f => !state.factorySector || f.sector === state.factorySector);
    const used = D.sectors.filter(s => D.factories.some(f => f.sector === s.id));
    return `<div class="wrap">
      ${pageHead('', t('f.title'), t('f.sub'))}
      <div class="chips" style="margin-block:18px 22px;justify-content:center"><button class="chip chip-btn" data-fsector="" aria-pressed="${!state.factorySector}">${t('filter.all')}</button>${used.map(s => `<button class="chip chip-btn" data-fsector="${s.id}" aria-pressed="${state.factorySector === s.id}">${secName(s.id)}</button>`).join('')}</div>
      <p class="results-count" style="text-align:center">${tn('f.count', list.length)}</p>
      <div class="grid g3" style="margin-top:12px;padding-bottom:40px">${list.map((f, i) => factoryCard(f, i)).join('')}</div>
    </div>`;
  }

  function oppCard(o, i) {
    const f = o.f ? F[o.f] : null;
    const typeCls = { new: 'pill-green', expansion: 'pill-sand', jv: 'pill-ink' }[o.type];
    return `<article class="opp glass tilt" ${rv(i)}>
      ${photo(P[OPP_PHOTO[o.id]], { chips: false })}
      <div class="opp-in">
        <div class="opp-top"><span class="pill ${typeCls}">${t('inv.type.' + o.type)}</span><span class="small muted">${secName(o.sector)} · ${city(o.estate)}</span></div>
        <h3>${t(o.id + '.t')}</h3>
        <p class="small" style="color:var(--ink-2)">${t(o.id + '.d', { f: f ? esc(fName(f)) : '' })}</p>
        <div class="opp-nums"><div><span class="small muted">${t('inv.ticket')}</span><b>${counter(o.ticket, 'moneyc')}</b></div><div><span class="small muted">${t('inv.jobs')}</span><b>${counter(o.jobs, 'num')}</b></div></div>
        <div class="opp-signal">${icon('signal')}<span><b>${t('inv.signal')}:</b> ${t(o.id + '.s')}</span></div>
        <div data-opp-slot="${o.id}">${state.requested[o.id] ? `<div class="success">${icon('check')}<span>${t('inv.requested')}</span></div>` : `<button class="btn btn-glass btn-sm" data-request="${o.id}">${icon('doc')}${t('inv.request')}</button>`}</div>
      </div>
    </article>`;
  }

  function estateList() {
    return D.estates.map(e => `<button class="estate-btn" data-estate="${e.id}" aria-pressed="${state.estate === e.id}"><i></i><span>${estName(e.id)}</span><small>${num(e.listed)}</small></button>`).join('');
  }

  function viewInvest() {
    const n = D.national;
    const agreements = ['US FTA', 'EU', 'UK', 'Canada', 'EFTA', 'GAFTA', 'Agadir'];
    const why = [['globe', 'access', ''], ['estate', 'estates', 'gold'], ['users', 'skills', 'teal'], ['pin', 'location', 'ink']];
    return `<div class="wrap">
      ${pageHead(t('inv.eyebrow'), t('inv.title'), t('inv.sub'))}
      <section class="section-tight">
        ${sectionHead(t('inv.why.title'))}
        <div class="why">${why.map(([ic, k, tone], i) => `<div class="card glass tilt" ${rv(i)}><span class="ico-ball ${tone}">${icon(ic)}</span><h3>${t('inv.why.' + k)}</h3><p class="small muted">${t('inv.why.' + k + 'Text')}</p>${k === 'access' ? `<div class="agreements">${agreements.map(a => `<span class="chip"><bdi dir="ltr">${a}</bdi></span>`).join('')}</div>` : ''}</div>`).join('')}</div>
      </section>
      <section class="section-tight">
        ${sectionHead(t('inv.opps.title'), t('inv.opps.sub'))}
        <div class="opps">${D.opportunities.map(oppCard).join('')}</div>
      </section>
      <section class="section-tight" style="padding-bottom:80px">
        ${sectionHead(t('inv.map.title'), t('inv.map.sub'))}
        <div class="mapbox glass" data-reveal>
          <div id="estate-map">${mapSVG({ sel: state.estate, interactive: true })}</div>
          <div class="grid" style="gap:12px"><div class="estate-list">${estateList()}</div><p class="source">${t('inv.estateCos', { a: num(n.estateCompanies), b: money(n.estateInvestment, true), c: compact(n.estateJobs) })}</p></div>
        </div>
      </section>
    </div>`;
  }

  // Charts
  function barList(rows, max) {
    return `<div class="bars">${rows.map(([label, v, muted], i) => `<div class="bar-row"><span class="bar-label" title="${esc(label)}">${label}</span><span class="bar-track"><i class="bar${muted ? ' muted-bar' : ''}" style="--i:${i};width:calc((100% - 64px) * ${(v / max).toFixed(4)})"></i><span class="bar-val">${num(v)}</span></span></div>`).join('')}</div>`;
  }
  const TG = { W: 960, H: 250, pl: 46, pr: 64, pt: 18, pb: 30, max: 4000 };
  const tx = (i, n) => TG.pl + (i * (TG.W - TG.pl - TG.pr)) / (n - 1);
  const ty = v => TG.pt + (TG.H - TG.pt - TG.pb) * (1 - v / TG.max);
  const monthDate = i => new Date(2025, 10 + i, 1);
  function trendSVG() {
    const v = D.insights.trend, n = v.length;
    let mf;
    try { mf = new Intl.DateTimeFormat(loc(), { month: 'short' }); } catch (e) { mf = new Intl.DateTimeFormat('en', { month: 'short' }); }
    const grid = [0, 1000, 2000, 3000, 4000].map(g => `<line class="grid-line" x1="${TG.pl}" x2="${TG.W - TG.pr}" y1="${ty(g)}" y2="${ty(g)}"/><text class="axis-text" x="${TG.pl - 8}" y="${ty(g) + 4}" text-anchor="end">${compact(g)}</text>`).join('');
    const pts = v.map((val, i) => `${tx(i, n).toFixed(1)},${ty(val).toFixed(1)}`);
    const months = v.map((_, i) => (i % 2 === 1 ? `<text class="axis-text" x="${tx(i, n)}" y="${TG.H - 8}" text-anchor="middle">${esc(mf.format(monthDate(i)))}</text>` : '')).join('');
    const lx = tx(n - 1, n), ly = ty(v[n - 1]);
    return `<svg id="trend-svg" viewBox="0 0 ${TG.W} ${TG.H}" role="img" aria-label="${esc(t('ins.trend'))}" style="direction:ltr">
      ${grid}
      <path class="area" d="M${pts.join(' L')} L${lx},${ty(0)} L${TG.pl},${ty(0)} Z"/>
      <path class="line" pathLength="1" d="M${pts.join(' L')}"/>
      <line class="cross" id="trend-cross" x1="0" x2="0" y1="${TG.pt}" y2="${ty(0)}" visibility="hidden"/>
      <circle class="end" cx="${lx}" cy="${ly}" r="6"/>
      <text class="end-text" x="${lx + 12}" y="${ly + 5}">${num(v[n - 1])}</text>
      ${months}
      <rect id="trend-hit" x="${TG.pl}" y="0" width="${TG.W - TG.pl - TG.pr}" height="${TG.H}" fill="transparent"/>
    </svg>`;
  }

  function viewInsights() {
    const ins = D.insights;
    const inEstates = D.estates.reduce((s, e) => s + e.listed, 0);
    const kpis = [
      [counter(ins.factories, 'num'), 'ins.kpi.factories'],
      [counter(ins.products, 'num'), 'ins.kpi.products'],
      [counter(ins.quotes, 'num'), 'ins.kpi.quotes'],
      [counter(ins.countries, 'num'), 'ins.kpi.countries'],
      [t('ins.coverageVal', { a: counter(inEstates, 'num'), b: num(D.national.estateCompanies) }), 'ins.coverage']
    ];
    const sectors = D.sectors.slice().sort((a, b) => b.listings - a.listings).map(s => [secName(s.id), s.listings]);
    const countries = ins.byCountry.map(([c, v]) => [country(c), v, c === 'other']);
    const estates = D.estates.slice().sort((a, b) => b.listed - a.listed);
    const total = ins.factories;
    const estRow = (label, sub, v) => `<tr><td><b style="font-weight:600">${label}</b>${sub ? `<br><span class="small muted">${sub}</span>` : ''}</td><td class="n">${num(v)}</td><td class="n"><span class="share"><i style="width:${Math.max(3, (v / 614) * 60).toFixed(0)}px"></i>${nf(v / total, { style: 'percent', maximumFractionDigits: 1 })}</span></td></tr>`;
    const status = sup => (sup === 0 ? `<span class="pill pill-gap">${icon('alert')}${t('ins.status.gap')}</span>` : sup <= 2 ? `<span class="pill pill-thin">${icon('minus')}${t('ins.status.thin')}</span>` : `<span class="pill pill-ok">${icon('check')}${t('ins.status.ok')}</span>`);
    const growth = ins.trend[ins.trend.length - 1] / ins.trend[0];
    return `<div class="wrap">
      ${pageHead(t('ins.eyebrow'), t('ins.title'), t('ins.sub'))}
      <div class="kpis" style="margin-top:28px">${kpis.map(([v, k], i) => `<div class="kpi glass tilt" ${rv(i)}><span class="kpi-label">${t(k)}</span><span class="kpi-val${k === 'ins.coverage' ? ' kpi-sm' : ''}">${v}</span></div>`).join('')}</div>
      <div class="ins-grid" style="margin-top:20px">
        <section class="panel glass" data-reveal><div class="panel-head"><h3>${t('ins.bySector')}</h3><span class="chip">${t('ui.sample')}</span></div>${barList(sectors, sectors[0][1])}</section>
        <section class="panel glass" ${rv(1)}><div class="panel-head"><h3>${t('ins.byCountry')}</h3><span class="chip">${t('ui.sample')}</span></div>${barList(countries, 720)}</section>
      </div>
      <section class="panel glass trend" style="margin-top:20px" data-reveal><div class="panel-head"><h3>${t('ins.trend')}</h3><span class="pill pill-green">${icon('trend')}${t('ins.trendDelta', { n: nf(growth, { maximumFractionDigits: 1 }) })}</span></div>${trendSVG()}</section>
      <div class="ins-grid" style="margin-top:20px">
        <section class="panel glass" data-reveal><h3>${t('ins.byEstate')}</h3><div class="table-wrap"><table class="table"><thead><tr><th>${t('ins.estate')}</th><th class="n">${t('ins.factories')}</th><th class="n">${t('ins.share')}</th></tr></thead><tbody>
          ${estates.map(e => estRow(city(e.id), estName(e.id), e.listed)).join('')}${estRow(t('ins.outside'), '', D.outsideEstates)}
        </tbody></table></div></section>
        <section class="panel glass" ${rv(1)}><div class="grid" style="gap:4px"><h3>${t('ins.demand.title')}</h3><p class="small muted">${t('ins.demand.sub')}</p></div><div class="table-wrap"><table class="table"><thead><tr><th>${t('ins.demand.term')}</th><th class="n">${t('ins.demand.searches')}</th><th class="n">${t('ins.demand.suppliers')}</th><th>${t('ins.demand.status')}</th></tr></thead><tbody>
          ${ins.demand.map(([k, s, sup]) => `<tr><td>${t('q.' + k)}</td><td class="n">${num(s)}</td><td class="n">${num(sup)}</td><td>${status(sup)}</td></tr>`).join('')}
        </tbody></table></div><button class="link-more" data-go="invest" style="justify-self:start">${t('search.empty.invest')} ${icon('fwd', 'flip-rtl')}</button></section>
      </div>
      <section class="section">${sectionHead(t('ins.national'), '', '', true)}${nationalBento()}</section>
    </div>`;
  }

  const PLAN_FEATS = {
    starter: ['profile', 'products10', 'lang2', 'quotes'],
    growth: ['profile', 'products100', 'lang10', 'quotes', 'analytics', 'verified'],
    export: ['profile', 'productsAll', 'lang10', 'quotes', 'analytics', 'verified', 'featured', 'investor', 'manager']
  };
  function joinForm() {
    if (state.joined) return `<div class="success">${icon('check')}<div><b>${t('join.form.done')}</b><p class="small muted">${t('p.quote.demo')}</p></div></div>`;
    const opt = (v, l, sel) => `<option value="${v}" ${v === sel ? 'selected' : ''}>${l}</option>`;
    return `<form id="join-form" class="form-grid">
      <div class="field"><label for="j-company">${t('join.form.company')}</label><input class="input" id="j-company" required value="Petra Valley Foods"></div>
      <div class="field"><label for="j-reg">${t('join.form.reg')}</label><input class="input" id="j-reg" value="200145873" inputmode="numeric"></div>
      <div class="field"><label for="j-sector">${t('join.form.sector')}</label><select id="j-sector">${D.sectors.map(s => opt(s.id, secName(s.id), 'food')).join('')}</select></div>
      <div class="field"><label for="j-estate">${t('join.form.estate')}</label><select id="j-estate">${D.estates.map(e => opt(e.id, estName(e.id), 'sahab')).join('')}${opt('outside', t('ins.outside'), '')}</select></div>
      <div class="field"><label for="j-contact">${t('join.form.contact')}</label><input class="input" id="j-contact" value="Omar Khalil"></div>
      <div class="field"><label for="j-phone">${t('join.form.phone')}</label><input class="input" id="j-phone" value="+962 7X XXX XXXX" dir="ltr"></div>
      <div class="field full"><label for="j-plan">${t('join.form.plan')}</label><select id="j-plan">${D.plans.map(p => opt(p.id, `${t('plan.' + p.id)} · ${money(p.price)} ${t('plan.perYear')}`, state.joinPlan)).join('')}</select></div>
      <div class="full" style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><button class="btn btn-primary" type="submit">${t('join.form.submit')}</button><span class="small muted">${t('p.quote.demo')}</span></div>
    </form>`;
  }
  function viewJoin() {
    return `<div class="wrap">
      ${pageHead(t('join.eyebrow'), t('join.title'), t('join.sub'))}
      <section class="section-tight">
        <div class="plans">${D.plans.map((p, i) => `<article class="plan glass tilt${p.id === 'growth' ? ' pop' : ''}" ${rv(i)}>
          ${p.id === 'growth' ? `<span class="plan-pop">${t('plan.popular')}</span>` : ''}
          <h3>${t('plan.' + p.id)}</h3>
          <div class="plan-price">${money(p.price)} <small>${t('plan.perYear')}</small></div>
          <p class="small muted">${t('plan.' + p.id + '.d')}</p>
          <ul class="feats">${PLAN_FEATS[p.id].map(k => `<li>${icon('check')}<span>${t('feat.' + k)}</span></li>`).join('')}</ul>
          <button class="btn ${p.id === 'growth' ? 'btn-primary' : 'btn-glass'}" data-plan="${p.id}">${t('plan.choose', { plan: t('plan.' + p.id) })}</button>
        </article>`).join('')}</div>
        <div class="offer glass" data-reveal>${icon('tag')}<span>${t('join.jiecOffer')}</span></div>
        <p class="source">${t('join.priceNote')}</p>
      </section>
      <section class="section-tight">
        ${sectionHead(t('join.steps.title'))}
        <div class="steps">${[1, 2, 3, 4].map(i => `<div class="step glass tilt" ${rv(i)}><span class="step-n">${num(i)}</span><h3>${t('step' + i + '.t')}</h3><p class="small muted">${t('step' + i + '.d')}</p></div>`).join('')}</div>
      </section>
      <section class="glass quote" data-reveal style="margin-bottom:60px"><h2 style="font-size:28px">${t('join.form.title')}</h2><div id="join-form-wrap">${joinForm()}</div></section>
    </div>`;
  }

  function ago(mins) { return mins < 60 ? t('adm.ago.min', { n: num(mins) }) : t('adm.ago.h', { n: num(Math.round(mins / 60)) }); }
  function queueHTML() {
    if (!state.queue.length) return `<div class="success">${icon('check')}<span>${t('adm.queue.empty')}</span></div>`;
    return state.queue.map(id => {
      const q = D.queue.find(x => x.id === id);
      const what = q.what.startsWith('est.') ? estName(q.what.slice(4)) : t(q.what);
      return `<div class="qitem" data-id="${q.id}"><div style="min-width:0"><span class="pill pill-ink" style="margin-bottom:6px">${t('adm.type.' + q.type)}</span><div class="qitem-who">${esc(q.who)}</div><div class="qitem-what">${what} · ${ago(q.mins)}</div></div>
        <div class="qitem-actions"><button class="btn btn-sm btn-ok" data-approve>${icon('check')}${t('adm.approve')}</button><button class="btn btn-sm btn-no" data-reject>${t('adm.reject')}</button></div></div>`;
    }).join('');
  }
  function viewAdmin() {
    const subs = D.plans.reduce((s, p) => s + p.subs, 0);
    const arr = D.plans.reduce((s, p) => s + p.subs * p.price, 0);
    const seq = { starter: 'var(--seq-1)', growth: 'var(--seq-2)', export: 'var(--seq-3)' };
    const kpis = [[counter(subs, 'num'), 'adm.kpi.subs', ''], [counter(arr, 'money'), 'adm.kpi.arr', ''], [num(state.queue.length), 'adm.kpi.pending', 'adm-pending'], [counter(86, 'num'), 'adm.kpi.renewals', '']];
    const roles = [['owner', 'lock', 'ink'], ['jiec', 'estate', 'gold'], ['factory', 'factory', 'teal'], ['public', 'globe', '']];
    return `<div class="wrap">
      ${pageHead(t('adm.eyebrow'), t('adm.title'), t('adm.sub'))}
      <div class="grid g4" style="margin-top:28px">${kpis.map(([v, k, id], i) => `<div class="kpi glass tilt" ${rv(i)}><span class="kpi-label">${t(k)}</span><span class="kpi-val" ${id ? `id="${id}"` : ''}>${v}</span></div>`).join('')}</div>
      <div class="adm-grid" style="margin-top:20px">
        <section class="panel glass queue-panel" data-reveal><div class="grid" style="gap:4px"><h3>${t('adm.queue.title')}</h3><p class="small muted">${t('adm.queue.sub')}</p></div><div class="queue" id="queue">${queueHTML()}</div></section>
        <aside class="grid">
          <section class="panel glass" ${rv(1)}><div class="panel-head"><h3>${t('adm.plans.title')}</h3><span class="chip">${t('ui.sample')}</span></div>
            <div class="stack" role="img" aria-label="${esc(t('adm.plans.title'))}">${D.plans.map(p => `<i style="width:${((p.subs / subs) * 100).toFixed(1)}%;background:${seq[p.id]}"></i>`).join('')}</div>
            <div class="legend">${D.plans.map(p => `<div class="legend-row"><i style="background:${seq[p.id]}"></i><span>${t('plan.' + p.id)} · <b>${num(p.subs)}</b></span><span class="small muted">${t('adm.plans.share', { n: num(Math.round((p.subs * p.price * 100) / arr)) })}</span></div>`).join('')}</div>
          </section>
          <section class="panel glass" ${rv(2)}><h3>${t('adm.roles.title')}</h3><div class="roles">${roles.map(([k, ic, tone]) => `<div class="role"><span class="ico-ball ${tone}">${icon(ic)}</span><div><b>${t('role.' + k)}</b><p class="small muted">${t('role.' + k + '.d')}</p></div></div>`).join('')}</div></section>
        </aside>
      </div>
      <section class="section-tight"><div class="panel glass" data-reveal><h3>${t('adm.activity.title')}</h3><div class="table-wrap"><table class="table"><thead><tr><th>${t('adm.col.item')}</th><th>${t('adm.col.factory')}</th><th>${t('adm.col.from')}</th><th class="n">${t('adm.col.when')}</th></tr></thead><tbody>
        ${D.recentQuotes.map(r => { const p = P[r.p]; return `<tr><td><a href="#${p.id}" data-go="${p.id}" style="font-weight:600">${pName(p)}</a></td><td>${esc(fName(F[p.f]))}</td><td>${country(r.from)}</td><td class="n">${ago(r.mins)}</td></tr>`; }).join('')}
      </tbody></table></div></div></section>
    </div>`;
  }

  function calcValues() {
    const c = state.calc, price = Object.fromEntries(D.plans.map(p => [p.id, p.price]));
    const subs = c.starter + c.growth + c.export;
    let rev = c.starter * price.starter + c.growth * price.growth + c.export * price.export;
    if (c.disc) rev *= 0.9;
    return { subs, rev, avg: subs ? rev / subs : 0 };
  }
  function calcOut() {
    const v = calcValues();
    return `<span class="small muted">${t('calc.total')}</span><span class="calc-total grad" id="calc-total">${money(v.rev)}</span>
      <div class="calc-sub"><div><span class="small muted">${t('calc.factories')}</span><b>${num(v.subs)}</b></div><div><span class="small muted">${t('calc.avg')}</span><b>${money(v.avg)}</b></div></div>`;
  }
  let calcShown = null, calcRaf = 0;
  function updateCalc() {
    const out = $('#calc-out');
    if (!out) return;
    const to = calcValues().rev, from = calcShown == null ? to : calcShown;
    out.innerHTML = calcOut();
    const el = $('#calc-total');
    cancelAnimationFrame(calcRaf);
    if (reduced || from === to) { calcShown = to; return; }
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 500), e = 1 - Math.pow(1 - k, 3);
      calcShown = from + (to - from) * e;
      el.textContent = money(Math.round(calcShown));
      if (k < 1) calcRaf = requestAnimationFrame(step);
    };
    calcRaf = requestAnimationFrame(step);
  }
  function viewModel() {
    const path = cls => `<path class="${cls}" d="M2 9h98" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M92 3l8 6-8 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    const arrow = (cls, label, reverse = false) => `<div class="arrow ${cls}"><svg viewBox="0 0 104 18" class="flip-rtl" aria-hidden="true"><g ${reverse ? 'transform="translate(104 0) scale(-1 1)"' : ''}>${path('flowing')}</g></svg><span>${label}</span></div>`;
    const max = { starter: 3000, growth: 1500, export: 500 };
    calcShown = null;
    return `<div class="wrap">
      ${pageHead(t('mdl.eyebrow'), t('mdl.title'), t('mdl.sub'))}
      <section class="section-tight">
        <div class="flow glass" data-reveal>
          <div class="node fac"><span class="ico-ball teal">${icon('factory')}</span><b>${t('flow.factories')}</b><span class="small muted">${t('flow.factories.d')}</span></div>
          ${arrow('a1', range(D.plans[0].price, D.plans[2].price) + ' ' + t('plan.perYear'))}
          <div class="node core plat"><span class="ico-ball">${starMark()}</span><b style="font-size:19px">${t('flow.platform')}</b><span class="small muted">${t('flow.platform.d')}</span></div>
          ${arrow('a2', t('flow.buyers.gets'), true)}
          <div class="node buy"><span class="ico-ball gold">${icon('cart')}</span><b>${t('flow.buyers')}</b><span class="small muted">${t('flow.buyers.d')}</span></div>
          <div class="arrow v a3"><svg viewBox="0 0 18 44" aria-hidden="true"><path class="flowing" d="M9 4v36" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M3 10l6-7 6 7M3 34l6 7 6-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><span style="text-align:start">${t('flow.jiec.gets')}</span></div>
          <div class="node jiec"><span class="ico-ball ink">${icon('estate')}</span><b>${t('flow.jiec')}</b><span class="small muted">${t('flow.jiec.d')}</span></div>
        </div>
      </section>
      <section class="section-tight">
        ${sectionHead(t('calc.title'), t('calc.sub'))}
        <div class="calc glass" data-reveal>
          <div class="grid" style="gap:20px">
            ${D.plans.map(p => `<div class="slider"><div class="slider-top"><label for="calc-${p.id}">${t('calc.subs', { plan: t('plan.' + p.id) })} · <span class="muted">${money(p.price)} ${t('plan.perYear')}</span></label><b id="calc-${p.id}-v">${num(state.calc[p.id])}</b></div><input type="range" id="calc-${p.id}" data-plan="${p.id}" min="0" max="${max[p.id]}" step="10" value="${state.calc[p.id]}"></div>`).join('')}
            <label class="check"><input type="checkbox" id="calc-disc" ${state.calc.disc ? 'checked' : ''}>${t('calc.discount')}</label>
          </div>
          <div class="calc-out" id="calc-out" aria-live="polite">${calcOut()}</div>
        </div>
      </section>
      <section class="section-tight" style="padding-bottom:80px">
        ${sectionHead(t('road.title'))}
        <div class="road">${[1, 2, 3].map(i => `<div class="step glass tilt" ${rv(i)}><span class="step-n">${num(i)}</span><h3>${t('road.' + i + '.t')}</h3><p class="small muted">${t('road.' + i + '.d')}</p></div>`).join('')}</div>
        <p class="source" style="margin-top:18px">${t('mdl.more')}</p>
      </section>
    </div>`;
  }

  function view() {
    const r = state.route;
    if (P[r]) return viewProduct(P[r]);
    if (F[r]) return viewFactory(F[r]);
    return ({ home: viewHome, search: viewSearch, factories: viewFactories, invest: viewInvest, insights: viewInsights, join: viewJoin, admin: viewAdmin, model: viewModel }[r] || viewHome)();
  }

  // ---------- motion ----------
  let io;
  function runCounters(root) {
    if (reduced) return;
    const els = root.matches && root.matches('[data-count]') ? [root] : [];
    els.push(...root.querySelectorAll('[data-count]'));
    els.forEach(el => {
      if (el._ran) return;
      el._ran = true;
      const to = +el.dataset.count, f = FMT[el.dataset.kind], t0 = performance.now(), dur = 1600;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur), e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
        el.textContent = f(to * e);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }
  function setupMotion(scope = document) {
    const els = $$('[data-reveal]', scope).filter(el => !el.classList.contains('in'));
    if (reduced || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    if (!io) {
      io = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.remove('pre');
        en.target.classList.add('in');
        runCounters(en.target);
        io.unobserve(en.target);
      }), { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    }
    const vh = window.innerHeight;
    els.forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.top < vh * 0.94) { el.classList.add('in'); runCounters(el); }
      else { el.classList.add('pre'); io.observe(el); }
    });
  }

  let tiltEl = null;
  function resetTilt(el) { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }
  if (fineHover && !reduced) {
    document.addEventListener('pointermove', e => {
      const el = e.target.closest && e.target.closest('.tilt');
      if (el !== tiltEl) { if (tiltEl) resetTilt(tiltEl); tiltEl = el; }
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      el.style.setProperty('--ry', ((x - 0.5) * 7).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - y) * 7).toFixed(2) + 'deg');
    }, { passive: true });
    document.addEventListener('pointerleave', () => { if (tiltEl) resetTilt(tiltEl); tiltEl = null; });
  }

  // ---------- render and routing ----------
  function render() {
    const html = document.documentElement;
    html.lang = state.lang;
    html.dir = t('meta.dir');
    $('#app').innerHTML = header() + `<main id="view">${view()}</main>` + footer() + tourPanel();
    document.body.classList.toggle('touring', state.tour >= 0);
    if (state.route === 'search') fillResults();
    if (state.route === 'insights') bindTrend();
    setupMotion();
  }
  function go(route) {
    const update = () => {
      state.route = route;
      state.menuOpen = false;
      window.scrollTo(0, 0);
      render();
    };
    try { history.replaceState(null, '', '#' + route); } catch (e) { /* sandboxed */ }
    if (document.startViewTransition && !reduced) {
      try {
        const vt = document.startViewTransition(update);
        vt.ready.catch(() => {});
        vt.finished.catch(() => {});
        return vt.updateCallbackDone.catch(() => {});
      } catch (e) { /* fall through */ }
    }
    update();
    const v = $('#view');
    if (v && !reduced) v.classList.add('view-enter');
    return Promise.resolve();
  }
  const validRoute = r => PAGES.includes(r) || !!P[r] || !!F[r];

  function tourGo(i) {
    if (i < 0 || i >= TOUR.length) { state.tour = -1; render(); return; }
    state.tour = i;
    const [route, sel] = TOUR[i];
    if (route === 'search') { state.q = ''; state.qKey = ''; state.qMatch = ''; state.f = blankFilters(); state.filtersOpen = true; }
    go(route).then(() => requestAnimationFrame(() => {
      const el = $(sel);
      if (!el) return;
      el.classList.remove('tour-glow');
      void el.offsetWidth;
      el.classList.add('tour-glow');
      const top = el.getBoundingClientRect().top + window.scrollY - 150;
      if (top > 160) window.scrollTo({ top, behavior: 'smooth' });
    }));
  }

  let toastTimer;
  function toast(msg) {
    let el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = icon('check') + `<span>${msg}</span>`;
    el.hidden = false;
    el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  }

  let tip;
  function bindTrend() {
    const svg = $('#trend-svg'), hit = $('#trend-hit'), cross = $('#trend-cross');
    if (!svg || !hit) return;
    if (!tip) { tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; document.body.appendChild(tip); }
    const v = D.insights.trend, n = v.length;
    let lf;
    try { lf = new Intl.DateTimeFormat(loc(), { month: 'long', year: 'numeric' }); } catch (e) { lf = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }); }
    const move = e => {
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * TG.W;
      const i = Math.max(0, Math.min(n - 1, Math.round(((x - TG.pl) / (TG.W - TG.pl - TG.pr)) * (n - 1))));
      cross.setAttribute('x1', tx(i, n)); cross.setAttribute('x2', tx(i, n)); cross.setAttribute('visibility', 'visible');
      tip.innerHTML = `${esc(lf.format(monthDate(i)))}<br><b>${num(v[i])}</b>`;
      tip.hidden = false;
      const tw = tip.offsetWidth;
      tip.style.left = Math.min(window.innerWidth - tw - 8, Math.max(8, e.clientX + 14)) + 'px';
      tip.style.top = (e.clientY - 56) + 'px';
    };
    hit.addEventListener('pointermove', move);
    hit.addEventListener('pointerleave', () => { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); });
  }

  function setLang(l) {
    if (!I[l]) return;
    state.lang = l;
    store.set('lang', l);
    if (state.qKey) state.q = t('q.' + state.qKey);
    render();
  }

  // ---------- events ----------
  document.addEventListener('error', e => { const el = e.target; if (el && el.tagName === 'IMG') el.classList.add('broken'); }, true);

  let credits = null;
  document.addEventListener('toggle', e => {
    if (e.target.id !== 'credits' || !e.target.open) return;
    const list = $('#credits-list');
    const fill = rows => { list.innerHTML = rows.map(c => `<li><a href="${esc(c.url)}" target="_blank" rel="noopener">${esc(c.title || c.file)}</a>, ${esc(c.creator || '')} · ${esc(c.license || '')}</li>`).join(''); };
    if (credits) { fill(credits); return; }
    fetch('img/credits.json').then(r => r.json()).then(rows => { credits = rows; fill(rows); }).catch(() => { list.innerHTML = '<li>Openverse</li>'; });
  }, true);

  document.addEventListener('click', e => {
    const el = e.target.closest('button, a, [data-estate]');
    if (!el) return;
    const d = el.dataset;
    if (d.go) { e.preventDefault(); go(d.go); return; }
    if (d.tour) {
      const a = d.tour;
      tourGo(a === 'start' ? 0 : a === 'next' ? state.tour + 1 : a === 'back' ? state.tour - 1 : -1);
      return;
    }
    if (d.cur) { state.cur = d.cur; store.set('cur', state.cur); state.menuOpen = false; render(); return; }
    if (d.chip) {
      const chip = D.chips.find(c => c[0] === d.chip);
      state.qKey = chip[0]; state.q = t('q.' + chip[0]); state.qMatch = chip[1]; state.f = blankFilters();
      go('search'); return;
    }
    if (d.sector) { state.q = ''; state.qKey = ''; state.qMatch = ''; state.f = { ...blankFilters(), sector: d.sector }; go('search'); return; }
    if (d.shelf) {
      const s = $('#shelf'); if (!s) return;
      const dir = (d.shelf === 'next' ? 1 : -1) * (t('meta.dir') === 'rtl' ? -1 : 1);
      s.scrollBy({ left: dir * s.clientWidth * 0.75, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    if ('menu' in d) {
      state.menuOpen = !state.menuOpen;
      $('.sheet').dataset.open = state.menuOpen;
      el.setAttribute('aria-expanded', state.menuOpen);
      el.innerHTML = icon(state.menuOpen ? 'x' : 'menu');
      return;
    }
    if ('filters' in d) { state.filtersOpen = !state.filtersOpen; $('.filters').dataset.open = state.filtersOpen; el.setAttribute('aria-expanded', state.filtersOpen); return; }
    if ('clear' in d) { state.f = blankFilters(); state.q = ''; state.qKey = ''; state.qMatch = ''; render(); return; }
    if (d.scroll) { const target = document.getElementById(d.scroll); if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); return; }
    if (d.estate) {
      state.estate = d.estate;
      const box = $('#estate-map');
      if (box) box.innerHTML = mapSVG({ sel: state.estate, interactive: true });
      $$('.estate-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.estate === state.estate)));
      return;
    }
    if (d.request) {
      state.requested[d.request] = true;
      const slot = document.querySelector(`[data-opp-slot="${d.request}"]`);
      if (slot) slot.innerHTML = `<div class="success">${icon('check')}<span>${t('inv.requested')}</span></div>`;
      return;
    }
    if ('approve' in d || 'reject' in d) {
      const item = el.closest('.qitem'), ok = 'approve' in d;
      item.classList.add('leaving');
      setTimeout(() => {
        state.queue = state.queue.filter(x => x !== item.dataset.id);
        const list = $('#queue'); if (list) list.innerHTML = queueHTML();
        const pend = $('#adm-pending'); if (pend) pend.textContent = num(state.queue.length);
      }, 380);
      toast(t(ok ? 'adm.approved' : 'adm.rejected'));
      return;
    }
    if (d.plan && el.tagName === 'BUTTON') {
      state.joinPlan = d.plan;
      const sel = $('#j-plan'); if (sel) sel.value = d.plan;
      const form = $('#join-form-wrap'); if (form) form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    if ('fsector' in d) { state.factorySector = d.fsector; render(); return; }
  });

  document.addEventListener('change', e => {
    const el = e.target;
    if (el.id === 'lang') setLang(el.value);
    else if (el.id === 'sort') { state.sort = el.value; fillResults(); }
    else if (el.id === 'f-sector') { state.f.sector = el.value; fillResults(); }
    else if (el.id === 'f-estate') { state.f.estate = el.value; fillResults(); }
    else if (el.id === 'f-cert') { state.f.cert = el.value; fillResults(); }
    else if (el.id === 'f-priced') { state.f.priced = el.checked; fillResults(); }
    else if (el.id === 'calc-disc') { state.calc.disc = el.checked; updateCalc(); }
    else if (el.id === 'j-plan') state.joinPlan = el.value;
  });

  document.addEventListener('input', e => {
    const el = e.target;
    if (el.id === 'q') { state.q = el.value; state.qKey = ''; state.qMatch = ''; fillResults(); }
    else if (el.type === 'range' && el.dataset.plan) {
      state.calc[el.dataset.plan] = +el.value;
      $('#calc-' + el.dataset.plan + '-v').textContent = num(+el.value);
      updateCalc();
    }
  });

  document.addEventListener('submit', e => {
    e.preventDefault();
    const id = e.target.id;
    if (id === 'hero-search') { state.q = $('#hero-q').value; state.qKey = ''; state.qMatch = ''; state.f = blankFilters(); go('search'); }
    else if (id === 'search-form') { const q = $('#q'); if (q) q.blur(); }
    else if (id === 'quote-form') { state.sent[state.route] = true; $('#quote').innerHTML = quoteForm(P[state.route]); toast(t('p.quote.sent', { f: esc(fName(F[P[state.route].f])) })); }
    else if (id === 'join-form') { state.joined = true; $('#join-form-wrap').innerHTML = joinForm(); toast(t('join.form.done')); }
  });

  document.addEventListener('keydown', e => {
    if (state.tour < 0 || /INPUT|TEXTAREA|SELECT/.test(document.activeElement && document.activeElement.tagName)) return;
    const rtl = t('meta.dir') === 'rtl';
    if (e.key === 'Escape') tourGo(-1);
    else if (e.key === (rtl ? 'ArrowLeft' : 'ArrowRight') || e.key === 'PageDown') tourGo(state.tour + 1 < TOUR.length ? state.tour + 1 : -1);
    else if (e.key === (rtl ? 'ArrowRight' : 'ArrowLeft') || e.key === 'PageUp') { if (state.tour > 0) tourGo(state.tour - 1); }
  });

  window.addEventListener('hashchange', () => {
    const r = location.hash.replace('#', '');
    if (validRoute(r) && r !== state.route) go(r);
  });

  // ---------- start ----------
  const start = location.hash.replace('#', '');
  if (validRoute(start)) state.route = start;
  render();
})();
