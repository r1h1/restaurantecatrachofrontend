// Configuración de URLs
const baseUrl = "https://elcatrachorestaurantes.somee.com";
const fullApiUrl = `${baseUrl}/api/Usuarios`;

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
const getProfile = async () => {

    // Decodificar el ID para obtener el usuario
    const payload = JSON.parse(atob(localStorage.getItem("uuid")));

    try {
        const data = await makeRequest(fullApiUrl + '/' + payload, "GET");

        if (data.id_usuario) {
            document.getElementById("nombre").value = atob(data.nombre);
            document.getElementById("correo").value = atob(data.correo);
            document.getElementById("telefono").value = atob(data.telefono);
            document.getElementById("direccion").value = atob(data.direccion);
            document.getElementById("rol").value = atob(data.rol);
        } else {
            return;
        }
    } catch (error) {
        alert(error);
    }
};

getProfile();