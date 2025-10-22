const WHATSAPP_NUMERO = "573332571225";
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyQzNwHdgGCSGz5dyIHHTn0SNwL0SbIfj_yRW5QXYKid9DJJFLj_djxDX-TGxBockui/exec";
const CATALOGO = document.querySelector(".catalogo");
const MODAL = document.getElementById("formulario-compra");
const FORM = document.getElementById("form-datos");
const BTN_CERRAR = document.getElementById("cerrar-modal");

let productoSeleccionado = null;

// ========== CARGAR PRODUCTOS ==========
async function cargarProductos() {
  const response = await fetch("productos.json");
  const productos = await response.json();

  productos.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("producto");
    card.dataset.id = p.id;
    card.dataset.nombre = p.nombre;
    card.dataset.precio = p.precio;

    // Generar tallas individuales
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
      <select id="talla-${p.id}" class="select-talla">
        <option value="">Selecciona...</option>
        ${opcionesTallas}
      </select>
      <div class="botones">
        <button class="btn btn-whatsapp">🛍️ WhatsApp</button>
        <button class="btn btn-wompi oculto">💳 Pagar con Wompi</button>
      </div>
    `;

    CATALOGO.appendChild(card);
  });

  agregarEventos();
}

// ========== EVENTOS ==========
function agregarEventos() {
  document.querySelectorAll(".select-talla").forEach((select) => {
    select.addEventListener("change", (e) => {
      const producto = e.target.closest(".producto");
      const botonPago = producto.querySelector(".btn-wompi");
      if (e.target.value !== "") botonPago.classList.remove("oculto");
    });
  });

  document.querySelectorAll(".btn-whatsapp").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const producto = e.target.closest(".producto");
      const nombre = producto.dataset.nombre;
      const precio = producto.dataset.precio;
      const talla = producto.querySelector(".select-talla").value;
      const mensaje = `Hola! Quiero hacer un pedido de ${nombre} (talla ${talla}) por $${precio}.`;
      window.open(`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`, "_blank");
    });
  });

  document.querySelectorAll(".btn-wompi").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      productoSeleccionado = e.target.closest(".producto");
      MODAL.style.display = "flex";
    });
  });

  BTN_CERRAR.addEventListener("click", () => {
    MODAL.style.display = "none";
    FORM.reset();
  });

  FORM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = productoSeleccionado.dataset.id;
    const precio = parseInt(productoSeleccionado.dataset.precio);
    const referencia = `pedido_${Date.now()}_${id}`;

    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const direccion = document.getElementById("direccion").value;

    alert(`Datos recibidos ✅\n\nCliente: ${nombre}\nTeléfono: ${telefono}\nDirección: ${direccion}`);

    try {
      const response = await fetch(`${BACKEND_URL}?reference=${referencia}&amount=${precio}`);
      const wompiUrl = await response.text();
      window.location.href = wompiUrl;
    } catch (err) {
      alert("Error generando el link de pago. Intenta nuevamente.");
    }
  });
}

cargarProductos();

