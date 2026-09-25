# Manual de uso — Panel de administración TopValor

Este panel (admin.html) es **solo para ti**. El cliente nunca ve Hipobuy, ni los enlaces de encargo, ni este panel.

> Actualización 25/09/2026: incluye **modo guía** (atendrás cada tarea paso a paso sin distracciones), **pedidos anulados**, **varios envíos/trackings por pedido** e **incidencias**. Fase 5 (margen real y agrupar por proveedor), filtros, revisión automática de tracking y aviso de pedido no válido ya incluidos desde las versiones anteriores.

---

## 0. Acceso

- Entra en `admin.html` (enlace "+ Admin" desde la web).
- Introduce la contraseña. La sesión queda abierta en ese navegador.
- **Siempre que haya una versión nueva, pulsa Ctrl+F5** (recarga limpia) para no trabajar con caches viejas.
- Todos los datos (productos propios y pedidos) se guardan **en ese navegador** (localStorage). Si navegas en otro sitio/incógnito, no los verás.

---

## 1. Proveedores de envío (físico)

Tabla con los agentes chinos y sus tarifas orientativas de **envío internacional**:

| Agente    | Comisión | QC (fotos)       | Plazo      | Base  | Por kg  |
|-----------|----------|------------------|------------|-------|---------|
| Kakobuy   | 0%       | 5-8 fotos        | 8-18 días  | 5,20 € | 11,80 € |
| Hipobuy   | 5-8%     | 12 fotos QC gratis| 7-15 días | 5,40 € | 12,00 € |
| ACBuy     | ~5%      | 5 fotos HD       | 8-18 días  | 5,20 € | 11,90 € |
| Superbuy  | 5-10%    | Mejor QC         | 7-20 días  | 5,80 € | 12,50 € |
| CNFans    | ~5%      | QC bueno         | 8-15 días  | 5,00 € | 11,70 € |
| Sugargoo  | ~5%      | QC bueno         | 8-18 días  | 5,20 € | 11,60 € |
| Oopbuy    | 0%       | QC muy bueno     | 10-20 días | 4,80 € | 11,40 € |
| CSSBuy    | 4%       | QC bueno         | 9-25 días  | 4,80 € | 11,30 € |

Precio de envío estimado = `base + porKg × peso`. Usa el mismo agente que eliges aquí en la calculadora (chip del proveedor).

---

## 2. Calculadora de precios

Introduce: **Coste** (lo que paga el agente por el artículo), **Margen %** (tu beneficio sobre el coste), **Envío** (si esculpes Manual o el cálculo exacto), y **Peso (gramos)**.

- Selecciona el **proveedor** (chip) para el cálculo estimado de envío.
- La calculadora te da: Coste → Margen € → Subtotal → **IVA 21%** → Total al cliente → Envío → **TOTAL con envío**.
- Ese TOTAL es el precio que pones al producto (el grupo al categoría). La casilla "Envío" del producto es lo que se suma al pedido (CON CAJA / SIN CAJA).

---

## 3. Mis productos

### Crear / editar
Pulsa **"Nuevo producto"**. Rellena:
- **Título** (lo ve el cliente), **Marca**, **Categoría**, **Precio** (el total con IVA y margen de la calculadora), **Envío por unidad** (cuota), **Enlace del agente / Hipobuy** (supLink: la ficha exacta del encargo).
- **Tallas**: añade las disponibles (+ Añadir).
- **Colores**: el primer campo es la etiqueta que el cliente ve (p. ej. `0860-1_Green`); el **prefijo numérico** (p. ej. `0860`) se usa en Pedidos como referencia/modelo para enlazar. Haz **Descargar** para las 5 fotos (vienen juntas del agente) o **+ Añadir** una a una.
- **Mecánica de oferta** (opcional): Flash, Pool, Precio bajando, Early bird, Bono rápido.

Al terminar pulsa **"Publicar producto"**: queda guardado en **Mis productos** (en este navegador) aún **no** visible en la web pública.

### Publicar cambios para el cliente
1. Revisa todo.
2. En **"Publicar en la web (GitHub Pages)"** pulsa **"Exportar JSON → data/productos.json"** (genera el catálogo).
3. Pulsa **"Publicar en GitHub ahora"**: sube el catálogo al repo (GitHub Pages lo publica automáticamente, ~1 min).
4. En la web del cliente un **Ctrl+F5** y verá el cambio (desde la última actualización la web lee el catálogo siempre fresco, sin caché).

**Consejo:** si antes de publicar haces muchos cambios, pulsa **"Sincronizar con repo"** (fusiona el catálogo publicado con tus productos nuevos sin perder nada). **"Subir fotos al repo"** sube las imágenes de los productos nuevos.

**"Importar JSON"** restaura una copia del catálogo en el editor.

