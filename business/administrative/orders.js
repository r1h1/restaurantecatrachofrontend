// Configuración de URLs
const baseUrl = "https://elcatrachorestaurantes.somee.com";
const fullApiUrlPedidos = `${baseUrl}/api/Pedidos`;
const fullApiUrlDetallesPedido = `${baseUrl}/api/DetallesPedido`;

// Función para chequear el token, si no, no permite ver la página
const isTokenExist = function () {
    const token = sessionStorage.getItem("authToken");
    const userInfo = localStorage.getItem("uuid");

    if (!token || !userInfo) {
        window.location.href = '../../../views/common/login.html';
    }
}

//Funcion para mostrar menu
const printMenu = function () {
    // Obtiene el token
    const token = sessionStorage.getItem("authToken");

    if (!token) {
        isTokenExist();
    }

    // Decodificar el token para obtener el rol
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;
    const adminNav = document.getElementById('adminNav');

    try {
        if (!role) {
            alert('No se pudo obtener el rol, por favor verifique.');
        }

        if (role == 1) {
            adminNav.innerHTML = `<ul class="navbar-nav ms-auto">
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="../dashboard.html">Inicio</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="usuarios.html">Usuarios</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="productos.html">Productos</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="pedidos.html">Pedidos</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="btn btn-danger" onclick="closeSession()">Cerrar Sesión</a>
                                    </li>
                                </ul>`;
        }
        else if (role == 3) {
            adminNav.innerHTML = `<ul class="navbar-nav ms-auto">
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="../dashboard.html">Inicio</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="pedidos.html">Pedidos</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="btn btn-danger" onclick="closeSession()">Cerrar Sesión</a>
                                    </li>
                                </ul>`;
        }
        else {
            sessionStorage.removeItem('authToken');
            localStorage.removeItem('uuid');
            window.location.href = '../../../views/common/login.html';
        }
    } catch (error) {
        alert('Surgió un error inesperado: ' + error);
    }
}
printMenu();

// Función Reutilizable para Fetch (GET, DELETE)
const makeRequestGetDelete = async (url, method) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const token = sessionStorage.getItem("authToken");
    if (!token) {
        return;
    }
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: method,
        headers: myHeaders,
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

// Función Reutilizable para Fetch (POST, PUT)
const makeRequestPostPut = async (url, method, body) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const token = sessionStorage.getItem("authToken");
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


