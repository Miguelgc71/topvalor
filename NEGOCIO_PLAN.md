# TopValor — Plataforma intermediaria de curaduría + venta dinámica

Estudio del modelo de negocio y plan de producto. Documento vivo.

---

## 1. Qué es el producto

**TopValor** es una tienda que **no tiene almacén ni inventario propio**. Es un
**intermediario curatorial**:

1. Viaja como "scrapers + curadores" por los agentes de compra y marketplaces
   (Hipobuy, Superbuy, Kakobuy, ACBuy, CNFans, Sugargoo, Oopbuy, CSSBuy,
   Kaufland Marketplace, AliExpress/1688/Taobao/Weidian, etc.).
2. Filtra **solo los productos con valoración máxima** (>= 4.8/5) y con pocas
   quejas.
3. Los agrupa por **proveedor** (cuál nos lo sirve) y por **categoría / producto**.
4. El cliente **compra en TopValor y paga a TopValor**.
5. TopValor **paga al proveedor** y le pasa la **dirección de envío del cliente**.
6. El proveedor **envía directamente al cliente** (cross-docking / fulfillment del
   agente).
7. TopValor **no participa en la gestión de errores** (retraso, talla, no llega):
   cliente y proveedor lo resuelven entre ellos. Si un artículo acumula varias
   quejas, TopValor **lo retira** de la página.

```
CLIENTE ──€──▶ TopValor ──€──▶ PROVEEDOR(agente/marketplace)
   ▲                          │
   └───────── producto físico directo ─────┘
        (quejas/resoluciones: cliente <-> proveedor, sin TopValor)
```

### Flujo de pago y comisiones
- El cliente paga `precio neto + envío + margen TopValor`. Precio **todo incluido
  y transparente** (siempre visible el coste de envío en tarjeta y en checkout).
- TopValor paga al proveedor su coste real. El margen es la diferencia + la mejora
  de precio que el proveedor concede por volumen de pedidos.
- Cuanto más pedidos acumule un artículo, mejor precio nos da el proveedor →
  modelo "pooling" que mejora el margen (ver mecánica 2).

---

## 2. Páginas de este tipo investigadas

### Agentes de compra estilo Hipobuy/Pandabuy (2026, según comparativas)
| Agente      | Fee servicio | QC | Almacén gratuito | Envío EU | Alta |
|-------------|-------------|----|------------------|----------|------|
| **Kakobuy** | 0%          | Excelente | 180 días | 7–18 d | 4.9 |
| **Hipobuy** | 5–8%        | 12 fotos | 90 días | 7–15 d | 4.7 |
| **ACBuy**   | ~5%         | 5 fotos HD | 90 días | 7–18 d | 9/10 |
| **Superbuy**| 5–10%       | Mejor QC | 90 días | 7–20 d | 4.8 |
| **CNFans**  | ~5%         | Bueno | 90 días | 7–15 d | 8/10 |
| **Sugargoo**| ~5%         | Bueno | 90 días | 7–18 d | 8/10 |
| **Oopbuy**  | 0%          | Muy bueno | 90 días | 10–20 d | 4.7 |
| **CSSBuy**  | 4%          | Bueno | 90 días | 9–25 d | 4.3 |

- **Pandabuy cerró (2025)** por presión legal y embargo de almacenes → lección de
  riesgo de concentración: **nunca depender de un solo agente**. Ventilar pedidos
  y tener 2+ agentes por categoría.
- Los productos de estas páginas suelen venir de **Taobao / 1688 / Weidian**.
  Importante: en CN la talla de zapato es **centímetros del pie** (p.ej. 265 =
  26,5 cm). Nuestro guiado de tallas aprovecha esto.

### Marketplaces (modelo "mercado," complementario)
- **Kaufland Global Marketplace** (ex Real.de): 9 marketplaces en EU, 6.400
  categorías, 15.000 vendedores, 45M+ productos. Buen canal de abastecimiento si
  queremos productos con IVA/EU ya dentro y devoluciones con la UE.
  - En Kaufland el envío/entrega lo coordina el vendedor → encaja con
    "resolución directa cliente-provvedor".
- AliExpress / Temu: dropshipping directo, precios bajos, pero ratings muy
  heterogéneos → curar solo rating alto + nº de ventas alto.

---

## 3. Curaría: solo valoración máxima + sistema anti-quejas

