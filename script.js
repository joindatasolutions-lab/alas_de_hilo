/******************************
 * CONFIGURACIÓN GENERAL
 ******************************/
const fmtCOP = v => Number(v || 0).toLocaleString('es-CO');
const state = { catalogo: [], cart: [] };

const WHATSAPP_NUMERO = "573001720582";
const WOMPI_BACKEND = "https://script.google.com/macros/s/AKfycbyQzNwHdgGCSGz5dyIHHTn0SNwL0SbIfj_yRW5QXYKid9DJJFLj_djxDX-TGxBockui/exec";

/******************************
 * ENVIAR WHATSAPP
 ******************************/
function enviarWhatsApp(mensaje, numero = WHATSAPP_NUMERO) {
  window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

/******************************
 * INICIALIZAR CATÁLOGO
 ******************************/
async function init() {
  try {
    const res = await fetch("productos.json");
    state.catalogo = await res.json();
    renderCatalog();
  } catch (error) {
    console.error("Error cargando catálogo:", error);
    Swal.fire("Error", "No se pudo cargar el catálogo", "error");
  }
}

/******************************
 * RENDERIZAR CATÁLOGO
 ******************************/
function renderCatalog() {
  const cont = document.getElementById("catalogo");
  cont.innerHTML = "";

  state.catalogo.forEach(prod => {
    let tallas = [];
    if (typeof prod.tallas === "string") {
      const match = prod.tallas.match(/(\d+)\s*a\s*(\d+)/);
      if (match) {
        const min = parseInt(match[1]);
        const max = parseInt(match[2]);
        for (let i = min; i <= max; i++) tallas.push(i);
      } else tallas = [prod.tallas];
    } else if (Array.isArray(prod.tallas)) tallas = prod.tallas;

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <div class="body">
        <div class="name">${prod.nombre}</div>
        <div class="price">$${fmtCOP(prod.precio)}</div>
        <label>Talla:</label>
        <select id="talla-${prod.id}" class="select-talla">
          <option value="">Selecciona</option>
          ${tallas.map(t => `<option value="${t}">${t}</option>`).join("")}
        </select>
        <button class="btn-add" onclick="addToCart('${prod.id}')">Agregar</button>
      </div>
    `;
    cont.appendChild(card);
  });
}

/******************************
 * AGREGAR AL CARRITO
 ******************************/
function addToCart(id) {
  const prod = state.catalogo.find(p => p.id === id);
  const select = document.getElementById(`talla-${id}`);
  const talla = select.value;

  if (!talla) {
    Swal.fire("Selecciona una talla", "", "warning");
    return;
  }

  const existing = state.cart.find(p => p.id === id && p.talla === talla);
  if (existing) existing.qty++;
  else state.cart.push({ ...prod, talla, qty: 1 });

  updateCartCount();
  renderDrawerCart();
  Swal.fire("Agregado", `${prod.nombre} (Talla ${talla})`, "success");
}

/******************************
 * CARRITO LATERAL
 ******************************/
function updateCartCount() {
  document.getElementById("cartCount").textContent = state.cart.reduce((a, b) => a + b.qty, 0);
}

function renderDrawerCart() {
  const cont = document.getElementById("cartItemsDrawer");
  cont.innerHTML = "";
  let subtotal = 0;
  if (state.cart.length === 0) {
    cont.innerHTML = `<p>Tu carrito está vacío 🛒</p>`;
  } else {
    state.cart.forEach(p => {
      const sub = p.precio * p.qty;
      subtotal += sub;
      cont.innerHTML += `
        <li class="cart-item">
          <div>
            <strong>${p.nombre}</strong><br>
            Talla: ${p.talla} — $${fmtCOP(p.precio)} × ${p.qty}
          </div>
          <div class="qty">
            <button onclick="changeQty('${p.id}','${p.talla}', -1)">−</button>
            <span>${p.qty}</span>
            <button onclick="changeQty('${p.id}','${p.talla}', 1)">+</button>
          </div>
        </li>`;
    });
  }
  document.getElementById("subtotalDrawer").textContent = fmtCOP(subtotal);
  document.getElementById("totalDrawer").textContent = fmtCOP(subtotal);
}

/******************************
 * CAMBIAR CANTIDAD EN CARRITO
 ******************************/
function changeQty(id, talla, delta) {
  const item = state.cart.find(p => p.id === id && p.talla === talla);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) state.cart = state.cart.filter(p => !(p.id === id && p.talla === talla));
  updateCartCount();
  renderDrawerCart();
}

/******************************
 * BOTONES DE CARRITO
 ******************************/
document.getElementById("btnDrawer").onclick = () => {
  renderDrawerCart();
  document.getElementById("drawerCarrito").classList.add("open");
};
document.getElementById("cerrarDrawer").onclick = () =>
  document.getElementById("drawerCarrito").classList.remove("open");
document.getElementById("vaciarCarrito").onclick = () => {
  state.cart = [];
  renderDrawerCart();
  updateCartCount();
};

/******************************
 * BOTÓN “CONTINUAR”
 ******************************/
document.getElementById("btnContinuarPedido").onclick = () => {
  if (state.cart.length === 0) {
    Swal.fire("Carrito vacío", "Agrega productos antes de continuar", "warning");
    return;
  }
  document.getElementById("drawerCarrito").classList.remove("open");
  document.getElementById("viewCatalog").classList.remove("active");
  document.getElementById("viewForm").classList.add("active");

  const resumen = state.cart.map(p =>
    `${p.qty}× ${p.nombre} (Talla ${p.talla}) — $${fmtCOP(p.precio * p.qty)}`
  ).join("<br>");
  document.getElementById("resumenProducto").innerHTML =
    `<h4>🛍 Tu pedido</h4>${resumen}<p><strong>Total:</strong> $${fmtCOP(state.cart.reduce((a, b) => a + b.precio * b.qty, 0))}</p>`;
};

/******************************
 * PAGO CON WOMPI
 ******************************/
document.getElementById("btnPagarWompi").onclick = async () => {
  const nombre = document.getElementById("nombreCliente").value.trim();
  const telefono = document.getElementById("telefonoCliente").value.trim();
  const direccion = document.getElementById("direccionCliente").value.trim();
  const barrio = document.getElementById("barrioCliente").value.trim();

  if (!nombre || !telefono || !direccion || !barrio) {
    Swal.fire("Completa todos los campos", "", "warning");
    return;
  }

  const total = state.cart.reduce((a, b) => a + b.precio * b.qty, 0);
  const detallePedido = state.cart.map(p => `${p.qty}× ${p.nombre} (Talla ${p.talla})`).join(", ");
  const reference = `PED_${Date.now()}_${state.cart.map(p => p.id).join("-")}`;

  const jsonData = { reference, nombre, telefono, direccion, barrio, detallePedido, total };

  // Muestra JSON en pantalla
  const preview = document.getElementById("jsonPreview");
  if (preview) preview.textContent = JSON.stringify(jsonData, null, 2);

  try {
    const resp = await fetch(WOMPI_BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(jsonData)
    });
    const text = await resp.text();
    console.log("Respuesta Apps Script:", text);

    if (!resp.ok || (!text.includes("✅") && !text.includes("OK"))) {
      throw new Error(text);
    }

    Swal.fire("Pedido registrado", "Redirigiendo a Wompi...", "success");

    const wompiResp = await fetch(`${WOMPI_BACKEND}?reference=${reference}&amount=${total}`);
    const wompiURL = await wompiResp.text();
    window.location.href = wompiURL;

  } catch (err) {
    console.error("Error en envío:", err);
    Swal.fire("Error", "No se pudo registrar el pedido o generar el pago.", "error");
  }
};

/******************************
 * CONFIRMACIÓN POR WHATSAPP
 ******************************/
document.getElementById("btnConfirmarWhatsapp").onclick = () => {
  const nombre = document.getElementById("nombreCliente").value.trim();
  const telefono = document.getElementById("telefonoCliente").value.trim();
  const direccion = document.getElementById("direccionCliente").value.trim();
  const barrio = document.getElementById("barrioCliente").value.trim();
  const total = state.cart.reduce((a, b) => a + b.precio * b.qty, 0);

  const mensaje = `🧾 *Pedido de ${nombre}*\n📞 ${telefono}\n📍 ${direccion}, ${barrio}\n\n` +
    state.cart.map(p => `• ${p.qty}× ${p.nombre} (Talla ${p.talla})`).join("\n") +
    `\n\n💰 *Total:* $${fmtCOP(total)}\nGracias por tu compra 🌸`;

  enviarWhatsApp(mensaje, telefono.startsWith("57") ? telefono : "57" + telefono);
};

/******************************
 * REGRESAR AL CATÁLOGO
 ******************************/
document.getElementById("btnVolver").onclick = () => {
  document.getElementById("viewForm").classList.remove("active");
  document.getElementById("viewCatalog").classList.add("active");
};

/******************************
 * CARGA INICIAL
 ******************************/
init();
