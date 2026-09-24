(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const fmt = n => (isNaN(n) ? "0,00" : n.toFixed(2).replace(".", ",")) + " €";
  const normPath = s => (s || "").trim().replace(/\\/g, "/");

  const SUPPLIERS = [
    { id: "kakobuy",  name: "Kakobuy",  fee: "0%",    qc: "Excelente · QC 5-8 fotos", eta: "8-18 d", base: 5.20, perKg: 11.80, color: "#5b8def" },
    { id: "hipobuy",  name: "Hipobuy",  fee: "5-8%",  qc: "12 fotos QC gratis",       eta: "7-15 d", base: 5.40, perKg: 12.00, color: "#e25b5b" },
    { id: "acbuy",    name: "ACBuy",    fee: "~5%",   qc: "5 fotos HD",               eta: "8-18 d", base: 5.20, perKg: 11.90, color: "#3fa36b" },
    { id: "superbuy", name: "Superbuy", fee: "5-10%", qc: "Mejor QC del mercado",     eta: "7-20 d", base: 5.80, perKg: 12.50, color: "#8a6ae0" },
    { id: "cnfans",   name: "CNFans",   fee: "~5%",   qc: "QC bueno",                 eta: "8-15 d", base: 5.00, perKg: 11.70, color: "#d99a2b" },
    { id: "sugargoo", name: "Sugargoo", fee: "~5%",   qc: "QC bueno",                 eta: "8-18 d", base: 5.20, perKg: 11.60, color: "#2a9d8f" },
    { id: "oopbuy",   name: "Oopbuy",   fee: "0%",    qc: "QC muy bueno",             eta: "10-20 d",base: 4.80, perKg: 11.40, color: "#4c6a92" },
    { id: "cssbuy",   name: "CSSBuy",   fee: "4%",    qc: "QC bueno",                 eta: "9-25 d", base: 4.80, perKg: 11.30, color: "#9b6a3c" },
  ];

  const ADMIN_PW_OK_KEY = "tv_admin_ok";
  const PRODUCTS_KEY = "tv_custom_products";

  let custom = [];
  try { custom = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]"); } catch (e) { custom = []; }
  let editingId = null;
  let selectedSup = localStorage.getItem("tv_last_sup") || SUPPLIERS[0].id;
  let sizes = [];
  let colors = [];

  // ---------- LOGIN ----------
  function tryLogin() {
    const pw = $("#pwInput").value;
    if (pw === "topvalor2026") {
      localStorage.setItem(ADMIN_PW_OK_KEY, "1");
      showAdmin();
    } else {
      $("#loginErr").textContent = "Contraseña incorrecta.";
    }
  }
  $("#loginBtn").onclick = tryLogin;
  $("#pwInput").addEventListener("keydown", e => { if (e.key === "Enter") tryLogin(); });

  function showAdmin() {
    $("#loginView").classList.add("hidden");
    $("#adminView").classList.remove("hidden");
    renderSups();
    renderSizes();
    renderList();
    renderStats();
  }
  if (localStorage.getItem(ADMIN_PW_OK_KEY)) showAdmin();

  // ---------- PRICE CALCULATOR ----------
  function defaultGramsForCat(c) {
    return ({ shoes: 1000, top: 350, bottom: 700, outer: 900, acc: 250 })[c] || 500;
  }

  function calc() {
    const cost = parseFloat($("#fCost").value.replace(",", ".")) || 0;
    const margin = parseFloat($("#fMargin").value.replace(",", ".")) || 0;
    const ship = parseFloat($("#fShip").value.replace(",", ".")) || 0;

    const sub = cost * (1 + margin / 100);       // coste + margen
    const iva = sub * 0.21;
    const total = sub + iva;                      // precio al cliente con IVA
    const grand = total + ship;                   // total con envío

    const grams = parseInt($("#fWeight").value) || defaultGramsForCat($("#fCat").value);
    const s = SUPPLIERS.find(x => x.id === selectedSup);
    const estShip = s ? s.base + s.perKg * (grams / 1000) : 0;

    $("#calcCost").textContent = fmt(cost);
    $("#calcMargin").textContent = fmt(sub - cost);
    $("#calcSub").textContent = fmt(sub);
    $("#calcIva").textContent = fmt(iva);
    $("#calcTotal").textContent = fmt(total);
    $("#calcShip").textContent = fmt(ship);
    $("#calcShipEst").textContent = fmt(estShip) + " (" + s.name + " · " + grams + " g)";
    $("#calcGrand").textContent = fmt(grand);
  }
  ["fCost", "fMargin", "fShip", "fWeight"].forEach(id => $("." + id) && ($("#" + id).addEventListener("input", calc)));
  $("#fCat").addEventListener("change", () => {
    if (!parseInt($("#fWeight").value)) $("#fWeight").value = defaultGramsForCat($("#fCat").value);
    calc();
  });

  // ---------- SUPPLIER CHIPS ----------
  function renderSups() {
    const wrap = $("#fSupChips");
    wrap.innerHTML = SUPPLIERS.map(s =>
      `<span class="sup-chip ${selectedSup === s.id ? "active" : ""}" data-sup="${s.id}" style="border-color:${s.color}">${s.name}</span>`
    ).join("");
    $$(".sup-chip", wrap).forEach(c => c.onclick = () => {
      selectedSup = c.dataset.sup;
      localStorage.setItem("tv_last_sup", selectedSup);
      renderSups();
    });
  }

  // ---------- SIZES ----------
  function renderSizes() {
    const wrap = $("#sizeTags");
    if (!sizes.length) { wrap.innerHTML = `<span style="font-size:12px;color:var(--muted)">Sin tallas. Añade las que tenga (ej. 42, M, 27,5cm).</span>`; return; }
    wrap.innerHTML = sizes.map((s, i) => `<span class="size-tag">${s} <button data-rm="${i}">&times;</button></span>`).join("");
    $$("[data-rm]", wrap).forEach(b => b.onclick = () => { sizes.splice(Number(b.dataset.rm), 1); renderSizes(); });
  }
  $("#addSizeBtn").onclick = () => {
    const v = $("#fSizeInput").value.trim();
    if (!v) return;
    if (!sizes.includes(v)) sizes.push(v);
    $("#fSizeInput").value = "";
    renderSizes();
  };
  $("#fSizeInput").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("#addSizeBtn").click(); } });

  // ---------- DEAL FIELDS ----------
  $("#fDeal").addEventListener("change", e => {
    $("#flashFields").style.display = e.target.value === "flash" ? "block" : "none";
  });

  $$('input[name="sizeMode"]').forEach(r => r.addEventListener("change", () => {
    $("#manualSizes").style.display = r.value === "manual" ? "block" : "none";
  }));

  // ---------- IMAGE ----------
  async function fetchImage(url) {
    try {
      const res = await fetch(url, { mode: "cors" });
      const blob = await res.blob();
      return new Promise((ok, no) => {
        const r = new FileReader();
        r.onload = () => ok(r.result);
        r.onerror = no;
        r.readAsDataURL(blob);
      });
    } catch (e) {
      return url;
    }
  }
  $("#fImgUrl").addEventListener("input", e => {
    const url = e.target.value.trim();
    const img = $("#fImgPreview");
    if (url) {
      img.src = url;
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }
  });
  $("#dlImgBtn").onclick = async () => {
    const url = $("#fImgUrl").value.trim();
    if (!url) { $("#formStatus").textContent = "Pega primero la URL de la imagen."; return; }
    $("#dlImgBtn").textContent = "Descargando...";
    const data = await fetchImage(url);
    $("#dlImgBtn").textContent = "Descargar";
    $("#fImgUrl").value = data;
    $("#fImgPreview").src = data;
    $("#fImgPreview").style.display = "block";
    $("#formStatus").textContent = "Imagen descargada y guardada en el producto.";
  };

  $("#fImgFile").addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      $("#fImgUrl").value = r.result;
      $("#fImgPreview").src = r.result;
      $("#fImgPreview").style.display = "block";
      $("#formStatus").textContent = "Imagen cargada desde el archivo (" + Math.round(f.size / 1024) + " KB).";
    };
    r.readAsDataURL(f);
    e.target.value = "";
  });

  // ---------- COLORS ----------
  function renderColors() {
    const wrap = $("#colorTags");
    if (!colors.length) { wrap.innerHTML = `<span style="font-size:12px;color:var(--muted)">Sin fotos extra. El producto mostrará solo una imagen.</span>`; return; }
    wrap.innerHTML = colors.map((c, i) =>
      `<span class="color-tag" title="Haz clic en el color para usarlo como imagen del producto. Ruta: ${c.img}" style="cursor:pointer"><img src="${c.img}" onerror="this.style.display='none'"><span>${c.label || "Foto " + (i + 1)}</span><button data-rm="${i}" title="Quitar este color">&times;</button></span>`
    ).join("");
    $$("[data-rm]", wrap).forEach(b => b.onclick = (e) => { e.stopPropagation(); colors.splice(Number(b.dataset.rm), 1); renderColors(); });
    $$(".color-tag", wrap).forEach(t => t.onclick = () => {
      const img = colors.find(c => c.img === t.querySelector("img").src.split("/").pop());
      const pth = colors[$$(".color-tag", wrap).indexOf(t)].img;
      $("#fImgUrl").value = pth;
      $("#fImgPreview").src = pth;
      $("#fImgPreview").style.display = "block";
      $("#formStatus").textContent = "Imagen del producto = " + pth;
    });
  }
  function addColor(label, img) {
    if (!img) return;
    colors.push({ label: (label || "").trim() || ("Foto " + (colors.length + 1)), img });
    renderColors();
  }
  $("#addColorBtn").onclick = () => {
    const img = $("#fColorImg").value.trim();
    if (!img) { $("#formStatus").textContent = "Pega primero la URL de la foto del color."; return; }
    addColor($("#fColorNum").value, img);
    $("#fColorNum").value = "";
    $("#fColorImg").value = "";
    $("#formStatus").textContent = "";
  };
  $("#fColorImg").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); $("#addColorBtn").click(); } });
  $("#fColorFile").addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      addColor($("#fColorNum").value, r.result);
      $("#fColorNum").value = "";
      $("#formStatus").textContent = "Foto de color añadida desde el archivo (" + Math.round(f.size / 1024) + " KB). Ojo: incrustar muchas fotos pesa mucho; prefiere URLs.";
    };
    r.readAsDataURL(f);
    e.target.value = "";
  });

  // ---------- SAVE / EDIT ----------
  const fitByCat = cat => (
    cat === "shoes" ? "shoe" :
    cat === "bottom" ? "bottom" :
    (cat === "top" || cat === "outer") ? "top" : "none"
  );

  function sizeMode() {
    const el = document.querySelector('input[name="sizeMode"]:checked');
    return el ? el.value : "auto";
  }

  function currentProduct() {
    const cost = parseFloat($("#fCost").value.replace(",", ".")) || 0;
    const margin = parseFloat($("#fMargin").value.replace(",", ".")) || 0;
    const ship = parseFloat($("#fShip").value.replace(",", ".")) || 0;
    const price = cost * (1 + margin / 100) * 1.21;
    const deal = $("#fDeal").value;
    const cat = $("#fCat").value;
    const manual = sizeMode() === "manual";

    const p = {
      id: editingId || ("c" + Date.now().toString(36)),
      title: $("#fName").value.trim(),
      brand: $("#fBrand").value.trim(),
      cat,
      supplierId: selectedSup,
      rating: 4.8,
      reviews: 0,
      price: Math.round(price * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      orig: null,
      grams: parseInt($("#fWeight").value) || defaultGramsForCat($("#fCat").value),
      mono: $("#fName").value.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "TV",
      grad: ["#1e293b", "#0f172a"],
      deal,
      complaints: 0,
      fit: manual ? "custom" : fitByCat(cat),
      subcat: $("#fSubcat").value || undefined,
      note: $("#fNote").value.trim(),
      sizes: manual ? sizes.slice() : undefined,
      imgData: normPath($("#fImgUrl").value) || null,
      colors: colors.length ? colors.map(c => ({ label: c.label, img: normPath(c.img) })) : undefined,
      shipOverride: ship || null,
      supLink: $("#fSupLink").value.trim() || null,
      isCustom: true,
      dateAdded: Date.now()
    };
    if (deal === "flash") p.flash = { total: parseInt($("#fFlashQty").value) || 3, minutes: parseInt($("#fFlashMin").value) || 5 };
    return p;
  }

  $("#saveBtn").onclick = () => {
    const name = $("#fName").value.trim();
    if (!name) { $("#formStatus").textContent = "Escribe el nombre del producto."; return; }
    const img = normPath($("#fImgUrl").value).trim();
    if (!img) {
      $("#formStatus").textContent = "Falta la imagen del producto. Pulsa «Subir fotos al repo» o haz clic en un color para usarlo como imagen.";
      return;
    }
    const p = currentProduct();

    if (editingId) {
      const i = custom.findIndex(x => x.id === editingId);
      if (i >= 0) custom[i] = p;
    } else {
      custom.push(p);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(custom));
    resetForm();
    renderList();
    renderStats();
    $("#formStatus").textContent = "Producto publicado en tu app. Recuerda exportar JSON para subirlo a la web.";
  };

  $("#cancelBtn").onclick = resetForm;

  function resetForm() {
    editingId = null;
    sizes = [];
    colors = [];
    ["fName", "fBrand", "fNote", "fImgUrl", "fCost", "fShip", "fSupLink", "fSubcat"].forEach(id => $("#" + id).value = "");
    $("#fMargin").value = "15";
    $("#fDeal").value = "none";
    $("#fCat").value = "shoes";
    $("#fWeight").value = defaultGramsForCat("shoes");
    $("#fImgPreview").style.display = "none";
    $("#formTitle").textContent = "Nuevo producto";
    $("#saveBtn").textContent = "Publicar producto";
    $("#formStatus").textContent = "";
    $("#flashFields").style.display = "none";
    document.querySelector('input[name="sizeMode"][value="auto"]').checked = true;
    $("#manualSizes").style.display = "none";
    $("#fColorNum").value = "";
    $("#fColorImg").value = "";
    renderColors();
    renderSizes();
    calc();
  }

  function fillForm(p) {
    editingId = p.id;
    $("#formTitle").textContent = "Editar: " + p.title;
    $("#saveBtn").textContent = "Guardar cambios";
    $("#fName").value = p.title;
    $("#fBrand").value = p.brand || "";
    $("#fCat").value = p.cat || "shoes";
    $("#fSubcat").value = p.subcat || "";
    $("#fNote").value = p.note || "";
    $("#fSupLink").value = p.supLink || "";
    $("#fCost").value = (p.cost != null ? p.cost : (p.price ? (p.price / 1.21 / 1.15) : 0)).toFixed(2);
    $("#fMargin").value = "15";
    $("#fShip").value = p.shipOverride == null ? "" : p.shipOverride;
    $("#fWeight").value = p.grams || defaultGramsForCat($("#fCat").value);
    selectedSup = p.supplierId;
    renderSups();
    const manual = p.fit === "custom";
    document.querySelector('input[name="sizeMode"' + (manual ? '][value="manual"' : '][value="auto"') + ']').checked = true;
    $("#manualSizes").style.display = manual ? "block" : "none";
    sizes = (p.sizes || []).slice();
    renderSizes();
    colors = (p.colors || []).map(c => ({ label: c.label || c.name || "", img: c.img || "" }));
    renderColors();
    $("#fDeal").value = p.deal || "none";
    if (p.flash) {
      $("#flashFields").style.display = "block";
      $("#fFlashQty").value = p.flash.total;
      $("#fFlashMin").value = p.flash.minutes;
    }
    if (p.imgData) { $("#fImgUrl").value = p.imgData; $("#fImgPreview").src = p.imgData; $("#fImgPreview").style.display = "block"; }
    calc();
    $("#formCard").scrollIntoView({ behavior: "smooth" });
  }

  function removeProduct(id) {
    if (!confirm("¿Seguro que quieres quitar este producto?")) return;
    custom = custom.filter(x => x.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(custom));
    renderList();
    renderStats();
  }

  // ---------- LIST ----------
  function renderList() {
    $("#prodCount").textContent = custom.length;
    const wrap = $("#prodList");
    if (!custom.length) { wrap.innerHTML = `<p style="color:var(--muted);font-size:13px">Aún no hay productos personalizados. Crea el primero arriba.</p>`; return; }
    wrap.innerHTML = custom.map(p => `
      <div class="prod-item">
        ${p.imgData ? `<img class="pi-img" src="${p.imgData}">` : `<div class="pi-img" style="display:grid;place-items:center;font-weight:800;color:var(--muted)">${p.mono}</div>`}
        <div class="pi-info">
          <b>${p.title}</b>
          <span style="color:var(--muted)">${p.brand}${p.subcat ? " · " + (SUBCATS.find(s => s.id === p.subcat) || { label: p.subcat }).label : ""} · ${sup(p.supplierId).name} · ${fmt(p.price)}${p.price ? "" : ""} · ${p.deal !== "none" ? p.deal.toUpperCase() : "Normal"} · ${p.colors && p.colors.length ? p.colors.length + " colores/fotos" : "1 imagen"}</span>
          ${p.supLink ? `<a href="${p.supLink}" target="_blank" rel="noopener" style="font-size:11px;color:var(--accent);word-break:break-all">Abrir enlace en ${sup(p.supplierId).name}</a>` : `<span style="font-size:11px;color:var(--muted)">Sin enlace del proveedor</span>`}
        </div>
        <div class="pi-actions">
          <button data-edit="${p.id}">Editar</button>
          <button class="del" data-del="${p.id}">Quitar</button>
        </div>
      </div>`).join("");
    $$("[data-edit]", wrap).forEach(b => b.onclick = () => fillForm(custom.find(x => x.id === b.dataset.edit)));
    $$("[data-del]", wrap).forEach(b => b.onclick = () => removeProduct(b.dataset.del));
  }

  function sup(id) { return SUPPLIERS.find(s => s.id === id); }

  // ---------- STATS ----------
  function renderStats() {
    const totalProducts = PRODUCTS.length + custom.length;
    let marginTotal = 0;
    custom.forEach(p => {
      const cost = p.price / 1.21 / 1.15;
      marginTotal += cost * 0.15;
    });
    $("#statsBox").innerHTML = `
      <div>Productos en catálogo: <b>${totalProducts}</b> (${PRODUCTS.length} base + ${custom.length} tuyos)</div>
      <div>Margen estimado de los tuyos: <b>${fmt(marginTotal)}</b> por venta completa del stock</div>
      <div>Proveedores: <b>${SUPPLIERS.length}</b></div>`;
  }

  // ---------- EXPORT / IMPORT / PUBLISH ----------
  const GH_KEY = "tv_gh_pub";
  function ghLoad() {
    try { return JSON.parse(localStorage.getItem(GH_KEY) || "{}"); } catch (e) { return {}; }
  }
  function ghSave() {
    localStorage.setItem(GH_KEY, JSON.stringify({ token: $("#ghToken").value.trim(), user: $("#ghUser").value.trim(), repo: $("#ghRepo").value.trim() }));
  }
  (() => { const g = ghLoad(); if (g.token) $("#ghToken").value = g.token; if (g.user) $("#ghUser").value = g.user; if (g.repo) $("#ghRepo").value = g.repo; })();

  function currentJson() { return JSON.stringify(custom, null, 2); }

  $("#exportBtn").onclick = () => {
    const blob = new Blob([currentJson()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "productos.json";
    a.click();
    URL.revokeObjectURL(a.href);
    $("#exportStatus").textContent = "Descargado: productos.json. Guárdalo como data/productos.json o usa «Publicar en GitHub ahora».";
  };

  $("#publishBtn").onclick = async () => {
    ghSave();
    const token = $("#ghToken").value.trim(), user = $("#ghUser").value.trim(), repo = $("#ghRepo").value.trim();
    if (!token || !user || !repo) { $("#exportStatus").textContent = "Faltan token, usuario o repo."; return; }
    const st = $("#exportStatus");

    // --- Protección 1: fotos incrustadas (base64) hinchan el catálogo ---
    const emb = custom.filter(p => JSON.stringify(p).toLowerCase().includes("data:image"));
    if (emb.length) {
      st.textContent = "Bloqueado: " + emb.length + " producto(s) tienen la foto incrustada en el JSON (data:image): «" + emb.map(p => p.title).join("», «") + "». Eso engorda el catálogo. Pon la foto como archivo en tienda/imagenes/... y usa la ruta relativa (ej. imagenes/zapatillas/Nike/...) en «Imagen del producto», o pulsa «Sincronizar con repo» para traer la lista limpia.";
      return;
    }
    const kb = Math.round(new Blob([currentJson()]).size / 1024);
    if (kb > 300) {
      st.textContent = "Bloqueado: el catálogo pesa " + kb + " KB. Suele ser por fotos incrustadas o imágenes gigantes. Usa rutas relativas a archivos del repo para mantenerlo ligero (el actual pesa 5 KB).";
      return;
    }

    // --- Protección 2: rutas de imagen mal escritas (barras invertidas o sin extensión) ---
    const badPaths = [];
    custom.forEach(p => {
      const check = t => { if (t && !/data:image/.test(t)) { if (t.includes("\\")) badPaths.push(t); const ext = (t.split("?")[0].match(/\.[a-z0-9]{2,4}$/i) || [null])[0]; if (t.startsWith("imagenes") && !ext) badPaths.push(t); } };
      check(p.imgData);
      (p.colors || []).forEach(c => check(c.img));
    });
    if (badPaths.length) {
      st.textContent = "Bloqueado: hay rutas de imagen mal escritas (barras invertidas \\ o falta extensión .jpg/.png):\n• " + badPaths.slice(0, 5).map(t => t.replace(/\\/g, "/")).join("\n• ") + "\n\nCorrige «Imagen del producto» y los colores para que usen / y acaben en .jpg/.png, o pulsa «Sincronizar con repo» y vuelve a publicar.";
      return;
    }

    const api = `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/contents/data/productos.json`;
    const hdr = { "Authorization": "token " + token, "Accept": "application/vnd.github.v3+json" };
    const readRemote = async () => {
      const r = await fetch(api, { headers: hdr, cache: "no-store" });
      if (!r.ok) return { sha: null, published: [] };
      const j = await r.json();
      let published = [];
      try { published = JSON.parse(decodeURIComponent(escape(atob(j.content)))); } catch (e) { published = []; }
      return { sha: j.sha, published };
    };
    const buildBody = sha => {
      const body = { message: "Publicar catalogo desde panel admin", content: btoa(unescape(encodeURIComponent(currentJson()))), branch: "main" };
      if (sha) body.sha = sha;
      return JSON.stringify(body);
    };
    const putRemote = sha => fetch(api, { method: "PUT", headers: hdr, body: buildBody(sha), cache: "no-store" });
    try {
      // --- Protección 3: no eliminar por accidente productos ya publicados ---
      const remote = await readRemote();
      const published = remote.published || [];
      const removed = Array.isArray(published) ? published.filter(p => p && p.id && !custom.some(c => c.id === p.id)).map(p => p.title || p.id) : [];
      if (removed.length) {
        const ok = confirm("⚠️ Al publicar se quitarán del catálogo publicado " + removed.length + " producto(s) que NO están en tu lista actual:\n\n• " + removed.slice(0, 10).join("\n• ") + (removed.length > 10 ? "\n… y " + (removed.length - 10) + " más" : "") + "\n\nEsto ocurre si tu lista del navegador no los incluye.\n¿Continuar de todas formas?");
        if (!ok) { st.textContent = "Publicación cancelada (se protege el catálogo publicado)."; return; }
      }

      let res = await putRemote(remote.sha);
      if (res.status === 409) {
        st.textContent = "El catálogo cambió en el repo. Reintentando con el sha actualizado...";
        const again = await readRemote();
        res = await putRemote(again.sha);
      }
      if (!res.ok) {
        const txt = await res.text();
        st.textContent = (res.status === 404)
          ? "Error 404: el usuario/repo no existe o el token no tiene acceso. Comprueba que Usuario sea Miguelgc71 y Repo topvalor (los he puesto por defecto), y pega el token ghp_... con permiso repo."
          : `Error ${res.status}: comprueba token (permiso repo) o red. ` + txt;
        return;
      }
      st.textContent = "Publicado (" + custom.length + " producto(s) + IVA). Espera ~30 s y recarga la web con Ctrl+F5.";
    } catch (err) {
      st.textContent = "Fallo de red: " + err.message;
    }
  };

  $("#importBtn").onclick = () => $("#importFile").click();
  $("#importFile").addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!Array.isArray(data)) throw 0;
        const merged = custom.filter(x => !data.some(d => d.id === x.id)).concat(data.filter(x => x && x.id));
        custom = merged;
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(custom));
        renderList();
        renderStats();
        $("#exportStatus").textContent = "Importados " + data.length + " productos de " + f.name;
      } catch (err) {
        $("#exportStatus").textContent = "El archivo no es válido.";
      }
    };
    r.readAsText(f);
    e.target.value = "";
  });

  $("#syncBtn").onclick = async () => {
    const st = $("#exportStatus");
    st.textContent = "Sincronizando...";
    try {
      const res = await fetch("data/productos.json", { cache: "no-store" });
      if (!res.ok) throw 0;
      const data = await res.json();
      if (!Array.isArray(data)) throw 0;
      const merged = custom.filter(x => !data.some(d => d && d.id && d.id === x.id)).concat(data.filter(x => x && x.id));
      custom = merged;
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(custom));
      renderList();
      renderStats();
      st.textContent = "Lista sincronizada con el repo (" + data.length + " productos). Tienes " + custom.length + " en total: los del repo + tus borradores nuevos conservados.";
    } catch (err) {
      st.textContent = "No se pudo leer data/productos.json (¿estás en local con file://? Usa el botón «Importar JSON» con el archivo).";
    }
  };

  // ---------- REVISAR PRECIOS ----------
  const MARGIN_PCT = 15, IVA = 1.21;
  const costOf = p => (p.cost != null ? Number(p.cost) || 0 : (p.price ? p.price / IVA / (1 + MARGIN_PCT / 100) : 0));
  const saleFromCost = c => Math.round(c * (1 + MARGIN_PCT / 100) * IVA * 100) / 100;

  function renderCheck() {
    const area = $("#checkArea");
    $("#checkSaveBtn").style.display = "inline-block";
    $("#checkPubBtn").style.display = "inline-block";
    if (!custom.length) {
      area.innerHTML = `<p style="color:var(--muted);font-size:13px">No hay productos que revisar.</p>`;
      return;
    }
    area.innerHTML = `<div style="overflow-x:auto"><table class="price-table">
      <thead><tr><th>Producto</th><th>Coste actual</th><th>Coste nuevo</th><th>Precio venta</th><th>Proveedor</th><th>Estado</th></tr></thead>
      <tbody>` + custom.map(p => {
        const c = costOf(p);
        return `<tr>
          <td><b>${p.title}</b><br><span style="color:var(--muted)">${p.brand || ""}</span></td>
          <td style="white-space:nowrap">${fmt(c)}</td>
          <td><input type="number" step="0.01" min="0" value="${c ? c.toFixed(2) : ""}" data-cost="${p.id}"></td>
          <td class="sale" data-sale="${p.id}">${fmt(saleFromCost(c))}</td>
          <td>${p.supLink ? `<a href="${p.supLink}" target="_blank" rel="noopener" style="color:var(--accent);white-space:nowrap">Abrir en ${sup(p.supplierId).name}</a>` : `<span style="color:var(--muted)">Sin enlace</span>`}</td>
          <td class="st-same" data-st="${p.id}">Igual</td>
        </tr>`;
      }).join("") + `</tbody></table></div>`;
    $$("[data-cost]", area).forEach(inp => {
      inp.addEventListener("input", () => {
        const id = inp.dataset.cost;
        const p = custom.find(x => x.id === id);
        const val = parseFloat(inp.value.replace(",", "."));
        const newCost = isNaN(val) ? 0 : val;
        $("[data-sale='" + id + "']").textContent = fmt(saleFromCost(newCost));
        const st = $("[data-st='" + id + "']");
        const changed = Math.abs(newCost - costOf(p)) > 0.005;
        st.textContent = changed ? "Cambiado" : "Igual";
        st.className = changed ? "st-changed" : "st-same";
      });
    });
  }

  $("#checkBtn").onclick = () => {
    renderCheck();
    $("#checkStatus").textContent = custom.length + " producto(s). Revisa el coste y pulsa «Guardar cambios».";
  };

  $("#checkSaveBtn").onclick = () => {
    let n = 0;
    $$("[data-cost]").forEach(inp => {
      const id = inp.dataset.cost;
      const p = custom.find(x => x.id === id);
      if (!p) return;
      const val = parseFloat(inp.value.replace(",", "."));
      if (isNaN(val)) return;
      const old = costOf(p);
      if (Math.abs(val - old) > 0.005) {
        p.cost = Math.round(val * 100) / 100;
        p.price = saleFromCost(val);
        n++;
      } else if (p.cost == null) {
        p.cost = Math.round(old * 100) / 100;
      }
    });
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(custom));
    renderList();
    renderStats();
    renderCheck();
    $("#checkStatus").textContent = n ? ("Actualizados " + n + " producto(s). Ahora pulsa «Publicar en GitHub».") : "No había cambios de coste.";
  };

  $("#checkPubBtn").onclick = () => $("#publishBtn").click();

  // ---------- SUBIR FOTOS AL REPO ----------
  $("#upBtn").onclick = async () => {
    const st = $("#upStatus");
    const token = $("#ghToken").value.trim(), user = $("#ghUser").value.trim(), repo = $("#ghRepo").value.trim();
    let folder = $("#upFolder").value.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
    const imgPos = folder.toLowerCase().indexOf("imagenes/");
    if (imgPos >= 0) folder = folder.slice(imgPos);
    if (/^[A-Za-z]:\//.test(folder)) {
      st.textContent = "Pegaste una ruta absoluta. Usa la ruta relativa al repo, ej. imagenes/zapatillas/Marca/Modelo (debe contener «imagenes/»).";
      return;
    }
    const files = Array.from(($("#upFiles").files) || []);
    if (!token || !user || !repo) { st.textContent = "Faltan token, usuario o repo (en la tarjeta de arriba)."; return; }
    if (!folder) { st.textContent = "Escribe la carpeta destino, ej. imagenes/zapatillas/Marca/Modelo"; return; }
    if (!files.length) { st.textContent = "Selecciona al menos una foto."; return; }
    ghSave();
    const apiBase = "https://api.github.com/repos/" + encodeURIComponent(user) + "/" + encodeURIComponent(repo) + "/contents/";
    const hdr = { "Authorization": "token " + token, "Accept": "application/vnd.github.v3+json" };
    const encPath = p => p.split("/").map(encodeURIComponent).join("/");
    const readB64 = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1] || ""); r.onerror = no; r.readAsDataURL(f); });
    const getSha = async path => {
      try {
        const r = await fetch(apiBase + encPath(path), { headers: hdr, cache: "no-store" });
        if (r.ok) { const j = await r.json(); return j.sha || null; }
      } catch (e) {}
      return null;
    };
    const putFile = async (path, b64) => {
      let sha = await getSha(path);
      const body = { message: "Subir foto: " + path, content: b64, branch: "main" };
      if (sha) body.sha = sha;
      let res = await fetch(apiBase + encPath(path), { method: "PUT", headers: hdr, body: JSON.stringify(body), cache: "no-store" });
      if (res.status === 409 || res.status === 422) {
        sha = await getSha(path);
        if (sha) { body.sha = sha; res = await fetch(apiBase + encPath(path), { method: "PUT", headers: hdr, body: JSON.stringify(body), cache: "no-store" }); }
      }
      return res;
    };
    let done = 0, fail = 0;
    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const name = f.name.replace(/\s+/g, "_");
      st.textContent = "Subiendo " + (i + 1) + "/" + files.length + ": " + name + "...";
      try {
        const b64 = await readB64(f);
        const res = await putFile(folder + "/" + name, b64);
        if (res.ok) { done++; uploaded.push(folder + "/" + name); }
        else { fail++; if (res.status === 404) { st.textContent = "Error 404: usuario/repo o token incorrecto."; return; } }
      } catch (e) { fail++; }
    }
    if (uploaded.length) {
      uploaded.forEach(pth => {
        const base = pth.split("/").pop().replace(/\.[^.]+$/, "");
        const num = (base.match(/\d+/) || [base])[0];
        if (!colors.some(c => c.img === pth)) colors.push({ label: num, img: pth });
      });
      renderColors();
      if (!$("#fImgUrl").value.trim()) {
        $("#fImgUrl").value = uploaded[0];
        $("#fImgPreview").src = uploaded[0];
        $("#fImgPreview").style.display = "block";
      }
    }
    st.textContent = "Fotos subidas: " + done + (fail ? " · con error: " + fail : "") + ". Añadidas como colores del producto. Revisa el formulario y pulsa «Publicar producto» y luego «Publicar en GitHub ahora». Espera ~1 min y recarga con Ctrl+F5.";
  };

  // ---------- PEDIDOS DE CLIENTES ----------
  const ORDERS_KEY = "tv_orders";
  let orders = [];
  try { orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]"); } catch (e) { orders = []; }
  let pubs = [];
  const ORDER_STATES = [
    { id: "recibido", label: "Recibido" },
    { id: "encargado", label: "Encargado" },
    { id: "pagado", label: "Pagado al proveedor" },
    { id: "tracking", label: "Tracking enviado" },
    { id: "entregado", label: "Entregado" }
  ];

  function ordEsc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function ordMon(s) {
    if (s == null || s === "") return null;
    let x = String(s).trim().replace(/\s/g, "");
    if (!/^[\d.,\-]+$/.test(x)) return null;
    if (x.includes(",") && x.includes(".")) x = x.replace(/\./g, "").replace(",", ".");
    else if (x.includes(",")) x = x.replace(",", ".");
    const n = parseFloat(x);
    return isNaN(n) ? null : n;
  }
  function ordNorm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
  }
  function ordFind(title, unit, modelo) {
    const t = ordNorm(title);
    const mm = modelo ? ordNorm(modelo) : "";
    const pool = [];
    const seen = {};
    for (const c of custom) if (c && !seen[c.id]) { seen[c.id] = 1; pool.push(c); }
    for (const p of pubs) if (p && !seen[p.id]) { seen[p.id] = 1; pool.push(p); }
    let cands = pool.filter(p => p && ordNorm(p.title) === t);
    if (!cands.length) cands = pool.filter(p => p && (ordNorm(p.title).includes(t) || t.includes(ordNorm(p.title))));
    if (!cands.length) cands = pool.slice();
    if (mm && cands.length > 1) {
      const byModel = cands.filter(p => (p.colors || []).some(c => ordNorm(String(c.label || "")).startsWith(mm)));
      if (byModel.length) cands = byModel;
    }
    if (unit != null) {
      if (!cands.length) cands = pool.filter(p => p && p.price != null && Math.abs(p.price - unit) < 0.011);
      else {
        const byPrice = cands.filter(p => p && p.price != null && Math.abs(p.price - unit) < 0.011);
        if (byPrice.length) cands = byPrice;
      }
    }
    const mine = cands.filter(p => custom.some(c => c.id === p.id));
    if (mine.length) return mine[0];
    return cands[0] || null;
  }
  function ordSave() {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    const el = $("#ordCount");
    if (el) el.textContent = orders.length;
  }
  function ordCopy(txt) {
    const ta = document.createElement("textarea");
    ta.value = txt;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { }
    document.body.removeChild(ta);
  }

  function parseOrderText(raw) {
    const items = [];
    const cust = { name: "", street: "", cpCity: "", phone: "", email: "", note: "" };
    let shipMode = "CON CAJA", shipAmt = null, total = null;
    let inShip = false;
    for (const rl of String(raw || "").split("\n")) {
      const line = rl.replace(/\s+/g, " ").trim();
      if (!line) continue;
      if (line === "ENV\u00cdO A:") { inShip = true; continue; }
      if (inShip) {
        const m = line.match(/^([\wáéíóúüñÁÉÍÓÚÜÑ\s()–\-]+):\s*(.*)$/);
        if (m) {
          const k = m[1].trim().toLowerCase(), v = m[2].trim();
          if (v && /nombre/.test(k)) cust.name = v;
          else if (v && /direcci/.test(k)) cust.street = v;
          else if (v && (/cp/.test(k) || /ciudad/.test(k))) cust.cpCity = v;
          else if (v && /tel/.test(k)) cust.phone = v;
          else if (v && (/correo/.test(k) || /tracking/.test(k))) cust.email = v;
          else if (v && /nota/.test(k)) cust.note = v;
        }
        continue;
      }
      let m = line.match(/^Env\u00edo \(((?:CON|SIN) CAJA)\)(?:\s*:\s*([\d.,]+)\s*€)?/u);
      if (m) { shipMode = m[1]; shipAmt = m[2] != null ? ordMon(m[2]) : null; continue; }
      m = line.match(/^TOTAL\b/);
      if (m) { const t = line.match(/([\d.,]+)\s*€/u); total = t ? ordMon(t[1]) : null; continue; }
      m = line.match(/^(\d+)\.\s+(.+)$/);
      if (m) {
        const seg = m[2];
        let price = null, rest = seg;
        const pm = seg.match(/^(.*?)\s*·\s*([\d.,]+)\s*€\s*$/u);
        if (pm) { rest = pm[1].trim(); price = ordMon(pm[2]); }
        let size = null;
        const ts = " · talla ";
        const tIdx = rest.indexOf(ts);
        if (tIdx >= 0) {
          const after = rest.slice(tIdx + ts.length);
          const sepIdx = after.indexOf(" · ");
          size = (sepIdx >= 0 ? after.slice(0, sepIdx) : after).trim();
          rest = rest.slice(0, tIdx) + (sepIdx >= 0 ? " · " + after.slice(sepIdx + 3) : "");
        }
        const parts = rest.split("·").map(x => x.trim());
        const title = parts.shift();
        let modelo = null, colParts = [];
        for (const pr of parts) {
          if (!modelo && /^\d+$/.test(pr)) { modelo = pr; continue; }
          if (pr) colParts.push(pr);
        }
        const color = colParts.join(" · ");
        if (!modelo) {
          const mm0 = color.match(/^(\d{2,6})[-_\s]/);
          if (mm0) modelo = mm0[1];
        }
        const found = ordFind(title, price, modelo);
        const last = items[items.length - 1];
        if (last && last.title === title && last.size === size && last.color === color &&
            last.modelo === modelo && last.unit === price && last.productId === (found ? found.id : null)) last.qty++;
        else items.push({ title, size, color, modelo, unit: price, qty: 1, done: false, productId: found ? found.id : null });
      }
    }
    return { items, cust, shipMode, shipAmt, total };
  }

  function orderShipText(o) {
    const c = o.cust;
    const block = [];
    if (o.shipMode) block.push(o.shipMode === "SIN CAJA" ? "SIN caja (quitar cajas)" : "CON caja");
    if (c.name) block.push("Nombre: " + c.name);
    if (c.street) block.push("Dirección: " + c.street);
    if (c.cpCity) block.push("CP y ciudad: " + c.cpCity);
    if (c.phone) block.push("Teléfono: " + c.phone);
    if (c.email) block.push("Correo (para el tracking): " + c.email);
    if (c.note) block.push("Nota: " + c.note);
    return "FICHA DE ENV\u00cdO\n" + block.join("\n");
  }

  function renderOrders() {
    const wrap = $("#ordList");
    if (!wrap) return;
    if (!orders.length) {
      wrap.innerHTML = `<p style="font-size:13px;color:var(--muted)">Aún no hay pedidos. Pega el mensaje del cliente arriba y pulsa «Parsear pedido».</p>`;
      return;
    }
    wrap.innerHTML = orders.slice().reverse().map(o => {
      const unMatched = o.items.some(it => !it.productId);
      const st = (ORDER_STATES.find(s => s.id === o.status) || ORDER_STATES[0]).label;
      const pool = [];
      const seen = {};
      for (const c of custom) if (c && !seen[c.id]) { seen[c.id] = 1; pool.push({ ...c, _src: "tuyo" }); }
      for (const p of pubs) if (p && !seen[p.id]) { seen[p.id] = 1; pool.push({ ...p, _src: "catálogo" }); }
      const itemsHtml = o.items.map((it, i) => {
        const p = custom.find(x => x.id === it.productId) || pubs.find(x => x.id === it.productId);
        const link = p && p.supLink
          ? `<a class="btn btn-green" style="flex:0;margin:4px;text-decoration:none" href="${ordEsc(p.supLink)}" target="_blank" rel="noopener">Abrir en Hipobuy</a>`
          : "";
        const variants = (p && it.modelo && Array.isArray(p.colors) && p.colors.length)
          ? p.colors.filter(c => ordNorm(String(c.label || "")).startsWith(ordNorm(it.modelo)))
          : [];
        const vNames = variants.map(v => ordNorm(String((v.img || "").split("/").pop().replace(/\.[^.]+$/, ""))));
        const exactPick = it.color && vNames.includes(ordNorm(it.color));
        const pick = p ? "" :
          `<select data-pick="${i}" style="flex:1 1 140px;min-width:0">
             <option value="">— elegir producto —</option>
             ${pool.map(c => `<option value="${ordEsc(c.id)}">${ordEsc(c.title)}${c._src === "catálogo" ? " (catálogo)" : ""}${c.price != null ? " · " + fmt(c.price) : ""}</option>`).join("")}
           </select>`;
        return `<div class="ord-item" style="border:1px solid var(--border);border-radius:8px;padding:8px;margin-bottom:6px">
          <div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap">
            <label style="display:flex;gap:10px;flex:1 1 100%;cursor:pointer">
              <input type="checkbox" data-done="${i}" ${it.done ? "checked" : ""} style="accent-color:var(--green);width:17px;height:17px;margin-top:2px">
              <span style="flex:1">
                <b style="font-size:13px">${ordEsc(it.title)}${it.modelo ? ` <span style="color:var(--accent);font-size:12px">ref. ${ordEsc(it.modelo)}</span>` : ""}</b>
                <br><span style="font-size:12px;color:var(--muted)">${it.size ? "talla " + ordEsc(it.size) : "sin talla"}${it.color ? " · " + ordEsc(it.color) : ""}${it.unit != null ? " · " + fmt(it.unit) : ""}${p ? " · ✅ " + (custom.some(c => c.id === p.id) ? "enlazado" : "enlazado (catálogo)") : ""}</span>
                ${variants.length ? `<br><span style="font-size:11px;color:var(--green)">📷 variantes ${ordEsc(it.modelo)}: ${variants.map(v => ordEsc((v.img || "").split("/").pop().replace(/\.[^.]+$/, ""))).join(" · ")}</span>` : ""}
                ${exactPick ? `<br><b style="color:var(--green)">✔ Pedir exactamente: ${ordEsc(it.color)}</b>` : ""}
              </span>
            </label>
            <span style="display:flex;gap:6px;align-items:center;padding-top:2px">
              <span style="font-size:12px;color:var(--muted)">x</span>
              <input type="number" min="1" value="${it.qty}" data-qty="${i}" style="width:52px;text-align:center">
            </span>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap">${link}${pick}</div>
        </div>`;
      }).join("");
      return `<div class="ord-card" data-oid="${o.id}" style="border:1px solid var(--border);border-radius:10px;padding:10px;margin-bottom:12px;border-left:3px solid ${o.status === "recibido" ? "var(--accent)" : o.status === "entregado" ? "var(--green)" : "var(--border)"}">
        <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:center">
          <b style="font-size:13px">${o.ts ? new Date(o.ts).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""} · ${o.total != null ? fmt(o.total) : "—"}</b>
          <button class="btn btn-ghost" data-del="${o.id}" style="flex:0;padding:4px 10px">Eliminar</button>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;align-items:center">
          <label style="font-size:12px;color:var(--muted)">Estado:</label>
          <select data-status="${o.id}" style="flex:1 1 170px">
            ${ORDER_STATES.map(s => `<option value="${s.id}" ${o.status === s.id ? "selected" : ""}>${s.label}</option>`).join("")}
          </select>
        </div>
        ${o.shipMode === "SIN CAJA" ? `<p style="font-size:12px;color:var(--accent2);margin:6px 0 0">📦 SIN CAJA: recuerda pedir a los agentes que quiten las cajas.</p>` : ""}
        ${o.cust.name || o.cust.cpCity ? `<p style="font-size:12px;color:var(--muted);margin:6px 0 0">${ordEsc(o.cust.name)}${o.cust.cpCity ? " · " + ordEsc(o.cust.cpCity) : ""}${o.cust.phone ? " · " + ordEsc(o.cust.phone) : ""}</p>` : ""}
        ${itemsHtml}
        ${unMatched ? `<p style="font-size:12px;color:var(--accent2);margin:6px 0 0">⚠️ Algún artículo no está enlazado (no coincide con tus productos). Elige uno abajo o créalo en «Mis productos» para que aparezca el botón de Hipobuy.</p>` : ""}
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
          <button class="btn btn-green" data-ship="${o.id}">Copiar ficha de envío</button>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;align-items:center">
          <input data-trk="${o.id}" value="${ordEsc(o.tracking || "")}" placeholder="Nº de seguimiento (p. ej. LP00123456789...)..." style="flex:1 1 200px;min-width:0">
          <button class="btn btn-primary" data-sendtrk="${o.id}" style="${o.tracking ? "" : "opacity:.6"}">Enviar tracking</button>
        </div>
        <p style="font-size:11px;color:var(--muted);margin:6px 0 0">«Enviar tracking» copia el mensaje con el enlace de 17track listo para pegar en WhatsApp, y marca el pedido como «Tracking enviado».</p>
      </div>`;
    }).join("");

    $$("[data-done]", wrap).forEach(cb => cb.onchange = (e) => {
      const card = e.target.closest(".ord-card"); if (!card) return;
      const o = orders.find(x => x.id === card.dataset.oid); if (!o) return;
      o.items[Number(e.target.dataset.done)].done = e.target.checked;
      ordSave();
    });
    $$("[data-qty]", wrap).forEach(inp => inp.onchange = (e) => {
      const card = e.target.closest(".ord-card"); if (!card) return;
      const o = orders.find(x => x.id === card.dataset.oid); if (!o) return;
      const v = Math.max(1, parseInt(e.target.value, 10) || 1);
      o.items[Number(e.target.dataset.qty)].qty = v;
      e.target.value = v;
      ordSave();
    });
    $$("[data-pick]", wrap).forEach(sel => sel.onchange = (e) => {
      const card = e.target.closest(".ord-card"); if (!card) return;
      const o = orders.find(x => x.id === card.dataset.oid); if (!o) return;
      o.items[Number(e.target.dataset.pick)].productId = e.target.value || null;
      ordSave();
      renderOrders();
    });
    $$("[data-status]", wrap).forEach(sel => sel.onchange = (e) => {
      const o = orders.find(x => x.id === e.target.dataset.status); if (!o) return;
      o.status = e.target.value;
      ordSave();
      renderOrders();
    });
    $$("[data-ship]", wrap).forEach(b => b.onclick = (e) => {
      const o = orders.find(x => x.id === e.target.dataset.ship); if (!o) return;
      ordCopy(orderShipText(o));
      const st = $("#ordStatus");
      st.textContent = "Ficha de envío copiada: pégala en el encargo de Hipobuy.";
      st.style.color = "var(--green)";
      setTimeout(() => { st.textContent = ""; }, 4000);
    });
    $$("[data-trk]", wrap).forEach(inp => inp.onchange = (e) => {
      const o = orders.find(x => x.id === e.target.dataset.trk); if (!o) return;
      o.tracking = e.target.value.trim();
      ordSave();
    });
    $$("[data-sendtrk]", wrap).forEach(b => b.onclick = (e) => {
      const o = orders.find(x => x.id === e.target.dataset.sendtrk); if (!o) return;
      const st = $("#ordStatus");
      if (!o.tracking) {
        st.textContent = "Escribe primero el nº de seguimiento en el campo de arriba.";
        st.style.color = "var(--accent2)";
        return;
      }
      const msg = "TOP VALOR — TU ENV\u00cdO 🚚\n\n\u00a1Hola " + (o.cust.name || "") + "!\nTu pedido ya está en camino y tiene número de seguimiento.\n\n\ud83d\udd0e Nº de seguimiento: " + o.tracking + "\n\ud83d\udccd Sigue tu paquete: https://t.17track.net/esp#nums=" + o.tracking + "\n\n\u00a1Gracias por comprar en Top Valor!";
      ordCopy(msg);
      o.status = "tracking";
      ordSave();
      renderOrders();
      st.textContent = "Mensaje de tracking copiado: pégalo en WhatsApp y mándale el enlace al cliente. Pedido marcado como «Tracking enviado».";
      st.style.color = "var(--green)";
    });
    $$("[data-del]", wrap).forEach(b => b.onclick = (e) => {
      if (!confirm("¿Eliminar este pedido?")) return;
      orders = orders.filter(x => x.id !== e.target.dataset.del);
      ordSave();
      renderOrders();
    });
  }

  $("#ordParseBtn").onclick = () => {
    const parsed = parseOrderText($("#ordRaw").value);
    const st = $("#ordStatus");
    if (!parsed.items.length) {
      st.textContent = "No encontré artículos: el mensaje debe tener líneas «1. producto · precio €». Revisa lo pegado.";
      st.style.color = "var(--accent2)";
      return;
    }
    orders.push({ id: "o" + Date.now().toString(36), ts: Date.now(), status: "recibido", ...parsed });
    ordSave();
    renderOrders();
    const units = parsed.items.reduce((a, i) => a + i.qty, 0);
    st.textContent = "Pedido guardado: " + parsed.items.length + " artículo(s) · " + units + " unidad(es). Abre cada uno en Hipobuy desde su botón y márcalo «✓» cuando lo encargues.";
    st.style.color = "var(--green)";
    $("#ordRaw").value = "";
  };
  $("#ordClearBtn").onclick = () => {
    $("#ordRaw").value = "";
    $("#ordStatus").textContent = "";
  };
  renderOrders();

  function loadPubProducts() {
    const tryFetch = u => fetch(u, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null);
    Promise.resolve().then(() => tryFetch("data/productos.json"))
      .then(j => Array.isArray(j) && j.length ? j : tryFetch("https://raw.githubusercontent.com/" + encodeURIComponent(($("#ghUser") && $("#ghUser").value.trim()) || "Miguelgc71") + "/" + encodeURIComponent(($("#ghRepo") && $("#ghRepo").value.trim()) || "topvalor") + "/main/data/productos.json"))
      .then(j => {
        if (Array.isArray(j) && j.length) {
          pubs = j;
          renderOrders();
        }
      });
  }
  loadPubProducts();
})();