
const clientes = [
    {id: 1, nombre: "Marco", Empresa: "Papeleria Marco", telefono: "1234567890", correo: "marco@example.com", monedero: 150, Rango: "Plata"}, 
    {id: 2, nombre: "Luisa", Empresa: "Luisa S.A.", telefono: "0987654321", correo: "luisa@example.com", monedero: 200, Rango: "Oro"},
    {id: 3, nombre: "Carlos", Empresa: "Carlos y Asociados", telefono: "5555555555", correo: "carlos@example.com", monedero: 300, Rango: "Diamante"},
    {id: 4, nombre: "Ana", Empresa: "Ana Papeleria", telefono: "1112223333", correo: "ana@example.com", monedero: 250, Rango: "Plata"}
];


const tbody = document.querySelector("#detalle-clientes");

if (tbody) {
    tbody.innerHTML = "";

    clientes.forEach(cliente => {
        const fila = `
            <tr class="border-b border-gray-200 dark:border-gray-700">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${cliente.nombre}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${cliente.Empresa}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${cliente.correo}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${cliente.telefono}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">$${cliente.monedero}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">${cliente.Rango}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center gap-2">
                                                <button type="button" title="Modificar cliente" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white active:bg-blue-700 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
</svg>
</button>
                                                <button type="button" title="Eliminar cliente" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white active:bg-red-700 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-300 dark:bg-red-900/40 dark:border-red-700 dark:text-red-300"><svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="square" stroke-linejoin="round" stroke-width="2" d="M7 19H5a1 1 0 0 1-1-1v-1a3 3 0 0 1 3-3h1m4-6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm7.441 1.559a1.907 1.907 0 0 1 0 2.698l-6.069 6.069L10 19l.674-3.372 6.07-6.07a1.907 1.907 0 0 1 2.697 0Z"/>
</svg>
</button>
                    </div>
                </td>
            </tr>
        `;

        tbody.innerHTML += fila;
    });
}