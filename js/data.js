const SHIP_RATES = {
  kakobuy:  { base: 5.20, perKg: 11.80, eta: "8-18 d" },
  hipobuy:  { base: 5.40, perKg: 12.00, eta: "7-15 d" },
  acbuy:    { base: 5.20, perKg: 11.90, eta: "8-18 d" },
  superbuy: { base: 5.80, perKg: 12.50, eta: "7-20 d" },
  cnfans:   { base: 5.00, perKg: 11.70, eta: "8-15 d" },
  sugargoo: { base: 5.20, perKg: 11.60, eta: "8-18 d" },
  oopbuy:   { base: 4.80, perKg: 11.40, eta: "10-20 d" },
  cssbuy:   { base: 4.80, perKg: 11.30, eta: "9-25 d" },
};

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

const SUBCATS = [
  { id: "bracelets", label: "Pulseras" },
  { id: "bags",      label: "Bolsas de deporte" },
  { id: "watches",   label: "Relojes" },
  { id: "caps",      label: "Gorras" },
];

const DEAL_INFO = {
  flash:     { label: "FlASH · cuenta atrás" },
  auction:   { label: "SUBASTA" },
  pricedrop: { label: "PRECIO BAJANDO" },
  earlybird: { label: "EARLY BIRD" },
  fastpay:   { label: "BONO RÁPIDO" },
  watch:     { label: "AVISO DE PRECIO" },
};

const STORE = {
  cart: [],
  fastpays: {},
  bids: {},
  coupons: {},
  noBox: false,
};