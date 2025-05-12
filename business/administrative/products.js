// Configuración de URLs
const baseUrl = "https://elcatrachorestaurantes.somee.com";
const fullApiUrl = ${baseUrl}/api/Productos;

// Función para chequear el token, si no, no permite ver la página
const isTokenExist = function(){
    const token = sessionStorage.getItem("authToken");
    const userInfo = localStorage.getItem("uuid");

    if(!token || !userInfo){
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
    myHeaders.append("Authorization", Bearer ${token});

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
    myHeaders.append("Authorization", Bearer ${token});

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

// Función para traer datos de productos y llenar la tabla
const getProducts = async () => {
    try {
        const data = await makeRequestGetDelete(fullApiUrl, "GET");

        if (data) {
            const tbody = document.getElementById("productosTabla");
            tbody.innerHTML = ""; // Limpiar el contenido existente

            data.forEach((producto, index) => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${producto.nombre}</td>
                    <td>${producto.descripcion}</td>
                    <td>${producto.precio.toFixed(2)}</td>
                    <td>${producto.categoria}</td>
                    <td>${producto.disponible ? 'Sí' : 'No'}</td>
                    <td>
                        <button class='btn btn-warning btn-sm' 
                            onclick='productEdit(
                                ${producto.idProducto}, 
                                "${producto.nombre}", 
                                "${producto.descripcion}", 
                                ${producto.precio}, 
                                "${producto.categoria}",
                                ${producto.disponible},
                                "${producto.imagenUrl}" 
                            )'>Editar</button>
                        <button class='btn btn-danger btn-sm' onclick='productDelete(${producto.idProducto})'>Eliminar</button>
                    </td>
                `;
                tbody.appendChild(fila);
            });
        } else {
            console.log("No hay datos de productos.");
        }
    } catch (error) {
        alert(error);
    }
};

// Función para borrar producto de base de datos
const productDelete = async (idProducto) => {
    try {
        const confirmDelete = confirm("¿Estás seguro de que deseas eliminar?");

        if (!confirmDelete) {
            return; // Si el usuario cancela, no se ejecuta el DELETE
        }

        const data = await makeRequestGetDelete(${fullApiUrl}/${idProducto}, "DELETE");

        if (data.isSuccess === true) {
            getProducts();
            alert('Producto eliminado con éxito');
        } else {
            alert('No se pudo eliminar el producto, verifique nuevamente');
            getProducts();
        }
    } catch (error) {
        alert(error);
    }
};

// Función para editar productos
const productEdit = function (idProducto, nombre, descripcion, precio, categoria, disponible, imagenUrl) {
    document.getElementById('id_producto').value = idProducto;
    document.getElementById('nombre').value = nombre;
    document.getElementById('descripcion').value = descripcion;
    document.getElementById('precio').value = precio;
    document.getElementById('categoria').value = categoria;
    document.getElementById('disponible').checked = disponible;
    document.getElementById('imagen_producto').value = imagenUrl;
};

// Función para actualizar producto
const productUpdate = async () => {
    const idProducto = document.getElementById('id_producto').value;
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria').value;
    const disponible = document.getElementById('disponible').checked;

    try {
        const body = {
            idProducto,
            nombre,
            descripcion,
            precio,
            categoria,
            disponible
        };

        const data = await makeRequestPostPut(fullApiUrl, "PUT", body);

        if (data.isSuccess === true) {
            getProducts();
            alert('Producto actualizado con éxito');
            resetData();
        } else {
            alert("No se pudo actualizar, verifique de nuevo");
            getProducts();
        }
    } catch (error) {
        alert(error);
    }
};

// Función para crear producto
const productCreate = async () => {
    const idProducto = 0;
    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const categoria = document.getElementById('categoria').value;
    const imagenUrl = document.getElementById('imagen_producto').value;
    const disponible = document.getElementById('disponible').checked;

    if(!nombre || !descripcion || !precio || !categoria|| !imagenUrl){
        alert('Todos los datos son obligatorios para crear un producto.');
        return;
    }

    try {
        const body = {
            idProducto,
            nombre,
            descripcion,
            precio,
            categoria,
            imagenUrl,
            disponible
        };

        const data = await makeRequestPostPut(fullApiUrl, "POST", body);

        if (data.isSuccess === true) {
            getProducts();
            alert('Producto creado con éxito');
            resetData();
        } else {
            alert("No se pudo crear, verifique de nuevo");
            getProducts();
        }
    } catch (error) {
        alert(error);
    }
};

// Función para el botón guardar
const saveButtonOptions = function () {
    const option = document.getElementById('id_producto').value;

    try {
        if (option) {
            productUpdate();
        } else {
            productCreate();
        }
    } catch (error) {
        alert(error);
    }
};

// Función para borrar datos
const resetData = function(){
    document.getElementById('id_producto').value = "";
    document.getElementById('nombre').value = "";
    document.getElementById('descripcion').value = "";
    document.getElementById('precio').value = "";
    document.getElementById('categoria').value = "";
    document.getElementById('disponible').checked = true;
};


document.addEventListener("DOMContentLoaded", function () {
    isTokenExist();
    printMenu();
    getProducts();
});