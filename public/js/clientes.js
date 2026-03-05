
const clientes = [{id: 1, nombre: "Juan Perez", empresa: "JUAN SVC", telefono: 4771234567,correo:"Juan@correo.com", rango: "Bronce"},
                   {id: 2, nombre: "Maria Angeles", empresa: "Angeles S.A. de C.V.", telefono: 4779876543,correo:"Maria@correo.com", rango: "Oro"},
                   {id: 3, nombre: "Carlos Lopez", empresa: "Lopez y Asociados", telefono: 4775551234,correo:"Carlos@correo.com", rango: "Diamante"},
                   {id: 4, nombre: "Ana Gomez", empresa: "Gomez Soluciones", telefono: 4773219876,correo:"Ana@correo.com", rango: "Plata"},
                   {id: 5, nombre: "Luis Martinez", empresa: "Martinez Servicios", telefono: 4776543210,correo:"Luis@correo.com", rango: "Bronce"},
                   {id: 6, nombre: "Sofia Ramirez", empresa: "Ramirez Consultores", telefono: 4777890123,correo:"Sofia@correo.com", rango: "Oro"},
                   {id: 7, nombre: "Miguel Torres", empresa: "Torres Innovación", telefono: 4774321098,correo:"Miguel@correo.com", rango: "Plata"},


];


const tbody = document.querySelector("#detalle-clientes");

tbody.innerHTML = "";

clientes.forEach(cliente => {
    const fila = `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${cliente.nombre}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.empresa}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.telefono}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.correo}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${cliente.rango}</td>
            
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
            <div class="flex items-center gap-2">
            <button type="button" title="Modificar cliente" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white active:bg-blue-700 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-300">
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M5 8a4 4 0 1 1 7.796 1.263l-2.533 2.534A4 4 0 0 1 5 8Zm4.06 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h2.172a2.999 2.999 0 0 1-.114-1.588l.674-3.372a3 3 0 0 1 .82-1.533L9.06 13Zm9.032-5a2.907 2.907 0 0 0-2.056.852L9.967 14.92a1 1 0 0 0-.273.51l-.675 3.373a1 1 0 0 0 1.177 1.177l3.372-.675a1 1 0 0 0 .511-.273l6.07-6.07a2.91 2.91 0 0 0-.944-4.742A2.907 2.907 0 0 0 18.092 8Z" clip-rule="evenodd"/>
            </svg>
        
            
                
            </button>               
            <button type="button" title="Eliminar cliente" class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white active:bg-red-700 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-300">
                <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"/>
                </svg>
            </button>
            </div>
            </td>
        </tr>
    `;

    tbody.innerHTML += fila;
});
