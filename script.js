// ========= CONFIGURACIÓN =========
const WHATSAPP_NUMERO = "573332571225";
const BACKEND_URL = "https://script.google.com/macros/s/AKfycbyQzNwHdgGCSGz5dyIHHTn0SNwL0SbIfj_yRW5QXYKid9DJJFLj_djxDX-TGxBockui/exec";
const CATALOGO = document.querySelector(".catalogo");
const MODAL = document.getElementById("formulario-compra");
const FORM = document.getElementById("form-datos");
const BTN_CERRAR = document.getElementById("cerrar-modal");

// ========= VARIABLES GLOBALES =========
let productoSeleccionado = null;
let carrito = [];

// ========= CARGAR PRODUCTOS =========
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
        <button class="btn btn-whatsapp">🛍️ Agregar al carrito</button>
      </div>
    `;

    CATALOGO.appendChild(card);
  });

  agregarEventos();
}

// ========= EVENTOS =========
function agregarEventos() {
  // Evento agregar al carrito
  document.querySelectorAll(".btn-whatsapp").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const producto = e.target.closest(".producto");
      const nombre = producto.dataset.nombre;
      const precio = parseInt(producto.dataset.precio);
      const talla = producto.querySelector(".select-talla").value;

      if (!talla) {
        alert("Por favor selecciona una talla antes de agregar al carrito.");
        return;
      }

      const productoCarrito = { nombre, precio, talla };
      carrito.push(productoCarrito);
      renderizarCarrito();

      alert(`${nombre} (talla ${talla}) agregado al carrito 🧺`);
    });
  });
}

// ========= CARRITO =========
const listaCarrito = document.getElementById("lista-carrito");
const totalTexto = document.getElementById("total");
const btnPagar = document.getElementById("btn-pagar");
const modal = document.getElementById("formulario-modal");
const form = document.getElementById("form-datos");
const cerrarModal = document.getElementById("cerrar-modal");

function renderizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((p, index) => {
    const li = document.createElement("li");
    li.textContent = `${p.nombre} (Talla ${p.talla}) - $${p.precio.toLocaleString()}`;
    listaCarrito.appendChild(li);
    total += p.precio;
  });

  totalTexto.textContent = `Total: $${total.toLocaleString()}`;
  btnPagar.disabled = carrito.length === 0;
}

// ========= FORMULARIO =========
btnPagar.addEventListener("click", () => {
  modal.classList.remove("oculto");
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const telefono = document.getElementById("telefono").value;
  const direccion = document.getElementById("direccion").value;

  alert(`Gracias ${nombre}! Tu pedido será enviado a ${direccion}. Nos comunicaremos al ${telefono}.`);

  // Vaciar carrito tras confirmar
  carrito = [];
  renderizarCarrito();
  modal.classList.add("oculto");
});

cerrarModal.addEventListener("click", () => {
  modal.classList.add("oculto");
});

// ========= INICIALIZAR =========
cargarProductos();