Criterio de inclusión de un producto:
- Rating >= **4.8/5** **con mínimo de N reseñas** (p.ej. >= 300) para filtrar
  "rating inflado por pocas ventas".
- Ratio de quejas < umbral (p.ej. < 2 %).
- QC (fotos de control de calidad) reciente disponible.
- Si las quejas acumuladas de un artículo superan el umbral (p.ej. 3 en 30 días o
  ratio > 5 %) → **se retira automáticamente** de la página (el prototipo muestra
  un ejemplo).

### Qué hace el scrapilador
- Tareas programadas: busca por categoría, extrae `rating`, `núm. reseñas`,
  `precio`, `stock`, `tabla de tallas`, `peso` (para envío), `país de origen`.
- Detección de "rating comprado" (picos de reseñas en horas) → descartar.
- Comparación de precio vs. los otros agentes para el mismo artículo (mismo
  SKU/referencia). Nos quedamos con el proveedor más barato a igual rating.

---

## 4. Anti-devoluciones: información de talla y ajuste

Es la propuesta de valor nº 1 frente a estas páginas. Cada producto con talla
(calzado, camisetas, pantalones, chaquetas, sudaderas...) lleva:

- **Tabla de tallas real del proveedor** (no genérica).
- **Asistente de ajuste personal**: el cliente introduce sus medidas →
  (cm de pie, cintura, pecho, cadera, altura) y el sistema recomienda `talla
  recomendada` con un **"fit score"** (%). Si el score < umbral, se sugiere
  "subir una talla" o "no recomendado para tu medida".
- **Conversión CN/EU/US/UK**: el pie en cm → talla CN/EU con fórmula:
  `EU ≈ (cm pie + 1,0) × 1,5` (aproximada), mostrada en tabla exacta.
- **Para ropa**: cm reales (pecho, cintura, largo) en vez de "M/L/XL".
- Aviso de **cortes**: en zapatillas "fits true to size / talle grande, pide una
  menos" según opiniones.
- En checkout, **bloqueo de talla** si el cliente no completa el asistente (opcional
  por producto) → reducción drástica de devoluciones por tallaje.

Ejemplo de tabla (calzado, convertida):
| Pie (cm) | CN/EU | US hombre | UK |
|----------|-------|-----------|----|
| 25.0     | 39    | 7         | 6  |
| 26.0     | 41    | 8         | 7  |
| 27.0     | 42    | 9         | 8  |
| 28.0     | 43    | 10        | 9  |

---

## 5. Envío: coste visible siempre

- Cada proveedor tiene una tarifa: `base + €/kg + zona`. El peso del artículo se
  conoce por el AGENTE (parse del listing).
- La tarjeta del producto muestra **siempre** el coste de envío estimado (y el
  plazo tipo, p.ej. "7–15 días").
- En checkout se muestra el desglose: `subtotal producto + servicio TopValor +
  envío (proveedor) = total`.
- **Envío combinado**: si el mismo proveedor tiene 2+ artículos, el envío se
  consolida (el agente junta paquetes) → mejor precio, mostrado como "Ahorras X €
  si pides juntos".

---

## 6. Gestión de errores: nosotros fuera

- Todos los pedidos llevan un **canal de incidencias** directo cliente ⇄ proveedor
  (los agentes tienen su propio soporte y reembolsos).
- TopValor solo interviene si (a) el proveedor no responde, (b) para activar la
  **retirada auto** del artículo por quejas, o (c) para facilitar el reembolso
  reteniendo el pago en custodia hasta confirmación de entrega (escrow parcial).
- **Retirada automática**: el panel de proveedores consume el feed de quejas. Con
  `umbral >= 3 quejas nuevas en 30 días` el artículo pasa a **"retirado"** y los
  clientes con intención de compra reciben aviso.

---

## 7. Las 10 mecánicas de venta dinámica (propuesta)

Objetivo: **conversión antes que stock** (no tenemos stock). Combinan escasez,
tiempo, evidencia social y cooperación.

### 1. Oferta relámpago con cuenta atrás (Flash Sale)
- 3 unidades declaradas (aunque el backoffice tenga 6). `Tiempo: 5:00 m`.
- El conteo corre; se acaba **cuando llega a 0 o se venden las 3**.
- Si no se vende ninguna y queda 1 minuto, el sistema **muestra "queda 1 unidad"**
  para forzar la decisión (el usuario así lo pidió).
