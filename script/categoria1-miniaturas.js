/* =========================================================
   SUBLIMARTS - PRODUCTOS CON 4 PUNTOS DE VISTA
   Puede copiarse al final de categoria1.js.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal-imagen');
    const imagenAmpliada = document.getElementById('imagen-ampliada');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalMedida = document.getElementById('modal-medida');
    const modalPrecio = document.getElementById('modal-precio');
    const verDetallesLink = document.getElementById('ver-detalles-link');
    const whatsappLink = document.getElementById('whatsapp-link');

    if (!modal || !imagenAmpliada || !verDetallesLink) return;

    let productoActivo = null;

    const obtenerDatosProducto = (card, imagenSeleccionada) => {
        const imagenCard = card.querySelector('.imagen-producto');
        const titulo = card.querySelector('.titulo-producto');
        const medida = card.querySelector('.dimension-producto');
        const precio = card.querySelector('.precio-producto');

        return {
            id: card.dataset.id || '',
            nombre: card.dataset.nombre || titulo?.textContent.trim() || 'Producto SublimArts',
            precio: card.dataset.precio || (precio?.textContent.match(/\d+/g) || []).join('') || '12990',
            medida: card.dataset.medida || medida?.textContent.replace(/^Medida:\s*/i, '').trim() || '20x22 cm',
            imagen: imagenSeleccionada || card.dataset.imagen || imagenCard?.getAttribute('src') || '',
            miniatura1: card.dataset.miniatura1 || card.dataset.imagen || imagenCard?.getAttribute('src') || '',
            miniatura2: card.dataset.miniatura2 || card.dataset.imagen || imagenCard?.getAttribute('src') || '',
            miniatura3: card.dataset.miniatura3 || card.dataset.imagen || imagenCard?.getAttribute('src') || '',
            miniatura4: card.dataset.miniatura4 || card.dataset.imagen || imagenCard?.getAttribute('src') || ''
        };
    };

    const construirUrlVisualizador = (datos) => {
        const parametros = new URLSearchParams({
            id: datos.id,
            nombre: datos.nombre,
            precio: datos.precio,
            medida: datos.medida,
            imagen: datos.imagen,
            miniatura1: datos.miniatura1,
            miniatura2: datos.miniatura2,
            miniatura3: datos.miniatura3,
            miniatura4: datos.miniatura4
        });

        return `visualizacion.html?${parametros.toString()}`;
    };

    const abrirModalProducto = (card, imagenClickeada) => {
        productoActivo = card;
        const srcAmpliada = imagenClickeada.currentSrc || imagenClickeada.getAttribute('src');
        const datos = obtenerDatosProducto(card, srcAmpliada);

        imagenAmpliada.src = datos.imagen;
        imagenAmpliada.alt = imagenClickeada.alt || datos.nombre;

        if (modalTitulo) modalTitulo.textContent = datos.nombre;
        if (modalMedida) modalMedida.textContent = `Medida: ${datos.medida}`;
        if (modalPrecio) {
            const precioFormateado = Number(datos.precio).toLocaleString('es-CL');
            modalPrecio.textContent = `Precio: $${precioFormateado} CLP`;
        }

        // La imagen ampliada será la primera que se vea en el visualizador.
        verDetallesLink.href = construirUrlVisualizador(datos);

        if (whatsappLink) {
            const mensaje = `Hola, quiero consultar por el cuadro ${datos.nombre}, medida ${datos.medida}.`;
            whatsappLink.href = `https://wa.me/56982045756?text=${encodeURIComponent(mensaje)}`;
        }

        modal.classList.add('activo');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-abierto');
    };

    // Solo la imagen abre el modal; no modifica el diseño de la tarjeta.
    document.querySelectorAll('.producto-card .imagen-producto').forEach((imagen) => {
        imagen.style.cursor = 'pointer';

        imagen.addEventListener('click', (evento) => {
            const card = evento.currentTarget.closest('.producto-card');
            if (card) abrirModalProducto(card, evento.currentTarget);
        });
    });

    // Actualiza la URL justo antes de entrar al visualizador.
    verDetallesLink.addEventListener('click', () => {
        if (!productoActivo) return;

        const datos = obtenerDatosProducto(productoActivo, imagenAmpliada.getAttribute('src'));
        verDetallesLink.href = construirUrlVisualizador(datos);
    });
});
