// Función para chequear el token, si no, no permite ver la página
const isTokenExist = function(){
    const token = sessionStorage.getItem("authToken");
    const userInfo = localStorage.getItem("uuid");

    if(!token || !userInfo){
        window.location.href = '../../../views/common/login.html';
    }
}

isTokenExist();