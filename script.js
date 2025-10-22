/****************************
 * CONFIGURACIÓN PRINCIPAL
 ****************************/
const WHATSAPP_NUMERO = "573332571225";
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyQzNwHdgGCSGz5dyIHHTn0SNwL0SbIfj_yRW5QXYKid9DJJFLj_djxDX-TGxBockui/exec";
const CATALOGO = document.querySelector(".catalogo");

/****************************
 * FUNCIÓN: CARGAR PRODUCTOS DESDE JSON
 ****************************/
async function cargarProductos() {
  try {
    const response = await fetch("productos.json");
    const productos = await response.json();

    productos.forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("producto");
      card.dataset.id = p.id;
      card.dataset.nombre = p.nombre;
      card.dataset.precio = p.precio;

      let opcionesTallas = "";
      if (p.tallas.includes("a")) {
        const [inicio, fin] = p.tallas.match(/\d+/g).map(Number);
        for (let i = inicio; i <= fin; i++) {
          opcionesTallas += `<option value="${i}">${i}</option>`;
        }
      } else {
        opcionesTallas = `<option value="Única">${p.tallas}</option>`;
      }

      card.innerHTML = `
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p class="precio">$${p.precio.toLocaleString()}</p>
        <label for="talla-${p.id}" class="talla-label">Selecciona talla:</label>
        <select id="talla-${p.id}" class="select-talla">${opcionesTallas}</select>
        <div class="botones">
          <button class="btn btn-whatsapp">🛍️ WhatsApp</button>
          <button class="btn btn-wompi">💳 Pagar con Wompi</button>
        </div>
      `;

      CATALOGO.appendChild(card);
    });

    agregarEventos();
  } catch (err) {
    console.error("Error cargando catálogo:", err);
  }
}

/****************************
 * FUNCIÓN: GENERAR REFERENCIA
 ****************************/
function generarReferencia(idProducto) {
  const timestamp = Date.now();
  return `pedido_${timestamp}_${idProducto}`;
}

/****************************
 * FUNCIÓN: AGREGAR EVENTOS
 ****************************/
function agregarEventos() {
  document.querySelectorAll(".btn-whatsapp").forEach((boton) => {
    boton.addEventListener("click", (e) => {
      const producto = e.target.closest(".producto");
      const nombre = producto.dataset.nombre;
      const precio = producto.dataset.precio;
      const talla = producto.querySelector(".select-talla").value;
      const mensaje = `Hola! Quiero hacer un pedido de ${nombre} (talla ${talla}) por $${precio}.`;

      window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`, "_blank");
    });
  });

  document.querySelectorAll(".btn-wompi").forEach((boton) => {
    boton.addEventListener("click", async (e) => {
      const producto = e.target.closest(".producto");
      const id = producto.dataset.id;
      const precio = parseInt(producto.dataset.precio);
      const referencia = generarReferencia(id);

      try {
        const response = await fetch(`${BACKEND_URL}?reference=${referencia}&amount=${precio}`);
        const wompiUrl = await response.text();
        window.location.href = wompiUrl;
      } catch (err) {
        alert("Error generando el link de pago. Intenta nuevamente.");
        console.error("Error al obtener URL firmada:", err);
      }
    });
  });
}

/****************************
 * EJECUTAR AL CARGAR LA PÁGINA
 ****************************/
cargarProductos();
