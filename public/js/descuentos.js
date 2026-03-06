const DESCUENTOS_STORAGE_KEY = "pv_descuentos_v1";

const DESCUENTOS_SEMILLA = [
    { id: 1, nombre: "Descuento Diamante", porcentaje: 0.2, rango: ["Diamante"], monedero: 20, inventarioBase: [] },
    { id: 2, nombre: "Descuento Oro", porcentaje: 0.15, rango: ["Oro"], monedero: 15, inventarioBase: [] },
    { id: 3, nombre: "Descuento Plata", porcentaje: 0.1, rango: ["Plata"], monedero: 10, inventarioBase: [] },
    { id: 4, nombre: "Descuento Sin Rango", porcentaje: 0.05, rango: ["Sin Rango"], monedero: 5, inventarioBase: [] },
    { id: 5, nombre: "Descuento Regreso a clases", porcentaje: 0.25, rango: ["Diamante", "Oro", "Sin Rango"], monedero: 2, inventarioBase: [1, 2, 3] }
];

let descuentos = cargarDescuentos();
let descuentoEnEdicionId = null;
let inventarioSeleccionado = new Set();

const tbody = document.querySelector("#detalle-descuentos");
const inputBuscar = document.getElementById("buscar-descuento");
const totalDescuentosEl = document.getElementById("total-descuentos");
const formDescuento = document.getElementById("form-descuento");
const btnCancelar = document.getElementById("btn-cancelar-descuento");
const btnGuardar = document.getElementById("btn-guardar-descuento");

const inputNombre = document.getElementById("input-descuento-nombre");
const inputPorcentaje = document.getElementById("input-descuento-porcentaje");
const inputMonedero = document.getElementById("input-descuento-monedero");
const inputActivo = document.getElementById("input-descuento-activo");

const grupoRangos = document.getElementById("grupo-rangos");
const buscarInventarioInput = document.getElementById("buscar-inventario-descuento");
const listaInventarioEl = document.getElementById("lista-inventario-descuento");
const resumenInventarioEl = document.getElementById("resumen-inventario-seleccion");

function cargarDescuentos() {
    const raw = localStorage.getItem(DESCUENTOS_STORAGE_KEY);
    if (!raw) {
        return [...DESCUENTOS_SEMILLA];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [...DESCUENTOS_SEMILLA];
    } catch {
        return [...DESCUENTOS_SEMILLA];
    }
}

function guardarDescuentos() {
    localStorage.setItem(DESCUENTOS_STORAGE_KEY, JSON.stringify(descuentos));
}

function obtenerInventarioCatalogo() {
    if (typeof window.obtenerInventario === "function") {
        return window.obtenerInventario();
    }
    return [];
}

function obtenerSiguienteId() {
    return descuentos.length ? Math.max(...descuentos.map((item) => item.id)) + 1 : 1;
}

function formatearPorcentaje(valorDecimal) {
    return `${Math.round(Number(valorDecimal || 0) * 100)}%`;
}

function renderRangos(rangos) {
    if (!Array.isArray(rangos) || !rangos.length) {
        return '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Sin rango</span>';
    }

    return rangos
        .map(
            (rango) =>
                `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200">${rango}</span>`
        )
        .join(" ");
}

function renderInventarioChips(ids) {
    if (!Array.isArray(ids) || !ids.length) {
        return '<span class="text-xs text-gray-400 dark:text-gray-500">Todos</span>';
    }

    const catalogo = obtenerInventarioCatalogo();
    const byId = new Map(catalogo.map((item) => [item.id, item]));

    return ids
        .map((id) => {
            const item = byId.get(id);
            const label = item ? `${item.articulo}` : `ID ${id}`;
            return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">${label}</span>`;
        })
        .join(" ");
}

function actualizarTotalDescuentos() {
    if (!totalDescuentosEl) {
        return;
    }

    const activos = descuentos.filter((item) => item.activo !== false).length;
    totalDescuentosEl.textContent = String(activos);
}

