const SUPPLIERS = [
  { id: "kakobuy",  name: "Kakobuy",  fee: "0%",    qc: "Excelente · QC 5-8 fotos", eta: "7-18 d", base: 3.90, perKg: 7.50, color: "#5b8def" },
  { id: "hipobuy",  name: "Hipobuy",  fee: "5-8%",  qc: "12 fotos QC gratis",       eta: "7-15 d", base: 4.50, perKg: 8.00, color: "#e25b5b" },
  { id: "acbuy",    name: "ACBuy",    fee: "~5%",   qc: "5 fotos HD",               eta: "7-18 d", base: 4.20, perKg: 7.80, color: "#3fa36b" },
  { id: "superbuy", name: "Superbuy", fee: "5-10%", qc: "Mejor QC del mercado",     eta: "7-20 d", base: 5.00, perKg: 8.50, color: "#8a6ae0" },
  { id: "cnfans",   name: "CNFans",   fee: "~5%",   qc: "QC bueno",                 eta: "7-15 d", base: 4.00, perKg: 7.60, color: "#d99a2b" },
  { id: "sugargoo", name: "Sugargoo", fee: "~5%",   qc: "QC bueno",                 eta: "7-18 d", base: 4.20, perKg: 7.40, color: "#2a9d8f" },
  { id: "oopbuy",   name: "Oopbuy",   fee: "0%",    qc: "QC muy bueno",             eta: "10-20 d",base: 3.60, perKg: 7.20, color: "#4c6a92" },
  { id: "cssbuy",   name: "CSSBuy",   fee: "4%",    qc: "QC bueno",                 eta: "9-25 d", base: 3.40, perKg: 6.90, color: "#9b6a3c" },
];

const NOW = Date.now();
const MIN = 60000;

