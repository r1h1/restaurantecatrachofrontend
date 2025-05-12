// Configuración de URLs
const baseUrl = "https://elcatrachorestaurantes.somee.com";
const fullApiUrl = `${baseUrl}/api/Productos`;

// Chequear token
const isTokenExist = function () {
    const token = sessionStorage.getItem("authToken");
    const userInfo = localStorage.getItem("uuid");
    if (!token || !userInfo) {
        window.location.href = '../../../views/common/login.html';
    }
};

// Mostrar menú según rol
const printMenu = function () {
    const token = sessionStorage.getItem("authToken");
    const payload = JSON.parse(atob(token.split('.')[1]));
    const role = payload.role;
    const adminNav = document.getElementById('adminNav');

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
    } else if (role == 3) {
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
    } else {
        sessionStorage.clear();
        window.location.href = '../../../views/common/login.html';
    }
};

// Reutilizable GET y DELETE
const makeRequestGetDelete = async (url, method) => {
    const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
    });

    const options = { method, headers, redirect: "follow" };
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
};

// Reutilizable POST y PUT
const makeRequestPostPut = async (url, method, body) => {
    const headers = new Headers({
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
    });

    const options = {
        method,
        headers,
        body: JSON.stringify(body),
        redirect: "follow"
    };
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
};

// Obtener productos
const getProducts = async () => {
    try {
        const data = await makeRequestGetDelete(fullApiUrl, "GET");
        const tbody = document.getElementById("productosTabla");
        tbody.innerHTML = "";

        data.forEach((p, i) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${i + 1}</td>
                <td>${p.nombre}</td>
                <td>${p.descripcion}</td>
                <td>${p.precio.toFixed(2)}</td>
                <td>${p.categoria}</td>
                <td>${p.disponible ? 'Sí' : 'No'}</td>
                <td>
                    <button class='btn btn-warning btn-sm' 
                        onclick='productEdit(${p.idProducto},"${p.nombre}","${p.descripcion}",${p.precio},"${p.categoria}",${p.disponible},"${p.imagenUrl}")'>Editar</button>
                    <button class='btn btn-danger btn-sm' onclick='productDelete(${p.idProducto})'>Eliminar</button>
                </td>`;
            tbody.appendChild(row);
        });
    } catch (error) {
        alert(error);
    }
};

// Eliminar producto
const productDelete = async (idProducto) => {
    if (!confirm("¿Estás seguro de que deseas eliminar?")) return;

    try {
        const data = await makeRequestGetDelete(`${fullApiUrl}/${idProducto}`, "DELETE");
        if (data.isSuccess) {
            alert('Producto eliminado con éxito');
            getProducts();
            resetData();
        } else {
            alert('No se pudo eliminar el producto');
            getProducts();
        }
    } catch (error) {
        alert(error);
    }
};

// Editar producto
const productEdit = function (id, nombre, descripcion, precio, categoria, disponible, imagenUrl) {
    document.getElementById('id_producto').value = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('descripcion').value = descripcion;
    document.getElementById('precio').value = precio;
    document.getElementById('categoria').value = categoria;
    document.getElementById('disponible').value = disponible ? "1" : "0";
    document.getElementById('imagen_producto').value = imagenUrl;
};

// Actualizar producto
const productUpdate = async () => {
    const body = {
        idProducto: parseInt(document.getElementById('id_producto').value),
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseFloat(document.getElementById('precio').value),
        categoria: document.getElementById('categoria').value,
        imagenUrl: document.getElementById('imagen_producto').value,
        disponible: document.getElementById('disponible').value === "1"
    };

    try {
        const data = await makeRequestPostPut(fullApiUrl, "PUT", body);
        if (data.isSuccess) {
            alert('Producto actualizado con éxito');
            getProducts();
            resetData();
        } else {
            alert("No se pudo actualizar");
            getProducts();
        }
    } catch (error) {
        alert(error);
    }
};

// Crear producto
const productCreate = async () => {
    const body = {
        idProducto: 0,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        precio: parseFloat(document.getElementById('precio').value),
        categoria: document.getElementById('categoria').value,
        imagenUrl: document.getElementById('imagen_producto').value,
        disponible: document.getElementById('disponible').value === "1"
    };

    if (!body.nombre || !body.descripcion || !body.precio || !body.categoria || !body.imagenUrl) {
        alert('Todos los campos son obligatorios');
        return;
    }

    try {
        const data = await makeRequestPostPut(fullApiUrl, "POST", body);
        if (data.isSuccess) {
            alert('Producto creado con éxito');
            getProducts();
            resetData();
        } else {
            alert("No se pudo crear");
            getProducts();
        }
    } catch (error) {
        alert(error);
    }
};

// Detectar si es actualización o creación
const saveButtonOptions = () => {
    const id = document.getElementById('id_producto').value;
    if (id) productUpdate();
    else productCreate();
};

// Limpiar formulario
const resetData = () => {
    document.getElementById('id_producto').value = "";
    document.getElementById('nombre').value = "";
    document.getElementById('descripcion').value = "";
    document.getElementById('precio').value = "";
    document.getElementById('categoria').value = "";
    document.getElementById('imagen_producto').value = "";
    document.getElementById('disponible').value = "1";
};

document.addEventListener("DOMContentLoaded", () => {
    isTokenExist();
    printMenu();
    getProducts();
});