function renderTablaDescuentos() {
    if (!tbody) {
        return;
    }

    const termino = (inputBuscar?.value || "").trim().toLowerCase();
    const filtrados = descuentos.filter((item) => {
        if (!termino) {
            return true;
        }

        return (
            item.nombre.toLowerCase().includes(termino) ||
            (item.rango || []).join(" ").toLowerCase().includes(termino)
        );
    });

    if (!filtrados.length) {
        tbody.innerHTML = '<tr><td class="px-6 py-10 text-sm text-center text-gray-400 dark:text-gray-500" colspan="5">No hay descuentos agregados</td></tr>';
        return;
    }

    tbody.innerHTML = filtrados
        .map(
            (item) => `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">#${item.id}</td>
                    <td class="px-6 py-4">
                        <p class="font-medium text-gray-800 dark:text-gray-100">${item.nombre}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Descuento: ${formatearPorcentaje(item.porcentaje)} · Monedero: ${Number(item.monedero || 0)}%</p>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-2">${renderRangos(item.rango)}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-2">${renderInventarioChips(item.inventarioBase)}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-end gap-2">
                            <button type="button" title="Modificar descuento" data-accion="editar" data-id="${item.id}" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white active:bg-blue-700 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="2" d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z"/>
                                </svg>
                            </button>
                            <button type="button" title="Eliminar descuento" data-accion="eliminar" data-id="${item.id}" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white active:bg-red-700 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300">
                                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `
        )
        .join("");
}

function obtenerRangosSeleccionados() {
    if (!grupoRangos) {
        return [];
    }

    return Array.from(grupoRangos.querySelectorAll('input[name="rango"]:checked')).map((input) => input.value);
}

function establecerRangosSeleccionados(rangos) {
    if (!grupoRangos) {
        return;
    }

    const set = new Set(rangos || []);
    grupoRangos.querySelectorAll('input[name="rango"]').forEach((input) => {
        input.checked = set.has(input.value);
    });
}

function actualizarResumenInventario() {
    if (!resumenInventarioEl) {
        return;
    }

    const cantidad = inventarioSeleccionado.size;
    resumenInventarioEl.textContent = `${cantidad} producto${cantidad === 1 ? "" : "s"} seleccionado${cantidad === 1 ? "" : "s"}`;
}

function renderInventarioSelector() {
    if (!listaInventarioEl) {
        return;
    }

    const catalogo = obtenerInventarioCatalogo();
    const termino = (buscarInventarioInput?.value || "").trim().toLowerCase();

    const filtrados = catalogo.filter((item) => {
        if (!termino) {
            return true;
        }

        return (
            item.articulo.toLowerCase().includes(termino) ||
            item.folio.toLowerCase().includes(termino) ||
            (item.codigo || "").toLowerCase().includes(termino)
        );
    });

    if (!filtrados.length) {
        listaInventarioEl.innerHTML = '<div class="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">Sin resultados de inventario</div>';
        actualizarResumenInventario();
        return;
    }

    listaInventarioEl.innerHTML = filtrados
        .map(
            (item) => `
                <label class="flex items-start gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <input type="checkbox" class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" data-inv-id="${item.id}" ${inventarioSeleccionado.has(item.id) ? "checked" : ""}>
                    <span>
                        <span class="block text-sm text-gray-800 dark:text-gray-100">${item.articulo}</span>
                        <span class="block text-xs text-gray-500 dark:text-gray-400">${item.folio} · ${item.codigo || "N/A"}</span>
                    </span>
                </label>
            `
        )
        .join("");

    actualizarResumenInventario();
}

function limpiarFormulario() {
    descuentoEnEdicionId = null;
    formDescuento?.reset();
    establecerRangosSeleccionados([]);
    inventarioSeleccionado = new Set();
    if (btnGuardar) {
        btnGuardar.textContent = "Guardar";
    }
    renderInventarioSelector();
}

