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