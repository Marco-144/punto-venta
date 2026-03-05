const IVA = 0.16;
const detalleVenta = document.getElementById("detalle-venta");
const subtotalVenta = document.getElementById("subtotal-venta");
const impuestosVenta = document.getElementById("impuestos-venta");
const totalVenta = document.getElementById("total-venta");
const inputBuscar = document.getElementById("buscar-articulo");
const listaArticulos = document.getElementById("lista-articulos");
const modalCantidad = document.getElementById("modal-cantidad");
const modalCantidadArticulo = document.getElementById("modal-cantidad-articulo");
const modalCantidadInput = document.getElementById("modal-cantidad-input");
const modalCancelar = document.getElementById("modal-cancelar");
const modalConfirmar = document.getElementById("modal-confirmar");
const carrito = [];
let articuloPendiente = null;

function obtenerCatalogo() {
	if (typeof window.obtenerInventario === "function") {
		return window.obtenerInventario();
	}

	return [];
}

function formatearMoneda(valor) {
	return `$${valor.toFixed(2)}`;
}

function ocultarLista() {
	listaArticulos.classList.add("hidden");
	listaArticulos.innerHTML = "";
}

function filtrarArticulos(texto) {
	const q = texto.trim().toLowerCase();
	const catalogo = obtenerCatalogo();

	if (!q) {
		return catalogo;
	}

	return catalogo.filter(
		(item) =>
			item.articulo.toLowerCase().includes(q) ||
			item.folio.toLowerCase().includes(q) ||
			(item.codigo || "").toLowerCase().includes(q) ||
			String(item.id).includes(q)
	);

}

function obtenerArticuloPorCodigoExacto(texto) {
	const codigo = texto.trim().toLowerCase();
	if (!codigo) {
		return null;
	}
	return obtenerCatalogo().find((item) => (item.codigo || "").toLowerCase() === codigo) || null;	
}


function mostrarLista(items) {
	if (!items.length) {
		listaArticulos.innerHTML = '<div class="px-4 py-3 text-sm text-gray-500">Sin resultados</div>';
		listaArticulos.classList.remove("hidden");
		return;
	}

	listaArticulos.innerHTML = items
		.map(
			(item) => `
			<button type="button" data-id="${item.id}" class="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0">
				<div class="text-sm font-medium text-gray-800">${item.articulo}</div>
				<div class="text-xs text-gray-500">Código: ${item.codigo || "N/A"} · ID: ${item.id} · Folio: ${item.folio} · Precio: ${formatearMoneda(item.precio)} · Existencias: ${item.existencias}</div>
			</button>
		`
		)
		.join("");

	listaArticulos.classList.remove("hidden");
}

function abrirModalCantidad(articulo) {
	articuloPendiente = articulo;
	modalCantidadArticulo.textContent = `${articulo.articulo} · ${formatearMoneda(articulo.precio)} c/u · Disp: ${articulo.existencias}`;
	modalCantidadInput.value = "1";
	modalCantidad.classList.remove("hidden");
	ocultarLista();
	setTimeout(() => {
		modalCantidadInput.focus();
		modalCantidadInput.select();
	}, 0);
}
function recalcularYRenderizar() {
	if (!carrito.length) {
		detalleVenta.innerHTML = '<tr><td class="px-6 py-6 text-sm text-gray-400" colspan="4">No hay artículos agregados</td></tr>';
		subtotalVenta.textContent = formatearMoneda(0);
		impuestosVenta.textContent = formatearMoneda(0);
		totalVenta.textContent = formatearMoneda(0);
		return;
	}

	let subtotal = 0;
	let filasHTML = "";

	carrito.forEach((item) => {
		const totalLinea = item.precio * item.cantidad;
		subtotal += totalLinea;

		filasHTML += `
			<tr>
				<td class="px-6 py-4">${item.articulo}</td>
				<td class="px-6 py-4">${formatearMoneda(item.precio)}</td>
				<td class="px-6 py-4">${item.cantidad}</td>
				<td class="px-6 py-4">${formatearMoneda(totalLinea)}</td>
			</tr>
		`;
	});

	detalleVenta.innerHTML = filasHTML;

	const impuestos = subtotal * IVA;
	const total = subtotal + impuestos;

	subtotalVenta.textContent = formatearMoneda(subtotal);
	impuestosVenta.textContent = formatearMoneda(impuestos);
	totalVenta.textContent = formatearMoneda(total);
}

function agregarArticulo(articulo, cantidadNueva) {
	const existente = carrito.find((item) => item.id === articulo.id);
	if (existente) {
		existente.cantidad += cantidadNueva;
	} else {
		carrito.push({ ...articulo, cantidad: cantidadNueva });
	}

	recalcularYRenderizar();
}

function cerrarModalCantidad() {
	modalCantidad.classList.add("hidden");
	modalCantidadInput.value = "";
	articuloPendiente = null;
}

function confirmarCantidadModal() {
	if (!articuloPendiente) {
		cerrarModalCantidad();
		return;
	}

	const cantidad = Number.parseInt(modalCantidadInput.value, 10);
	if (!Number.isInteger(cantidad) || cantidad <= 0) {
		window.alert("Ingresa una cantidad válida mayor a 0.");
		modalCantidadInput.focus();
		return;
	}

	const articuloActualizado = typeof window.obtenerArticuloInventario === "function" ? window.obtenerArticuloInventario(articuloPendiente.id) : null;
	const existenciasDisponibles = articuloActualizado ? articuloActualizado.existencias : articuloPendiente.existencias;

	const enCarrito = carrito.find((item) => item.id === articuloPendiente.id)?.cantidad ?? 0;
	if (cantidad + enCarrito > existenciasDisponibles) {
		window.alert(`Existencias insuficientes. Disponibles: ${existenciasDisponibles}.`);
		modalCantidadInput.focus();
		return;
	}

	agregarArticulo(articuloPendiente, cantidad);
	inputBuscar.value = "";
	ocultarLista();
	cerrarModalCantidad();
	inputBuscar.focus();
}

inputBuscar.addEventListener("focus", () => {
	mostrarLista(filtrarArticulos(inputBuscar.value));
});

inputBuscar.addEventListener("click", () => {
	mostrarLista(filtrarArticulos(inputBuscar.value));
});

inputBuscar.addEventListener("input", (event) => {
	const texto = event.target.value;
	const resultados = filtrarArticulos(texto);
	mostrarLista(resultados);

	const articuloExacto = obtenerArticuloPorCodigoExacto(texto);
	if (!articuloExacto) {
		return;
	}

	abrirModalCantidad(articuloExacto);
	inputBuscar.value = "";
});

listaArticulos.addEventListener("click", (event) => {
	const boton = event.target.closest("button[data-id]");
	if (!boton) {
		return;
	}

	const id = Number(boton.dataset.id);
	const seleccionado = obtenerCatalogo().find((item) => item.id === id);
	if (!seleccionado) {
		return;
	}

	abrirModalCantidad(seleccionado);
});

modalConfirmar.addEventListener("click", confirmarCantidadModal);

modalCancelar.addEventListener("click", () => {
	cerrarModalCantidad();
	ocultarLista();
	inputBuscar.focus();
});

modalCantidadInput.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.preventDefault();
		confirmarCantidadModal();
	}
});

document.addEventListener("click", (event) => {
	if (!event.target.closest("#buscar-articulo") && !event.target.closest("#lista-articulos")) {
		ocultarLista();
	}
});

recalcularYRenderizar();
