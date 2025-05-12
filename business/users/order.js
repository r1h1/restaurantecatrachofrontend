// Configuración de URLs
const baseUrlApi = "https://elcatrachorestaurantes.somee.com";
const fullApiUrlPedidos = `${baseUrlApi}/api/Pedidos`;
const fullApiUrlDetallesPedido = `${baseUrlApi}/api/DetallesPedido`;

// Funciones reutilizables
const makeRequestPostPutOrder = async (url, method, body) => {
    const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
    });
    try {
        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(body),
            redirect: "follow"
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        throw error;
    }
};

const makeReuestGetDeleteOrder = async (url, method) => {
    const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
    });
    try {
        const response = await fetch(url, { method, headers, redirect: "follow" });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        throw error;
    }
};

// Modal de confirmación
const mostrarModal = () => {
    if (carritoCompras.length === 0) return Swal.fire({ title: "Advertencia", text: "El carrito está vacío.", icon: "warning" });
    document.getElementById("modalTotal").textContent = total.toFixed(2);
    document.getElementById("modalFechaCreacion").textContent = new Date().toLocaleDateString();
    document.getElementById("modalFechaEntrega").textContent = new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString();
    new bootstrap.Modal(document.getElementById("modalConfirmacion")).show();
};

// Finalizar pedido
const finalizarPedido = () => {
    const direccion = document.getElementById("direccion").value.trim();
    const indicaciones = document.getElementById("indicaciones").value.trim();
    if (!direccion || !indicaciones) return Swal.fire({ title: "Advertencia", text: "Ingresa todos los datos requeridos.", icon: "warning" });
    if (carritoCompras.length === 0) return Swal.fire({ title: "Advertencia", text: "El carrito está vacío.", icon: "warning" });

    const metodo = document.querySelector('input[name="metodoPago"]:checked').value;
    if (metodo === "Tarjeta") {
        const nombre = document.getElementById("nombreTarjeta").value.trim();
        const numero = document.getElementById("numeroTarjeta").value.replace(/\s/g, "");
        const fecha = document.getElementById("fechaExp").value.trim();
        const cvv = document.getElementById("cvv").value.trim();
        if (!nombre || numero.length !== 16 || !/^\d{2}\/\d{2}$/.test(fecha) || !/^\d{3,4}$/.test(cvv)) {
            return Swal.fire({ icon: "warning", title: "Datos inválidos", text: "Revisa los datos de la tarjeta." });
        }
    }
    if (metodo === "Bitcoin" && !document.getElementById("walletId").value.trim()) {
        return Swal.fire({ icon: "warning", title: "Falta Wallet ID", text: "Debes ingresar tu Wallet ID." });
    }

    const pedido = {
        numeroPedido: Math.floor(100000 + Math.random() * 900000),
        productos: carritoCompras,
        total: total.toFixed(2),
        fechaCreacion: new Date().toLocaleDateString(),
        fechaEntrega: new Date(new Date().setDate(new Date().getDate() + 1)).toLocaleDateString(),
        direccion,
        indicaciones: indicaciones || "N/A"
    };

    localStorage.setItem("ultimoPedido", JSON.stringify(pedido));
    if (!localStorage.getItem("ultimoPedido")) return Swal.fire({ title: "Advertencia", text: "No se pudo crear el pedido.", icon: "warning" });

    orderCreated();
};

// Crear pedido
const orderCreated = async () => {
    const pedidoJson = localStorage.getItem("ultimoPedido");
    if (!pedidoJson) return Swal.fire({ title: "Advertencia", text: "No hay pedido creado.", icon: "warning" });

    let pedido;
    try {
        pedido = JSON.parse(pedidoJson);
    } catch (error) {
        return Swal.fire({ title: "Error", text: error, icon: "error" });
    }

    const userIdEncoded = localStorage.getItem("uuid");
    if (!userIdEncoded) return Swal.fire({ title: "Advertencia", text: "Usuario no válido.", icon: "warning" });

    try {
        const idUsuario = parseInt(atob(userIdEncoded));
        const pedidoBody = {
            idPedido: 0,
            idUsuario,
            numeroPedido: pedido.numeroPedido.toString(),
            estado: "1",
            fechaCreacion: new Date().toISOString(),
            fechaEntregaEstimada: new Date(pedido.fechaEntrega).toISOString(),
            montoTotal: parseFloat(pedido.total),
            direccion: pedido.direccion,
            indicaciones: pedido.indicaciones
        };

        const resPedido = await makeRequestPostPutOrder(fullApiUrlPedidos, "POST", pedidoBody);
        if (!resPedido.isSuccess) return Swal.fire({ title: "Advertencia", text: "Error al crear pedido.", icon: "warning" });

        const idPedido = resPedido.id_pedido;
        const detallesSuccess = await insertOrderDetails(pedido, idPedido);

        if (!detallesSuccess) {
            await makeReuestGetDeleteOrder(`${fullApiUrlPedidos}/${idPedido}`, "DELETE");
            return Swal.fire({ title: "Advertencia", text: "Error en detalles. Pedido eliminado.", icon: "warning" });
        }

        successModal(pedido.numeroPedido.toString());
    } catch (error) {
        Swal.fire({ title: "Error", text: error, icon: "error" });
    }
};

// Insertar detalles
const insertOrderDetails = async (pedido, idPedido) => {
    try {
        const agrupados = pedido.productos.reduce((acc, p) => {
            if (!acc[p.id]) acc[p.id] = { ...p, cantidad: 1 };
            else acc[p.id].cantidad += 1;
            return acc;
        }, {});

        let allOk = true;
        for (const key in agrupados) {
            const p = agrupados[key];
            const detalle = {
                idDetalle: 0,
                idPedido,
                numeroPedido: pedido.numeroPedido.toString(),
                idProducto: p.id,
                cantidad: p.cantidad,
                precioUnitario: parseFloat(p.precio)
            };
            const res = await makeRequestPostPutOrder(fullApiUrlDetallesPedido, "POST", detalle);
            if (!res.isSuccess) allOk = false;
        }
        return allOk;
    } catch (error) {
        Swal.fire({ title: "Error", text: error, icon: "error" });
        return false;
    }
};

// Mostrar modal de éxito
const successModal = (numeroPedido) => {
    bootstrap.Modal.getInstance(document.getElementById("modalConfirmacion")).hide();
    document.getElementById("numeroPedido").textContent = numeroPedido;
    new bootstrap.Modal(document.getElementById("modalExito")).show();
    reset();
};

// Resetear UI
const reset = () => {
    localStorage.removeItem("ultimoPedido");
    carritoCompras = [];
    document.getElementById("cart").innerHTML = "";
    total = 0;
    document.getElementById("total").textContent = "0.00";
    document.getElementById("direccion").value = "";
    document.getElementById("indicaciones").value = "";
    actualizarBotonConfirmar();
};