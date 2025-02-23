// Configuración de URLs
const baseUrl = "https://elcatrachorestaurantes.somee.com";
const fullApiUrl = `${baseUrl}/api/Usuarios`;


// Función Reutilizable para Fetch (GET, DELETE)
const makeRequestGetDelete = async (url, method) => {
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

// Función Reutilizable para Fetch (POST, PUT)
const makeRequestPostPut = async (url, method, body) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

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

// Función para traer datos de usuario logueado
// Función para decodificar base64
const decodificarBase64 = (textoBase64) => {
    try {
        return atob(textoBase64);
    } catch (error) {
        console.error("Error al decodificar base64:", error);
        return textoBase64;
    }
};

// Función para traer datos de usuario logueado y llenar la tabla
const getUsers = async () => {
    try {
        const data = await makeRequestGetDelete(fullApiUrl, "GET");

        if (data) {
            // Obtener el tbody de la tabla
            const tbody = document.getElementById("usuariosTabla");
            tbody.innerHTML = ""; // Limpiar el contenido existente

            // Recorrer el arreglo de usuarios y crear filas
            data.forEach((usuario, index) => {
                const fila = document.createElement("tr");

                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${decodificarBase64(usuario.nombre)}</td>
                    <td>${decodificarBase64(usuario.correo)}</td>
                    <td>${decodificarBase64(usuario.rol) == 1 ? 'Administrador' : 'Usuario'}</td>
                    <td>${decodificarBase64(usuario.telefono)}</td>
                    <td>
                        <button class='btn btn-warning btn-sm' onclick='editarUsuario(${usuario.id_usuario})'>Editar</button>
                        <button class='btn btn-danger btn-sm' onclick='eliminarUsuario(${usuario.id_usuario})'>Eliminar</button>
                        <button class='btn btn-primary btn-sm' onclick='actualizarContraseña(${usuario.id_usuario})'>Actualizar Clave</button>
                    </td>
                `;

                // Agregar la fila al tbody
                tbody.appendChild(fila);
            });
        } else {
            console.log("No hay datos de usuarios.");
        }
    } catch (error) {
        alert(error);
    }
};


getUsers();