- Riesgo: fatiga si es muy frecuente → máx. 3-4 flashes/día.

### 2. Compra colectiva / pool de interés (Group Buy)
- Botón "Me interesa" por artículo. Al llegar a **5 interesados** se desbloquea un
  descuento (p.ej. -8%) **para esos 5** durante X horas.
- Como pedimos 5 al proveedor, **mejora el precio que nos deja a nosotros** → el
  descuento es financiable. Tradicional (Groupon) y probado por la ciencia
  (cuenta atrás y efecto unidad).
- **Combinable con la 1**: flash + pool = doble urgencia.

### 3. Subasta real
- Puja por un artículo con precio de salida = coste proveedor + mínimo.
- Incremento mínimo; vence a los N minutos; si puja en el último minuto, se
  extienden 1 min (anti-sniping).
- Ideal para piezas de gama alta (relojes, chaquetas premium).

### 4. Precio que baja solo (Price Drops)
- El precio **desciende cada 20 min** hasta comprarse o llegar a un suelo.
- Urgencia + "trampa" de esperar → equilibrio: si hay interés, el precio real
  negociado con el proveedor baja y todos ganan.

### 5. "Di tu precio" (Name Your Price)
- El cliente propone un precio (p.ej. -15%). Si está por encima de `coste
  proveedor + margen mínimo`, **se acepta al momento** (anti-robot: máx. 1 intento/
  semana). Licht modelo Priceline.

### 6. Preventa Early-Bird
- Los primeros X compradores de un artículo recién curado se llevan una rebaja
  extra + prioridad de envío. Escasez + acceso anticipado.

### 7. Caja misteriosa (Mystery Box) por proveedor
- Pagas un precio fijo por debajo del valor y recibes **uno de los top del
  proveedor**, al azar (p.ej. una de las 5 zapatillas mejor valoradas). Mueve
  stock sobrante y sube ticket medio del proveedor → negociable margen.

### 8. Compra en pareja / referido (Buy Both)
- "Llévatelo a -20% si un amigo compra contigo en 24 h". Para socios del pool 2 se
  le da el descuento a ambos. Crea red social + clientes nuevos.

### 9. Bono rápido (Fast-Pay)
- Después de mostrar interés ("Me interesa"), tienes **10 min** para pagar. Cada
  minuto que pasa, el descuento baja 0,5 %. Recompensa la inmediatez.

### 10. Cazador de precios (Price-Watch + cupón)
- "Avísame si baja" → al registrar la alerta se te canaliza un **cupón exclusivo
  de -5 %** para ese artículo (válido 24 h). Convierte curiosidad en acción.

### 11. Compra en grupo colaborativa (grupos de amigos) — la mecánica 11
La pediste tú: **grupos de amigos registrados** (usuario + dirección + correo + talla).
Cómo queda afinada:

- **Registro 1 vez** con dirección, nombre de contacto y correo (empre correo se usa
  para que el proveedor contacte en devoluciones).
- Cada miembro elige **su talla** (via asistente de medidas).
- Un **líder crea el grupo** → código/enlace (ej. GR-7K2M). Grupos **privados**
  (amigos) u **abiertos** (enlace público para completar cuota).
- **Descuento escalonado según nº de personas**: el grupo no tiene por qué ser de 5.
  El líder cierra "con los que haya" (mínimo 2, máximo 5):

| Personas | Rebaja del proveedor | Descuento al grupo (aprox., Yeezy) |
|---|---|---|
| 2 | ~3,5 % | −5,4 % |
| 3 | ~5,5 % | −6,9 % |
| 5 | ~8 % | −8,5 % |

- **Cada miembro paga su parte por separado** (nunca el líder paga por todos →
  se elimina el fraude). Pago en custodia.
- **Cuando han pagado los 2, 3 o 5** → se manda el pedido al proveedor: se le paga
  y se le pasan **direcciones, tallas, nombres de contacto y correos** de cada miembro,
  para que envíe a cada uno y para gestionar devoluciones directamente con ellos.
- Regla **todo o nada**: si al vencer el plazo no se llegan a 2, **nadie paga**.
- **El líder recibe recompensa** (cupón o 1 % cashback) → crecimiento viral.

**Margen (el cálculo que pediste):** motor de margen en la maqueta (Simulador,
también ajusta el nº de personas 2/3/5). Ejemplo con la Yeezy (39,90 €):

