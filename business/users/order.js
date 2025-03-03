// Configuración de URLs
const baseUrlApi = "https://elcatrachorestaurantes.somee.com";
const fullApiUrlPedidos = `${baseUrlApi}/api/Pedidos`;
const fullApiUrlDetallesPedido = `${baseUrlApi}/api/DetallesPedido`;

// Función Reutilizable para Fetch (POST, PUT)
const makeRequestPostPutOrder = async (url, method, body) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    // Obtén el token del sessionStorage
    const token = sessionStorage.getItem("authToken");

    // Agrega el token al encabezado Authorization si existe
    if (!token) {
        alert('No se procesó la solicitud, por favor, vuelve a loguearte');
        return;
    }

    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: method,
        headers: myHeaders,
        body: JSON.stringify(body),
        redirect: "follow"
    };

    try {
        const response = await fetch(url, requestOptions);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Error en la solicitud.");
        }
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Función Reutilizable para Fetch (GET, DELETE)
const makeReuestGetDeleteOrder = async (url, method) => {
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

    if(!localStorage.getItem("ultimoPedido")){
        alert('No se procedió con el pedido, no existe un pedido en cola.');
    }

    orderCreated();
};


// Función para insertar el pedido y sus detalles en una transacción simulada
const orderCreated = async () => {
    const pedido = JSON.parse(localStorage.getItem("ultimoPedido"));
    const encodedUserId = localStorage.getItem("uuid"); // Obtener el ID en base64

    if (!pedido) {
        alert('Necesitas hacer un pedido para continuar, no se encontró ningún pedido en cola.');
        return;
    }

    if (!encodedUserId) {
        alert('No se encontró un usuario válido logueado en el sistema, verifique.');
        return;
    }

    try {
        // Decodificar el ID de usuario almacenado en base64
        const idUsuario = parseInt(atob(encodedUserId)); // Convertir a número

        // Construcción del objeto para insertar el pedido
        const pedidoBody = {
            idPedido: 0, // ID en 0 como se solicita
            idUsuario: idUsuario, // ID del usuario decodificado
            numeroPedido: pedido.numeroPedido.toString(), // Convertir a string
            estado: "1", // Estado predeterminado
            fechaCreacion: new Date().toISOString(), // Fecha actual en formato ISO
            fechaEntregaEstimada: new Date(pedido.fechaEntrega).toISOString(), // Convertir fecha a ISO
            montoTotal: parseFloat(pedido.total) // Convertir el total a número
        };

        // Llamada a la API para insertar el pedido
        const pedidoData = await makeRequestPostPutOrder(fullApiUrlPedidos, "POST", pedidoBody);

        if (!pedidoData.isSuccess) {
            alert("No se pudo crear el pedido, verifique de nuevo.");
            return;
        }

        const idPedido = pedidoData.idPedido; // Obtener el ID del pedido insertado

        // Ahora intenta insertar los detalles del pedido
        const detallesExitosos = await insertOrderDetails(pedido, idPedido);

        if (!detallesExitosos) {
            // Si los detalles fallaron, eliminar el pedido insertado
            await makeReuestGetDeleteOrder(`${fullApiUrlPedidos}/${idPedido}`, "DELETE", {});
            alert("No se pudo crear el detalle del pedido, el pedido ha sido eliminado.");
            return;
        }

        successModal(); // Mostrar modal de éxito

    } catch (error) {
        alert("Error al insertar el pedido: " + error);
    }
};

// Función para insertar los detalles del pedido
const insertOrderDetails = async (pedido, idPedido) => {
    try {
        const groupedProducts = pedido.productos.reduce((acc, producto) => {
            if (!acc[producto.id]) {
                acc[producto.id] = { ...producto, cantidad: 1 };
            } else {
                acc[producto.id].cantidad += 1;
            }
            return acc;
        }, {});

        console.log("Productos agrupados:", groupedProducts);

        let allSuccess = true;

        for (const key in groupedProducts) {
            const producto = groupedProducts[key];

            const detalleBody = {
                idDetalle: 0, // ID en 0 como se solicita
                idPedido: idPedido, // Corregido para usar el ID del pedido recibido
                numeroPedido: pedido.numeroPedido.toString(),
                idProducto: producto.id, // ID del producto
                cantidad: producto.cantidad, // Cantidad correcta agrupada
                precioUnitario: parseFloat(producto.precio) // Convertir precio a número
            };

            console.log("Enviando detalle:", detalleBody);

            const detalleData = await makeRequestPostPutOrder(fullApiUrlDetallesPedido, "POST", detalleBody);

            if (!detalleData.isSuccess) {
                console.error("Error insertando detalle:", detalleData.message);
                allSuccess = false; // No detener el proceso, pero marcarlo como fallo
            }
        }

        return allSuccess; // Retornar si al menos un detalle falló

    } catch (error) {
        console.error("Error al insertar los detalles del pedido:", error);
        return false;
    }
};

//Funcion para confirmar que el pedido fue exitoso
const successModal = function () {
    // Cerrar modal de confirmación
    const modalConfirmacion = bootstrap.Modal.getInstance(document.getElementById("modalConfirmacion"));
    modalConfirmacion.hide();

    // Mostrar modal de éxito
    document.getElementById("numeroPedido").textContent = pedido.numeroPedido;
    const modalExito = new bootstrap.Modal(document.getElementById("modalExito"));
    modalExito.show();
    reset();
}


// Refrescar la pantalla después de finalizar pedido
const reset = function () {
    localStorage.removeItem("ultimoPedido");
    // Reiniciar el carrito
    carritoCompras = [];
    document.getElementById("cart").innerHTML = "";
    total = 0;
    document.getElementById("total").textContent = "0.00";
};