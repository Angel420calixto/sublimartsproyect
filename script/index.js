/* ================================================
           MENÚ MOBILE
           ================================================ */
        const botonMenu    = document.getElementById('botonMenuMobile');
        const menuPrincipal = document.getElementById('menuPrincipal');
        const menuOverlay  = document.getElementById('menuOverlay');

        /**
         * Abre/cierra el menú lateral mobile.
         * Actualiza aria-expanded en el botón hamburguesa.
         */
        function toggleMenu(forzarCerrar = false) {
            const estaAbierto = menuPrincipal.classList.contains('activo');
            const nuevaEstado = forzarCerrar ? false : !estaAbierto;

            menuPrincipal.classList.toggle('activo', nuevaEstado);
            menuOverlay.classList.toggle('activo', nuevaEstado);
            document.body.classList.toggle('menu-abierto', nuevaEstado);

            // Actualizar aria-expanded en el botón hamburguesa
            botonMenu.setAttribute('aria-expanded', nuevaEstado.toString());
            menuOverlay.setAttribute('aria-hidden', (!nuevaEstado).toString());

            // Cambiar ícono hamburguesa ↔ X
            const icono = botonMenu.querySelector('i');
            if (icono) {
                icono.className = nuevaEstado ? 'fas fa-times' : 'fas fa-bars';
            }
        }

        if (botonMenu && menuPrincipal && menuOverlay) {
            botonMenu.addEventListener('click', () => toggleMenu());
        menuOverlay.addEventListener('click', () => toggleMenu(true));
        }

        // FIX UX: cerrar menú con tecla ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && menuPrincipal.classList.contains('activo')) {
                toggleMenu(true);
                botonMenu.focus(); // Devolver foco al botón hamburguesa
            }
        });


        /* ================================================
           SUBMENÚS DESPLEGABLES (MOBILE)
           FIX: cierra otros submenús al abrir uno nuevo.
           FIX: actualiza aria-expanded en el botón.
           ================================================ */
        document.querySelectorAll('.menu-con-desplegable .enlace-menu-desplegable')
            .forEach(btn => {
                btn.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();

                        const itemPadre = btn.closest('.menu-con-desplegable');
                        const estaAbierto = itemPadre.classList.contains('activo');

                        // FIX: cierra todos los demás submenús abiertos
                        document.querySelectorAll('.menu-con-desplegable.activo').forEach(item => {
                            if (item !== itemPadre) {
                                item.classList.remove('activo');
                                const otroBtnSubmenu = item.querySelector('.enlace-menu-desplegable');
                                if (otroBtnSubmenu) {
                                    otroBtnSubmenu.setAttribute('aria-expanded', 'false');
                                }
                            }
                        });

                        // Toggle del submenú actual
                        itemPadre.classList.toggle('activo', !estaAbierto);
                        btn.setAttribute('aria-expanded', (!estaAbierto).toString());
                    }
                });
            });


        /* ================================================
           CATEGORÍAS: navegación JS (compatibilidad)
           Las cards ahora son <a href> pero se mantiene
           el listener original para no romper funcionalidad.
           ================================================ */
        document.querySelectorAll('.categoria-card').forEach(card => {
            card.addEventListener('click', function (e) {
                // Solo activar JS nav si el tag no es <a> (retrocompatibilidad)
                if (this.tagName !== 'A') {
                    const url = this.getAttribute('data-url');
                    if (url) window.location.href = url;
                }
            });
        });


        /* ================================================
           CIERRE DE MENÚ AL NAVEGAR (mobile)
           ================================================ */
        document.querySelectorAll('.enlace-menu, .submenu a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    toggleMenu(true);
                }
            });
        });


        /* ================================================
           CARRUSEL DE LA SECCIÓN INFO
           Flechas, indicadores, teclado y gesto táctil.
           ================================================ */
        const infoCarrusel = document.getElementById('infoCarrusel');

        if (infoCarrusel) {
            const slides = Array.from(infoCarrusel.querySelectorAll('.info-slide'));
            const indicadores = Array.from(infoCarrusel.querySelectorAll('.info-indicador'));
            const btnAnterior = infoCarrusel.querySelector('.info-carrusel-flecha.anterior');
            const btnSiguiente = infoCarrusel.querySelector('.info-carrusel-flecha.siguiente');
            let indiceActual = 0;
            let inicioX = 0;
            let desplazamientoX = 0;

            function mostrarSlide(nuevoIndice) {
                indiceActual = (nuevoIndice + slides.length) % slides.length;

                slides.forEach((slide, indice) => {
                    const activo = indice === indiceActual;
                    slide.classList.toggle('activo', activo);
                    slide.setAttribute('aria-hidden', (!activo).toString());
                });

                indicadores.forEach((indicador, indice) => {
                    const activo = indice === indiceActual;
                    indicador.classList.toggle('activo', activo);
                    indicador.setAttribute('aria-current', activo ? 'true' : 'false');
                });
            }

            btnAnterior.addEventListener('click', () => mostrarSlide(indiceActual - 1));
            btnSiguiente.addEventListener('click', () => mostrarSlide(indiceActual + 1));

            indicadores.forEach((indicador, indice) => {
                indicador.addEventListener('click', () => mostrarSlide(indice));
            });

            infoCarrusel.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') mostrarSlide(indiceActual - 1);
                if (e.key === 'ArrowRight') mostrarSlide(indiceActual + 1);
            });

            infoCarrusel.addEventListener('touchstart', (e) => {
                inicioX = e.touches[0].clientX;
                desplazamientoX = 0;
            }, { passive: true });

            infoCarrusel.addEventListener('touchmove', (e) => {
                desplazamientoX = e.touches[0].clientX - inicioX;
            }, { passive: true });

            infoCarrusel.addEventListener('touchend', () => {
                const umbral = 45;
                if (desplazamientoX <= -umbral) mostrarSlide(indiceActual + 1);
                if (desplazamientoX >= umbral) mostrarSlide(indiceActual - 1);
                inicioX = 0;
                desplazamientoX = 0;
            });

            infoCarrusel.setAttribute('tabindex', '0');
            mostrarSlide(0);
        }


/* Evita errores 404 mientras se crean las nuevas páginas de categorías. */
document.querySelectorAll('[data-pagina-futura]').forEach((enlace) => {
    enlace.addEventListener('click', () => {
        const destino = enlace.dataset.paginaFutura;
        console.info(`Página pendiente de crear: ${destino}`);
    });
});
