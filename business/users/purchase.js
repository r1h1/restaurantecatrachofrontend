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
    if (!token) return;
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

// Función mejorada para cargar productos y agrupar por categoría
const cargarProductos = async () => {
    const productList = document.getElementById("product-list");
    try {
        const productos = await makeReuestGetDelete(fullApiUrlProductos, "GET");

        if (productos.length > 0) {
            productList.innerHTML = "";

            const categorias = {};
            productos.forEach(p => {
                if (!categorias[p.categoria]) {
                    categorias[p.categoria] = [];
                }
                categorias[p.categoria].push(p);
            });

            for (const categoria in categorias) {
                const titulo = document.createElement("h4");
                titulo.classList.add("category-title");
                titulo.textContent = `Nuestros ${categoria}`;
                productList.appendChild(titulo);

                const fila = document.createElement("div");
                fila.classList.add("row", "mb-4");

                categorias[categoria].forEach(producto => {
                    const card = document.createElement("div");
                    card.classList.add("col-md-4", "mb-3");
                    card.innerHTML = `
                        <div class="card h-100 p-2 text-center product-card" onclick="agregarAlCarrito(${producto.idProducto}, '${producto.nombre}', ${producto.precio})">
                            <img src="${producto.imagenUrl}" class="card-img-top img-fluid" alt="${producto.nombre}" style="height: 150px; object-fit: cover;">
                            <div class="card-body">
                                <h6 class="card-title">${producto.nombre}</h6>
                                <p class="card-text text-muted">Q${producto.precio.toFixed(2)}</p>
                            </div>
                        </div>
                    `;
                    fila.appendChild(card);
                });

                productList.appendChild(fila);
            }

        } else {
            productList.innerHTML = "";
            const card = document.createElement("div");
            card.classList.add("col-12", "mb-3");
            card.innerHTML = `
                <div class="card p-2 text-center">
                    <h6 class="mt-2">-- NO HAY PRODUCTOS DISPONIBLES --</h6>
                    <p class="text-muted">Vuelve pronto, gracias por confiar en Donde El Catracho</p>
                </div>
            `;
            productList.appendChild(card);
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error,
            icon: "error"
        });
    }
};

// Agregar productos al carrito
const agregarAlCarrito = function (id, nombre, precio) {
    const cart = document.getElementById("cart");
    const totalElement = document.getElementById("total");

    const producto = { id, nombre, precio };
    carritoCompras.push(producto);

    const item = document.createElement("li");
    item.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
    item.innerHTML = `
        ${nombre} - ${precio.toFixed(2)}
        <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(this, ${precio}, ${id})"><i class="bi bi-trash-fill"></i></button>
    `;

    cart.appendChild(item);

    total += precio;
    totalElement.textContent = `${total.toFixed(2)}`;
};

// Eliminar productos del carrito
const eliminarDelCarrito = function (elemento, precio, id) {
    const totalElement = document.getElementById("total");

    elemento.parentElement.remove();

    const index = carritoCompras.findIndex(producto => producto.id === id);
    if (index !== -1) {
        carritoCompras.splice(index, 1);
        total -= precio;
    }

    totalElement.textContent = `${total.toFixed(2)}`;
};

// Inicializar
document.addEventListener("DOMContentLoaded", function () {
    isTokenExist();
    cargarProductos();
});