// Función para traer datos
const getOrders = async () => {
    try {
        const data = await makeRequestGetDelete(fullApiUrlPedidos, "GET");

        if (data) {
            // Destruir DataTables antes de modificar la tabla para evitar problemas
            if ($.fn.DataTable.isDataTable("#pedidosTable")) {
                $("#pedidosTable").DataTable().destroy();
            }

            const tbody = document.getElementById("pedidosTabla");
            tbody.innerHTML = ""; // Limpiar contenido antes de agregar nuevos datos

            data.forEach((pedido, index) => {
                const fila = document.createElement("tr");

                const estadoOptions = {
                    "1": "Creado",
                    "2": "En Proceso",
                    "3": "Enviado",
                    "4": "Finalizado"
                };

                fila.innerHTML = `
                    <td>
                        <select class="form-select" id="estadoPedido-${pedido.idPedido}" 
                            onchange="changeStatus(this)" required 
                            style="width: 140px;">
                            ${Object.entries(estadoOptions)
                        .map(([value, text]) =>
                            `<option value="${value}" ${pedido.estado == value ? "selected" : ""}>${text}</option>`
                        ).join("")}
                        </select>
                    </td>
                    <td>${pedido.numeroPedido}</td>
                    <td>${pedido.fechaCreacion}</td>
                    <td>${pedido.fechaEntregaEstimada}</td>
                    <td>Q<span class="montoTotal">${pedido.montoTotal}</span></td>
                    <td>${pedido.direccion}</td>
                    <td>${pedido.indicaciones}</td>
                    <td>
                        <button class='btn btn-success btn-sm'
                            onclick='productDetailInfo("${pedido.numeroPedido}",${pedido.idPedido})'>Detalle</button>
                        <button class='btn btn-danger btn-sm'
                            onclick='deleteOrder(${pedido.idPedido})'>Eliminar</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });

            // Inicializar DataTables después de poblar la tabla
            initializeDataTable();
        } else {
            console.log("No hay datos de pedidos.");
        }
    } catch (error) {
        alert(error);
    }
};

// Función para cambiar estado de pedido y obtener toda la fila
const changeStatus = async (selectElement) => {
    const fila = selectElement.closest("tr");
    const idPedido = parseInt(selectElement.id.split("-")[1]);
    const estado = selectElement.value; // Convertirlo directamente a string
    const idUsuario = atob(localStorage.getItem("uuid"));
    const numeroPedido = fila.cells[1].textContent.trim();
    const fechaCreacion = fila.cells[2].textContent.trim();
    let fechaEntregaEstimada = fila.cells[3].textContent.trim();
    let montoTotal = fila.querySelector(".montoTotal").textContent.trim();
    const direccion = fila.cells[5].textContent.trim();
    let indicaciones = fila.cells[6].textContent.trim();

    // Convertir fechaEntregaEstimada a formato ISO 8601 o cadena vacía si no existe
    fechaEntregaEstimada = fechaEntregaEstimada ? new Date(fechaEntregaEstimada).toISOString() : "";

    // Convertir montoTotal a número
    montoTotal = parseFloat(montoTotal.replace("Q", "").trim());

    // Limpiar indicaciones
    indicaciones = indicaciones.replace(/\s+/g, " ").trim();

    try {
        const body = {
            idPedido,
            idUsuario, // Este campo es obligatorio según la API
            estado, // Ahora es un string
            numeroPedido,
            fechaCreacion,
            fechaEntregaEstimada,
            montoTotal,
            direccion,
            indicaciones
        };

        const response = await makeRequestPostPut(fullApiUrlPedidos, "PUT", body);

        if (response.isSuccess === true) {
            alert("Estado del pedido actualizado con éxito");
            getOrders();
        } else {
            alert("No se pudo actualizar el estado del pedido, verifique de nuevo");
            getOrders();
        }
    } catch (error) {
        alert("Error al actualizar el estado del pedido: " + error);
    }
};



// Función para borrar pedido de base de datos
const deleteOrder = async (id_pedido) => {
    try {
        const confirmDelete = confirm("¿Estás seguro de que deseas eliminar?");

        if (!confirmDelete) {
            return; // Si el usuario cancela, no se ejecuta el DELETE
        }

        const data = await makeRequestGetDelete(fullApiUrlPedidos + '/' + id_pedido, "DELETE");

        if (data.isSuccess === true) {
            alert('Eliminado con éxito');
            getOrders(); // Refrescar la lista de pedidos
        } else {
            alert('No se pudo eliminar, verifique nuevamente');
            getOrders();
        }
    } catch (error) {
        alert("Error al eliminar el pedido: " + error);
    }
};



// Función para mostrar el modal de confirmación de pedido
const productDetailInfo = async (numeroPedido, idPedido) => {
    try {
        document.getElementById('numeroProducto').innerHTML = numeroPedido;

        const data = await makeRequestGetDelete(fullApiUrlDetallesPedido + '/' + idPedido, "GET");

        if (data) {
            const tbody = document.getElementById("detallePedidoTabla");
            tbody.innerHTML = ""; // Limpiar el contenido existente

            data.forEach((detallePedido, index) => {
                const fila = document.createElement("tr");
                fila.innerHTML = `
                                    <td>${index + 1}</td>
                                    <td>${detallePedido.nombreProducto}</td>
                                    <td>${detallePedido.cantidad}</td>
                                    <td>Q<span id="precioUnitario">${detallePedido.precioUnitario}</span></td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            console.log("No hay datos de pedidos.");
        }

        const modal = new bootstrap.Modal(document.getElementById("modalDetallePedido"));
        modal.show();
    } catch (error) {
        alert('No se pudo mostrar el detalle del pedido ' + numeroPedido + ': ' + error);
    }
};

const initializeDataTable = () => {
    $("#pedidosTable").DataTable({
        destroy: true, // Permite reinicializar la tabla sin errores
        responsive: true, // Hace la tabla adaptable a dispositivos móviles
        pageLength: 10, // Cantidad de filas por página
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]], // Opciones de cantidad de filas
        language: {
            url: "https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json" // Traducción al español
        },
        order: [[2, "desc"]] // Ordenar por número de pedido (columna índice 2) en orden descendente
    });
};


isTokenExist();
printMenu();
getOrders();