var PRODUCTS = [
  {
    id: "p01", title: "Nike Dunk Low \"Panda\"", brand: "Nike", cat: "shoes",
    supplierId: "hipobuy", rating: 4.9, reviews: 4120, price: 34.90, orig: 54.90, grams: 980,
    mono: "ND", grad: ["#cbd5e1", "#64748b"], deal: "none", complaints: 0, fit: "shoe",
    note: "Comfy, talle normal. Fotos QC disponibles."
  },
  {
    id: "p02", title: "Air Jordan 4 \"Bred\"", brand: "Jordan/Nike", cat: "shoes",
    supplierId: "kakobuy", rating: 4.9, reviews: 1860, price: 49.90, orig: 79.90, grams: 1200,
    mono: "AJ4", grad: ["#ef4444", "#7f1d1d"], deal: "flash", complaints: 0, fit: "shoe",
    flash: { total: 3, minutes: 5 }, note: "CVW factory. Talle normal."
  },
  {
    id: "p03", title: "Yeezy Boost 350 V2 \"Core Black\"", brand: "Adidas", cat: "shoes",
    supplierId: "acbuy", rating: 4.8, reviews: 2210, price: 39.90, orig: 65.90, grams: 1050,
    mono: "YB", grad: ["#f1f5f9", "#94a3b8"], deal: "pool", complaints: 0, fit: "shoe",
    pool: { target: 5, now: 4, disc: 8 }, note: "Boost auténtico al tacto. Talle medio: pide 0.5 arriba."
  },
  {
    id: "p04", title: "Champion Reverse Weave Hoodie", brand: "Champion", cat: "top",
    supplierId: "superbuy", rating: 4.9, reviews: 3350, price: 41.90, orig: 69.90, grams: 850,
    mono: "CR", grad: ["#1e3a5f", "#0f172a"], deal: "none", complaints: 0, fit: "top",
    note: "Algodón grueso, costuras dobles."
  },
  {
    id: "p05", title: "FOG Essentials Tee (caja perfecta)", brand: "Essentials", cat: "top",
    supplierId: "sugargoo", rating: 4.8, reviews: 2980, price: 24.90, orig: 39.90, grams: 260,
    mono: "FT", grad: ["#f8fafc", "#475569"], deal: "earlybird", complaints: 0, fit: "top",
    early: { quota: 25 }, note: "Talle oversized real, va grande."
  },
  {
    id: "p06", title: "Nike Tech Fleece Pants", brand: "Nike", cat: "bottom",
    supplierId: "oopbuy", rating: 4.9, reviews: 1740, price: 35.90, orig: 59.90, grams: 640,
    mono: "NT", grad: ["#334155", "#0f172a"], deal: "none", complaints: 0, fit: "bottom",
    note: "Talle según cintura, táper regular."
  },
  {
    id: "p07", title: "Arc'teryx Alpha Jacket (GTX)", brand: "Arc'teryx", cat: "outer",
    supplierId: "hipobuy", rating: 4.9, reviews: 960, price: 89.90, orig: 149.90, grams: 780,
    mono: "AX", grad: ["#065f46", "#022c22"], deal: "pricedrop", complaints: 0, fit: "top",
    drop: { floor: 69.90, step: 1.50, everyMin: 2 }, note: "Membrana real, sellado con cinta."
  },
  {
    id: "p08", title: "Rolex Datejust 41 (VSF)", brand: "Rolex", cat: "acc",
    supplierId: "cnfans", rating: 4.8, reviews: 640, price: 145.90, orig: 210.90, grams: 320,
    mono: "DJ", grad: ["#a16207", "#422006"], deal: "auction", complaints: 0, fit: "none",
    auc: { start: 129.00, minInc: 4.00, mins: 15 }, note: "VSF, calibre 3235. Caja 41 mm."
  },
  {
    id: "p09", title: "LV Monogram Belt 110cm", brand: "Louis Vuitton", cat: "acc",
    supplierId: "cssbuy", rating: 4.8, reviews: 1520, price: 38.90, orig: 59.90, grams: 410,
    mono: "LV", grad: ["#92400e", "#451a03"], deal: "fastpay", complaints: 0, fit: "none",
    fast: { mins: 10, discStart: 6 }, note: "Hebilla metálica grabada."
  },
  {
    id: "p10", title: "Air Force 1 Low \"Triple White\"", brand: "Nike", cat: "shoes",
    supplierId: "acbuy", rating: 4.9, reviews: 3610, price: 33.90, orig: 52.90, grams: 1000,
    mono: "AF1", grad: ["#ffffff", "#cbd5e1"], deal: "watch", complaints: 0, fit: "shoe",
    note: "Clásico que no falla. Talle normal."
  },
  {
    id: "p11", title: "Balenciaga Speed Trainer", brand: "Balenciaga", cat: "shoes",
    supplierId: "kakobuy", rating: 4.8, reviews: 890, price: 48.90, orig: 74.90, grams: 880,
    mono: "BS", grad: ["#0f172a", "#334155"], deal: "none", complaints: 0, fit: "shoe",
    note: "Knit elástico, pide la talla de siempre."
  },
  {
    id: "p12", title: "Stussy Worldwide Hoodie", brand: "Stussy", cat: "top",
    supplierId: "superbuy", rating: 4.9, reviews: 2050, price: 37.90, orig: 59.90, grams: 620,
    mono: "ST", grad: ["#b91c1c", "#450a0a"], deal: "pool", complaints: 0, fit: "top",
    pool: { target: 5, now: 2, disc: 10 }, note: "Print sólido, algodón pesado."
  },
  {
    id: "p13", title: "Diesel Straight Jeans (raw selvedge)", brand: "Diesel", cat: "bottom",
    supplierId: "sugargoo", rating: 4.8, reviews: 1270, price: 44.90, orig: 69.90, grams: 780,
    mono: "DN", grad: ["#1d4ed8", "#172554"], deal: "none", complaints: 0, fit: "bottom",
    note: "Selvage real. Mide la cintura en cm, no la letra."
  },
  {
    id: "p14", title: "Adidas Ultraboost 1.0 (basf)", brand: "Adidas", cat: "shoes",
    supplierId: "cnfans", rating: 4.9, reviews: 1580, price: 43.90, orig: 67.90, grams: 960,
    mono: "UB", grad: ["#16a34a", "#052e16"], deal: "flash", complaints: 0, fit: "shoe",
    flash: { total: 3, minutes: 3 }, note: "Boost real (BASF). Va entera."
  },
  {
    id: "p15", title: "Carhartt WIP Beanie New York", brand: "Carhartt", cat: "acc",
    supplierId: "oopbuy", rating: 4.9, reviews: 980, price: 15.90, orig: 25.90, grams: 130,
    mono: "CB", grad: ["#7f1d1d", "#450a0a"], deal: "none", complaints: 0, fit: "none",
    note: "Punto acrílico doble."
  },
  {
    id: "p16", title: "Gucci Aviator Sunglasses GG0061S", brand: "Gucci", cat: "acc",
    supplierId: "cssbuy", rating: 4.8, reviews: 720, price: 32.90, orig: 49.90, grams: 210,
    mono: "GG", grad: ["#1e293b", "#0f172a"], deal: "pricedrop", complaints: 2, fit: "none",
    drop: { floor: 24.90, step: 1.00, everyMin: 3 }, note: "Lentes UV400 con grabado."
  },
];