| Concepto | Individual | 2 pers | 3 pers | 5 pers |
|---|---|---|---|---|
| Precio todo incluido / persona | 52,29 € | 49,48 € | 48,67 € | 47,86 € |
| Tu margen por unidad | 7,98 € | 9,86 € | 10,39 € | 10,93 € |
| % margen sobre precio | 15 % | 20 % | 21 % | 23 % |

- El ahorro real del proveedor por unidad (rebaja ~8 % + envío −45 %) es ~8,13 €.
- Regla por defecto: **te quedas el 40 %** del ahorro y **pasas el 60 %** al grupo
  (deslizador en la maqueta para ajustarlo).
- Clave de la idea perfeccionada: **no se gana por el descuento que se da, sino por
  bajar el coste real de abastecimiento** (volumen + consolidación) y repartir la
  mitad. Si solo recortas tu margen, el grupo no es sostenible.

**Guardarraíles operativos:**
- Mín. 4 y máx. 10 personas por grupo (logística).
- Talla y artículo **bloqueados al cerrar** (no se cambian después).
- En la vida real, la cuota de 5 puede ser **por proveedor y no por artículo**:
  "5 artículos del mismo proveedor" baja más la fricción (no hace falta que los 5
  quieran el mismo zapato).
- El envío consolidado real se divide por peso/volumen entre los miembros.

### ¿Dónde encajan otras ideas conocidas?
- **FOMO/scarcity** (estudio IJFMR): funciona a corto plazo, pero abusar erosiona
  la confianza → guardarraíles: honestidad de stock, contadores reales.
- **Bundles** (3-packs): bueno para accesorios y consumibles, no incluido en las
  10, implementable como simplest añadido en checkout (mejora AOV).
- **Precio por demanda** (surge): Riesgo legal/publicitario de percepción injusta →
  no recomendado en fase 1.

### Reglas de oro en todas las mecánicas
- Contador **siempre real** (o no usar).
- Umbral de descuento máx. por artículo.
- Nº de veces que puede repetir el mismo artículo como oferta (p.ej. 4 veces/día).
- Las 5 mecánicas de venta + informadas dan mejor ratio de conversión que aplicar
  todas a la vez → priorizar 3 (Flash, Pool, Early-Bird) en el MVP.

---

## 8. Riesgos y legal (importante)

- **Réplicas**: gran parte del catálogo tipo Hipobuy son réplicas. Legalmente muy
  gris (marcas, aduanas, PUI). Decidir tesis: (a) solo "inspirados/originales sin
  marca", (b) réplicas explícitas con máximo disclaimer y siendo merchandising de
  catálogo de agente. Esto define riesgo total del negocio.
- **Responsabilidad del intermediario** (UE: Directiva 2019/771 y PSD2): como
  comercio B2C respondemos ante consumidor final. El pacto "el proveedor gestiona
  la queja" es operativo, pero **legalmente reclamarán a TopValor** → presupuestar
  reembolsos/escrow y seguros.
- **Facturación/IVA**: venta al consumidor → factura con IVA de tu país; el coste
  del proveedor extranjero no se descuenta como IVA → vigilar margen real.
- **Pasarela de pago**: open banking + tarjeta. Retener en custodia (escrow)
  hasta confirmación de entrega la parte del envío.
- **Protección de datos**: dirección del cliente se cede al proveedor con base
  legal (ejecución del contrato).

---

## 9. Roadmap

- **Fase 0 — Prototipo** (este repo): página estática con datos ficticios,
  mecánicas 1, 2, 3, 4, 6, 9 simuladas y UI de tallas/envío/quejas. Objetivo:
  validar UX con 20 usuarios.
- **Fase 1 — MVP**: back + front, scrape manual con hojas de cálculo del agente,
  checkout + pago (Stripe open banking), escrow básico, feed de quejas manual,
  mecánica 1+2.
- **Fase 2 — Automatización**: scraping con API/proxy de agentes, pooling real de
  productos por rating, precios por proveedor, feed de quejas API.
- **Fase 3 — Escala**: multi-proveedor, envío consolidado, panel proveedor.

## 10. Métricas clave
- Tasa de conversión por mecánica.
- **Ratio de devolución por talla** (objetivo < 5 % vs. 25-40 % típico de moda online).
- Margen efectivo por pedido (neto de IVA, quejas, reembolsos).
- Quejas por artículo (alerta de retirada).
- AOV y nº de artículos pedidos por pool (mecánica 2).