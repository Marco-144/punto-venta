const articulosDB = [
	{ id: 1, folio: "A-1001", articulo: "Cuaderno Profesional", precio: 45.0, promocion: { tipo: "acumulativa", cadaCantidad: 2, descuento: 10, descripcion: "Promoción escolar aplicada" } },
	{ id: 2, folio: "A-1002", articulo: "Lápiz N°2", precio: 12.0, promocion: { tipo: "acumulativa", cadaCantidad: 2, descuento: 10, descripcion: "Promoción lápices" } },
	{ id: 3, folio: "A-1003", articulo: "Hojas Blancas", precio: 2.0, promocion: { minCantidad: 10, descuento: 5, descripcion: "Promoción por volumen" } },
	{ id: 4, folio: "A-1004", articulo: "Colores BIC", precio: 97.0, promocion: { minCantidad: 2, descuento: 15, descripcion: "Promoción de temporada" } },
	{ id: 5, folio: "A-1005", articulo: "Cuaderno Italiano Pasta Dura", precio: 58.0 },
	{ id: 6, folio: "A-1006", articulo: "Marcador Permanente", precio: 25.0 },
	{ id: 7, folio: "A-1007", articulo: "Pluma Azul", precio: 15.0 },
	{ id: 8, folio: "A-1008", articulo: "Regla 30cm", precio: 18.0 }
];

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

function formatearMoneda(valor) {
	return `$${valor.toFixed(2)}`;
}

function ocultarLista() {
	listaArticulos.classList.add("hidden");
	listaArticulos.innerHTML = "";
}

function filtrarArticulos(texto) {
	const q = texto.trim().toLowerCase();

	if (!q) {
		return articulosDB;
	}

	return articulosDB.filter((item) => item.articulo.toLowerCase().includes(q) || item.folio.toLowerCase().includes(q) || String(item.id).includes(q));
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
				<div class="text-xs text-gray-500">ID: ${item.id} · Folio: ${item.folio} · Precio: ${formatearMoneda(item.precio)}</div>
			</button>
		`
		)
		.join("");

	listaArticulos.classList.remove("hidden");
}

function abrirModalCantidad(articulo) {
	articuloPendiente = articulo;
	modalCantidadArticulo.textContent = `${articulo.articulo} · ${formatearMoneda(articulo.precio)} c/u`;
	modalCantidadInput.value = "1";
	modalCantidad.classList.remove("hidden");
	ocultarLista();
	setTimeout(() => {
		modalCantidadInput.focus();
		modalCantidadInput.select();
	}, 0);
}

function obtenerInfoPromocion(item) {
	if (!item.promocion) {
		return {
			totalDescuento: 0,
			lineas: []
		};
	}

	const umbral = item.promocion.cadaCantidad || item.promocion.minCantidad;
	if (!umbral || item.cantidad < umbral) {
		return {
			totalDescuento: 0,
			lineas: []
		};
	}

	const esAcumulativa = item.promocion.tipo === "acumulativa" || Boolean(item.promocion.cadaCantidad);
	const bloquesAplicados = esAcumulativa ? Math.floor(item.cantidad / umbral) : 1;
	const lineas = Array.from({ length: bloquesAplicados }, () => ({
		descripcion: `${item.promocion.descripcion} (-${formatearMoneda(item.promocion.descuento)} c/${umbral} pzas)`,
		descuento: item.promocion.descuento
	}));

	return {
		totalDescuento: bloquesAplicados * item.promocion.descuento,
		lineas
	};
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
		const subtotalLinea = item.precio * item.cantidad;
		const promoInfo = obtenerInfoPromocion(item);
		const totalLinea = subtotalLinea - promoInfo.totalDescuento;
		subtotal += totalLinea;

		filasHTML += `
			<tr>
				<td class="px-6 py-4">${item.articulo}</td>
				<td class="px-6 py-4">${formatearMoneda(item.precio)}</td>
				<td class="px-6 py-4">${item.cantidad}</td>
				<td class="px-6 py-4">${formatearMoneda(totalLinea)}</td>
			</tr>
		`;

		if (promoInfo.lineas.length > 0) {
			promoInfo.lineas.forEach((lineaPromo) => {
				filasHTML += `
					<tr class="text-gray-400 text-xs">
						<td class="px-10 pb-3" colspan="3">↳ ${lineaPromo.descripcion}</td>
						<td class="px-6 pb-3">-${formatearMoneda(lineaPromo.descuento)}</td>
					</tr>
				`;
			});
		}
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
	mostrarLista(filtrarArticulos(event.target.value));
});

listaArticulos.addEventListener("click", (event) => {
	const boton = event.target.closest("button[data-id]");
	if (!boton) {
		return;
	}

	const id = Number(boton.dataset.id);
	const seleccionado = articulosDB.find((item) => item.id === id);
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
