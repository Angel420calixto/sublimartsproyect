document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const menu = document.getElementById("menu-principal");
    const botonMenu = document.getElementById("boton-menu-mobile");
    const overlay = document.getElementById("menu-overlay");
    const dropdown = document.getElementById("categorias-dropdown");
    const botonCategorias = document.getElementById("categorias-btn");

    const esMobile = () => window.matchMedia("(max-width: 1040px)").matches;

    const actualizarIconoMenu = (abierto) => {
        const icono = botonMenu?.querySelector("i");

        if (!icono) return;

        icono.classList.toggle("fa-bars", !abierto);
        icono.classList.toggle("fa-xmark", abierto);
    };

    const abrirMenu = () => {
        if (!menu || !botonMenu || !overlay) return;

        menu.classList.add("activo");
        overlay.classList.add("activo");
        body.classList.add("menu-abierto");

        botonMenu.setAttribute("aria-expanded", "true");
        botonMenu.setAttribute("aria-label", "Cerrar menú");
        overlay.setAttribute("aria-hidden", "false");

        actualizarIconoMenu(true);
    };

    const cerrarSubmenu = () => {
        if (!dropdown || !botonCategorias) return;

        dropdown.classList.remove("submenu-abierto");
        botonCategorias.setAttribute("aria-expanded", "false");
    };

    const cerrarMenu = () => {
        if (!menu || !botonMenu || !overlay) return;

        menu.classList.remove("activo");
        overlay.classList.remove("activo");
        body.classList.remove("menu-abierto");

        botonMenu.setAttribute("aria-expanded", "false");
        botonMenu.setAttribute("aria-label", "Abrir menú");
        overlay.setAttribute("aria-hidden", "true");

        actualizarIconoMenu(false);
        cerrarSubmenu();
    };

    botonMenu?.addEventListener("click", () => {
        const abierto = menu?.classList.contains("activo");

        if (abierto) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });

    overlay?.addEventListener("click", cerrarMenu);

    botonCategorias?.addEventListener("click", (evento) => {
        evento.preventDefault();
        evento.stopPropagation();

        const abierto = dropdown?.classList.toggle("submenu-abierto") ?? false;
        botonCategorias.setAttribute("aria-expanded", String(abierto));
    });

    document.addEventListener("click", (evento) => {
        if (!dropdown?.contains(evento.target)) {
            cerrarSubmenu();
        }
    });

    menu?.querySelectorAll("a").forEach((enlace) => {
        enlace.addEventListener("click", () => {
            if (esMobile()) {
                cerrarMenu();
            }
        });
    });

    document.addEventListener("keydown", (evento) => {
        if (evento.key === "Escape") {
            cerrarMenu();
            cerrarSubmenu();
        }
    });

    window.addEventListener("resize", () => {
        if (!esMobile()) {
            cerrarMenu();
        }
    });

    const observarElementos = () => {
        const elementos = document.querySelectorAll(
            ".tarjeta-proposito, .paso-proceso, .valor-item, .categoria-card, .timeline-contenido, .galeria-item, .faq-item"
        );

        if (!("IntersectionObserver" in window)) {
            elementos.forEach((elemento) => elemento.classList.add("visible"));
            return;
        }

        const observador = new IntersectionObserver(
            (entradas, observer) => {
                entradas.forEach((entrada) => {
                    if (entrada.isIntersecting) {
                        entrada.target.classList.add("visible");
                        observer.unobserve(entrada.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -30px 0px"
            }
        );

        elementos.forEach((elemento) => observador.observe(elemento));
    };

    observarElementos();


    const preguntasFaq = document.querySelectorAll(".faq-pregunta");

    preguntasFaq.forEach((boton) => {
        boton.addEventListener("click", () => {
            const item = boton.closest(".faq-item");
            const respuesta = item?.querySelector(".faq-respuesta");
            const estabaAbierto = item?.classList.contains("abierto");

            document.querySelectorAll(".faq-item.abierto").forEach((otroItem) => {
                if (otroItem !== item) {
                    otroItem.classList.remove("abierto");
                    const otroBoton = otroItem.querySelector(".faq-pregunta");
                    const otraRespuesta = otroItem.querySelector(".faq-respuesta");
                    otroBoton?.setAttribute("aria-expanded", "false");
                    if (otraRespuesta) otraRespuesta.style.maxHeight = "0px";
                }
            });

            if (!item || !respuesta) return;

            item.classList.toggle("abierto", !estabaAbierto);
            boton.setAttribute("aria-expanded", String(!estabaAbierto));
            respuesta.style.maxHeight = estabaAbierto
                ? "0px"
                : `${respuesta.scrollHeight}px`;
        });
    });

});