> Si al editar **cambias el título, marca o `id`** a uno diferente, no estás "renombrando": el producto nuevo se **añade** y el viejo **sigue existiendo**. Para renombrar de verdad (p. ej. Converse → Asics) edita el producto existente **sin cambiar su id** y publícalo; luego elimina los duplicados que veas en **Mis productos**.

### Eliminar
En la lista "Mis productos", botón **Eliminar** del producto. Complementa borrando también su ficha del catálogo publicado si ya estaba a la venta (publica de nuevo el catálogo).

---

## 4. Pedidos de clientes

### 4.0 Modo guía
Abre el panel y te aparece **«👋 ¿Qué quieres hacer hoy?»** con atajos. Elige uno y el panel **te muestra solo lo necesario** para esa tarea (sin ruido). Para verlo todo de nuevo pulsa **«📄 Todo»**.
- **🛒 Hacer un pedido** → se enfoca el pegado del mensaje del cliente y el filtro se pone en "Pendientes de encargar".
- **📦 Pedidos en curso** → filtro "Enviados": aquí se gestiona tracking y llegadas. Nada queda pendiente.
- **⚠️ Incidencias** → filtro "Entregados": para anotar y cerrar reclamaciones de clientes.
- **👜 Productos y publicar** → toda la secuencia en una sola pantalla: formulario del producto → Mis productos → **Subir fotos al repo** → **Publicar en GitHub**. Haz y guarda los productos con «Publicar producto» (quedan en Mis productos); cuando tengas varios listos pulsa una sola vez **Exportar JSON → Sincronizar con repo → Publicar en GitHub ahora**.
- **💰 Precios** → revisar costes nuevos y guardar.
- **📄 Todo** → ver todas las secciones del panel.

### 4.1 Recibir e interpretar el pedido
El cliente hace su pedido en la web y pulsa **"Pedir por Bizum"**: la app genera el mensaje **"TOP VALOR - PEDIDO"** con sus datos, e incluye **códigos de integridad**: cada línea lleva `[XXX]` (3 letras/números) y al final una línea `REF: XXXXXX`.

Cuando te llegue (WhatsApp), **pégalo en "Mensaje del cliente"** y pulsa **"Parsear pedido"**.

Cada pedido muestra además una **barra de pasos** (Enlazar → Encargar → Pagar → Tracking → Entregado) que te dice en qué momento está y qué toca hacer ahora.

### 4.2 Comprobar la integridad (importante)
La tarjeta del pedido te dice el estado de la verificación:

- **✅ Integridad OK** — el cliente no ha tocado cantidades ni precios: puedes encargar con confianza.
- **⚠️ El REF no cuadra** — el mensaje fue **editado** (precios, cantidades, envío...). Puede identificar las **líneas afectadas**. **No encargues** un pedido editado.
- **Sin REF** — mensaje antiguo (versión previa a Fase 4): revísalo tú a mano.

**Si es inválido (⚠️):** se **bloquea todo el encargo** (no hay botón de Hipobuy, ni elegir producto, ni proveedor) y solo quedan estas acciones:
- **"📋 Copiar aviso al cliente"**: copia un escrito que explica que el pedido no es válido, **qué se ha detectado que se modificó**, que no se realizará, y cómo arreglarlo. Válido para correo o WhatsApp.
- **"🚨 WhatsApp: pedido no válido"**: abre el chat del cliente con ese mensaje listo para enviar.
- **"🚫 Anular pedido"**: lo archiva como **Anulado** (no se encargará nunca). Lo verás en el filtro **«Anulados»**; puedes desanularlo o eliminarlo.

Regla: **nunca se procesa un pedido editado, ni aunque ya hayan hecho el Bizum**. El aviso incluye: "si ya me hiciste Bizum, te lo devuelvo o lo aplicamos al pedido correcto cuando lo hagas de nuevo".

### 4.3 Encargar en el agente
Cada artículo aparece con:
- **"Abrir en Hipobuy"** si ya está enlazado: ficha exacta del encargo (envía ahí talla, color, SIN CAJA si aplica).
- Si **no** está enlazado: elige el producto en el desplegable "elegir producto" (aparece el botón de Hipobuy). Mejor aún, créealo en **Mis productos**.
- **Proveedor** de cada artículo (Hipobuy, Kakobuy, ...): se rellena solo según el enlace; puedes cambiarlo a mano. La lista de proveedores se edita en el campo bajo los filtros ("Guardar proveedores").
- **"🔍 Review precios"** (sección Publicar) revisa que los precios del catálogo cuadren.

Botones por pedido:
- **"Copiar ficha de envío"**: pega la ficha ENVÍO A en el encargo del agente (CON/SIN CAJA + datos del cliente).
- **"📦 Agrupar por proveedor"**: copia un resumen del pedido **agrupado por proveedor**, con subtotal por agente, para repartir los encargos.

