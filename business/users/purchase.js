const cargarProductos = async () => {
    const productList = document.getElementById("product-list");
    try {
        const productos = await makeReuestGetDelete(fullApiUrlProductos, "GET");

        if (productos.length > 0) {
            productList.innerHTML = "";

            // Agrupar productos por categoría
            const categorias = {};
            productos.forEach(p => {
                if (!categorias[p.categoria]) {
                    categorias[p.categoria] = [];
                }
                categorias[p.categoria].push(p);
            });

            // Renderizar productos por categoría
            for (const categoria in categorias) {
                const titulo = document.createElement("h4");
                titulo.classList.add("category-title");
                titulo.textContent = `Nuestros ${categoria}`;
                productList.appendChild(titulo);

                const fila = document.createElement("div");
                fila.classList.add("row", "mb-4");

                categorias[categoria].forEach(producto => {
                    const card = document.createElement("div");
                    card.classList.add("col-md-4", "mb-3");
                    card.innerHTML = `
                        <div class="card h-100 p-2 text-center product-card" onclick="agregarAlCarrito(${producto.idProducto}, '${producto.nombre}', ${producto.precio})">
                            <img src="${producto.imagenUrl}" class="card-img-top img-fluid" alt="${producto.nombre}" style="height: 150px; object-fit: cover;">
                            <div class="card-body">
                                <h6 class="card-title">${producto.nombre}</h6>
                                <p class="card-text text-muted">Q${producto.precio.toFixed(2)}</p>
                            </div>
                        </div>
                    `;
                    fila.appendChild(card);
                });

                productList.appendChild(fila);
            }

        } else {
            productList.innerHTML = "";
            const card = document.createElement("div");
            card.classList.add("col-12", "mb-3");
            card.innerHTML = `
                <div class="card p-2 text-center">
                    <h6 class="mt-2">-- NO HAY PRODUCTOS DISPONIBLES --</h6>
                    <p class="text-muted">Vuelve pronto, gracias por confiar en Donde El Catracho</p>
                </div>
            `;
            productList.appendChild(card);
        }
    } catch (error) {
        Swal.fire({
            title: "Error",
            text: error,
            icon: "error"
        });
    }
};
