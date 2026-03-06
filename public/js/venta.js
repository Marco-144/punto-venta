const IVA = 0.16;
const REGISTRO_VENTAS_KEY = "punto_venta_registro_ventas_v1";
const CLIENTES_STORAGE_KEY = "pv_clientes";
const DESCUENTOS_STORAGE_KEY = "pv_descuentos_v1";
const CLIENTES_SEMILLA = [
	{ id: 1, nombre: "Marco", Empresa: "Papeleria Marco", telefono: "1234567890", correo: "marco@example.com", monedero: 150, Rango: "Plata" },
	{ id: 2, nombre: "Luisa", Empresa: "Luisa S.A.", telefono: "0987654321", correo: "luisa@example.com", monedero: 200, Rango: "Oro" },
	{ id: 3, nombre: "Carlos", Empresa: "Carlos y Asociados", telefono: "5555555555", correo: "carlos@example.com", monedero: 300, Rango: "Diamante" },
	{ id: 4, nombre: "Ana", Empresa: "Ana Papeleria", telefono: "1112223333", correo: "ana@example.com", monedero: 250, Rango: "Plata" },
	{ id: 5, nombre: "Jorge", Empresa: "Jorge S.A.", telefono: "4445556666", correo: "jorge@example.com", monedero: 180, Rango: "Plata" }
];
const DESCUENTOS_SEMILLA = [
	{ id: 1, nombre: "Descuento Diamante", porcentaje: 0.2, rango: ["Diamante"], monedero: 20, inventarioBase: [] },
	{ id: 2, nombre: "Descuento Oro", porcentaje: 0.15, rango: ["Oro"], monedero: 15, inventarioBase: [] },
	{ id: 3, nombre: "Descuento Plata", porcentaje: 0.1, rango: ["Plata"], monedero: 10, inventarioBase: [] },
	{ id: 4, nombre: "Descuento Sin Rango", porcentaje: 0.05, rango: ["Sin Rango"], monedero: 5, inventarioBase: [] },
	{ id: 5, nombre: "Descuento Regreso a clases", porcentaje: 0.25, rango: ["Diamante", "Oro", "Sin Rango"], monedero: 2, inventarioBase: [1, 2, 3] }
];
const detalleVenta = document.getElementById("detalle-venta");
const subtotalVenta = document.getElementById("subtotal-venta");
const descuentoVenta = document.getElementById("descuento-venta");
const impuestosVenta = document.getElementById("impuestos-venta");
const totalVenta = document.getElementById("total-venta");
const cambioVenta = document.getElementById("cambio-venta");
const inputBuscar = document.getElementById("buscar-articulo");
const listaArticulos = document.getElementById("lista-articulos");
const inputClienteVenta = document.getElementById("input-cliente-venta");
const clienteDescuentoInfoEl = document.getElementById("cliente-descuento-info");
const modalCantidad = document.getElementById("modal-cantidad");
const modalCantidadArticulo = document.getElementById("modal-cantidad-articulo");
const modalCantidadInput = document.getElementById("modal-cantidad-input");
const modalCancelar = document.getElementById("modal-cancelar");
const modalConfirmar = document.getElementById("modal-confirmar");
const modalTarjeta = document.getElementById("modal-tarjeta");
const modalTarjetaInput = document.getElementById("modal-tarjeta-input");
const modalTarjetaEstado = document.getElementById("modal-tarjeta-estado");
const modalTarjetaCancelar = document.getElementById("modal-tarjeta-cancelar");
const modalTarjetaConfirmar = document.getElementById("modal-tarjeta-confirmar");
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
let clientesCatalogo = [];
let descuentosCatalogo = [];
let clienteVentaActual = null;
let procesandoPagoTarjeta = false;
const placeholderBusqueda = "Escanear o ingresar código de artículo...";
const placeholderEfectivo = "Ingresa monto recibido en efectivo y presiona Enter";

