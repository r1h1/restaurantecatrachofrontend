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
        document.getElementById('clave').disabled = false;
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
                                    <td>${decodificarBase64(usuario.rol) == 1 ? 'Administrador' :
                        decodificarBase64(usuario.rol) == 2 ? 'Gerente' :
                            decodificarBase64(usuario.rol) == 3 ? 'Empleado' : 'Cliente'}</td>
                                    <td>${decodificarBase64(usuario.telefono)}</td>
                                    <td>
                                        <button class='btn btn-warning btn-sm' 
                                            onclick='userEdit(
                                                ${usuario.id_usuario}, 
                                                "${decodificarBase64(usuario.nombre).replace(/"/g, '&quot;')}", 
                                                "${decodificarBase64(usuario.correo).replace(/"/g, '&quot;')}", 
                                                "${decodificarBase64(usuario.rol)}", 
                                                "${decodificarBase64(usuario.telefono).replace(/"/g, '&quot;')}",
                                                "${decodificarBase64(usuario.direccion).replace(/"/g, '&quot;')}"
                                            )'>Editar</button>
                                        <button class='btn btn-danger btn-sm' onclick='userDelete(${usuario.id_usuario})'>Eliminar</button>
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


// Función para borrar usuario de base de datos
const userDelete = async (id_usuario) => {
    try {
        const data = await makeRequestGetDelete(fullApiUrl + '/' + id_usuario, "DELETE");

        if (data.isSuccess === true) {
            getUsers();
            alert('Usuario eliminado con éxito');
        } else {
            alert('No se pudo eliminar el usuario, verifique nuevamente');
            getUsers();
            return;
        }
    } catch (error) {
        alert(error);
    }
};


//Funcion para editar usuarios
const userEdit = function (id_usuario, nombre, correo, rol, telefono, direccion) {
    document.getElementById('id_usuario').value = id_usuario;
    document.getElementById('nombre').value = nombre;
    document.getElementById('correo').value = correo;
    document.getElementById('rol').value = rol;
    document.getElementById('telefono').value = telefono;
    document.getElementById('direccion').value = direccion;
    document.getElementById('clave').disabled = true;
}

// Función para traer datos de usuario logueado y llenar la tabla
const userUpdate = async () => {
    const id_usuario = document.getElementById('id_usuario').value;
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const rol = document.getElementById('rol').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;

    try {

        const body = {
            id_usuario,
            nombre,
            correo,
            rol,
            telefono,
            direccion
        };

        const data = await makeRequestPostPut(fullApiUrl, "PUT", body);

        if (data.isSuccess === true) {
            getUsers();
            alert('Usuario actualizado con éxito');
            resetData();
        } else {
            alert("No se pudo actualizar, verifique de nuevo");
            getUsers();
            return;
        }
    } catch (error) {
        alert(error);
    }
};


// Función para traer datos de usuario logueado y llenar la tabla
const userCreate = async () => {
    const id_usuario = 0;
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const rol = document.getElementById('rol').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const clave = document.getElementById('clave').value;

    if(!nombre || !correo || !rol || !telefono || !direccion || !clave){
        alert('Todos los datos son obligatorios para crear un usuario.');
        return;
    }

    try {

        const body = {
            id_usuario,
            nombre,
            correo,
            clave,
            rol,
            telefono,
            direccion
        };

        const data = await makeRequestPostPut(fullApiUrl, "POST", body);

        if (data.isSuccess === true) {
            getUsers();
            alert('Usuario creado con éxito');
            resetData();
        } else {
            alert("No se pudo crear, verifique de nuevo");
            getUsers();
            return;
        }
    } catch (error) {
        alert(error);
    }
};


//Funcion para el botón guardar, cuando exista algo en ID usuario va a editar, cuando no, crear
const saveButtonOptions = function () {
    const option = document.getElementById('id_usuario').value;
    const clave = document.getElementById('clave').value;
    try {
        if (option) {
            userUpdate();
            getUsers();
        }
        else {
            if (clave) {
                userCreate();
                getUsers();
            }
            else {
                return;
            }
        }
    }
    catch (error) {
        alert(error);
        return;
    }
}


//Funcion para borrar datos
const resetData = function(){
    document.getElementById('id_usuario').value = "";
    document.getElementById('nombre').value = "";
    document.getElementById('correo').value = "";
    document.getElementById('rol').value = 1
    document.getElementById('telefono').value = "";
    document.getElementById('direccion').value = "";
    document.getElementById('clave').value = "";
    document.getElementById('clave').disabled = false;
}


getUsers();