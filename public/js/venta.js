const IVA = 0.16;
const REGISTRO_VENTAS_KEY = "punto_venta_registro_ventas_v1";
const detalleVenta = document.getElementById("detalle-venta");
const subtotalVenta = document.getElementById("subtotal-venta");
const impuestosVenta = document.getElementById("impuestos-venta");
const totalVenta = document.getElementById("total-venta");
const cambioVenta = document.getElementById("cambio-venta");
const inputBuscar = document.getElementById("buscar-articulo");
const listaArticulos = document.getElementById("lista-articulos");
const modalCantidad = document.getElementById("modal-cantidad");
const modalCantidadArticulo = document.getElementById("modal-cantidad-articulo");
const modalCantidadInput = document.getElementById("modal-cantidad-input");
const modalCancelar = document.getElementById("modal-cancelar");
const modalConfirmar = document.getElementById("modal-confirmar");
const btnPagoEfectivo = document.getElementById("btn-pago-efectivo");
const btnPagoTarjeta = document.getElementById("btn-pago-tarjeta");
const btnPagoOtros = document.getElementById("btn-pago-otros");
const btnFinalizarVenta = document.getElementById("btn-finalizar-venta");
const carrito = [];
let articuloPendiente = null;
let metodoPago = "efectivo";
let esperandoMontoEfectivo = false;
let montoRecibido = 0;
let totalActual = 0;
const placeholderBusqueda = "Escanear o ingresar código de artículo...";
const placeholderEfectivo = "Ingresa monto recibido en efectivo y presiona Enter";

function obtenerCatalogo() {
	if (typeof window.obtenerInventario === "function") {
		return window.obtenerInventario();
	}

	return [];
}

function formatearMoneda(valor) {
	return `$${valor.toFixed(2)}`;
}

function obtenerTotales() {
	const subtotal = carrito.reduce((acum, item) => acum + item.precio * item.cantidad, 0);
	const impuestos = subtotal * IVA;
	const total = subtotal + impuestos;

	return { subtotal, impuestos, total };
}

function guardarRegistroVenta(registro) {
	const raw = localStorage.getItem(REGISTRO_VENTAS_KEY);
	const lista = raw ? JSON.parse(raw) : [];
	lista.unshift(registro);
	localStorage.setItem(REGISTRO_VENTAS_KEY, JSON.stringify(lista));
}

function actualizarCambioUI() {
	const cambio = Math.max(0, montoRecibido - totalActual);
	cambioVenta.textContent = formatearMoneda(cambio);
}

function activarPagoEfectivo() {
	metodoPago = "efectivo";
	esperandoMontoEfectivo = true;
	inputBuscar.value = "";
	inputBuscar.placeholder = placeholderEfectivo;
	ocultarLista();
	inputBuscar.focus();
}

function activarMetodoNoEfectivo(metodo) {
	metodoPago = metodo;
	esperandoMontoEfectivo = false;
	montoRecibido = 0;
	inputBuscar.placeholder = placeholderBusqueda;
	actualizarCambioUI();
}

function confirmarMontoEfectivoDesdeInput() {
	if (!esperandoMontoEfectivo) {
		return;
	}

	const monto = Number(inputBuscar.value.trim());
	if (!Number.isFinite(monto) || monto < 0) {
		window.alert("Ingresa un monto válido para efectivo.");
		return;
	}

	montoRecibido = monto;
	esperandoMontoEfectivo = false;
	inputBuscar.value = "";
	inputBuscar.placeholder = placeholderBusqueda;
	actualizarCambioUI();
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
		totalActual = 0;
		actualizarCambioUI();
		return;
	}

	let filasHTML = "";

	carrito.forEach((item) => {
		const totalLinea = item.precio * item.cantidad;

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
	const { subtotal, impuestos, total } = obtenerTotales();
	totalActual = total;

	subtotalVenta.textContent = formatearMoneda(subtotal);
	impuestosVenta.textContent = formatearMoneda(impuestos);
	totalVenta.textContent = formatearMoneda(total);
	actualizarCambioUI();
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
	if (esperandoMontoEfectivo) {
		return;
	}
	mostrarLista(filtrarArticulos(inputBuscar.value));
});

inputBuscar.addEventListener("click", () => {
	if (esperandoMontoEfectivo) {
		return;
	}
	mostrarLista(filtrarArticulos(inputBuscar.value));
});

inputBuscar.addEventListener("input", (event) => {
	if (esperandoMontoEfectivo) {
		return;
	}

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

inputBuscar.addEventListener("keydown", (event) => {
	if (event.key === "Enter" && esperandoMontoEfectivo) {
		event.preventDefault();
		confirmarMontoEfectivoDesdeInput();
	}
});

btnPagoEfectivo.addEventListener("click", activarPagoEfectivo);
btnPagoTarjeta.addEventListener("click", () => activarMetodoNoEfectivo("tarjeta"));
btnPagoOtros.addEventListener("click", () => activarMetodoNoEfectivo("otros"));

btnFinalizarVenta.addEventListener("click", () => {
	if (!carrito.length) {
		window.alert("Agrega artículos antes de finalizar la venta.");
		return;
	}

	if (esperandoMontoEfectivo) {
		window.alert("Confirma primero el monto recibido en efectivo con Enter.");
		return;
	}

	if (metodoPago === "efectivo" && montoRecibido < totalActual) {
		window.alert("El monto recibido es menor al total de la compra.");
		return;
	}

	for (const item of carrito) {
		const actual = typeof window.obtenerArticuloInventario === "function" ? window.obtenerArticuloInventario(item.id) : null;
		if (!actual || actual.existencias < item.cantidad) {
			window.alert(`Inventario insuficiente para ${item.articulo}.`);
			return;
		}
	}

	for (const item of carrito) {
		const ok = typeof window.disminuirInventario === "function" ? window.disminuirInventario(item.id, item.cantidad) : false;
		if (!ok) {
			window.alert(`No se pudo descontar inventario de ${item.articulo}.`);
			return;
		}
	}

	const { subtotal, impuestos, total } = obtenerTotales();
	const cambio = metodoPago === "efectivo" ? Math.max(0, montoRecibido - total) : 0;
	const fecha = new Date();

	guardarRegistroVenta({
		id: `V-${Date.now()}`,
		fechaISO: fecha.toISOString(),
		fechaTexto: fecha.toLocaleString(),
		metodoPago,
		subtotal,
		impuestos,
		total,
		montoRecibido: metodoPago === "efectivo" ? montoRecibido : null,
		cambio,
		articulos: carrito.map((item) => ({
			id: item.id,
			codigo: item.codigo || "",
			articulo: item.articulo,
			precio: item.precio,
			cantidad: item.cantidad,
			totalLinea: item.precio * item.cantidad
		}))
	});

	window.alert(`Venta registrada correctamente. Cambio: ${formatearMoneda(cambio)}`);

	carrito.length = 0;
	montoRecibido = 0;
	esperandoMontoEfectivo = false;
	metodoPago = "efectivo";
	inputBuscar.value = "";
	inputBuscar.placeholder = placeholderBusqueda;
	ocultarLista();
	recalcularYRenderizar();
});

document.addEventListener("click", (event) => {
	if (!event.target.closest("#buscar-articulo") && !event.target.closest("#lista-articulos")) {
		ocultarLista();
	}
});

recalcularYRenderizar();
