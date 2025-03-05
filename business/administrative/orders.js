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
//Funcion para mostrar menu
const printMenu = function () {
    // Obtiene el token
    const token = sessionStorage.getItem("authToken");

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
            const tbody = document.getElementById("pedidosTabla");
            tbody.innerHTML = ""; // Limpiar el contenido existente

            data.forEach((pedido, index) => {
                const fila = document.createElement("tr");
                const originalDate = pedido.fechaEntregaEstimada;

                // Convertir la cadena a un objeto Date
                const dateObj = new Date(originalDate);

                // Obtener los componentes de la fecha
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Meses en JS van de 0 a 11
                const day = String(dateObj.getDate()).padStart(2, "0");
                const hours = String(dateObj.getHours()).padStart(2, "0");
                const minutes = String(dateObj.getMinutes()).padStart(2, "0");

                // Formato compatible con datetime-local (YYYY-MM-DDTHH:MM)
                const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

                fila.innerHTML = `
                                    <td>${index + 1}</td>
                                    <td>
                                        <select class="form-select" id="estadoPedido" required>
                                            <option value="1">Creado</option>
                                            <option value="2">Pagado</option>
                                            <option value="3">Enviado</option>
                                            <option value="4">Finalizado</option>
                                        </select>
                                    </td>
                                    <td>${pedido.numeroPedido}</td>
                                    <td>${pedido.fechaCreacion}</td>
                                    <td><input type="datetime-local" class="form-control" value="${formattedDate}"></td>
                                    <td>Q<span id="montoTotal">${pedido.montoTotal}</span></td>
                                    <td>${pedido.direccion}</td>
                                    <td>${pedido.indicaciones}</td>
                                    <td>
                                        <button class='btn btn-success btn-sm'
                                            onclick='productDetailInfo("${pedido.numeroPedido}",${pedido.idPedido})'>Detalle</button>
                                        <button class='btn btn-danger btn-sm'
                                            onclick='eliminarPedido(this)'>Eliminar</button>
                                    </td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            console.log("No hay datos de pedidos.");
        }
    } catch (error) {
        alert(error);
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

isTokenExist();
printMenu();
getOrders();