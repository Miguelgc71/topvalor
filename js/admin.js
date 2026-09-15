(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const fmt = n => (isNaN(n) ? "0,00" : n.toFixed(2).replace(".", ",")) + " €";

  const ADMIN_PW_OK_KEY = "tv_admin_ok";
  const PRODUCTS_KEY = "tv_custom_products";

  let custom = [];
  try { custom = JSON.parse(localStorage.getItem(PRODUCTS_KEY) || "[]"); } catch (e) { custom = []; }
  let editingId = null;
  let selectedSup = localStorage.getItem("tv_last_sup") || SUPPLIERS[0].id;
  let sizes = [];

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
  function calc() {
    const cost = parseFloat($("#fCost").value.replace(",", ".")) || 0;
    const margin = parseFloat($("#fMargin").value.replace(",", ".")) || 0;
    const ship = parseFloat($("#fShip").value.replace(",", ".")) || 0;

    const sub = cost * (1 + margin / 100);       // coste + margen
    const iva = sub * 0.21;
    const total = sub + iva;                      // precio al cliente con IVA
    const grand = total + ship;                   // total con envío

    $("#calcCost").textContent = fmt(cost);
    $("#calcMargin").textContent = fmt(sub - cost);
    $("#calcSub").textContent = fmt(sub);
    $("#calcIva").textContent = fmt(iva);
    $("#calcTotal").textContent = fmt(total);
    $("#calcShip").textContent = fmt(ship);
    $("#calcGrand").textContent = fmt(grand);
  }
  ["fCost", "fMargin", "fShip"].forEach(id => $("." + id) && ($("#" + id).addEventListener("input", calc)));

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
    $("#poolFields").style.display = e.target.value === "pool" ? "block" : "none";
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
      orig: null,
      grams: 500,
      mono: $("#fName").value.trim().split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "TV",
      grad: ["#1e293b", "#0f172a"],
      deal,
      complaints: 0,
      fit: manual ? "custom" : fitByCat(cat),
      note: $("#fNote").value.trim(),
      sizes: manual ? sizes.slice() : undefined,
      imgData: $("#fImgUrl").value.trim() || null,
      shipOverride: ship,
      isCustom: true,
      dateAdded: Date.now()
    };
    if (deal === "flash") p.flash = { total: parseInt($("#fFlashQty").value) || 3, minutes: parseInt($("#fFlashMin").value) || 5 };
    if (deal === "pool") p.pool = { target: parseInt($("#fPoolTarget").value) || 5, now: 0, disc: parseInt($("#fPoolDisc").value) || 8 };
    return p;
  }

  $("#saveBtn").onclick = () => {
    const name = $("#fName").value.trim();
    if (!name) { $("#formStatus").textContent = "Escribe el nombre del producto."; return; }
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
    ["fName", "fBrand", "fNote", "fImgUrl", "fCost", "fShip"].forEach(id => $("#" + id).value = "");
    $("#fMargin").value = "15";
    $("#fDeal").value = "none";
    $("#fCat").value = "shoes";
    $("#fImgPreview").style.display = "none";
    $("#formTitle").textContent = "Nuevo producto";
    $("#saveBtn").textContent = "Publicar producto";
    $("#formStatus").textContent = "";
    $("#flashFields").style.display = "none";
    $("#poolFields").style.display = "none";
    document.querySelector('input[name="sizeMode"][value="auto"]').checked = true;
    $("#manualSizes").style.display = "none";
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
    $("#fNote").value = p.note || "";
    $("#fCost").value = (p.price ? (p.price / 1.21 / 1.15) : 0).toFixed(2);
    $("#fMargin").value = "15";
    $("#fShip").value = p.shipOverride || 0;
    selectedSup = p.supplierId;
    renderSups();
    const manual = p.fit === "custom";
    document.querySelector('input[name="sizeMode"' + (manual ? '][value="manual"' : '][value="auto"') + ']').checked = true;
    $("#manualSizes").style.display = manual ? "block" : "none";
    sizes = (p.sizes || []).slice();
    renderSizes();
    $("#fDeal").value = p.deal || "none";
    if (p.flash) {
      $("#flashFields").style.display = "block";
      $("#fFlashQty").value = p.flash.total;
      $("#fFlashMin").value = p.flash.minutes;
    }
    if (p.pool) {
      $("#poolFields").style.display = "block";
      $("#fPoolTarget").value = p.pool.target;
      $("#fPoolDisc").value = p.pool.disc;
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
          <span style="color:var(--muted)">${p.brand} · ${sup(p.supplierId).name} · ${fmt(p.price)}${p.price ? "" : ""} · ${p.deal !== "none" ? p.deal.toUpperCase() : "Normal"}</span>
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
    st.textContent = "Publicando " + custom.length + " producto(s)...";
    const api = `https://api.github.com/repos/${encodeURIComponent(user)}/${encodeURIComponent(repo)}/contents/data/productos.json`;
    const hdr = { "Authorization": "token " + token, "Accept": "application/vnd.github.v3+json" };
    try {
      let sha = null;
      try {
        const r = await fetch(api, { headers: hdr });
        if (r.ok) sha = (await r.json()).sha;
      } catch (e) { /* 404 o sin archivo: se crea */ }
      const body = {
        message: "Publicar catalogo desde panel admin",
        content: btoa(unescape(encodeURIComponent(currentJson()))),
        branch: "main"
      };
      if (sha) body.sha = sha;
      const res = await fetch(api, { method: "PUT", headers: hdr, body: JSON.stringify(body) });
      if (!res.ok) {
        const txt = await res.text();
        st.textContent = (res.status === 404)
          ? "Error 404: el usuario/repo no existe o el token no tiene acceso. Comprueba que Usuario sea Miguelgc71 y Repo topvalor (los he puesto por defecto), y pega el token ghp_... con permiso repo."
          : `Error ${res.status}: comprueba token (permiso repo) o red. ` + txt;
        return;
      }
      st.textContent = "Publicado. Espera ~30 s y recarga la web: la tienda ya tiene " + custom.length + " producto(s).";
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
        const merged = custom.concat(data.filter(x => !custom.some(c => c.id === x.id)));
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
})();