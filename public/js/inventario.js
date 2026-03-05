const SUCURSAL_ACTUAL = "Centro";

const inventarioDB = [
    { id: 1, folio: "A-1001", codigo: "CP1", articulo: "Cuaderno Profesional", precio: 45.0, sucursales: { Centro: 28, Norte: 14, Sur: 9 } },
    { id: 2, folio: "A-1002", codigo: "LP2", articulo: "Lápiz N°2", precio: 12.0, sucursales: { Centro: 80, Norte: 50, Sur: 34 } },
    { id: 3, folio: "A-1003", codigo: "HB500", articulo: "Hojas Blancas paquete 500", precio: 2.0, sucursales: { Centro: 200, Norte: 150, Sur: 90 } },
    { id: 4, folio: "A-1004", codigo: "BIC16", articulo: "Colores Paquete 16 BIC", precio: 97.0, sucursales: { Centro: 20, Norte: 18, Sur: 11 } },
    { id: 5, folio: "A-1005", codigo: "ItaDura", articulo: "Cuaderno Italiano Pasta Dura", precio: 58.0, sucursales: { Centro: 12, Norte: 7, Sur: 6 } },
    { id: 6, folio: "A-1006", codigo: "MarcPerm", articulo: "Marcador Permanente", precio: 25.0, sucursales: { Centro: 38, Norte: 27, Sur: 13 } },
    { id: 7, folio: "A-1007", codigo: "PlumaAz", articulo: "Pluma Azul", precio: 15.0, sucursales: { Centro: 65, Norte: 44, Sur: 30 } },
    { id: 8, folio: "A-1008", codigo: "Regla30", articulo: "Regla 30cm", precio: 18.0, sucursales: { Centro: 41, Norte: 32, Sur: 19 } }
];

let articuloEditandoId = null;

function calcularExistenciasTotales(articulo) {
    return Object.values(articulo.sucursales).reduce((acum, cantidad) => acum + cantidad, 0);
}

function normalizarArticulo(articulo) {
    return { ...articulo, existencias: calcularExistenciasTotales(articulo) };
}

function obtenerInventario() {
    return inventarioDB.map(normalizarArticulo);
}

function buscarArticuloPorId(id) {
    return inventarioDB.find((articulo) => articulo.id === id);
}

window.obtenerInventario = obtenerInventario;
window.obtenerArticuloInventario = (id) => {
    const articulo = buscarArticuloPorId(id);
    return articulo ? normalizarArticulo(articulo) : null;
};

window.obtenerExistenciasSucursal = (id, sucursal) => {
    const articulo = buscarArticuloPorId(id);
    if (!articulo) return 0;
    return articulo.sucursales[sucursal] ?? 0;
};

window.disminuirInventario = (id, cantidad) => {
    const articulo = buscarArticuloPorId(id);
    if (!articulo || cantidad <= 0) return false;

    let pendiente = cantidad;
    const nombresSucursales = Object.keys(articulo.sucursales);

    for (const sucursal of nombresSucursales) {
        if (pendiente === 0) break;
        const disponible = articulo.sucursales[sucursal];
        const descontar = Math.min(disponible, pendiente);
        articulo.sucursales[sucursal] -= descontar;
        pendiente -= descontar;
    }
    return pendiente === 0;
};

function formatoMoneda(valor) {
    return `$${Number(valor).toFixed(2)}`;
}

function siguienteId() {
    return inventarioDB.length ? Math.max(...inventarioDB.map((a) => a.id)) + 1 : 1;
}

function crearMapaSucursalesBase() {
    const sucursales = Object.keys(inventarioDB[0]?.sucursales || { [SUCURSAL_ACTUAL]: 0 });
    const base = {};
    sucursales.forEach((s) => (base[s] = 0));
    if (!(SUCURSAL_ACTUAL in base)) base[SUCURSAL_ACTUAL] = 0;
    return base;
}

