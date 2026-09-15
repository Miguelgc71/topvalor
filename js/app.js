(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const fmt = n => n.toFixed(2).replace(".", ",") + " €";
  const sup = id => SUPPLIERS.find(s => s.id === id);

  const nullImg = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200"><rect width="100%" height="100%" fill="#1b2029"/><text x="50%" y="50%" fill="#3a4553" font-size="22" text-anchor="middle" font-family="sans-serif">SIN FOTO</text></svg>`);

  const CUSTOM = (() => {
    try { return JSON.parse(localStorage.getItem("tv_custom_products") || "[]"); } catch (e) { return []; }
  })();
  const PRODUCTS = globalThis.PRODUCTS.concat(CUSTOM);

  const ST = {};
  PRODUCTS.forEach(p => {
    const s = { sold: 0, earlySold: 0, size: null };
    if (p.deal === "flash") s.flashExpires = p.id === "p14" ? NOW + 66000 : NOW + p.flash.minutes * MIN;
    if (p.deal === "pricedrop") s.dropCur = p.price;
    if (p.deal === "pool") {
      const saved = Number(localStorage.getItem("tv_pool_" + p.id));
      s.poolNow = saved || p.pool.now;
      s.poolUnlocked = s.poolNow >= p.pool.target;
    }
    if (p.deal === "fastpay") s.fastStart = 0;
    if (p.deal === "auction") { s.bidCur = p.auc.start; s.bidEnd = NOW + p.auc.mins * MIN; s.bidder = null; }
    ST[p.id] = s;
  });

  const savePool = id => localStorage.setItem("tv_pool_" + id, String(ST[id].poolNow));

  let filters = { supplier: null, cat: null, brand: null, sizeCm: null, q: "" };
  let sortBy = "rating";
  let currentProduct = null;
  let currentTab = "desc";
  let simN = 5;

  const effDiscount = p => {
    const s = ST[p.id];
    if (p.deal === "pricedrop") return { price: Math.max(p.drop.floor, s.dropCur), tag: "Precio bajando" };
    if (p.deal === "pool" && s.poolUnlocked) return { price: p.price * (1 - p.pool.disc / 100), tag: "Pool desbloqueado -" + p.pool.disc + "%" };
    if (p.deal === "fastpay" && s.fastStart > 0) {
      const gone = Math.floor((Date.now() - s.fastStart) / MIN);
      const disc = Math.max(0, 6 - gone * 0.5);
      return { price: p.price * (1 - disc / 100), tag: "Bono rápido -" + disc.toFixed(1).replace(".", ",") + "%" };
    }
    if (p.deal === "watch" && STORE.coupons[p.id]) return { price: p.price * 0.95, tag: "Cupón aviso -5%" };
    if (inClosedGroup(p.id)) {
      const g = closedGroupFor(p.id);
      return { price: p.price * (1 - groupMath(p, groupPassShare(), g.members.length).discPct), tag: "Precio de grupo (" + g.members.length + " personas)" };
    }
    return { price: p.price, tag: null };
  };

  const shipFor = p => p.shipOverride != null ? p.shipOverride : sup(p.supplierId).base + sup(p.supplierId).perKg * (p.grams / 1000);

  const imgFor = p => p.imgData && p.imgData !== "null" ? p.imgData : null;

  const GROUP_MIN = 2, GROUP_MAX = 5;
  const groupMath = (p, passShare, n) => {
    n = n || GROUP_MAX;
    passShare = passShare || 0.6;
    const agentCost = p.price * 0.80;
    const shipSolo = shipFor(p);
    const soloPrice = p.price + shipSolo;
    const soloCost = agentCost + shipSolo;
    const soloMargin = soloPrice - soloCost;
    const rFac = n >= 5 ? 0.92 : n === 3 ? 0.945 : 0.965;
    const kg = p.grams / 1000;
    const s = sup(p.supplierId);
    const shipGroupShare = s.base / n + 0.82 * s.perKg * kg;
    const agentCostGroup = agentCost * rFac;
    const groupCost = agentCostGroup + shipGroupShare;
    const savings = soloCost - groupCost;
    const groupPrice = groupCost + soloMargin + savings * (1 - passShare);
    const discPct = (soloPrice - groupPrice) / soloPrice;
    return {
      n, soloPrice, soloCost, soloMargin, agentCost, shipSolo,
      agentCostGroup, shipGroupShare, groupCost, savings, groupPrice, discPct,
      ourMarginGroup: soloMargin + savings * (1 - passShare),
      perPersonSave: soloPrice - groupPrice,
    };
  };
  const tiersLabel = (p, passShare) => [2, 3, 5].map(n => {
    const m = groupMath(p, passShare, n);
    return n + " pers: −" + (m.discPct * 100).toFixed(1).replace(".", ",") + "%";
  }).join(" · ");

  const groupKey = "tv_groups_v2";
  const GROUP_SEED = [
    { code: "GR-7K2M", productId: "p03", max: GROUP_MAX, min: GROUP_MIN, leader: "Ana", members: ["tú", "Ana", "Luis", "Marta", "José"], deadline: NOW + 5 * MIN, closedAt: NOW },
    { code: "GR-4AB9", productId: "p12", max: GROUP_MAX, min: GROUP_MIN, leader: "tú", members: ["tú", "Sara"], deadline: NOW + 25 * MIN, closedAt: null },
    { code: "GR-9Q1W", productId: "p06", max: GROUP_MAX, min: GROUP_MIN, leader: "Raúl", members: ["Raúl", "Miguel", "Clara"], deadline: NOW + 8 * MIN, closedAt: null },
  ];
  const groups = (() => {
    try {
      const raw = localStorage.getItem(groupKey);
      if (raw) return JSON.parse(raw);
    } catch (e) { }
    return GROUP_SEED.map(g => Object.assign({}, g));
  })();
  const saveGroups = () => localStorage.setItem(groupKey, JSON.stringify(groups));
  const groupStatus = g => {
    if (g.closedAt) return "closed";
    const elapsed = Date.now() > g.deadline;
    if (elapsed) {
      if (g.members.length >= g.min) { g.closedAt = Date.now(); saveGroups(); return "closed"; }
      return "expired";
    }
    if (g.members.length >= g.max) { g.closedAt = Date.now(); saveGroups(); return "closed"; }
    return "open";
  };
  const closedGroupFor = pId => groups
    .filter(g => g.productId === pId && g.members.includes("tú") && groupStatus(g) === "closed")
    .sort((a, b) => b.members.length - a.members.length)[0];
  const inClosedGroup = pId => !!closedGroupFor(pId);
  const groupPassShare = () => Number(localStorage.getItem("tv_pass") || 60) / 100;

  function renderSuppliers() {
    const wrap = $("#supplierFilters");
    wrap.innerHTML = `<button class="chip ${filters.supplier ? "" : "active"}" data-sup="">Todos</button>` +
      SUPPLIERS.map(s => `<button class="chip ${filters.supplier === s.id ? "active" : ""}" data-sup="${s.id}">
        <span class="sup-dot" style="background:${s.color}"></span>${s.name}</button>`).join("");
    $$("[data-sup]", wrap).forEach(b => b.onclick = () => {
      filters.supplier = b.dataset.sup || null;
      renderFilters();
      renderGrid();
    });
  }

  function renderFilters() {
    const catWrap = $("#categoryFilters");
    catWrap.innerHTML = `<button class="chip ${filters.cat ? "" : "active"}" data-cat="">Todo</button>` +
      CATEGORIES.map(c => `<button class="chip ${filters.cat === c.id ? "active" : ""}" data-cat="${c.id}">${c.label}</button>`).join("");
    $$("[data-cat]", catWrap).forEach(b => b.onclick = () => {
      filters.cat = b.dataset.cat || null;
      renderFilters();
      renderGrid();
    });
    renderSuppliers();

    const bSel = $("#brandSelect");
    const brands = [...new Set(PRODUCTS.map(p => p.brand))].sort();
    const current = bSel.value || filters.brand || "";
    bSel.innerHTML = `<option value="">Todas las marcas</option>` +
      brands.map(b => `<option value="${b}" ${b === current ? "selected" : ""}>${b}</option>`).join("");
  }

  const sizeMatches = (p, cm) => {
    if (!cm) return true;
    if (p.fit === "shoe") return SHOE_CHART.some(r => parseFloat(r.cm.replace(",", ".")) >= cm);
    if (p.fit === "custom" && p.sizes) {
      return p.sizes.some(s => parseFloat(String(s).replace(",", ".")) === cm);
    }
    return false;
  };

  function visibleProducts() {
    return PRODUCTS.filter(p => {
      if (filters.supplier && p.supplierId !== filters.supplier) return false;
      if (filters.cat && p.cat !== filters.cat) return false;
      if (filters.brand && p.brand !== filters.brand) return false;
      if (filters.sizeCm != null && !sizeMatches(p, filters.sizeCm)) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        if (!(p.title.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || sup(p.supplierId).name.toLowerCase().includes(q))) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return effDiscount(a).price - effDiscount(b).price;
      if (sortBy === "price-desc") return effDiscount(b).price - effDiscount(a).price;
      if (sortBy === "reviews") return b.reviews - a.reviews;
      return b.rating - a.rating;
    });
  }

  function dealBadge(p) {
    if (p.deal === "none") return "";
    const info = DEAL_INFO[p.deal];
    const sec = p.deal === "flash" || p.deal === "pricedrop";
    return `<span class="deal-badge ${sec ? "warn" : ""}">${info.label}</span>`;
  }

  function countdownHtml(ms) {
    if (ms <= 0) return `<span class="countdown-live">Finalizada</span>`;
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60), s = sec % 60;
    return `<div class="countdown" data-end="${Date.now() + ms}">
      <div class="cd-box"><b data-u="m">${String(m).padStart(2, "0")}</b><span>min</span></div>
      <div class="cd-box"><b data-u="s">${String(s).padStart(2, "0")}</b><span>seg</span></div>
    </div>`;
  }

  function flashState(p) {
    const s = ST[p.id];
    const remaining = s.flashExpires - Date.now();
    const left = Math.max(0, p.flash.total - s.sold);
    let msg;
    if (remaining <= 0) msg = "Oferta terminada";
    else if (left <= 0) msg = "3 vendidas · oferta terminada";
    else if (s.sold === 0 && remaining <= 60000) msg = "¡Solo queda 1 unidad para motivar la compra!";
    else msg = `${left} de ${p.flash.total} a precio flash`;
    return { remaining, left, msg };
  }

  function poolBar(p) {
    const s = ST[p.id];
    const pct = Math.round((s.poolNow / p.pool.target) * 100);
    return `<div class="pool-bar">${s.poolUnlocked
      ? `<b style="color:var(--accent)">Desbloqueado</b> · -${p.pool.disc}% para los ${p.pool.target} interesados`
      : `Interés: <b>${s.poolNow}/${p.pool.target}</b> para desbloquear -${p.pool.disc}%`}
      <div class="pool-fill ${s.poolUnlocked ? "locked" : ""}" style="width:${Math.min(100, pct)}%"></div></div>`;
  }

  function priceBlock(p) {
    const eff = effDiscount(p);
    const ship = shipFor(p);
    return `<div class="pa-price-row"><span class="pa-price">${fmt(eff.price)}</span>
      ${p.orig ? `<span class="pa-orig">${fmt(p.orig)}</span>` : ""}<span class="iva-tag">IVA incl.</span></div>
      <div class="pa-ship"><span>&#128666;</span> Envío <b>${fmt(ship)}</b> · ${sup(p.supplierId).eta}</div>`;
  }

  function productCard(p) {
    const s = ST[p.id];
    let extra = "";
    if (p.deal === "flash") {
      const f = flashState(p);
      extra = `${countdownHtml(f.remaining)}<div class="pa-meta"><span>${f.msg}</span></div>`;
    }
    if (p.deal === "pool") extra = poolBar(p);
    if (p.deal === "pricedrop") extra = `<div class="pa-meta"><span class="pa-complaints">Precio bajando cada ${p.drop.everyMin} min</span></div>`;
    if (p.deal === "auction") extra = `<div class="pa-meta"><span>Puja actual: ${fmt(s.bidCur)}</span></div>`;
    const img = imgFor(p);
    const media = img
      ? `<img class="pa-img" src="${img}" alt=${p.title} loading="lazy" onerror="this.src='${nullImg}'">`
      : `<div class="mono">${p.mono}</div>`;
    return `<article class="product-card" data-open="${p.id}">
      <div class="pa-co ${img ? "pa-co-img" : ""}" style="background:linear-gradient(135deg,${p.grad[0]},${p.grad[1]})">
        <div class="pa-badges"><span class="supplier-badge">${sup(p.supplierId).name}</span>${dealBadge(p)}</div>
        ${media}
        <div class="rating-tag">&#9733; ${p.rating} <small>(${p.reviews})</small></div>
      </div>
      <div class="pa-body">
        <div class="pa-brand">${p.brand}</div>
        <div class="pa-title">${p.title}</div>
        ${priceBlock(p)}
        ${extra}
        <div class="pa-meta">
          <span>${CATEGORIES.find(c => c.id === p.cat).label}</span>
          <span class="pa-complaints">${p.complaints > 0 ? p.complaints + " quejas" : "sin quejas"}</span>
        </div>
        <div class="pa-bottom">
          <button class="btn btn-primary" data-view="${p.id}">Ver · elegir talla</button>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const g = $("#productGrid");
    const list = visibleProducts();
    $("#gridEmpty").hidden = list.length > 0;
    if (PRODUCTS.length === 0) {
      $("#gridEmpty").hidden = false;
      $("#gridEmpty").innerHTML = `<b style="display:block;font-size:16px;">Tienda en preparación</b><span style="font-size:13px;">Aún no hay artículos publicados. Vuelve pronto o contacta con el vendedor.</span>`;
    } else {
      $("#gridEmpty").innerHTML = "No hay productos con esos filtros.";
    }
    g.innerHTML = list.map(productCard).join("");
    $$("[data-view]", g).forEach(b => b.onclick = () => openModal(b.dataset.view));
    $$(".product-card", g).forEach(c => c.onclick = e => {
      if (!e.target.closest("button")) openModal(c.dataset.open);
    });
  }

  function renderDeals() {
    const deals = PRODUCTS.filter(p => p.deal !== "none").slice(0, 4);
    $("#dealGrid").innerHTML = deals.map(p => {
      let body;
      switch (p.deal) {
        case "flash": {
          const f = flashState(p);
          body = `${countdownHtml(f.remaining)}<div class="countdown-live">${f.msg}</div>`;
          break;
        }
        case "pool": {
          const s = ST[p.id];
          body = `<p class="deal-desc">5 interesados desbloquean -${p.pool.disc}%. Vamos por <b>${s.poolNow}/${p.pool.target}</b>.</p>`;
          break;
        }
        case "auction": body = `<p class="deal-desc">Puja actual: <b>${fmt(ST[p.id].bidCur)}</b>. Cierra en ${countdownHtml(ST[p.id].bidEnd - Date.now())}</p>`; break;
        case "pricedrop": body = `<p class="deal-desc">Precio actual: <b>${fmt(Math.max(p.drop.floor, ST[p.id].dropCur))}</b>. Baja solo cada ${p.drop.everyMin} min hasta ${fmt(p.drop.floor)}.</p>`; break;
        case "fastpay": body = `<p class="deal-desc">Date prisa: muestra interés y el bono decae 0,5%/min durante 10 min.</p>`; break;
        default: body = `<p class="deal-desc">${DEAL_INFO[p.deal].label}</p>`;
      }
      return `<div class="deal-card">
        <div class="deal-type">${DEAL_INFO[p.deal].label}</div>
        <div class="deal-title">${p.title}</div>
        <p class="deal-desc">${fmt(effDiscount(p).price)} · vía ${sup(p.supplierId).name}</p>
        ${body}
        <button class="btn btn-primary" data-view="${p.id}" style="margin-top:10px">Entrar</button>
      </div>`;
    }).join("");
    $$("[data-view]", $("#dealGrid")).forEach(b => b.onclick = () => openModal(b.dataset.view));
  }

  function renderSupplierTable() {
    $("#supplierTable").innerHTML = `<tr><th>Proveedor</th><th>Fee servicio</th><th>QC</th><th>Envio EU</th><th>Tarifa envio</th><th>Articulos en catalogo</th></tr>` +
      SUPPLIERS.map(s => {
        const n = PRODUCTS.filter(p => p.supplierId === s.id).length;
        return `<tr><td><span class="sup-dot" style="background:${s.color}"></span><b>${s.name}</b></td>
          <td>${s.fee}</td><td>${s.qc}</td><td>${s.eta}</td><td>${fmt(s.base)} + ${fmt(s.perKg)}/kg</td><td>${n}</td></tr>`;
      }).join("");
  }

  function fitInfo(p) {
    if (p.fit === "shoe") return { title: "Calzado — tabla cm / EU / US / UK", type: "shoe" };
    if (p.fit === "top" || p.fit === "outer") return { title: "Parte superior — talla por medidas en cm", type: "top" };
    if (p.fit === "bottom") return { title: "Pantalones — cintura en cm", type: "bottom" };
    if (p.fit === "custom") return { title: "Tallas disponibles", type: "custom" };
    return null;
  }

  function chartHtml(p) {
    if (p.fit === "shoe") {
      return `<h4>Tabla real del proveedor (pie en cm → CN/EU, US, UK)</h4>
        <table class="size-table"><tr><th>Talla marcada CN</th><th>Pie (cm)</th><th>EU</th><th>US hombre</th><th>UK</th></tr>
        ${SHOE_CHART.map(r => `<tr data-size="EU ${r.eu}" data-active="${ST[p.id].size === "EU " + r.eu}">
          <td>${r.cm.replace(",", ".")}</td><td>${r.cm}</td><td>${r.eu}</td><td>${r.us}</td><td>${r.uk}</td></tr>`).join("")}</table>`;
    }
    if (p.fit === "top" || p.fit === "outer") {
      return `<h4>Tabla (cm reales)</h4>
        <table class="size-table"><tr><th>Talla</th><th>Pecho (cm)</th><th>Cintura (cm)</th><th>Largo (cm)</th></tr>
        ${TOP_CHART.map(r => `<tr data-size="${r.size}" data-active="${ST[p.id].size === r.size}">
          <td>${r.size}</td><td>${r.chest}</td><td>${r.waist}</td><td>${r.length}</td></tr>`).join("")}</table>`;
    }
    if (p.fit === "bottom") {
      return `<h4>Tabla (cm reales)</h4>
        <table class="size-table"><tr><th>Talla</th><th>Cintura (cm)</th><th>Cadera (cm)</th><th>Largo (cm)</th></tr>
        ${BOTTOM_CHART.map(r => `<tr data-size="${r.size}" data-active="${ST[p.id].size === r.size}">
          <td>${r.size}</td><td>${r.waist}</td><td>${r.hip}</td><td>${r.length}</td></tr>`).join("")}</table>`;
    }
    if (p.fit === "custom") {
      const sz = p.sizes || [];
      return `<h4>Tallas que tiene el proveedor</h4>
        <div class="size-chips-wrap">${sz.length ? sz.map(s => `<button class="size-chip ${ST[p.id].size === s ? "active" : ""}" data-size="${s}">${s}</button>`).join("") : `<span class="pa-complaints">Sin tallas especificadas.</span>`}</div>`;
    }
    return `<p>Este producto no requiere talla.</p>`;
  }

  function runFit(p) {
    const s = ST[p.id];
    const input = $("#fitInput");
    const val = parseFloat((input.value || "").replace(",", "."));
    const out = $("#fitResult");
    if (isNaN(val)) { out.innerHTML = `<span class="pa-complaints">Introduce tu medida en cm (ej. 27,5 o 104).</span>`; return; }

    if (p.fit === "shoe") {
      const row = SHOE_CHART.find(r => parseFloat(r.cm.replace(",", ".")) >= val);
      if (!row) {
        out.innerHTML = `<span class="pa-complaints">Pie mayor de 30 cm: consulta con el proveedor, puede que no haya talla.</span>`;
        return;
      }
      const diff = parseFloat(row.cm.replace(",", ".")) - val;
      const score = Math.max(45, Math.min(100, 100 - diff * 4));
      pickSize(p, "EU " + row.eu);
      out.innerHTML = `<span class="big">Talla y ajuste</span><br>Recomendado: <b>EU ${row.eu}</b> (talla CN ${row.cm.replace(",", ".")}, US ${row.us}, UK ${row.uk}).
        <div class="fit-score ${score > 85 ? "good" : score > 65 ? "mid" : "bad"}">Fit score: ${Math.round(score)} / 100</div>
        El pie en cm coincide con la talla CN real. ${diff > 0.5 ? "Con holgura de " + diff.toFixed(1).replace(".", ",") + " cm +\" para andar.\"" : "Ajuste justo: si vas a usar calcetín grueso, sube una."}`;
      return;
    }

    if (p.fit === "top" || p.fit === "outer") {
      const row = TOP_CHART.find(r => r.chest >= val);
      if (!row) {
        out.innerHTML = `<span class="pa-complaints">Pecho mayor de 122 cm: puede que con XXL no quede. Consulta al proveedor.</span>`;
        return;
      }
      const diff = row.chest - val;
      const score = Math.max(40, Math.min(100, 100 - diff * 1.2));
      pickSize(p, row.size);
      out.innerHTML = `<span class="big">Talla y ajuste</span><br>Recomendado: <b>${row.size}</b> (pecho ${row.chest} cm).
        <div class="fit-score ${score > 85 ? "good" : score > 65 ? "mid" : "bad"}">Fit score: ${Math.round(score)} / 100</div>
        ${diff > 12 ? "Hueco amplio (oversized). Si quieres ajustado, baja una talla." : diff < 2 ? "Muy justo: sube una talla para no devolver." : "Ajuste correcto."}`;
      return;
    }

    if (p.fit === "bottom") {
      const row = BOTTOM_CHART.find(r => val <= Number(r.waist.split("-")[1]));
      if (!row) {
        out.innerHTML = `<span class="pa-complaints">Cintura mayor de 92 cm: consulta con el proveedor por tallas extendidas.</span>`;
        return;
      }
      const hi = Number(row.waist.split("-")[1]);
      const lo = Number(row.waist.split("-")[0]);
      const score = val > hi ? Math.max(40, 100 - (val - hi) * 2) : val < lo ? 90 : 100;
      pickSize(p, row.size);
      out.innerHTML = `<span class="big">Talla y ajuste</span><br>Recomendado: <b>${row.size}</b> (cintura ${row.waist} cm).
        <div class="fit-score ${score > 85 ? "good" : score > 65 ? "mid" : "bad"}">Fit score: ${Math.round(score)} / 100</div>
        ${val > hi ? "Va ajustado: valora subir una talla." : val < lo ? "Queda algo suelto en cintura." : "Perfecto para tu cintura."}`;
      return;
    }
  }

  function pickSize(p, size) {
    ST[p.id].size = size;
    $$(".modal tr[data-size]").forEach(r => r.classList.toggle("active", r.dataset.size === size));
    $$(".modal .size-chip[data-size]").forEach(c => c.classList.toggle("active", c.dataset.size === size));
    const bar = $("#sizeBar");
    if (bar) bar.textContent = "Talla elegida: " + size;
  }

  function modalBody(p) {
    const fi = fitInfo(p);
    const eff = effDiscount(p);
    const s = ST[p.id];
    const ship = shipFor(p);

    let sizePanel;
    if (fi && fi.type === "custom") {
      sizePanel = `<div class="fit-assist">
        <b>Elige tu talla</b> — estas son las disponibles en el proveedor.
        <p style="font-size:12px;color:var(--muted);margin-top:6px">Dado que es un producto añadido por el administrador, solo está disponible en estas tallas.</p>
      </div>${chartHtml(p)}`;
    } else if (fi) {
      sizePanel = `<div class="fit-assist">
        <b>Asistente de ajuste personal</b> — así evitamos devoluciones por talla.
        <div class="fit-row">
          <div class="fit-field"><label>${fi.type === "shoe" ? "Longitud de tu pie (cm)" : fi.type === "top" ? "Contorno de pecho (cm)" : "Cintura (cm)"}</label>
            <input id="fitInput" type="text" placeholder="ej. ${fi.type === "shoe" ? "27,5" : fi.type === "top" ? "104" : "82"}"></div>
          <button class="btn btn-green" id="fitBtn" style="width:auto">Calcular mi talla</button>
        </div>
        <div class="fit-result" id="fitResult">Si introduces tu medida te recomendamos la talla y el % de ajuste.<br>
          <span class="pa-complaints">También puedes tocar una fila de la tabla para elegir talla manualmente.</span>
        </div>
      </div>${chartHtml(p)}`;
    } else {
      sizePanel = `<p>Sin tallas — artículo único (uno-solo). No hace falta medida.</p>`;
    }

    let dealPanel = "";
    if (p.deal === "flash") {
      const f = flashState(p);
      dealPanel = `<div class="fit-assist">${countdownHtml(f.remaining)}<div class="countdown-live">${f.msg}</div>
        <p style="margin-top:8px;font-size:13px">Al acabarse el tiempo, o al venderse las 3 unidades, la oferta termina automáticamente.</p></div>`;
    }
    if (p.deal === "pool") {
      const unlocked = s.poolUnlocked;
      dealPanel = `<div class="fit-assist">${poolBar(p)}
        <button class="btn ${unlocked ? "btn-ghost" : "btn-green"}" id="poolBtn" style="margin-top:10px;width:100%">${unlocked ? "Precio -" + p.pool.disc + "% ya aplicado" : "Me interesa (hazte del pool)"}</button>
        ${unlocked ? "" : `<p style="font-size:12px;color:var(--muted);margin-top:8px">Quedan ${p.pool.target - s.poolNow} interesados para desbloquear el descuento para los ${p.pool.target}.</p>`}
      </div>`;
    }
    if (p.deal === "auction") {
      dealPanel = `<div class="fit-assist">
        <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
          <div>Puja actual:<br><b style="font-size:22px;color:var(--accent)">${fmt(s.bidCur)}</b><br>${s.bidder ? "por " + s.bidder : "sin puja aun"}</div>
          <div>${countdownHtml(s.bidEnd - Date.now())}</div>
        </div>
        <div class="bid-form">
          <input id="bidInput" type="number" step="1" value="${(s.bidCur + p.auc.minInc).toFixed(0)}">
          <button class="btn btn-primary" id="bidBtn" style="flex:1">Pujar +${p.auc.minInc.toFixed(0)}</button>
        </div>
        <p style="font-size:12px;color:var(--muted);margin-top:8px">Incremento mínimo ${fmt(p.auc.minInc)}. Si alguien puja en el último minuto, se extienden 1 min (anti-sniping).</p>
      </div>`;
    }
    if (p.deal === "pricedrop") {
      dealPanel = `<div class="fit-assist">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <div>Precio ahora:<br><b style="font-size:22px;color:var(--accent)">${fmt(Math.max(p.drop.floor, s.dropCur))}</b></div>
          <div>Techo:<br><b>${fmt(p.drop.floor)}</b></div>
        </div>
        <p style="font-size:12px;color:var(--muted);margin-top:8px">Baja ${fmt(p.drop.step)} cada ${p.drop.everyMin} min hasta comprarse o llegar al techo.</p>
      </div>`;
    }
    if (p.deal === "earlybird") {
      const left = Math.max(0, p.early.quota - s.earlySold);
      dealPanel = `<div class="fit-assist"><b>Early bird</b> — primeros ${p.early.quota} compradores con precio de entrada.
        <p style="font-size:13px;margin-top:6px">Quedan <b>${left}</b> plazas a precio early (−15% sobre ${fmt(Math.round(p.orig * 0.85))})</p></div>`;
    }
    if (p.deal === "fastpay") {
      dealPanel = `<div class="fit-assist">
        ${s.fastStart > 0
          ? `<b>Bono rápido activo</b> ${countdownHtml(s.fastStart + p.fast.mins * MIN - Date.now())}<p style="font-size:13px;margin-top:6px">Descuento actual aplicado al añadir al carrito.</p>`
          : `<button class="btn btn-green" id="fastBtn" style="width:100%">Me interesa · activar bono rápido (−6% y bajando 0,5%/min, 10 min)</button>`}
      </div>`;
    }
    if (p.deal === "watch") {
      dealPanel = `<div class="fit-assist">
        ${STORE.coupons[p.id]
          ? `<b>Cupon aviso activo: −5%</b> aplicado al añadir al carrito.`
          : `<button class="btn btn-primary" id="watchBtn" style="width:100%">Avísame si baja · cupon −5% valido 24 h</button>`}
      </div>`;
    }

    const complaintsTab = p.complaints > 0 ? `
      <div class="complaint-box">
        <b>Quejas reportadas (${p.complaints}):</b>
        <div class="complaint-line"><span>Talla mal (pedida M, llega S)</span><span>vía ${sup(p.supplierId).name}</span></div>
        <div class="complaint-line"><span>Costura defectuosa</span><span>vía ${sup(p.supplierId).name}</span></div>
        ${p.complaints > 2 ? `<div class="complaint-line"><span>Color distinto a la foto</span><span>vía ${sup(p.supplierId).name}</span></div>` : ""}
        <p style="margin-top:10px">Cuando un artículo almacena <b>3+ quejas en 30 días se retira de la página automáticamente</b>.</p>
      </div>`
      : `<p>Sin quejas reportadas. Rating <b>${p.rating}</b> con ${p.reviews} reseñas verificadas por el proveedor.</p>`;

    return {
      head: `<div class="mh-media" style="background:linear-gradient(135deg,${p.grad[0]},${p.grad[1]})">
          ${imgFor(p) ? `<img src="${imgFor(p)}" class="mh-img" onerror="this.style.display='none'">` : `<div class="mono">${p.mono}</div>`}</div>
        <div class="mh-info">
          <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">${p.brand} · ${sup(p.supplierId).name}</div>
          <div class="mh-title">${p.title}</div>
          <div class="mh-meta">
            <span>&#9733; ${p.rating} · ${p.reviews} reseñas</span>
            <span>${p.complaints > 0 ? `<b style="color:var(--accent2)">${p.complaints} quejas</b>` : `<b style="color:var(--green)">sin quejas</b>`}</span>
            ${dealBadge(p)}
          </div>
          <div class="mh-price">${fmt(eff.price)} <span class="iva-tag">IVA incl.</span> ${eff.tag ? `<span style="font-size:13px;color:var(--green)">(${eff.tag})</span>` : ""}</div>
        </div>`,
      panels: {
        desc: `<p>${p.note}</p><p style="margin-top:10px;color:var(--muted)">Fotos QC (control de calidad) disponibles en el proveedor ${sup(p.supplierId).name} antes del envío. Peso estimado <b>${(p.grams / 1000).toFixed(2).replace(".", ",")} kg</b>.</p>${dealPanel}`,
        fit: sizePanel,
        ship: `<h4>Coste de envío — transparente</h4>
          <div class="fit-assist">
            <div style="display:grid;gap:4px">
              <div><b>Proveedor:</b> ${sup(p.supplierId).name} (tarifa ${fmt(sup(p.supplierId).base)} + ${fmt(sup(p.supplierId).perKg)}/kg)</div>
              <div><b>Peso:</b> ${(p.grams / 1000).toFixed(2).replace(".", ",")} kg</div>
              <div><b>Envío estimado:</b> ${fmt(ship)}</div>
              <div><b>Plazo:</b> ${sup(p.supplierId).eta} EU</div>
            </div>
          </div>
          <h4>Quien lo gestiona</h4>
          <ul style="margin-left:18px;font-size:13px">
            <li>El proveedor envía <b>directamente a tu casa</b>.</li>
            <li>Retrasos, faltas o tallas incorrectas: yo hablo <b>directamente con ${sup(p.supplierId).name}</b> y lo arreglamos.</li>
            <li>Tú me pagas por <b>Bizum</b> y te doy el número de seguimiento (tracking) cuando lo envía.</li>
          </ul>`,
        rate: complaintsTab,
      },
    };
  }

  function openModal(id) {
    const p = PRODUCTS.find(x => x.id === id);
    currentProduct = p;
    currentTab = "desc";
    const b = modalBody(p);
    $("#productModal").innerHTML = `<button class="modal-close" data-close="modalBackdrop">&times;</button>
      <div class="modal-head">${b.head}</div>
      <div class="tabs">
        <button class="tab active" data-tab="desc">Descripción</button>
        ${fitInfo(p) ? `<button class="tab" data-tab="fit">Tallas y ajuste</button>` : ""}
        <button class="tab" data-tab="ship">Envío</button>
        <button class="tab" data-tab="rate">Valoraciones y quejas</button>
      </div>
      <div class="tab-panel" id="tabPanel">${b.panels[currentTab]}</div>
      <div class="tab-panel" style="padding-top:0">
        <div class="fit-assist" style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
          <div style="flex:1"><b id="sizeBar">${fitInfo(p) ? "Elige talla (asistente o tabla)" : "Sin talla requerida"}</b>
            <div style="font-size:12px;color:var(--muted)" id="cartLine">Precio + envio incluidos</div></div>
          <button class="btn btn-primary" id="addBtn" style="flex:1;min-width:200px">Añadir al carrito</button>
        </div>
      </div>`;

    $("#modalBackdrop").hidden = false;
    $("#modalBackdrop").classList.add("show");
    bindModal(p);
  }

  function bindModal(p) {
    $$(".tab").forEach(t => t.onclick = () => {
      currentTab = t.dataset.tab;
      $$(".tab").forEach(x => x.classList.toggle("active", x === t));
      $("#tabPanel").innerHTML = modalBody(p).panels[currentTab];
      bindFit(p);
      bindModalActions(p);
    });
    bindFit(p);
    bindModalActions(p);
    $$(".modal tr[data-size]").forEach(r => r.onclick = () => pickSize(p, r.dataset.size));
    $("#addBtn").onclick = () => {
      if (fitInfo(p) && !ST[p.id].size) {
        const fitTab = $$(".tab").find(t => t.dataset.tab === "fit");
        if (fitTab) { currentTab = "fit"; $$(".tab").forEach(x => x.classList.toggle("active", x === fitTab)); $("#tabPanel").innerHTML = modalBody(p).panels.fit; bindFit(p); bindModalActions(p); }
        toast("Elige talla: usa el asistente de ajuste (medida en cm) o toca una fila de la tabla.", false);
        return;
      }
      addToCart(p);
    };
  }

  function bindFit(p) {
    const btn = $("#fitBtn"), input = $("#fitInput"), out = $("#fitResult");
    if (btn) btn.onclick = () => runFit(p);
    if (input) input.addEventListener("keydown", e => { if (e.key === "Enter") runFit(p); });
    if (out) out.innerHTML = "Si introduces tu medida te recomendamos la talla y el % de ajuste.<br><span class=\"pa-complaints\">También puedes tocar una fila de la tabla.</span>";
    $$(".modal tr[data-size]").forEach(r => r.onclick = () => pickSize(p, r.dataset.size));
    $$(".modal .size-chip[data-size]").forEach(c => c.onclick = () => pickSize(p, c.dataset.size));
  }

  function bindModalActions(p) {
    if (p.deal === "pool") {
      const b = $("#poolBtn");
      if (b) b.onclick = () => {
        if (ST[p.id].poolUnlocked) return;
        ST[p.id].poolNow = Math.min(p.pool.target, ST[p.id].poolNow + 1);
        ST[p.id].poolUnlocked = ST[p.id].poolNow >= p.pool.target;
        savePool(p.id);
        const m = modalBody(p);
        $("#tabPanel").innerHTML = m.panels[currentTab];
        bindFit(p); bindModalActions(p);
        toast(ST[p.id].poolUnlocked ? "Pool desbloqueado: -" + p.pool.disc + "% para los " + p.pool.target : "Interés registrado (" + ST[p.id].poolNow + "/" + p.pool.target + ")", true);
        renderGrid(); renderDeals();
      };
    }
    if (p.deal === "auction") {
      const bi = $("#bidInput"), bb = $("#bidBtn");
      if (bb) bb.onclick = () => {
        const v = parseFloat(bi.value.replace(",", "."));
        const min = ST[p.id].bidCur + p.auc.minInc;
        if (isNaN(v) || v < min) { toast("Puja mínima " + fmt(min), false); return; }
        const timeLeft = ST[p.id].bidEnd - Date.now();
        ST[p.id].bidCur = v; ST[p.id].bidder = "tú";
        if (timeLeft < 60000) ST[p.id].bidEnd = Date.now() + 60000;
        toast("Puja registrada: " + fmt(v) + (timeLeft < 60000 ? " · se extendió 1 min" : ""), true);
        const m = modalBody(p);
        $("#tabPanel").innerHTML = m.panels[currentTab];
        bindFit(p); bindModalActions(p);
        renderGrid(); renderDeals();
      };
    }
    if (p.deal === "fastpay") {
      const b = $("#fastBtn");
      if (b) b.onclick = () => {
        ST[p.id].fastStart = Date.now();
        toast("Bono rapido activado: -6% y bajando.", true);
        const m = modalBody(p);
        $("#tabPanel").innerHTML = m.panels[currentTab];
        bindFit(p); bindModalActions(p);
        renderGrid(); renderDeals();
      };
    }
    if (p.deal === "watch") {
      const b = $("#watchBtn");
      if (b) b.onclick = () => {
        STORE.coupons[p.id] = true;
        toast("Alerta creada. Cupón -5% aplicado a tu carrito.", true);
        const m = modalBody(p);
        $("#tabPanel").innerHTML = m.panels[currentTab];
        bindFit(p); bindModalActions(p);
        renderGrid(); renderDeals();
      };
    }
  }

  function addToCart(p) {
    const s = ST[p.id];
    const eff = effDiscount(p);
    const ship = shipFor(p);
    if (p.deal === "flash" && (s.sold >= p.flash.total || Date.now() > s.flashExpires)) {
      toast("Oferta relámpago agotada o terminada.", false);
      return;
    }
    STORE.cart.push({ id: p.id, mono: p.mono, grad: p.grad, title: p.title, supplier: p.supplierId, size: fitInfo(p) ? s.size : null, unit: eff.price, ship, isGroup: inClosedGroup(p.id) });
    if (p.deal === "flash") s.sold++;
    if (p.deal === "earlybird") s.earlySold = Math.min(p.early.quota, s.earlySold + 1);
    toast("Añadido al carrito:" + (fitInfo(p) ? " talla " + s.size : "") + " · " + fmt(eff.price + ship), true);
    updateCart();
    openCart();
  }

  function groupedShip() {
    const per = {};
    STORE.cart.forEach(i => {
      const s = sup(i.supplier);
      if (!per[i.supplier]) per[i.supplier] = 0;
      per[i.supplier] += i.ship;
    });
    let total = 0;
    Object.entries(per).forEach(([sid, v]) => {
      const s = sup(sid);
      const kgs = STORE.cart.filter(i => i.supplier === sid).reduce((a, i) => a + PRODUCTS.find(p => p.id === i.id).grams / 1000, 0);
      total += s.base + s.perKg * kgs;
    });
    return total;
  }

  function updateCart() {
    $("#cartCount").textContent = STORE.cart.length;
  }

  const BIZUM = "612 34 56 78";

  function openCart() {
    const items = STORE.cart;
    const ship = groupedShip();
    const sub = items.reduce((a, i) => a + i.unit, 0);
    const total = sub + ship;
    const bySup = {};
    items.forEach(i => bySup[i.supplier] = (bySup[i.supplier] || 0) + 1);

    $("#cartDrawer").innerHTML = `<button class="modal-close" data-close="cartBackdrop">&times;</button>
      <h2 style="font-size:20px;margin-bottom:12px">Mi selección</h2>
      ${items.length === 0 ? "<p style='color:var(--muted)'>Vacío. Toca \u201cVer \u00b7 elegir talla\u201d y eliges un producto.</p>" : items.map((i, idx) => `
        <div class="cart-row">
          <div class="cr-img" style="background:linear-gradient(135deg,${i.grad[0]},${i.grad[1]})"><span class="mono">${i.mono}</span></div>
          <div><b>${i.title}</b><br><span style="color:var(--muted);font-size:12px">${sup(i.supplier).name}${i.size ? " · talla " + i.size : ""} · ${fmt(i.unit)}</span></div>
          <button class="cr-x" data-rm="${idx}">&times;</button>
        </div>`).join("")}
      ${items.length ? `<div class="cart-total">
        <div><span>Subtotal producto (${items.length}) · IVA incl.</span><b>${fmt(sub)}</b></div>
        <div><span>Envío consolidado (${Object.keys(bySup).length} proveedor${Object.keys(bySup).length > 1 ? "es" : ""})</span><b>${fmt(ship)}</b></div>
        <div class="grand"><span>Total a pagar</span><span>${fmt(total)}</span></div>
      </div>
      <button class="btn btn-primary" id="payBtn" style="width:100%;margin-top:12px">Pedir por Bizum · ${fmt(total)}</button>
      <p class="table-note" style="margin-top:8px">Preparo el pedido cuando me pagas por <b>Bizum ${BIZUM}</b>. Precio final con 21% IVA.</p>
      <div class="cart-flow">
        <div class="step"><span class="n">1</span><span>Me pagas por <b>Bizum</b> con tu talla y dirección.</span></div>
        <div class="step"><span class="n">2</span><span>Hago el pedido al <b>proveedor</b> (${sup(items[0].supplier).name}...).</span></div>
        <div class="step"><span class="n">3</span><span>El proveedor envía <b>directo a tu casa</b> y te paso el tracking.</span></div>
        <div class="step"><span class="n">4</span><span>Incidencias: las hablo <b>yo con el proveedor</b> por ti.</span></div>
      </div>` : ""}`;

    $("#cartBackdrop").hidden = false;
    $$(".cr-x", $("#cartDrawer")).forEach(b => b.onclick = () => {
      STORE.cart.splice(Number(b.dataset.rm), 1);
      updateCart();
      openCart();
    });
    const pay = $("#payBtn");
    if (pay) pay.onclick = () => doPay();
  }

  function groupSummary(g, p) {
    return g.members.map(member => {
      const line = (member + ": " + p.title + " (" + fmt(p.price) + " + env\u00edo)");
      return line;
    }).join("\n");
  }

  function doPay() {
    const sub = STORE.cart.reduce((a, i) => a + i.unit, 0);
    const ship = groupedShip();
    const total = sub + ship;
    const supNames = [...new Set(STORE.cart.map(i => i.supplier))];
    const items = STORE.cart;
    const lines = items.map((i, idx) => `${idx + 1}. ${i.title} · ${sup(i.supplier).name}${i.size ? " · talla " + i.size : ""} · ${fmt(i.unit)}`).join("\n");
    const summary = `TOP VALOR - PEDIDO\n\n${lines}\n\nSubtotal: ${fmt(sub)}\nEnv\u00edo: ${fmt(ship)}\nTOTAL (IVA incl.): ${fmt(total)}\n\nMe pagas por Bizum ${BIZUM}\nGracias!`;

    $("#cartDrawer").innerHTML = `<h2 style="font-size:20px;margin-bottom:12px">Pedido listo · págame por Bizum</h2>
      <div class="cart-flow" id="flow">
        <div class="step"><span class="n">1</span><span>Mándame por Bizum <b>${fmt(total)}</b> a <b>${BIZUM}</b></span></div>
        <div class="step"><span class="n">2</span><span>En el mensaje escribe tu <b>dirección</b> y <b>talla</b> (${items.map(i => i.size).filter(Boolean).join(", ") || "seg\u00fan selecci\u00f3n"})</span></div>
        <div class="step"><span class="n">3</span><span>Hago el pedido a <b>${supNames.map(s => sup(s).name).join(", ")}</b> y te paso el <b>tracking</b></span></div>
        <div class="step"><span class="n">4</span><span>Envío directo a tu casa · si algo falla, lo arreglo <b>yo</b></span></div>
      </div>
      <textarea readonly onclick="this.select()" class="order-note" rows="6">${summary}</textarea>
      <p class="table-note">El resumen se copia solo al tocarlo. Pásalo a un amigo con Bizum y listo.</p>
      <button class="btn btn-green" id="copyBtn" style="width:100%;margin-top:10px">Copiar resumen</button>
      <button class="btn btn-ghost" id="doneBtn" style="width:100%;margin-top:8px">Cerrar</button>`;

    STORE.cart = [];
    updateCart();
    renderGrid(); renderDeals();
    $("#copyBtn").onclick = () => {
      const t = $("#cartDrawer textarea");
      t.select();
      try { document.execCommand("copy"); } catch (e) { }
      toast("Resumen copiado: p\u00e9gaselo a tu amigo.", true);
    };
    $("#doneBtn").onclick = () => { $("#cartBackdrop").hidden = true; };
  }

  function toast(msg, ok) {
    const t = $("#toast");
    t.textContent = msg;
    t.className = "toast" + (ok ? " ok" : "");
    t.hidden = false;
    clearTimeout(t._tm);
    t._tm = setTimeout(() => t.hidden = true, 3200);
  }

  $$("[data-close]").forEach(b => b.onclick = () => { $("#" + b.dataset.close).hidden = true; });
  $("#modalBackdrop").addEventListener("click", e => { if (e.target.id === "modalBackdrop") $("#modalBackdrop").hidden = true; });
  $("#cartBackdrop").addEventListener("click", e => { if (e.target.id === "cartBackdrop") $("#cartBackdrop").hidden = true; });
  $("#howBackdrop").addEventListener("click", e => { if (e.target.id === "howBackdrop") $("#howBackdrop").hidden = true; });
  $$("[data-open]").forEach(b => {
    if (b.dataset.open === "how") b.onclick = () => { $("#howBackdrop").hidden = false; };
    if (b.dataset.open === "cart") b.onclick = () => openCart();
  });
  $("#searchBox").addEventListener("input", e => { filters.q = e.target.value.trim(); renderGrid(); });
  $("#sortSelect").addEventListener("change", e => { sortBy = e.target.value; renderGrid(); });
  $("#brandSelect").addEventListener("change", e => { filters.brand = e.target.value || null; renderGrid(); });
  $("#sizeCmInput").addEventListener("input", e => {
    const v = parseFloat(e.target.value.replace(",", "."));
    filters.sizeCm = e.target.value.trim() === "" || isNaN(v) ? null : v;
    renderGrid();
  });

  $("#retiredBanner").hidden = true;

  function renderGroups() {
    const sel = $("#groupProduct"), sim = $("#simProduct");
    if (PRODUCTS.length === 0) {
      sel.innerHTML = `<option value="">(sin productos - añade alguno en el admin)</option>`;
      sim.innerHTML = ``;
      $("#createGroupBtn").disabled = true;
      $("#groupList").innerHTML = `<p style="color:var(--muted);font-size:13px">Primero añade un producto desde el panel de administración (link + Admin).</p>`;
      return;
    }
    $("#createGroupBtn").disabled = false;
    $("#createGroupBtn").onclick = () => {
      const pid = sel.value;
      const p = PRODUCTS.find(x => x.id === pid);
      if (!p) { toast("Primero elige un artículo para el grupo.", false); return; }
      const code = "GR-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      groups.push({ code, productId: pid, max: GROUP_MAX, min: GROUP_MIN, leader: "tú", members: ["tú"], deadline: Date.now() + 30 * MIN, closedAt: null });
      saveGroups();
      toast("Grupo " + code + " creado para " + p.title + ". Mínimo 2, máximo 5. Pásalo a amigos.", true);
      renderGroups();
    };
    const opts = PRODUCTS.map(p => `<option value="${p.id}">${p.title} (${fmt(p.price)})</option>`).join("");
    if (!sel._init) { sel.innerHTML = opts; sim.innerHTML = opts; sel._init = 1; }

    const pass = groupPassShare();
    const wrap = $("#groupList");
    const valid = groups.filter(g => PRODUCTS.some(x => x.id === g.productId));
    if (valid.length === 0) { wrap.innerHTML = `<p style="color:var(--muted);font-size:13px">Aún no hay grupos. Crea el primero a la izquierda.</p>`; return; }
    wrap.innerHTML = valid.map(g => {
      const p = PRODUCTS.find(x => x.id === g.productId);
      const st = groupStatus(g);
      const joined = g.members.includes("tú");
      const leader = g.leader === "tú";
      const tiers = tiersLabel(p, pass);
      let cta = "";
      if (st === "open") {
        if (joined) {
          cta = `<div style="margin-top:8px;font-size:12px;color:var(--green);font-weight:700">Estás dentro · lleváis ${g.members.length} de 5${leader ? " · eres el líder" : ""}</div>`;
          if (leader && g.members.length >= g.min)
            cta += `<button class="btn btn-primary" data-close-g="${g.code}" style="width:100%;margin-top:8px;font-size:13px">Cerrar con ${g.members.length} (descuento ya aplicado)</button>`;
          else if (g.members.length < g.min)
            cta += `<div style="font-size:11px;color:var(--muted);margin-top:6px">Mínimo ${g.min} para poder cerrar.</div>`;
        } else {
          cta = `<button class="btn btn-green" data-join="${g.code}" style="width:100%;margin-top:8px">Unirse (${g.members.length}/5)</button>`;
          cta += `<div style="font-size:11px;color:var(--muted);margin-top:6px">${tiers}</div>`;
        }
      } else if (st === "closed") {
        cta = `<div style="margin-top:8px;font-size:12px;color:var(--accent);font-weight:700">Cerrado con ${g.members.length} personas · precio de grupo aplicado</div>`;
      } else {
        cta = `<div style="margin-top:8px;font-size:12px;color:var(--accent2);font-weight:700">No se llegó al mínimo · nadie pagó</div>`;
      }
      const cd = st === "open" ? countdownHtml(g.deadline - Date.now()) : `<span class="countdown-live">${st === "closed" ? "cerrado" : "caducado"}</span>`;
      return `<div class="group-card">
        <div class="gc-head">
          <span class="gc-code">${g.code}</span>
          <span class="gc-status ${st}">${st}</span>
        </div>
        <div class="gc-prod">${p.title}</div>
        <div class="gc-avatars">Miembros: <b>${g.members.length}/5</b> · ${g.members.map((m, i) => `<span title="${m}" style="display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:hsla(${(i * 47) % 360},60%,50%,.5);font-size:10px">${m[0].toUpperCase()}</span>`).join(" ")}</div>
        <div style="margin-top:8px">${cd}</div>
        ${cta}
      </div>`;
    }).join("");

    $$("[data-join]", wrap).forEach(b => b.onclick = () => {
      const g = groups.find(x => x.code === b.dataset.join);
      if (!g || g.members.includes("tú")) return;
      g.members.push("tú");
      const st = groupStatus(g);
      saveGroups();
      toast(st === "closed" ? "Grupo completo: +descuento de grupo (" + g.members.length + " personas) aplicado" : "Unido al grupo " + g.code + " · lleváis " + g.members.length + "/5, cierra el líder", true);
      renderGroups();
      renderGrid(); renderDeals();
    });
    $$("[data-close-g]", wrap).forEach(b => b.onclick = () => {
      const g = groups.find(x => x.code === b.dataset.closeG);
      if (!g || g.closedAt) return;
      g.closedAt = Date.now();
      saveGroups();
      const m = groupMath(PRODUCTS.find(x => x.id === g.productId), groupPassShare(), g.members.length);
      toast("Grupo " + g.code + " cerrado con " + g.members.length + " personas · descuento −" + (m.discPct * 100).toFixed(1).replace(".", ",") + "% para cada miembro", true);
      renderGroups();
      renderGrid(); renderDeals();
    });
  }

  function renderSim() {
    const p = PRODUCTS.find(x => x.id === $("#simProduct").value);
    if (!p) { $("#simOut").innerHTML = `<p style="font-size:12px;color:var(--muted)">Elige un producto para ver la tabla de grupo.</p>`; return; }
    const pass = Number($("#simPass").value) / 100;
    const m = groupMath(p, pass, simN);
    $("#simPassVal").textContent = Math.round(pass * 100) + "%";
    $$(".seg").forEach(b => b.classList.toggle("active", Number(b.dataset.n) === simN));
    $("#simOut").innerHTML = `<p style="font-size:11px;color:var(--muted);margin-bottom:6px">Descuento según cuántos seáis: <b style="color:var(--text)">${tiersLabel(p, pass)}</b></p>
    <table class="sim-table">
      <tr><td>Individual (1 persona)</td><td class="r">${fmt(m.soloPrice)}</td></tr>
      <tr><td>Tu margen individual</td><td class="r">${fmt(m.soloMargin)}</td></tr>
      <tr><td>Grupo (${m.n} personas)</td><td class="r">${fmt(m.groupPrice)}</td></tr>
      <tr><td>Ahorro por persona (del proveedor)</td><td class="r">${fmt(m.savings)}</td></tr>
      <tr><td>Descuento para cada uno</td><td class="r">-${fmt(m.perPersonSave)} (${(m.discPct * 100).toFixed(1).replace(".", ",")}%)</td></tr>
      <tr class="total"><td>Tu margen en grupo (${m.n})</td><td class="r">${fmt(m.ourMarginGroup)}</td></tr>
    </table>
    <p style="font-size:11px;color:var(--muted);margin-top:8px">Tú mantienes tu margen normal y encima te quedas el ${Math.round((1 - pass) * 100)}% del ahorro por volumen. El resto baja el precio al grupo.</p>`;
  }

  function tick() {
    $$(".countdown[data-end]").forEach(el => {
      const ms = Number(el.dataset.end) - Date.now();
      if (ms <= 0) { el.innerHTML = `<span class="countdown-live">Finalizada</span>`; return; }
      const sec = Math.floor(ms / 1000);
      const m = Math.floor(sec / 60), s = sec % 60;
      const mb = el.querySelector("[data-u=m]");
      if (mb) { mb.textContent = String(m).padStart(2, "0"); el.querySelector("[data-u=s]").textContent = String(s).padStart(2, "0"); }
    });
    PRODUCTS.forEach(p => {
      if (p.deal === "pricedrop" && !ST[p.id].sold) {
        const s = ST[p.id];
        const steps = Math.floor((Date.now() - NOW) / (p.drop.everyMin * MIN));
        s.dropCur = Math.max(p.drop.floor, p.price - steps * p.drop.step);
      }
    });
  }

  setInterval(tick, 1000);
  tick();

  renderFilters();
  renderGrid();
  renderDeals();
  renderSupplierTable();
  renderGroups();
  renderSim();
  $("#simPass").addEventListener("input", renderSim);
  $("#simProduct").addEventListener("change", renderSim);
  $$(".seg").forEach(b => b.onclick = () => { simN = Number(b.dataset.n); renderSim(); });
  updateCart();

  function initProductState(p) {
    if (ST[p.id]) return;
    const s = { sold: 0, earlySold: 0, size: null };
    if (p.deal === "flash") s.flashExpires = NOW + (p.flash ? p.flash.minutes : 5) * MIN;
    if (p.deal === "pricedrop") s.dropCur = p.price;
    if (p.deal === "pool") {
      s.poolNow = p.pool ? p.pool.now || 0 : 0;
      s.poolUnlocked = p.pool ? s.poolNow >= p.pool.target : false;
    }
    if (p.deal === "fastpay") s.fastStart = 0;
    if (p.deal === "auction") { s.bidCur = p.auc ? p.auc.start : 0; s.bidEnd = NOW + (p.auc ? p.auc.mins : 10) * MIN; s.bidder = null; }
    ST[p.id] = s;
  }

  fetch("data/productos.json")
    .then(r => { if (!r.ok) throw 0; return r.json(); })
    .catch(() => [])
    .then(arr => {
      if (!Array.isArray(arr) || !arr.length) return;
      const known = new Set(PRODUCTS.map(p => p.id));
      let changed = false;
      arr.forEach(p => {
        if (!p || !p.id || known.has(p.id)) return;
        p.mono = p.mono || (p.title || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        p.grad = p.grad || ["#1e293b", "#0f172a"];
        p.fit = p.fit || "none";
        p.complaints = p.complaints || 0;
        p.rating = p.rating || 4.8;
        p.reviews = p.reviews || 0;
        PRODUCTS.push(p);
        initProductState(p);
        changed = true;
      });
      if (changed) { renderFilters(); renderGrid(); renderDeals(); renderSupplierTable(); }
    });
})();