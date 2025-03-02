// Configuración de URLs
const baseUrl = "https://elcatrachorestaurantes.somee.com";
const fullApiUrlProductos = `${baseUrl}/api/Productos`;

// Variable global para el total
let total = 0;
let carritoCompras = [];

//Funcion para ver el token, si no, no permite ver la página
const isTokenExist = function () {
    const token = sessionStorage.getItem("authToken");
    const userInfo = localStorage.getItem("uuid");

    if (!token || !userInfo) {
        window.location.href = '../../../views/common/login.html';
    }
}

//Funcion para cerrar sesión
const closeSession = function () {
    localStorage.removeItem("uuid");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("ultimoPedido");
    // Reiniciar el carrito
    carritoCompras = [];
    document.getElementById("cart").innerHTML = "";
    total = 0;
    document.getElementById("total").textContent = "0.00";
    window.location.href = "../../../views/common/login.html";
}

// Función Reutilizable para Fetch (GET, DELETE)
const makeReuestGetDelete = async (url, method) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const token = sessionStorage.getItem("authToken");
    if (!token) {
        return;
    }
    myHeaders.append("Authorization", `Bearer ${token}`);

    const reuestOptions = {
        method: method,
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch(url, reuestOptions);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Error en la solicitud.");
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Función para obtener productos y cargarlos en la interfaz
const cargarProductos = async () => {
    const productList = document.getElementById("product-list");
    try {
        const productos = await makeReuestGetDelete(fullApiUrlProductos, "GET");
        if (productos) {
            productList.innerHTML = ""; // Limpiar la lista antes de cargar productos

            productos.forEach(producto => {
                const card = document.createElement("div");
                card.classList.add("col-6", "mb-3");
                card.innerHTML = `
                    <div class="card product-card p-2 text-center" onclick="agregarAlCarrito(${producto.idProducto}, '${producto.nombre}', ${producto.precio})">
                        <h6 class="mt-2">${producto.nombre}</h6>
                        <p class="text-muted">${producto.precio.toFixed(2)}</p>
                    </div>
                `;
                productList.appendChild(card);
            });
        } else {
            console.log("No hay productos disponibles.");
        }
    } catch (error) {
        console.error("Error al obtener productos:", error);
        alert("Error al cargar los productos.");
    }
};

// Agregar productos al carrito
const agregarAlCarrito = function (id, nombre, precio) {
    const cart = document.getElementById("cart");
    const totalElement = document.getElementById("total");

    const producto = { id, nombre, precio };
    carritoCompras.push(producto); // Agregar al array de compras

    const item = document.createElement("li");
    item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    item.innerHTML = `
        ${nombre} - ${precio.toFixed(2)}
        <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(this, ${precio}, ${id})">X</button>
    `;

    cart.appendChild(item);

    // Actualizar total global
    total += precio;
    totalElement.textContent = `${total.toFixed(2)}`;
};

// Eliminar productos del carrito
const eliminarDelCarrito = function (elemento, precio, id) {
    const totalElement = document.getElementById("total");

    // Eliminar del DOM
    elemento.parentElement.remove();

    // Eliminar del array carritoCompras
    const index = carritoCompras.findIndex(producto => producto.id === id);
    if (index !== -1) {
        carritoCompras.splice(index, 1); // Eliminar producto
        total -= precio; // Restar al total
    }

    // Actualizar total en pantalla
    totalElement.textContent = `${total.toFixed(2)}`;
};


// Función para mostrar el modal de confirmación de pedido
const mostrarModal = function () {
    const modalTotal = document.getElementById("modalTotal");
    const modalFechaCreacion = document.getElementById("modalFechaCreacion");
    const modalFechaEntrega = document.getElementById("modalFechaEntrega");

    if (carritoCompras.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de confirmar el pedido.");
        return;
    }

    modalTotal.textContent = total.toFixed(2);
    modalFechaCreacion.textContent = new Date().toLocaleDateString();
    modalFechaEntrega.textContent = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString();

    const modal = new bootstrap.Modal(document.getElementById("modalConfirmacion"));
    modal.show();
};


// Función para finalizar el pedido y guardarlo en LocalStorage
const finalizarPedido = function () {
    const direccionEntrega = document.getElementById("direccion").value.trim();
    const indicaciones = document.getElementById("indicaciones").value.trim();

    if (!direccionEntrega) {
        alert("Por favor, ingrese una dirección de entrega.");
        return;
    }

    if (carritoCompras.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de finalizar el pedido.");
        return;
    }

    const pedido = {
        numeroPedido: Math.floor(100000 + Math.random() * 900000),
        productos: carritoCompras,
        total: total.toFixed(2),
        fechaCreacion: new Date().toLocaleDateString(),
        fechaEntrega: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString(),
        direccion: direccionEntrega,
        indicaciones: indicaciones || "N/A"
    };

    // Guardar el pedido en LocalStorage
    localStorage.setItem("ultimoPedido", JSON.stringify(pedido));

    // Cerrar modal de confirmación
    const modalConfirmacion = bootstrap.Modal.getInstance(document.getElementById("modalConfirmacion"));
    modalConfirmacion.hide();

    // Mostrar modal de éxito
    document.getElementById("numeroPedido").textContent = pedido.numeroPedido;
    const modalExito = new bootstrap.Modal(document.getElementById("modalExito"));
    modalExito.show();
};

// Refrescar la pantalla después de finalizar pedido
const refrescarPantalla = function () {
    localStorage.removeItem("ultimoPedido");
    // Reiniciar el carrito
    carritoCompras = [];
    document.getElementById("cart").innerHTML = "";
    total = 0;
    document.getElementById("total").textContent = "0.00";
    location.href = 'compra.html';
};


// Inicializar la carga de productos
cargarProductos();
isTokenExist();