const SHOE_CHART = [
  { cm: "25,0", eu: 39,  us: 7,    uk: 6  },
  { cm: "25,5", eu: 40,  us: 7.5,  uk: 6.5 },
  { cm: "26,0", eu: 41,  us: 8,    uk: 7  },
  { cm: "26,5", eu: 41.5, us: 8.5, uk: 7.5 },
  { cm: "27,0", eu: 42,  us: 9,    uk: 8  },
  { cm: "27,5", eu: 42.5, us: 9.5, uk: 8.5 },
  { cm: "28,0", eu: 43,  us: 10,   uk: 9  },
  { cm: "28,5", eu: 44,  us: 10.5, uk: 9.5 },
  { cm: "29,0", eu: 44.5, us: 11,  uk: 10 },
  { cm: "30,0", eu: 46,  us: 12,   uk: 11 },
];

const TOP_CHART = [
  { size: "S",   chest: 96,  waist: 82,  length: 65 },
  { size: "M",   chest: 102, waist: 86,  length: 68 },
  { size: "L",   chest: 108, waist: 92,  length: 71 },
  { size: "XL",  chest: 116, waist: 98,  length: 74 },
  { size: "XXL", chest: 122, waist: 104, length: 77 },
];

const BOTTOM_CHART = [
  { size: "S",   waist: "72-76", hip: "96-100", length: 100 },
  { size: "M",   waist: "76-80", hip: "100-104", length: 102 },
  { size: "L",   waist: "80-84", hip: "104-108", length: 104 },
  { size: "XL",  waist: "84-88", hip: "108-112", length: 106 },
  { size: "XXL", waist: "88-92", hip: "112-116", length: 108 },
];

const CATEGORIES = [
  { id: "shoes",  label: "Zapatillas" },
  { id: "top",    label: "Camisetas y sudaderas" },
  { id: "bottom", label: "Pantalones" },
  { id: "outer",  label: "Chaquetas" },
  { id: "acc",    label: "Accesorios y relojes" },
];

const DEAL_INFO = {
  flash:     { label: "FlASH · cuenta atrás" },
  pool:      { label: "POOL · interés agrupado" },
  auction:   { label: "SUBASTA" },
  pricedrop: { label: "PRECIO BAJANDO" },
  earlybird: { label: "EARLY BIRD" },
  fastpay:   { label: "BONO RÁPIDO" },
  watch:     { label: "AVISO DE PRECIO" },
};

const STORE = {
  cart: [],
  pools: {},
  fastpays: {},
  bids: {},
  coupons: {},
};