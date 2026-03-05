const REGISTRO_VENTAS_KEY = "punto_venta_registro_ventas_v1";
const DARK_MODE_KEY = "punto_venta_dark_mode";

const tablaRegistroVentas = document.getElementById("tabla-registro-ventas");
const selectVentaReimpresion = document.getElementById("select-venta-reimpresion");
const btnReimprimir = document.getElementById("btn-reimprimir");
const btnToggleDark = document.getElementById("btn-toggle-dark");

function formatearMoneda(valor) {
    return `$${Number(valor || 0).toFixed(2)}`;
}

function obtenerRegistroVentas() {
    const raw = localStorage.getItem(REGISTRO_VENTAS_KEY);
    if (!raw) {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.sort((a, b) => new Date(b.fechaISO).getTime() - new Date(a.fechaISO).getTime());
    } catch {
        return [];
    }
}

function construirHtmlBoucher(venta) {
    const lineasArticulos = venta.articulos
        .map(
            (item) =>
                `<tr><td>${item.codigo || "-"}</td><td>${item.articulo}</td><td>${item.cantidad}</td><td>${formatearMoneda(item.totalLinea)}</td></tr>`
        )
        .join("");

    return `
		<html>
			<head>
				<title>Boucher ${venta.id}</title>
				<style>
					body { font-family: Arial, sans-serif; padding: 16px; }
					h1, h2, p { margin: 0 0 8px 0; }
					table { width: 100%; border-collapse: collapse; margin-top: 10px; }
					th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; text-align: left; }
					.totales { margin-top: 12px; }
				</style>
			</head>
			<body>
				<h2>Boucher de Venta</h2>
                <br>
				<p><strong>Folio:</strong> ${venta.id}</p>
				<p><strong>Fecha:</strong> ${venta.fechaTexto || venta.fechaISO}</p>
				<p><strong>Método:</strong> ${venta.metodoPago}</p>
				<table>
					<thead>
						<tr><th>Código</th><th>Artículo</th><th>Cantidad</th><th>Total</th></tr>
					</thead>
					<tbody>
						${lineasArticulos}
					</tbody>
				</table>
				<div class="totales">
					<p><strong>Subtotal:</strong> ${formatearMoneda(venta.subtotal)}</p>
					<p><strong>Impuestos:</strong> ${formatearMoneda(venta.impuestos)}</p>
					<p><strong>Total:</strong> ${formatearMoneda(venta.total)}</p>
					<p><strong>Cambio:</strong> ${formatearMoneda(venta.cambio)}</p>
				</div>
			</body>
		</html>
	`;
}

function reimprimirVenta(venta) {
    const ventana = window.open("", "_blank", "width=700,height=700");
    if (!ventana) {
        window.alert("No se pudo abrir la ventana de impresión.");
        return;
    }

    ventana.document.write(construirHtmlBoucher(venta));
    ventana.document.close();
    ventana.focus();
    ventana.print();
}

function aplicarDarkMode() {
    const activo = localStorage.getItem(DARK_MODE_KEY) === "1";
    document.documentElement.classList.toggle("dark", activo);
}

function alternarDarkMode() {
    const activo = localStorage.getItem(DARK_MODE_KEY) === "1";
    localStorage.setItem(DARK_MODE_KEY, activo ? "0" : "1");
    aplicarDarkMode();
}

function renderizar() {
    if (!tablaRegistroVentas || !selectVentaReimpresion) {
        return;
    }

    const ventas = obtenerRegistroVentas();

    if (!ventas.length) {
        tablaRegistroVentas.innerHTML = '<tr><td colspan="7" class="px-4 py-6 text-center text-gray-500">No hay ventas registradas</td></tr>';
        selectVentaReimpresion.innerHTML = '<option value="">Sin ventas</option>';
        return;
    }

    tablaRegistroVentas.innerHTML = ventas
        .map(
            (venta) => `
				<tr class="border-b border-gray-200 dark:border-gray-700">
					<td class="px-4 py-3">${venta.id}</td>
					<td class="px-4 py-3">${venta.fechaTexto || new Date(venta.fechaISO).toLocaleString()}</td>
                    <td class="px-4 py-3">${(venta.articulos || []).map((item) => item.articulo).join(", ")}</td>
                    <td class="px-4 py-3">${(venta.articulos || []).reduce((acum, item) => acum + Number(item.cantidad || 0), 0)}</td>
					<td class="px-4 py-3">${venta.metodoPago}</td>
					<td class="px-4 py-3">${formatearMoneda(venta.total)}</td>
					<td class="px-4 py-3">
						<button type="button" data-id="${venta.id}" class="btn-imprimir px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-md">Imprimir</button>
					</td>
				</tr>
			`
        )
        .join("");

    selectVentaReimpresion.innerHTML = ventas
        .map((venta) => `<option value="${venta.id}">${venta.id} · ${venta.fechaTexto || new Date(venta.fechaISO).toLocaleString()}</option>`)
        .join("");

    tablaRegistroVentas.querySelectorAll(".btn-imprimir").forEach((btn) => {
        btn.addEventListener("click", () => {
            const venta = ventas.find((v) => v.id === btn.dataset.id);
            if (venta) {
                reimprimirVenta(venta);
            }
        });
    });

    btnReimprimir.addEventListener("click", () => {
        const seleccionada = ventas.find((venta) => venta.id === selectVentaReimpresion.value);
        if (!seleccionada) {
            window.alert("Selecciona una venta para reimprimir.");
            return;
        }

        reimprimirVenta(seleccionada);
    });
}

aplicarDarkMode();
btnToggleDark?.addEventListener("click", alternarDarkMode);
renderizar();