function iniciarVistaInventario() {
    const tablaInventario = document.getElementById("tabla-inventario");
    const inputBusqueda = document.getElementById("buscar-articulo");
    const sucursalActualLabel = document.getElementById("sucursal-actual");

    const sucursalSelect = document.getElementById("sucursal-select");
    const botonBuscarSucursal = document.getElementById("btn-buscar-sucursal");
    const articuloSeleccionado = document.getElementById("articulo-seleccionado");
    const existenciasSucursal = document.getElementById("existencias-sucursal");

    const formArticulo = document.getElementById("form-articulo");
    const inputFolio = document.getElementById("input-folio");
    const inputCodigo = document.getElementById("input-codigo");
    const inputNombre = document.getElementById("input-nombre");
    const inputPrecio = document.getElementById("input-precio");
    const inputExistenciasActual = document.getElementById("input-existencias-actual");
    const btnCancelarEdicion = document.getElementById("btn-cancelar-edicion");

    if (
        !tablaInventario || !inputBusqueda || !sucursalSelect || !botonBuscarSucursal ||
        !articuloSeleccionado || !existenciasSucursal || !formArticulo || !inputFolio ||
        !inputCodigo || !inputNombre || !inputPrecio || !inputExistenciasActual || !btnCancelarEdicion
    ) {
        return;
    }

    sucursalActualLabel.textContent = SUCURSAL_ACTUAL;

    const sucursales = Object.keys(crearMapaSucursalesBase());
    sucursalSelect.innerHTML = sucursales.map((sucursal) => `<option value="${sucursal}">${sucursal}</option>`).join("");

    let articulosFiltrados = obtenerInventario();
    let articuloActivo = articulosFiltrados[0] || null;

    function limpiarFormulario() {
        articuloEditandoId = null;
        formArticulo.reset();
        inputExistenciasActual.value = "0";
    }

    function cargarFormulario(articulo) {
        articuloEditandoId = articulo.id;
        inputFolio.value = articulo.folio;
        inputCodigo.value = articulo.codigo;
        inputNombre.value = articulo.articulo;
        inputPrecio.value = articulo.precio;
        inputExistenciasActual.value = articulo.sucursales[SUCURSAL_ACTUAL] ?? 0;
    }

    function actualizarPanelSucursal() {
        if (!articuloActivo) {
            articuloSeleccionado.textContent = "Ninguno";
            existenciasSucursal.textContent = "0";
            return;
        }
        articuloSeleccionado.textContent = `${articuloActivo.articulo} (${articuloActivo.folio})`;
        const cantidad = window.obtenerExistenciasSucursal(articuloActivo.id, sucursalSelect.value);
        existenciasSucursal.textContent = String(cantidad);
    }

    function renderizarTabla() {
        if (!articulosFiltrados.length) {
            tablaInventario.innerHTML = '<tr><td class="px-6 py-6 text-sm text-gray-400" colspan="6">No se encontraron artículos</td></tr>';
            articuloActivo = null;
            actualizarPanelSucursal();
            return;
        }

        tablaInventario.innerHTML = articulosFiltrados
            .map(
                (articulo) => `
                    <tr data-id="${articulo.id}" class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="px-6 py-3">${articulo.folio}</td>
                        <td class="px-6 py-3">${articulo.codigo}</td>
                        <td class="px-6 py-3">${articulo.articulo}</td>
                        <td class="px-6 py-3">${formatoMoneda(articulo.precio)}</td>
                        <td class="px-6 py-3">${articulo.existencias}</td>
                        <td class="px-6 py-3">
                            <div class="flex gap-2">
                                <button type="button" data-action="editar" data-id="${articulo.id}" class="px-3 py-1 text-xs rounded bg-amber-100 text-amber-800 hover:bg-amber-200">Editar</button>
                                <button type="button" data-action="eliminar" data-id="${articulo.id}" class="px-3 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200">Eliminar</button>
                            </div>
                        </td>
                    </tr>
                `
            )
            .join("");

        const existeActivo = articuloActivo && articulosFiltrados.some((a) => a.id === articuloActivo.id);
        if (!existeActivo) articuloActivo = articulosFiltrados[0];
        actualizarPanelSucursal();
    }

    function filtrar() {
        const termino = inputBusqueda.value.trim().toLowerCase();
        articulosFiltrados = obtenerInventario().filter((articulo) => {
            if (!termino) return true;
            return (
                articulo.articulo.toLowerCase().includes(termino) ||
                articulo.folio.toLowerCase().includes(termino) ||
                (articulo.codigo || "").toLowerCase().includes(termino)
            );
        });
        renderizarTabla();
    }

    function guardarArticulo(event) {
        event.preventDefault();

        const folio = inputFolio.value.trim();
        const codigo = inputCodigo.value.trim();
        const nombre = inputNombre.value.trim();
        const precio = Number(inputPrecio.value);
        const existenciasActual = Number.parseInt(inputExistenciasActual.value, 10);

        if (!folio || !codigo || !nombre || Number.isNaN(precio) || precio < 0 || !Number.isInteger(existenciasActual) || existenciasActual < 0) {
            alert("Completa todos los campos con valores válidos.");
            return;
        }

        const repetido = inventarioDB.find((a) =>
            (a.folio.toLowerCase() === folio.toLowerCase() || a.codigo.toLowerCase() === codigo.toLowerCase()) &&
            a.id !== articuloEditandoId
        );
        if (repetido) {
            alert("Ya existe un artículo con ese folio o código.");
            return;
        }

        if (articuloEditandoId) {
            const articulo = buscarArticuloPorId(articuloEditandoId);
            if (!articulo) return;

            articulo.folio = folio;
            articulo.codigo = codigo;
            articulo.articulo = nombre;
            articulo.precio = precio;
            if (!(SUCURSAL_ACTUAL in articulo.sucursales)) articulo.sucursales[SUCURSAL_ACTUAL] = 0;
            articulo.sucursales[SUCURSAL_ACTUAL] = existenciasActual;
        } else {
            const sucursalesBase = crearMapaSucursalesBase();
            sucursalesBase[SUCURSAL_ACTUAL] = existenciasActual;

            inventarioDB.push({
                id: siguienteId(),
                folio,
                codigo,
                articulo: nombre,
                precio,
                sucursales: sucursalesBase
            });
        }

        limpiarFormulario();
        filtrar();
    }

    function eliminarArticulo(id) {
        const idx = inventarioDB.findIndex((a) => a.id === id);
        if (idx === -1) return;
        const ok = confirm("¿Seguro que deseas eliminar este artículo?");
        if (!ok) return;

        inventarioDB.splice(idx, 1);
        if (articuloEditandoId === id) limpiarFormulario();
        filtrar();
    }

    inputBusqueda.addEventListener("input", filtrar);

    tablaInventario.addEventListener("click", (event) => {
        const boton = event.target.closest("button[data-action]");
        const fila = event.target.closest("tr[data-id]");

        if (fila) {
            const idFila = Number.parseInt(fila.dataset.id, 10);
            articuloActivo = obtenerInventario().find((a) => a.id === idFila) || null;
            actualizarPanelSucursal();
        }

        if (!boton) return;

        const id = Number.parseInt(boton.dataset.id, 10);
        const accion = boton.dataset.action;
        const articulo = buscarArticuloPorId(id);
        if (!articulo) return;

        if (accion === "editar") {
            cargarFormulario(articulo);
        } else if (accion === "eliminar") {
            eliminarArticulo(id);
        }
    });

    formArticulo.addEventListener("submit", guardarArticulo);
    btnCancelarEdicion.addEventListener("click", () => {
        limpiarFormulario();
    });

    botonBuscarSucursal.addEventListener("click", actualizarPanelSucursal);

    limpiarFormulario();
    renderizarTabla();
}

document.addEventListener("DOMContentLoaded", iniciarVistaInventario);