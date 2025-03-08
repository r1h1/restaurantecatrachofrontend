// Configuración de URLs
const baseUrl = "https://elcatrachorestaurantes.somee.com";
const fullApiUrl = `${baseUrl}/api/Auth`;
const fullApiUrlActualizarClave = `${baseUrl}/api/Usuarios/ActualizarClave`;

// Función Reutilizable para Fetch
const makeRequest = async (url, method, body) => {
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

// Función de Autenticación (Login)
const authFunction = async () => {
    const correo = document.getElementById("email").value.trim();
    const contraseña = document.getElementById("password").value.trim();

    // Validación de campos vacíos
    if (!correo || !contraseña) {
        Swal.fire({
            title: "Atención",
            text: "Debe ingresar correo y contraseña",
            icon: "warning"
        });
        return;
    }

    const body = { correo, contraseña };

    try {
        const data = await makeRequest(fullApiUrl, "POST", body);

        if (data.and_authorizated) {
            localStorage.setItem("uuid", data.user);
            sessionStorage.setItem("authToken", data.and_authorizated);

            // Decodificar el token para obtener el rol
            const payload = JSON.parse(atob(data.and_authorizated.split('.')[1]));
            const role = payload.role;

            // Redirigir según el rol
            if (role === "1" || role === "3") {
                window.location.href = "../../views/administrative/dashboard.html";
            } else {
                window.location.href = "../../views/users/modules/compra.html";
            }
        } else {
            Swal.fire({
                title: "Atención",
                text: "Usuario y/o contraseña incorrecta.",
                icon: "warning"
            });
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: "Usuario y/o contraseña incorrecta",
            icon: "error"
        });
    }
};

// Función para Cambio de Clave
const changePassword = async () => {
    const Correo = document.getElementById("email").value.trim();
    const Telefono = document.getElementById("cellphone").value.trim();
    const Direccion = document.getElementById("address").value.trim();
    const NuevaClave = document.getElementById("newPassword").value.trim();
    const NuevaClaveConfirmacion = document.getElementById("newPasswordConfirm").value.trim();

    // Validaciones
    if (NuevaClave !== NuevaClaveConfirmacion) {
        Swal.fire({
            title: "Atención",
            text: "La nueva contraseña no coincide con la confirmación.",
            icon: "warning"
        });
        return;
    }

    if (!Correo || !Telefono || !Direccion || !NuevaClave) {
        Swal.fire({
            title: "Atención",
            text: "Llena todos los campos para continuar.",
            icon: "warning"
        });
        return;
    }

    const body = {
        correo: Correo,
        telefono: Telefono,
        direccion: Direccion,
        nuevaClave: NuevaClave
    };

    try {
        const result = await makeRequest(fullApiUrlActualizarClave, "POST", body);
        Swal.fire({
            title: "Éxito",
            text: "Contraseña actualizada correctamente.",
            icon: "success"
        });
        window.location.href = "../../views/common/login.html";
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: "Hubo un problema al actualizar la clave: " + error,
            icon: "error"
        });
    }
};