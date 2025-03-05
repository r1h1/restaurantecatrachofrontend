// Configuración de URLs
const baseUrl = "https://elcatrachorestaurantes.somee.com";
const fullApiUrlPedidos = `${baseUrl}/api/Pedidos/NumeroPedido/`;


//Funcion para chequear el token, si no, no permite ver la página
const isTokenExist = function () {
    const token = sessionStorage.getItem("authToken");
    const userInfo = localStorage.getItem("uuid");

    if (!token || !userInfo) {
        window.location.href = '../../../views/common/login.html';
    }
    else {
        return;
    }
}


//Funcion para cerrar sesión
const closeSession = function () {
    localStorage.removeItem("uuid");
    sessionStorage.removeItem("authToken");
    window.location.href = "../../../views/common/login.html";
}


// Función Reutilizable para Fetch (GET)
const makeRequest = async (url, method) => {
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

// Función para traer datos de usuario logueado
const getOrderByOrderNumber = async () => {

    const numeroOrden = document.getElementById('numeroPedidoInput').value.trim();

    // Expresión regular que solo permite números enteros
    const numeroOrdenValidacion = /^[0-9]+$/;

    if (!numeroOrden) {
        alert('Debes ingresar el número de orden para buscar.');
        return;
    }

    if (!numeroOrdenValidacion.test(numeroOrden)) {
        alert('El número de orden debe contener solo números.');
        return;
    }


    try {
        const data = await makeRequest(fullApiUrlPedidos + numeroOrden, "GET");

        if (data.idPedido > 0) {
            document.getElementById('pedidoNumero').innerHTML = numeroOrden;

            const estadoOptions = {
                "1": "Creado",
                "2": "En Proceso",
                "3": "Enviado",
                "4": "Finalizado"
            };
            document.getElementById('pedidoEstado').innerHTML = estadoOptions[data.estado] || "Desconocido";

            document.getElementById('pedidoFecha').innerHTML = data.fechaCreacion;
            document.getElementById('pedidoEntrega').innerHTML = data.fechaEntregaEstimada;
            document.getElementById('pedidoTotal').innerHTML = data.montoTotal;
            document.getElementById('direccion').innerHTML = data.direccion;
            document.getElementById('indicaciones').innerHTML = data.indicaciones;

        } else {
            alert(`No se encontró ningún pedido con el número de pedido ${numeroOrden}`);
        }
    } catch (error) {
        alert("Error al obtener el pedido: " + error);
    }
};

document.addEventListener("DOMContentLoaded", function () {
    isTokenExist();
});