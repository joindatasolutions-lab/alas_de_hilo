// ========= CONFIGURACIÓN =========
const WHATSAPP_NUMERO = "573332571225";
const CATALOGO = document.querySelector(".catalogo");
const listaCarrito = document.getElementById("lista-carrito");
const totalTexto = document.getElementById("total");
const btnPagar = document.getElementById("btn-pagar");
const modal = document.getElementById("formulario-modal");
const form = document.getElementById("form-datos");
const cerrarModal = document.getElementById("cerrar-modal");

let carrito = [];

// ========= CARGAR PRODUCTOS =========
async function cargarProductos() {
  const response = await fetch("productos.json");
  const productos = await response.json();

  productos.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("producto");
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
      <label class="talla-label">Selecciona talla:</label>
      <select class="select-talla">
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

      carrito.push({ nombre, precio, talla });
      renderizarCarrito();
    });
  });
}

// ========= CARRITO =========
function renderizarCarrito() {
  listaCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = `${p.nombre} (Talla ${p.talla}) - $${p.precio.toLocaleString()}`;
    listaCarrito.appendChild(li);
    total += p.precio;
  });

  totalTexto.textContent = `Total: $${total.toLocaleString()}`;
  btnPagar.disabled = carrito.length === 0;
  actualizarContadorCarrito();
}

// ========= FORMULARIO =========
btnPagar.addEventListener("click", () => modal.classList.remove("oculto"));
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const telefono = document.getElementById("telefono").value;
  const direccion = document.getElementById("direccion").value;

  mostrarToast(`${nombre} (talla ${talla}) agregado al carrito 🧺`);

  carrito = [];
  renderizarCarrito();
  modal.classList.add("oculto");
});
cerrarModal.addEventListener("click", () => modal.classList.add("oculto"));

// ========= BOTÓN FLOTANTE Y DRAWER =========
const btnCarrito = document.getElementById("btn-carrito");
const carritoDrawer = document.getElementById("carrito");
const contadorCarrito = document.getElementById("contador-carrito");

btnCarrito.addEventListener("click", () => {
  carritoDrawer.classList.toggle("mostrar");
});

function actualizarContadorCarrito() {
  contadorCarrito.textContent = carrito.length;
}

// ======= TOAST NOTIFICATION =======
function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");
  toast.textContent = mensaje;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// === CONTROL DE DRAWER CARRITO ===
const btnDrawer = document.getElementById("btnDrawer");
const drawerCarrito = document.getElementById("drawerCarrito");
const cerrarDrawer = document.getElementById("cerrarDrawer");

// Abrir/cerrar carrito al hacer clic en el botón flotante
btnDrawer.addEventListener("click", () => {
  drawerCarrito.classList.add("open");
});

// Cerrar carrito al presionar la X
cerrarDrawer.addEventListener("click", () => {
  drawerCarrito.classList.remove("open");
});


// ========= INICIALIZAR =========
cargarProductos();
