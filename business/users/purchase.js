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
        if (productos.length > 0) {  // Se corrige "lenght" por "length"
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
            productList.innerHTML = ""; // Limpiar la lista antes de cargar productos
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
        alert("Error al cargar los productos: " + error);
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


// Inicializar la carga de productos
cargarProductos();
isTokenExist();
