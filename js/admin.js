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

  // ---------- COLORS ----------
  function renderColors() {
    const wrap = $("#colorTags");
    if (!colors.length) { wrap.innerHTML = `<span style="font-size:12px;color:var(--muted)">Sin fotos extra. El producto mostrará solo una imagen.</span>`; return; }
    wrap.innerHTML = colors.map((c, i) =>
      `<span class="color-tag"><img src="${c.img}" onerror="this.style.display='none'"><span>${c.label || "Foto " + (i + 1)}</span><button data-rm="${i}">&times;</button></span>`
    ).join("");
    $$("[data-rm]", wrap).forEach(b => b.onclick = () => { colors.splice(Number(b.dataset.rm), 1); renderColors(); });
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
      colors: colors.length ? colors.slice() : undefined,
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
    colors = [];
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
    colors = (p.colors || []).map(c => ({ label: c.label || c.name || "", img: c.img || "" }));
    renderColors();
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
          <span style="color:var(--muted)">${p.brand} · ${sup(p.supplierId).name} · ${fmt(p.price)}${p.price ? "" : ""} · ${p.deal !== "none" ? p.deal.toUpperCase() : "Normal"} · ${p.colors && p.colors.length ? p.colors.length + " colores/fotos" : "1 imagen"}</span>
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
      // --- Protección 2: no eliminar por accidente productos ya publicados ---
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
      custom = data.slice();
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(custom));
      renderList();
      renderStats();
      st.textContent = "Lista sincronizada con el repo: " + custom.length + " producto(s). Ya puedes publicar.";
    } catch (err) {
      st.textContent = "No se pudo leer data/productos.json (¿estás en local con file://? Usa el botón «Importar JSON» con el archivo).";
    }
  };

  // ---------- SUBIR FOTOS AL REPO ----------
  $("#upBtn").onclick = async () => {
    const st = $("#upStatus");
    const token = $("#ghToken").value.trim(), user = $("#ghUser").value.trim(), repo = $("#ghRepo").value.trim();
    let folder = $("#upFolder").value.trim().replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
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
})();