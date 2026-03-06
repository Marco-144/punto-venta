const descuentos = [
    { id: 1, nombre: "Descuento Diamante", porcentaje: 0.20, rango: ["Diamante"], monedero: 20 },
    { id: 2, nombre: "Descuento Oro", porcentaje: 0.15, rango: ["Oro"], monedero: 15 },
    { id: 3, nombre: "Descuento Plata", porcentaje: 0.10, rango: ["Plata"], monedero: 10 },
    { id: 4, nombre: "Descuento Sin Rango", porcentaje: 0.05, rango: ["Sin Rango"], monedero: 5 },
    { id: 5, nombre: "Descuento Regreso a clases", porcentaje: 0.25, rango: ["Diamante", "Oro", "Sin Rango"], monedero: 2, inventarioBase: [1, 2, 3] }
];

const tbody = document.querySelector("#detalle-descuentos");

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

function renderTablaDescuentos() {
    if (!tbody) {
        return;
    }

    if (!descuentos.length) {
        tbody.innerHTML = '<tr><td class="px-6 py-10 text-sm text-center text-gray-400 dark:text-gray-500" colspan="4">No hay descuentos agregados</td></tr>';
        return;
    }

    tbody.innerHTML = descuentos
        .map(
            (item) => `
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td class="px-6 py-4 font-medium text-gray-800 dark:text-gray-100">#${item.id}</td>
                    <td class="px-6 py-4">${item.nombre}</td>
                    <td class="px-6 py-4">
                        <div class="flex flex-wrap gap-2">${renderRangos(item.rango)}</div>
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

renderTablaDescuentos();
