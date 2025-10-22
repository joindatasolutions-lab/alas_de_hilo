// === CONFIGURACIÓN ===
const WHATSAPP_NUMERO = "573332571225"; // número de WhatsApp
const WOMPI_BACKEND = "https://script.google.com/macros/s/AKfycbyQzNwHdgGCSGz5dyIHHTn0SNwL0SbIfj_yRW5QXYKid9DJJFLj_djxDX-TGxBockui/exec";

// === ESTADO GLOBAL ===
const state = { catalogo: [], cart: [] };
const fmtCOP = v => Number(v || 0).toLocaleString('es-CO');

// === INICIALIZAR ===
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

// === RENDERIZAR CATÁLOGO ===
function renderCatalog() {
  const cont = document.getElementById("catalogo");
  cont.innerHTML = "";

  state.catalogo.forEach(prod => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}">
      <div class="body">
        <div class="name">${prod.nombre}</div>
        <div class="price">$${fmtCOP(prod.precio)}</div>
        <p style="font-size:0.9rem;color:#666;">${prod.tallas}</p>
        <div style="display:flex;gap:6px;justify-content:center;margin-top:8px;">
          <button class="btn-primary" onclick="abrirWhatsApp('${prod.nombre}', ${prod.precio})">🛍️ WhatsApp</button>
          <button class="btn-outline" onclick="pagarWompi('${prod.id}', ${prod.precio})">💳 Pagar</button>
        </div>
      </div>
    `;
    cont.appendChild(card);
  });
}

// === WHATSAPP ===
function abrirWhatsApp(nombre, precio) {
  const mensaje = `Hola 👋 quiero hacer un pedido de *${nombre}* por valor de $${fmtCOP(precio)}.`;
  window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

// === WOMPI ===
function generarReferencia(id) {
  return `pedido_${Date.now()}_${id}`;
}

async function pagarWompi(id, precio) {
  const referencia = generarReferencia(id);
  try {
    const response = await fetch(`${WOMPI_BACKEND}?reference=${referencia}&amount=${precio}`);
    const wompiUrl = await response.text();
    window.location.href = wompiUrl;
  } catch (err) {
    Swal.fire("Error", "No se pudo generar el enlace de pago.", "error");
    console.error("Error al generar URL Wompi:", err);
  }
}

// === CARRITO (solo visual) ===
document.getElementById("btnDrawer").onclick = () => {
  renderDrawerCart();
  document.getElementById("drawerCarrito").classList.add("open");
};
document.getElementById("cerrarDrawer").onclick = () =>
  document.getElementById("drawerCarrito").classList.remove("open");
document.getElementById("vaciarCarrito").onclick = () => {
  state.cart = [];
  renderDrawerCart();
};

// === RENDER DRAWER ===
function renderDrawerCart() {
  const cont = document.getElementById("cartItemsDrawer");
  cont.innerHTML = "";
  const subtotal = state.cart.reduce((a, p) => a + p.precio * p.qty, 0);
  document.getElementById("subtotalDrawer").textContent = fmtCOP(subtotal);
  document.getElementById("totalDrawer").textContent = fmtCOP(subtotal);
}

// === INICIO ===
init();
