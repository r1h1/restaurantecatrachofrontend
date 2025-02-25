// Lista de productos
const productos = [
    { id: 1, nombre: "Baleada Sencilla", precio: 15.00 },
    { id: 2, nombre: "Baleada con Huevo", precio: 20.00 },
    { id: 3, nombre: "Tajada con Queso", precio: 25.00 },
    { id: 4, nombre: "Pollo con Tajadas", precio: 40.00 },
    { id: 5, nombre: "Sopa de Res", precio: 50.00 }
];

//Funcion para chequear el token, si no, no permite ver la página
const isTokenExist = function(){
    const token = sessionStorage.getItem("authToken");
    const userInfo = localStorage.getItem("uuid");

    if(!token || !userInfo){
        window.location.href = '../../../views/common/login.html';
    }
    else{
        return;
    }
}

// Elementos del DOM
const productList = document.getElementById("product-list");
const cart = document.getElementById("cart");
const totalElement = document.getElementById("total");
let total = 0;
let carritoCompras = [];

const cargarProductos = function () {
    for (let i = 0; i < productos.length; i++) {
        let producto = productos[i];

        const card = document.createElement("div");
        card.classList.add("col-6", "mb-3");
        card.innerHTML = `
            <div class="card product-card p-2 text-center" onclick="agregarAlCarrito(${producto.id})">
                <h6 class="mt-2">${producto.nombre}</h6>
                <p class="text-muted">Q${producto.precio.toFixed(2)}</p>
            </div>
        `;
        productList.appendChild(card);
    }
};

// Buscar un producto por ID (Usando for en lugar de find)
const buscarProductoPorId = function (id) {
    for (let i = 0; i < productos.length; i++) {
        if (productos[i].id === id) {
            return productos[i]; // Retorna el producto encontrado
        }
    }
    return null; // Retorna null si no se encontró
};

// Agregar productos al carrito
const agregarAlCarrito = function (id) {
    const producto = buscarProductoPorId(id);
    if (!producto) return; // Si el producto no existe, se detiene la función.

    carritoCompras.push(producto); // Agrega el producto al array de compras.

    const item = document.createElement("li");
    item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    item.innerHTML = `
        ${producto.nombre} - Q${producto.precio.toFixed(2)}
        <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(this, ${producto.precio}, ${id})">X</button>
    `;

    cart.appendChild(item);
    total += producto.precio;
    totalElement.textContent = total.toFixed(2);
};

// Eliminar productos del carrito (Usando for en lugar de filter)
const eliminarDelCarrito = function (elemento, precio, id) {
    elemento.parentElement.remove();
    total -= precio;
    totalElement.textContent = total.toFixed(2);

    // Recorrer el carrito y eliminar el producto por ID
    for (let i = 0; i < carritoCompras.length; i++) {
        if (carritoCompras[i].id === id) {
            carritoCompras.splice(i, 1); // Elimina el producto del array
            break; // Sale del bucle después de eliminarlo
        }
    }
};

// Mostrar modal de confirmación
const mostrarModal = function () {
    document.getElementById("modalTotal").textContent = total.toFixed(2);
    document.getElementById("modalFechaCreacion").textContent = new Date().toLocaleDateString();
    document.getElementById("modalFechaEntrega").textContent = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString();
    new bootstrap.Modal(document.getElementById("modalConfirmacion")).show();
};

// Finalizar pedido y guardarlo en LocalStorage
const finalizarPedido = function () {
    const direccionEntrega = document.getElementById("direccion").value.trim();
    const indicaciones = document.getElementById("indicaciones").value.trim();

    if (!direccionEntrega) {
        alert("Por favor, ingrese una dirección de entrega.");
        return;
    }

    const pedido = {
        numeroPedido: Math.floor(100000 + Math.random() * 900000),
        productos: carritoCompras,
        total: total.toFixed(2),
        fechaCreacion: new Date().toLocaleDateString(),
        fechaEntrega: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString(),
        direccion: direccionEntrega,
        indicaciones: indicaciones || "Sin indicaciones"
    };

    // Guardar el pedido en LocalStorage
    localStorage.setItem("ultimoPedido", JSON.stringify(pedido));

    // Cerrar modal de confirmación
    bootstrap.Modal.getInstance(document.getElementById("modalConfirmacion")).hide();

    // Mostrar modal de éxito
    document.getElementById("numeroPedido").textContent = pedido.numeroPedido;
    new bootstrap.Modal(document.getElementById("modalExito")).show();
};

const refrescarPantalla = function () {
    localStorage.removeItem("ultimoPedido");
    location.href = 'compra.html';
}

// Inicializar la carga de productos
cargarProductos();
isTokenExist();