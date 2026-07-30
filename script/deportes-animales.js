'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('boton-menu-mobile');
    const menu = document.getElementById('menu-principal');
    const overlay = document.getElementById('menu-overlay');
    const dropdown = document.getElementById('categorias-dropdown');
    const categoriasBtn = document.getElementById('categorias-btn');
    const submenu = document.getElementById('categorias-submenu');

    const modal = document.getElementById('modal-imagen');
    const modalImg = document.getElementById('imagen-ampliada');
    const modalTitulo = document.getElementById('modal-titulo');
    const modalMedida = document.getElementById('modal-medida');
    const modalPrecio = document.getElementById('modal-precio');
    const cerrarModalBtn = document.getElementById('cerrar-modal');
    const detallesLink = document.getElementById('ver-detalles-link');
    const whatsappLink = document.getElementById('whatsapp-link');

    let ultimoElementoActivo = null;

    function esMobile() {
        return window.matchMedia('(max-width: 768px)').matches;
    }

    function abrirMenu() {
        if (!menu || !overlay || !menuBtn) return;
        menu.classList.add('activo');
        overlay.classList.add('activo');
        document.body.classList.add('menu-abierto');
        menuBtn.setAttribute('aria-expanded', 'true');
        menuBtn.setAttribute('aria-label', 'Cerrar menú');
        const icono = menuBtn.querySelector('i');
        if (icono) {
            icono.classList.remove('fa-bars');
            icono.classList.add('fa-xmark');
        }
    }

    function cerrarSubmenu() {
        if (!dropdown || !categoriasBtn || !submenu) return;
        dropdown.classList.remove('activo');
        categoriasBtn.classList.remove('activo');
        submenu.classList.remove('activo');
        categoriasBtn.setAttribute('aria-expanded', 'false');
    }

    function cerrarMenu() {
        if (!menu || !overlay || !menuBtn) return;
        menu.classList.remove('activo');
        overlay.classList.remove('activo');
        document.body.classList.remove('menu-abierto');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.setAttribute('aria-label', 'Abrir menú');
        const icono = menuBtn.querySelector('i');
        if (icono) {
            icono.classList.remove('fa-xmark');
            icono.classList.add('fa-bars');
        }
        cerrarSubmenu();
    }

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menu?.classList.contains('activo') ? cerrarMenu() : abrirMenu();
        });
    }

    overlay?.addEventListener('click', cerrarMenu);

    categoriasBtn?.addEventListener('click', (evento) => {
        evento.preventDefault();
        evento.stopPropagation();

        const abierto = dropdown?.classList.contains('activo');
        if (abierto) {
            cerrarSubmenu();
        } else {
            dropdown?.classList.add('activo');
            categoriasBtn.classList.add('activo');
            submenu?.classList.add('activo');
            categoriasBtn.setAttribute('aria-expanded', 'true');
        }
    });

    document.addEventListener('click', (evento) => {
        if (!dropdown?.contains(evento.target) && !esMobile()) {
            cerrarSubmenu();
        }
    });

    submenu?.querySelectorAll('a').forEach((enlace) => {
        enlace.addEventListener('click', () => {
            if (esMobile()) cerrarMenu();
        });
    });

    menu?.querySelectorAll(':scope > li > a').forEach((enlace) => {
        enlace.addEventListener('click', () => {
            if (esMobile()) cerrarMenu();
        });
    });

    window.addEventListener('resize', () => {
        if (!esMobile()) cerrarMenu();
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
            if (modal?.classList.contains('mostrar')) cerrarModal();
            else if (menu?.classList.contains('activo')) cerrarMenu();
            else cerrarSubmenu();
        }
    });

    document.querySelectorAll('.boton-ver-mas').forEach((boton) => {
        const idGaleria = boton.getAttribute('aria-controls');
        const galeria = idGaleria ? document.getElementById(idGaleria) : null;
        if (!galeria) {
            boton.hidden = true;
            return;
        }

        const productos = Array.from(galeria.querySelectorAll(':scope > article'));
        const limite = 6;

        function actualizar(expandida) {
            productos.forEach((producto, indice) => {
                producto.classList.toggle('producto-oculto', !expandida && indice >= limite);
                producto.setAttribute('aria-hidden', !expandida && indice >= limite ? 'true' : 'false');
            });

            boton.textContent = expandida ? 'Ver menos' : 'Ver más';
            boton.setAttribute('aria-expanded', String(expandida));
        }

        if (productos.length <= limite) {
            boton.hidden = true;
        } else {
            actualizar(false);
            boton.addEventListener('click', () => {
                const expandida = boton.getAttribute('aria-expanded') === 'true';
                actualizar(!expandida);

                if (expandida) {
                    galeria.closest('section')?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        }
    });

    function obtenerDatosProducto(imagen) {
        const tarjeta = imagen.closest('.producto-card, .producto-item, .item-popular, article');
        return {
            nombre: tarjeta?.querySelector('.titulo-producto')?.textContent.trim() || imagen.alt || 'Cuadro personalizado',
            medida: tarjeta?.querySelector('.dimension-producto')?.textContent.trim() || 'Medida: consultar',
            precio: tarjeta?.querySelector('.precio-producto')?.textContent.trim() || 'Precio: consultar',
            imagen: imagen.currentSrc || imagen.src
        };
    }

    function abrirModal(imagen) {
        if (!modal || !modalImg) return;

        ultimoElementoActivo = imagen;
        const datos = obtenerDatosProducto(imagen);

        modalImg.src = datos.imagen;
        modalImg.alt = imagen.alt || datos.nombre;
        if (modalTitulo) modalTitulo.textContent = datos.nombre;
        if (modalMedida) modalMedida.textContent = datos.medida;
        if (modalPrecio) modalPrecio.textContent = datos.precio;

        if (detallesLink) {
            const params = new URLSearchParams({
                nombre: datos.nombre,
                medida: datos.medida,
                precio: datos.precio,
                imagen: datos.imagen
            });
            detallesLink.href = `visualizacion.html?${params.toString()}`;
        }

        if (whatsappLink) {
            const mensaje = `Hola SublimArts, me interesa el cuadro "${datos.nombre}", ${datos.medida}, ${datos.precio}. ¿Está disponible?`;
            whatsappLink.href = `https://wa.me/56982045756?text=${encodeURIComponent(mensaje)}`;
        }

        modal.classList.add('mostrar');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        cerrarModalBtn?.focus();
    }

    function cerrarModal() {
        if (!modal) return;
        modal.classList.remove('mostrar');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        ultimoElementoActivo?.focus();
    }

    document.querySelectorAll('.imagen-producto').forEach((imagen) => {
        imagen.setAttribute('tabindex', '0');
        imagen.setAttribute('role', 'button');
        imagen.setAttribute('aria-label', `Ampliar ${imagen.alt || 'imagen del producto'}`);

        imagen.addEventListener('click', () => abrirModal(imagen));
        imagen.addEventListener('keydown', (evento) => {
            if (evento.key === 'Enter' || evento.key === ' ') {
                evento.preventDefault();
                abrirModal(imagen);
            }
        });
    });

    cerrarModalBtn?.addEventListener('click', cerrarModal);
    modal?.addEventListener('click', (evento) => {
        if (evento.target === modal) cerrarModal();
    });
});
