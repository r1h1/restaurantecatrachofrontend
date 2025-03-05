// Función para chequear el token, si no, no permite ver la página
const isTokenExist = function () {
    const token = sessionStorage.getItem("authToken");
    const userInfo = localStorage.getItem("uuid");

    if (!token || !userInfo) {
        window.location.href = '../../../views/common/login.html';
    }
}

//FUNCION PARA MOSTRAR EL MENÚ EN BASE A LOS ROLES
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
                                        <a class="nav-link text-white" href="dashboard.html">Inicio</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="modules/usuarios.html">Usuarios</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="modules/productos.html">Productos</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="modules/pedidos.html">Pedidos</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="btn btn-danger" onclick="closeSession()">Cerrar Sesión</a>
                                    </li>
                                </ul>`;
        }
        else if (role == 3) {
            adminNav.innerHTML = `<ul class="navbar-nav ms-auto">
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="dashboard.html">Inicio</a>
                                    </li>
                                    <li class="nav-item">
                                        <a class="nav-link text-white" href="modules/pedidos.html">Pedidos</a>
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

document.addEventListener("DOMContentLoaded", function () {
    isTokenExist();
    printMenu();
});