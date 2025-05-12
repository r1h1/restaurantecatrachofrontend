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

        if (productos.length > 0) {
            productList.innerHTML = "";

            // Agrupar productos por categoría
            const categorias = {};
            productos.forEach(p => {
                if (!categorias[p.categoria]) {
                    categorias[p.categoria] = [];
                }
                categorias[p.categoria].push(p);
            });

            // Renderizar productos por categoría
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

    const productoExistente = carritoCompras.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;

        const itemDOM = document.getElementById(`item-${id}`);
        itemDOM.querySelector(".cantidad").textContent = `x${productoExistente.cantidad}`;
        itemDOM.querySelector(".subtotal").textContent = `Subtotal: Q${(productoExistente.precio * productoExistente.cantidad).toFixed(2)}`;
    } else {
        const nuevoProducto = { id, nombre, precio, cantidad: 1 };
        carritoCompras.push(nuevoProducto);

        const item = document.createElement("li");
        item.classList.add("list-group-item");
        item.id = `item-${id}`;
        item.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <div>${nombre} <span class="badge bg-secondary rounded-pill cantidad">x1</span></div>
                    <div class="text-muted small">
                        Q${precio.toFixed(2)} c/u | <span class="subtotal">Subtotal: Q${precio.toFixed(2)}</span>
                    </div>
                </div>
                <div class="btn-group btn-group-sm ms-2 mt-2" role="group">
                    <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${id}, -1)">–</button>
                    <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${id}, 1)">+</button>
                </div>
            </div>
        `;
        cart.appendChild(item);
        Swal.fire({
         toast: true,
         position: 'top-end',
         icon: 'success',
         title: 'Producto agregado al carrito',
         showConfirmButton: false,
         timer: 1200
});
    }

    total += precio;
    totalElement.textContent = `${total.toFixed(2)}`;
    actualizarBotonConfirmar();

};

const resetMetodoPago = function () {

    document.getElementById("pagoEfectivo").checked = true;
 
    document.getElementById("infoTarjeta").classList.add("d-none");
    document.getElementById("infoBitcoin").classList.add("d-none");

    document.querySelector('#infoTarjeta input').value = "";
    document.querySelector('#infoBitcoin input').value = "";
    document.getElementById("nombreTarjeta").value = "";
    document.getElementById("numeroTarjeta").value = "";
    document.getElementById("fechaExp").value = "";
    document.getElementById("cvv").value = "";

};




const cambiarCantidad = function (id, cambio) {
    const totalElement = document.getElementById("total");

    const producto = carritoCompras.find(p => p.id === id);
    if (!producto) return;

    // Sumar o restar cantidad
    producto.cantidad += cambio;

    // Si baja a 0 o menos, eliminar
    if (producto.cantidad <= 0) {
        carritoCompras = carritoCompras.filter(p => p.id !== id);
        document.getElementById(`item-${id}`).remove();
    } else {
        // Actualizar cantidad y subtotal
        const itemDOM = document.getElementById(`item-${id}`);
        itemDOM.querySelector(".cantidad").textContent = `x${producto.cantidad}`;
        itemDOM.querySelector(".subtotal").textContent = `Subtotal: Q${(producto.precio * producto.cantidad).toFixed(2)}`;
    }

    // Recalcular total
    total = carritoCompras.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
    totalElement.textContent = `${total.toFixed(2)}`;
    actualizarBotonConfirmar();
};




// Inicializar la carga de productos
document.addEventListener("DOMContentLoaded", function () {
    isTokenExist();
    cargarProductos();
     actualizarBotonConfirmar(); 
     const metodoPagoInputs = document.querySelectorAll('input[name="metodoPago"]');
    const infoTarjeta = document.getElementById("infoTarjeta");
    const infoBitcoin = document.getElementById("infoBitcoin");

    metodoPagoInputs.forEach(input => {
        input.addEventListener("change", () => {
            infoTarjeta.classList.add("d-none");
            infoBitcoin.classList.add("d-none");

            if (input.value === "Tarjeta") {
                infoTarjeta.classList.remove("d-none");
            } else if (input.value === "Bitcoin") {
                infoBitcoin.classList.remove("d-none");
            }
        });
    });

     document.getElementById("numeroTarjeta").addEventListener("input", function () {
    this.value = this.value
        .replace(/\D/g, "")               
        .substring(0, 16)                
        .replace(/(.{4})/g, "$1 ")       
        .trim();
});

    document.getElementById("cvv").addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 3);
    });

  document.getElementById("fechaExp").addEventListener("input", function () {
    let input = this.value.replace(/[^\d]/g, "");
    if (input.length >= 3) {
        input = input.substring(0, 2) + "/" + input.substring(2, 4);
    }
    this.value = input.substring(0, 5);
});

    
});

const actualizarBotonConfirmar = function () {
    const btn = document.getElementById("btnConfirmar");
    btn.disabled = carritoCompras.length === 0;
};