### 4.4 Estados del pedido
Recibido → Encargado → Pagado al proveedor → **Tracking enviado** → **Entregado**.
- El **tracking se introduce justo al hacer el envío** (no se queda pendiente). Rellena el nº de seguimiento y pulsa **"Enviar tracking"**: se copia el mensaje (17track) y el pedido pasa a **"Tracking enviado"** automáticamente. El teléfono es la app del cliente con el prefijo +34.
- **Varios envíos por pedido**: si el agente envía por partes, pulsa **"+ otro envío"** y se crea **Envío 1/2**, **Envío 2/2**, etc. Cada envío tiene su nº de seguimiento y su checkbox **"llegó"**.
- **El pedido pasa a Entregado solo cuando han llegado TODOS los envíos.** Si alguno está en camino, se queda como Enviado y verás "🚚 Envíos: X/Y llegaron".
- **Entrega parcial de artículos**: el checkbox **"llegó"** de cada artículo también marca piezas. Cuando marcas la última aparece **"Todas las piezas llegadas → marcar Entregado"**.

### 4.5 Revisar tracking automático
Botón **"🔎 Revisar tracking (auto)"**:
- Consulta 17track de todos los envíos pendientes de los pedidos Enviados; si pone **Delivered**, marca ese envío como **"llegó"**. Cuando todos los envíos de un pedido han llegado, lo pasa a **Entregado** solo.
- 17track a veces bloquea la consulta automática: en ese caso **no falla en silencio**, te dice cuáles no pudo comprobar y te da el enlace directo. Compruébalos tú.

### 4.6 Incidencias
Si el cliente reclama (no llegó, defectuoso, ...):
- En la tarjeta del pedido pulsa **"⚠️ Registrar incidencia"** y anota el motivo. Queda marcada en el pedido en rojo.
- Cuando se resuelva, **"Cerrar incidencia"** la quita.
- La gestión completa (con importe, quién paga, estado) está en valoración para versiones futuras: por ahora se anota como nota.

### 4.7 Filtros y limpieza
Chips con contador: **Todos / Pendientes de encargar (Recibido) / Encargados / Pagados / Enviados / Entregados / Anulados**.
- **"Vaciar entregados"**: borra los pedidos marcados como Entregado (pide confirmación).
- **"Vaciar todos"**: borra todos los pedidos de una vez (pide confirmación). El historial de pedidos vive solo en tu navegador; no vuelve atrás.
- **Anulados** guarda el registro de los pedidos que no se encargaron (invalidados) por si necesitas consultarlos. Para quitarlos, Elimínalos uno a uno.

### 4.8 Margen real (Fase 5)
En la parte inferior de cada pedido:
- **Bizum recibido (€)**: lo que el cliente te ha pagado.
- **Coste encargo (€)**: lo que te ha cobrado el/los agente/s.
- **💰 Margen real** = Bizum − Coste (verde si es positivo, rojo si negativo). **Margen = Bizum recibido − coste del encargo** (tu beneficio final de ese pedido; los precios que cobras ya incluyen tu margen + IVA).

Arriba, junto a los filtros, verás los **totales** de todos los pedidos: Total Bizum · Coste encargos · **Margen total**.

---

## 5. WhatsApp y seguimiento
- **"Enviar por WhatsApp"** abre `wa.me` con el mensaje del tracking ya escrito: solo pulsas Enviar. En móvil usa tu app; en el PC usa WhatsApp Web/Escritorio.
- El **teléfono** se rellena solo (añade +34 si el cliente escribió 9 dígitos): corrígelo si hace falta.
- **"Enviar tracking"** copia el mensaje para pegarlo en WhatsApp, SMS o email (el cliente indica su correo en el pedido).

---

## 6. Preguntas frecuentes

- **¿Cómo sé que se lo han entregado?** Por el tracking (17track pone "Delivered") o por confirmación del cliente. Como no hay aviso automático gratis, usa el botón "🔎 Revisar tracking" o ábrelo tú y marca Entregado.
- **El pedido llegó por partes (2+ envíos).** Usa "+ otro envío" para crear Envío 1/2, 2/2... El pedido solo pasa a Entregado cuando TODOS los envíos tienen "llegó" marcado.
- **El cliente reclama que no le llegó.** En "Enviados" o "Entregados" del pedido usa "⚠️ Registrar incidencia" y déjalo anotado; cierra la incidencia cuando se resuelva.
- **Pedido inválido que no se encargará.** Usa "🚫 Anular pedido": queda archivado en el filtro "Anulados" sin riesgo de encargarlo por error.
- **Lo mandó editado + ya hizo Bizum.** No encargues. Envía el aviso de pedido no válido (tiene la instrucción de devolver/aplicar el Bizum) y pide un pedido nuevo correcto.
- **Antes de tocar nada nuevo, actualiza con Ctrl+F5** para cargar la última versión del panel.
- **El panel parece lento o con caché vieja** → prueba Ctrl+F5 o borra el almacenamiento del sitio en el navegador.