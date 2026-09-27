# TopValor — PASO A PASO: cómo atender un pedido de principio a fin

> Guía de operación diaria. Los botones que se citan son del **panel de administración** (admin.html).
> Regla de oro: **nada se envía solo**. Los botones "📋 Copiar..." copian texto (lo pegas tú). Los botones "... WhatsApp" **abren la conversación del cliente con el mensaje ya escrito**; tú le das a **Enviar**.

---

## 1. Llega el pedido
El cliente hace su pedido en la web y te manda el mensaje **"TOP VALOR - PEDIDO"** por WhatsApp.

**Qué haces:** lo pegas en el campo grande del panel y pulsas **"Parsear"**. El pedido entra como **Recibido**.

---

## 2. Comprueba la integridad (antes de nada)
En la parte superior de la tarjeta del pedido:

- ✅ **"Integridad OK"** → el cliente no ha tocado precios ni cantidades. Sigue al paso 3.
- ⚠️ **"El REF no cuadra"** → el mensaje ha sido **editado**. NO encargues, NO cobres:
  1. "📋 **Copiar aviso**" o "🚨 **WhatsApp: pedido no válido**" → le explicas que el pedido no es válido y que lo haga de nuevo.
  2. "🚫 **Anular pedido**" → queda archivado en *Anulados* (por si lo necesitas).
  3. Si el cliente ya pagó el pedido mal editado: se lo devuelves o se lo aplicas al pedido correcto (lo habla el aviso).

> **Regla: nunca proceses un mensaje editado, aunque ya haya Bizum.**

---

## 3. Manda el pedido al cliente para que lo revise 💡
En la tarjeta: **"💶 WhatsApp: pedir pago"** (o **"📋 Copiar aviso de pago"** si quieres mandarlo por correo u otro canal).

El mensaje incluye **todo el detalle** para que él lo verifique:
- Cada artículo (título, talla, color/modelo, precio, cantidad).
- Subtotal, envío y **TOTAL (IVA incl.)** y el **REF**.
- La **dirección de envío** que rellenó.

El mensaje le dice:
> Si todo es correcto, págamelo por Bizum y enseguida lo encargo.
> **Si algo está mal, haz un NUEVO pedido desde la web (no edites este mensaje) y envíamelo.**

**¿Por qué un nuevo pedido y no retocar el mensaje?** Porque el REF valida que el mensaje no se ha tocado. Si el cliente edita algo, el pedido llega "no válido" y bloquea todo el encargo. Un pedido nuevo de la web genera un REF nuevo y correcto.

**Si el cliente dice que algo falla pero ya pagó:** le dices "haz el pedido nuevo y te aplico el Bizum"; cuando lo envíe, anulas el antiguo (queda archivado) y anotas el Bizum en el nuevo.

---

## 4. Confirma el pago
Cuando te llega el Bizum:
1. Escribe el importe en **"Bizum recibido (€)"**.
2. Pulsa **"Confirmar pago ✓"** → queda marcado con la fecha (`✓ Pago confirmado el ...`). Con varios pedidos, así no te pierdes.

---

## 5. Reparte los encargos por proveedor
Pulsa **"📦 Agrupar por proveedor"**: copia qué artículo va a cada agente (Hipobuy, Kakobuy...) con el subtotal de cada uno. Lo pegas y lo divides.

---

## 6. Encarga en el agente (Hipobuy)
Por cada artículo:
1. Pulsa **"Abrir en Hipobuy"** → se abre el producto en la web del agente.
2. Elige talla y color/modelo usando el **"✔ Pedir exactamente: <color/modelo>"** de la línea del pedido.
3. Añádelo al carrito del agente.
4. En el formulario de envío del agente, pega la **"📋 Copiar ficha de envío"** (el recuadro 📮 *Envío del cliente* de la tarjeta: Nombre · Dirección · CP/ciudad · Teléfono · Correo). Es lo que pone el envío a nombre del cliente.
5. **Paga el encargo en Hipobuy** (ese pago se hace fuera del panel; el panel solo lo anotas).
6. Vuelve al panel y marca **«✓»** el artículo como encargado.

Con todos encargados → el pedido pasa a **Encargado**.

---

## 7. Anota el coste del encargo
Cuando sepas cuánto te ha cobrado el agente, escribe **"Coste encargo (€)"**. Con el "Bizum recibido" te calcula el **💰 margen real** (= Bizum − coste). Los precios que cobras ya llevan ese margen + IVA.

---

## 8. Llega el tracking del proveedor
Cuando el agente envía el paquete te da un **nº de seguimiento**. En la tarjeta:
1. En la fila **"Envío 1/1"** (siempre visible) **pega/teclea el nº de seguimiento** → se guarda solo.
2. **"Enviar tracking"** copia el mensaje con el enlace de 17track (por si lo mandas por correo).
3. **"Enviar por WhatsApp"** abre la conversación del cliente con ese mensaje escrito → solo le das a Enviar.
4. El pedido pasa a **Tracking enviado** automáticamente.

**Varios paquetes:** si el agente envía por partes o usas varios agentes, pulsa **"+ otro envío"** → tendrás Envío 1/2, 2/2, cada uno con su tracking. **El pedido se da por Entregado solo cuando TODOS han llegado.**
- Puedes marcar el checkbox **"llegó"** de cada envío (o usar **"🔎 Revisar tracking (auto)"** que los consulta de golpe).

---

## 9. Entrega y cierre
- Cuando todos los envíos llegan y el cliente tiene su paquete → **Entregado**.
- Apunta el nº de seguimiento llegado y guarda una **copia semanal** con **"💾 Descargar copia de pedidos"** (archivo .json en Drive/correo). Si algo pasa con el navegador, **"📥 Restaurar copia"** lo recupera.

---

## 10. Incidencias (si algo sale mal)
- **"⚠️ Registrar incidencia"** → motivo (no llegó / defectuoso / talla / falta artículo / no es el modelo / retraso / otro), nota, **Devolver (€)**, **Reposición**, hasta 2 fotos de prueba (se suben solas).
- Avanza **Pendiente → En gestión → Resuelta**; marca **"Bizum devuelto"** cuando reembolses.
- **"WhatsApp al cliente"** abre el mensaje ya escrito.
- El atajo **"⚠️ Incidencias"** filtra solo los pedidos con incidencia.

---

## Resumen exprés (para el día a día)
```
Llega pedido → Pegar + Parsear → ¿Validado (REF OK)?
   NO → Copiar aviso + WhatsApp no válido + Anular
   SÍ → 💶 WhatsApp: pedir pago (él REVISA todo el pedido)
        → Bizum recibido + Confirmar pago ✓
        → 📦 Agrupar por proveedor
        → Abrir Hipobuy + Pedir exactamente + Ficha de envío + pagar encargo + ✓
        → Coste encargo € (para el margen)
        → tracking del agente → pegar nº → Enviar por WhatsApp
        → todos llegaron → Entregado
```