function normalizarTexto(valor) {
	return String(valor || "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.trim()
		.toLowerCase();
}

function cargarListaStorage(key) {
	const raw = localStorage.getItem(key);
	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function cargarCatalogosRelacionados() {
	const clientesGuardados = cargarListaStorage(CLIENTES_STORAGE_KEY);
	clientesCatalogo = clientesGuardados.length ? clientesGuardados : [...CLIENTES_SEMILLA];
	const descuentosGuardados = cargarListaStorage(DESCUENTOS_STORAGE_KEY);
	descuentosCatalogo = descuentosGuardados.length ? descuentosGuardados : [...DESCUENTOS_SEMILLA];
}

function buscarClientePorNombre(nombre) {
	const termino = normalizarTexto(nombre);
	if (!termino) {
		return null;
	}

	const exacto = clientesCatalogo.find((cliente) => normalizarTexto(cliente.nombre) === termino);
	if (exacto) {
		return exacto;
	}

	const exactoEmpresa = clientesCatalogo.find((cliente) => normalizarTexto(cliente.Empresa) === termino);
	if (exactoEmpresa) {
		return exactoEmpresa;
	}

	const parciales = clientesCatalogo.filter((cliente) => normalizarTexto(cliente.nombre).includes(termino));
	if (parciales.length === 1) {
		return parciales[0];
	}

	const parcialesEmpresa = clientesCatalogo.filter((cliente) => normalizarTexto(cliente.Empresa).includes(termino));
	return parcialesEmpresa.length === 1 ? parcialesEmpresa[0] : null;
}

function obtenerDescuentosPorCliente(cliente) {
	if (!cliente) {
		return [];
	}

	const rangoCliente = normalizarTexto(cliente.Rango || "Sin Rango");
	return descuentosCatalogo.filter((descuento) => {
		if (descuento.activo === false) {
			return false;
		}

		if (!Array.isArray(descuento.rango) || !descuento.rango.length) {
			return false;
		}

		return descuento.rango.some((rango) => normalizarTexto(rango) === rangoCliente);
	});
}

function calcularDescuentoCarrito(cliente) {
	if (!cliente || !carrito.length) {
		return { descuentoTotal: 0, descuentosAplicados: [] };
	}

	const descuentosRango = obtenerDescuentosPorCliente(cliente);
	if (!descuentosRango.length) {
		return { descuentoTotal: 0, descuentosAplicados: [] };
	}

	let descuentoTotal = 0;
	const aplicados = new Set();

	for (const item of carrito) {
		let porcentajeLinea = 0;
		const totalLinea = Number(item.precio || 0) * Number(item.cantidad || 0);

		for (const descuento of descuentosRango) {
			const inventarioBase = Array.isArray(descuento.inventarioBase) ? descuento.inventarioBase.map(Number) : [];
			const aplicaArticulo = !inventarioBase.length || inventarioBase.includes(Number(item.id));
			if (!aplicaArticulo) {
				continue;
			}

			porcentajeLinea += Number(descuento.porcentaje || 0);
			aplicados.add(descuento.nombre);
		}

		descuentoTotal += totalLinea * Math.min(porcentajeLinea, 1);
	}

	return {
		descuentoTotal,
		descuentosAplicados: Array.from(aplicados)
	};
}

function resolverClienteVentaActual() {
	if (!inputClienteVenta) {
		clienteVentaActual = null;
		return;
	}

	const nombreCliente = inputClienteVenta.value.trim();
	clienteVentaActual = buscarClientePorNombre(nombreCliente);
}

function actualizarInfoClienteDescuento(descuentosAplicados) {
	if (!clienteDescuentoInfoEl) {
		return;
	}

	const nombreCliente = (inputClienteVenta?.value || "").trim();
	if (!nombreCliente) {
		clienteDescuentoInfoEl.textContent = "Sin cliente seleccionado";
		return;
	}

	if (!clienteVentaActual) {
		clienteDescuentoInfoEl.textContent = "Cliente no encontrado. No se aplicarán descuentos.";
		return;
	}

	if (!descuentosAplicados.length) {
		clienteDescuentoInfoEl.textContent = `Cliente: ${clienteVentaActual.nombre} (${clienteVentaActual.Rango || "Sin Rango"}) · Sin descuentos activos`;
		return;
	}

	clienteDescuentoInfoEl.textContent = `Cliente: ${clienteVentaActual.nombre} (${clienteVentaActual.Rango || "Sin Rango"}) · Descuentos: ${descuentosAplicados.join(", ")}`;
}

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
	const subtotalSinDescuento = carrito.reduce((acum, item) => acum + item.precio * item.cantidad, 0);
	const { descuentoTotal, descuentosAplicados } = calcularDescuentoCarrito(clienteVentaActual);
	const subtotal = Math.max(0, subtotalSinDescuento - descuentoTotal);
	const impuestos = subtotal * IVA;
	const total = subtotal + impuestos;

	return { subtotalSinDescuento, descuento: descuentoTotal, subtotal, impuestos, total, descuentosAplicados };
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

function abrirModalTarjeta() {
	if (!carrito.length) {
		window.alert("Agrega artículos antes de procesar pago con tarjeta.");
		return;
	}

	activarMetodoNoEfectivo("tarjeta");
	if (!modalTarjeta) {
		return;
	}

	modalTarjeta.classList.remove("hidden");
	modalTarjeta.classList.add("flex");
	modalTarjetaInput.value = "";
	modalTarjetaEstado.textContent = "";
	modalTarjetaConfirmar.disabled = false;
	modalTarjetaCancelar.disabled = false;
	setTimeout(() => {
		modalTarjetaInput.focus();
		modalTarjetaInput.select();
	}, 0);
}

function cerrarModalTarjeta() {
	if (!modalTarjeta) {
		return;
	}

	modalTarjeta.classList.add("hidden");
	modalTarjeta.classList.remove("flex");
	modalTarjetaEstado.textContent = "";
	modalTarjetaInput.value = "";
	procesandoPagoTarjeta = false;
	modalTarjetaConfirmar.disabled = false;
	modalTarjetaCancelar.disabled = false;
}

function esperar(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
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

async function confirmarPagoTarjetaModal() {
	if (procesandoPagoTarjeta) {
		return;
	}

	const numeroTarjeta = String(modalTarjetaInput?.value || "").replace(/\s+/g, "");
	if (!/^\d{12,19}$/.test(numeroTarjeta)) {
		window.alert("Ingresa un número de tarjeta válido (12 a 19 dígitos).");
		modalTarjetaInput?.focus();
		return;
	}

	procesandoPagoTarjeta = true;
	modalTarjetaConfirmar.disabled = true;
	modalTarjetaCancelar.disabled = true;
	modalTarjetaEstado.textContent = "Procesando pago...";

	await esperar(2200);
	cerrarModalTarjeta();
	finalizarVenta();
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
	modalCantidad.classList.add("flex");
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
		descuentoVenta.textContent = formatearMoneda(0);
		impuestosVenta.textContent = formatearMoneda(0);
		totalVenta.textContent = formatearMoneda(0);
		actualizarInfoClienteDescuento([]);
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
	const { subtotal, descuento, impuestos, total, descuentosAplicados } = obtenerTotales();
	totalActual = total;

	subtotalVenta.textContent = formatearMoneda(subtotal);
	descuentoVenta.textContent = formatearMoneda(descuento);
	impuestosVenta.textContent = formatearMoneda(impuestos);
	totalVenta.textContent = formatearMoneda(total);
	actualizarInfoClienteDescuento(descuentosAplicados);
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
	modalCantidad.classList.remove("flex");
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

inputClienteVenta?.addEventListener("input", () => {
	cargarCatalogosRelacionados();
	resolverClienteVentaActual();
	recalcularYRenderizar();
});

btnPagoEfectivo.addEventListener("click", activarPagoEfectivo);
btnPagoTarjeta.addEventListener("click", abrirModalTarjeta);
btnPagoOtros.addEventListener("click", () => activarMetodoNoEfectivo("otros"));

function finalizarVenta() {
	if (!carrito.length) {
		window.alert("Agrega artículos antes de finalizar la venta.");
		return false;
	}

	if (esperandoMontoEfectivo) {
		window.alert("Confirma primero el monto recibido en efectivo con Enter.");
		return false;
	}

	if (metodoPago === "efectivo" && montoRecibido < totalActual) {
		window.alert("El monto recibido es menor al total de la compra.");
		return false;
	}

	for (const item of carrito) {
		const actual = typeof window.obtenerArticuloInventario === "function" ? window.obtenerArticuloInventario(item.id) : null;
		if (!actual || actual.existencias < item.cantidad) {
			window.alert(`Inventario insuficiente para ${item.articulo}.`);
			return false;
		}
	}

	for (const item of carrito) {
		const ok = typeof window.disminuirInventario === "function" ? window.disminuirInventario(item.id, item.cantidad) : false;
		if (!ok) {
			window.alert(`No se pudo descontar inventario de ${item.articulo}.`);
			return false;
		}
	}

	resolverClienteVentaActual();
	const { subtotalSinDescuento, subtotal, descuento, impuestos, total, descuentosAplicados } = obtenerTotales();
	const cambio = metodoPago === "efectivo" ? Math.max(0, montoRecibido - total) : 0;
	const fecha = new Date();

	guardarRegistroVenta({
		id: `V-${Date.now()}`,
		fechaISO: fecha.toISOString(),
		fechaTexto: fecha.toLocaleString(),
		metodoPago,
		cliente: clienteVentaActual
			? {
				id: clienteVentaActual.id,
				nombre: clienteVentaActual.nombre,
				rango: clienteVentaActual.Rango || "Sin Rango"
			}
			: null,
		subtotalSinDescuento,
		subtotal,
		descuento,
		descuentosAplicados,
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
	if (inputClienteVenta) {
		inputClienteVenta.value = "";
	}
	clienteVentaActual = null;
	inputBuscar.value = "";
	inputBuscar.placeholder = placeholderBusqueda;
	ocultarLista();
	recalcularYRenderizar();
	return true;
}

btnFinalizarVenta.addEventListener("click", finalizarVenta);

modalTarjetaCancelar?.addEventListener("click", () => {
	if (procesandoPagoTarjeta) {
		return;
	}
	cerrarModalTarjeta();
});

modalTarjetaConfirmar?.addEventListener("click", confirmarPagoTarjetaModal);

modalTarjetaInput?.addEventListener("keydown", (event) => {
	if (event.key === "Enter") {
		event.preventDefault();
		confirmarPagoTarjetaModal();
	}
});

document.addEventListener("click", (event) => {
	if (!event.target.closest("#buscar-articulo") && !event.target.closest("#lista-articulos")) {
		ocultarLista();
	}
});

cargarCatalogosRelacionados();
resolverClienteVentaActual();
recalcularYRenderizar();