function cargarEnFormulario(item) {
    descuentoEnEdicionId = item.id;

    if (inputNombre) inputNombre.value = item.nombre;
    if (inputPorcentaje) inputPorcentaje.value = Math.round(Number(item.porcentaje || 0) * 100);
    if (inputMonedero) inputMonedero.value = Number(item.monedero || 0);
    if (inputActivo) inputActivo.checked = item.activo !== false;

    establecerRangosSeleccionados(item.rango || []);
    inventarioSeleccionado = new Set((item.inventarioBase || []).map((id) => Number(id)));

    if (btnGuardar) {
        btnGuardar.textContent = "Actualizar";
    }

    renderInventarioSelector();
}

function guardarDesdeFormulario(event) {
    event.preventDefault();

    const nombre = (inputNombre?.value || "").trim();
    const porcentajeEntrada = Number(inputPorcentaje?.value || 0);
    const monedero = Number(inputMonedero?.value || 0);
    const activo = Boolean(inputActivo?.checked);
    const rangos = obtenerRangosSeleccionados();

    if (!nombre) {
        window.alert("Ingresa un nombre para el descuento.");
        return;
    }

    if (!Number.isFinite(porcentajeEntrada) || porcentajeEntrada <= 0 || porcentajeEntrada > 100) {
        window.alert("El porcentaje debe ser un numero entre 1 y 100.");
        return;
    }

    if (!Number.isFinite(monedero) || monedero < 0 || monedero > 100) {
        window.alert("El monedero debe estar entre 0 y 100.");
        return;
    }

    if (!rangos.length) {
        window.alert("Selecciona al menos un rango.");
        return;
    }

    const payload = {
        nombre,
        porcentaje: porcentajeEntrada / 100,
        monedero,
        rango: rangos,
        inventarioBase: Array.from(inventarioSeleccionado),
        activo
    };

    if (descuentoEnEdicionId) {
        const index = descuentos.findIndex((item) => item.id === descuentoEnEdicionId);
        if (index !== -1) {
            descuentos[index] = { ...descuentos[index], ...payload };
        }
    } else {
        descuentos.push({ id: obtenerSiguienteId(), ...payload });
    }

    guardarDescuentos();
    limpiarFormulario();
    actualizarTotalDescuentos();
    renderTablaDescuentos();
}

function eliminarDescuento(id) {
    const ok = window.confirm("¿Eliminar este descuento?");
    if (!ok) {
        return;
    }

    descuentos = descuentos.filter((item) => item.id !== id);
    guardarDescuentos();

    if (descuentoEnEdicionId === id) {
        limpiarFormulario();
    }

    actualizarTotalDescuentos();
    renderTablaDescuentos();
}

function configurarEventos() {
    inputBuscar?.addEventListener("input", renderTablaDescuentos);
    formDescuento?.addEventListener("submit", guardarDesdeFormulario);

    btnCancelar?.addEventListener("click", () => {
        limpiarFormulario();
    });

    buscarInventarioInput?.addEventListener("input", renderInventarioSelector);

    listaInventarioEl?.addEventListener("change", (event) => {
        const check = event.target.closest("input[data-inv-id]");
        if (!check) {
            return;
        }

        const id = Number(check.dataset.invId);
        if (check.checked) {
            inventarioSeleccionado.add(id);
        } else {
            inventarioSeleccionado.delete(id);
        }
        actualizarResumenInventario();
    });

    tbody?.addEventListener("click", (event) => {
        const btn = event.target.closest("button[data-accion]");
        if (!btn) {
            return;
        }

        const id = Number(btn.dataset.id);
        const accion = btn.dataset.accion;
        const item = descuentos.find((d) => d.id === id);
        if (!item) {
            return;
        }

        if (accion === "editar") {
            cargarEnFormulario(item);
            return;
        }

        if (accion === "eliminar") {
            eliminarDescuento(id);
        }
    });
}

function iniciarVistaDescuentos() {
    if (!tbody) {
        return;
    }

    configurarEventos();
    actualizarTotalDescuentos();
    renderInventarioSelector();
    renderTablaDescuentos();
}

document.addEventListener("DOMContentLoaded", iniciarVistaDescuentos);
