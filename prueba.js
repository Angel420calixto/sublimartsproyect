/* ================================================
   SublimArts — script/index.js
   Único script del sitio. Incluye:
   - Sistema de carruseles con scroll-snap nativo
   - Hero carrusel con autoplay cada 4s
   - Carrusel de imágenes de la sección info
   - Menú mobile
   - Animaciones al entrar en viewport
   ================================================ */

/* ================================================
   SISTEMA DE CARRUSELES CON SCROLL-SNAP NATIVO
   En mobile usa scroll-snap del navegador para
   cambiar de a un elemento por swipe. En desktop
   usa flechas para desplazar múltiples elementos.
   ================================================ */
class Carrusel {
    constructor(contenedorId, pistaId, opciones = {}) {
        this.contenedor = document.getElementById(contenedorId);
        if (!this.contenedor) return;

        this.pista = document.getElementById(pistaId);
        this.vista = this.contenedor.querySelector('.carrusel-vista');
        this.btnAnterior = this.contenedor.querySelector('.carrusel-flecha-anterior');
        this.btnSiguiente = this.contenedor.querySelector('.carrusel-flecha-siguiente');
        this.slides = Array.from(this.pista.children);

        this.opciones = {
            visiblesDesktop: opciones.visiblesDesktop || 4,
            visiblesTablet: opciones.visiblesTablet || 3,
            visiblesMobile: opciones.visiblesMobile || 1,
            gap: opciones.gap || 20,
            ...opciones
        };

        this.esMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        this.calcularDimensiones();
        this.bindEventos();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.esMobile = window.innerWidth <= 768;
                this.calcularDimensiones();
                if (this.btnAnterior) this.btnAnterior.disabled = true;
                if (this.btnSiguiente) this.btnSiguiente.disabled = false;
            }, 250);
        });
    }

    calcularDimensiones() {
        // En mobile, cada slide ocupa el 100% del ancho de la vista
        if (this.esMobile) {
            this.anchoSlide = this.vista.offsetWidth;
            this.slides.forEach(slide => {
                slide.style.width = '100%';
            });
        } else {
            // En desktop, los slides se distribuyen según visiblesDesktop
            const gap = this.opciones.gap;
            const visibles = window.innerWidth <= 1024 ? this.opciones.visiblesTablet : this.opciones.visiblesDesktop;
            const anchoDisponible = this.vista.offsetWidth;
            const anchoSlide = (anchoDisponible - (gap * (visibles - 1))) / visibles;
            
            this.anchoSlide = anchoSlide;
            this.slides.forEach(slide => {
                slide.style.width = `${anchoSlide}px`;
            });
        }
    }

    bindEventos() {
        if (this.btnAnterior) {
            this.btnAnterior.addEventListener('click', () => this.desplazar(-1));
        }
        if (this.btnSiguiente) {
            this.btnSiguiente.addEventListener('click', () => this.desplazar(1));
        }

        // Scroll snap ya está activo via CSS en mobile
        // En desktop, actualizamos los botones al hacer scroll
        this.vista.addEventListener('scroll', () => {
            if (!this.esMobile) {
                this.actualizarBotones();
            }
        }, { passive: true });

        // Navegación por teclado
        this.contenedor.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.desplazar(-1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.desplazar(1);
            }
        });

        this.actualizarBotones();
    }

    desplazar(direccion) {
        const paso = this.anchoSlide;
        const scrollActual = this.vista.scrollLeft;
        const nuevoScroll = scrollActual + (direccion * paso);
        
        this.vista.scrollTo({
            left: nuevoScroll,
            behavior: 'smooth'
        });
    }

    actualizarBotones() {
        if (!this.btnAnterior || !this.btnSiguiente) return;
        
        const scrollActual = this.vista.scrollLeft;
        const anchoTotal = this.pista.scrollWidth;
        const anchoVista = this.vista.clientWidth;
        
        this.btnAnterior.disabled = scrollActual <= 0;
        this.btnSiguiente.disabled = scrollActual >= (anchoTotal - anchoVista - 10);
    }
}

/* ================================================
   HERO CARRUSEL — PORTADA
   Fundido automático entre imágenes cada 4s.
   Swipe en mobile para cambiar de imagen.
   Pausa en hover/foco.
   ================================================ */
class HeroCarrusel {
    constructor(seccionId, pistaId, indicadoresId, opciones = {}) {
        this.seccion = document.getElementById(seccionId);
        this.pista = document.getElementById(pistaId);
        this.indicadoresContenedor = document.getElementById(indicadoresId);
        if (!this.seccion || !this.pista) return;

        this.slides = Array.from(this.pista.querySelectorAll('.hero-slide'));
        this.indicadores = this.indicadoresContenedor
            ? Array.from(this.indicadoresContenedor.querySelectorAll('.hero-indicador'))
            : [];
        this.indice = 0;
        this.intervalo = opciones.intervalo || 4000; // 4 segundos
        this.temporizador = null;
        this.reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.touchInicioX = 0;
        this.touchInicioY = 0;
        this.touchDeltaX = 0;
        this.touchDeltaY = 0;
        this.tracking = false;

        this.init();
    }

    init() {
        if (this.slides.length <= 1) return;

        this.indicadores.forEach((ind, i) => {
            ind.addEventListener('click', () => {
                this.irSlide(i);
                this.reiniciarAutoplay();
            });
        });

        this.seccion.addEventListener('mouseenter', () => this.detenerAutoplay());
        this.seccion.addEventListener('mouseleave', () => this.reiniciarAutoplay());
        this.seccion.addEventListener('focusin', () => this.detenerAutoplay());
        this.seccion.addEventListener('focusout', () => this.reiniciarAutoplay());

        // Soporte táctil con detección de swipe horizontal
        this.seccion.addEventListener('touchstart', (e) => {
            this.touchInicioX = e.touches[0].clientX;
            this.touchInicioY = e.touches[0].clientY;
            this.touchDeltaX = 0;
            this.touchDeltaY = 0;
            this.tracking = true;
            this.detenerAutoplay();
        }, { passive: true });

        this.seccion.addEventListener('touchmove', (e) => {
            if (!this.tracking) return;
            
            this.touchDeltaX = e.touches[0].clientX - this.touchInicioX;
            this.touchDeltaY = e.touches[0].clientY - this.touchInicioY;
            
            // Si es swipe horizontal, prevenimos el scroll vertical
            if (Math.abs(this.touchDeltaX) > Math.abs(this.touchDeltaY)) {
                e.preventDefault();
            }
        }, { passive: false });

        this.seccion.addEventListener('touchend', () => {
            if (!this.tracking) return;
            this.tracking = false;

            const umbral = 50;
            if (this.touchDeltaX < -umbral) {
                this.navegar(1);
            } else if (this.touchDeltaX > umbral) {
                this.navegar(-1);
            }

            this.touchDeltaX = 0;
            this.touchDeltaY = 0;
            this.reiniciarAutoplay();
        });

        this.mostrarSlide(this.indice);

        if (!this.reducirMovimiento) {
            this.iniciarAutoplay();
        }
    }

    navegar(dir) {
        this.irSlide(this.indice + dir);
    }

    irSlide(nuevo) {
        this.indice = (nuevo + this.slides.length) % this.slides.length;
        this.mostrarSlide(this.indice);
    }

    mostrarSlide(i) {
        this.slides.forEach((slide, idx) => {
            slide.classList.toggle('activo', idx === i);
        });
        this.indicadores.forEach((ind, idx) => {
            ind.classList.toggle('activo', idx === i);
        });
    }

    iniciarAutoplay() {
        this.temporizador = setInterval(() => this.navegar(1), this.intervalo);
    }

    detenerAutoplay() {
        clearInterval(this.temporizador);
    }

    reiniciarAutoplay() {
        this.detenerAutoplay();
        if (!this.reducirMovimiento) {
            this.iniciarAutoplay();
        }
    }
}

/* ================================================
   CARRUSEL DE IMÁGENES — SECCIÓN "¿QUÉ ES UNA
   IMPRESIÓN EN METAL?"
   Carrusel con fade + indicadores + flechas.
   Soporte para swipe en mobile.
   ================================================ */
class CarruselInfo {
    constructor(id) {
        this.carrusel = document.getElementById(id);
        if (!this.carrusel) return;

        this.slides = Array.from(this.carrusel.querySelectorAll('.info-slide'));
        this.indicadores = Array.from(this.carrusel.querySelectorAll('.info-indicador'));
        this.btnAnterior = this.carrusel.querySelector('.info-carrusel-flecha.anterior');
        this.btnSiguiente = this.carrusel.querySelector('.info-carrusel-flecha.siguiente');
        this.indice = 0;
        this.touchInicioX = 0;
        this.touchDeltaX = 0;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        if (this.btnAnterior) {
            this.btnAnterior.addEventListener('click', () => this.navegar(-1));
        }
        if (this.btnSiguiente) {
            this.btnSiguiente.addEventListener('click', () => this.navegar(1));
        }

        this.indicadores.forEach((ind, i) => {
            ind.addEventListener('click', () => this.irSlide(i));
        });

        // Navegación por teclado
        this.carrusel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navegar(-1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navegar(1);
            }
        });

        // Soporte táctil para mobile
        this.carrusel.addEventListener('touchstart', (e) => {
            this.touchInicioX = e.touches[0].clientX;
            this.touchDeltaX = 0;
        }, { passive: true });

        this.carrusel.addEventListener('touchmove', (e) => {
            this.touchDeltaX = e.touches[0].clientX - this.touchInicioX;
            if (Math.abs(this.touchDeltaX) > 10) {
                e.preventDefault();
            }
        }, { passive: false });

        this.carrusel.addEventListener('touchend', () => {
            const umbral = 50;
            if (this.touchDeltaX < -umbral) {
                this.navegar(1);
            } else if (this.touchDeltaX > umbral) {
                this.navegar(-1);
            }
            this.touchDeltaX = 0;
        });

        this.mostrarSlide(this.indice);
    }

    navegar(dir) {
        this.irSlide(this.indice + dir);
    }

    irSlide(nuevo) {
        this.indice = (nuevo + this.slides.length) % this.slides.length;
        this.mostrarSlide(this.indice);
    }

    mostrarSlide(i) {
        this.slides.forEach((slide, idx) => {
            slide.classList.toggle('activo', idx === i);
        });
        this.indicadores.forEach((ind, idx) => {
            ind.classList.toggle('activo', idx === i);
        });
    }
}

/* ================================================
   MENÚ MOBILE
   Hamburguesa + submenú acordeón
   ================================================ */
class MenuMobile {
    constructor() {
        this.boton = document.getElementById('botonMenuMobile');
        this.menu = document.getElementById('menuPrincipal');
        this.overlay = document.getElementById('menuOverlay');

        if (!this.boton || !this.menu || !this.overlay) return;

        this.estaAbierto = false;
        this.init();
    }

    init() {
        this.boton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        this.overlay.addEventListener('click', (e) => {
            e.preventDefault();
            this.cerrarMenu();
        });

        // Manejo del submenú
        const botonesSubmenu = document.querySelectorAll('.enlace-menu-desplegable');
        botonesSubmenu.forEach((btn) => {
            btn.addEventListener('click', (e) => this.handleSubmenuClick(e, btn));
        });

        // Cerrar menú al hacer click en enlaces
        const enlacesMenu = document.querySelectorAll('.enlace-menu, .submenu a');
        enlacesMenu.forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && this.estaAbierto) {
                    setTimeout(() => this.cerrarMenu(), 150);
                }
            });
        });

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.estaAbierto) {
                this.cerrarMenu();
                this.boton.focus();
            }
        });

        // Reset al cambiar a desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.estaAbierto) {
                this.cerrarMenu();
            }
        });
    }

    handleSubmenuClick(e, btn) {
        if (window.innerWidth > 768) return;

        e.preventDefault();
        e.stopPropagation();

        const padre = btn.closest('.menu-con-desplegable');
        if (!padre) return;

        // Cerrar otros submenús
        document.querySelectorAll('.menu-con-desplegable.activo').forEach((item) => {
            if (item !== padre) {
                item.classList.remove('activo');
                const otroBtn = item.querySelector('.enlace-menu-desplegable');
                if (otroBtn) otroBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Toggle del submenú actual
        const estaActivo = padre.classList.contains('activo');
        padre.classList.toggle('activo', !estaActivo);
        btn.setAttribute('aria-expanded', String(!estaActivo));
    }

    toggleMenu() {
        this.estaAbierto ? this.cerrarMenu() : this.abrirMenu();
    }

    abrirMenu() {
        this.estaAbierto = true;
        this.menu.classList.add('activo');
        this.overlay.classList.add('activo');
        document.body.style.overflow = 'hidden';
        this.boton.setAttribute('aria-expanded', 'true');
        this.boton.setAttribute('aria-label', 'Cerrar menú');
    }

    cerrarMenu() {
        this.estaAbierto = false;
        this.menu.classList.remove('activo');
        this.overlay.classList.remove('activo');
        document.body.style.overflow = '';
        this.boton.setAttribute('aria-expanded', 'false');
        this.boton.setAttribute('aria-label', 'Abrir menú');

        // Cerrar submenús abiertos
        document.querySelectorAll('.menu-con-desplegable.activo').forEach((item) => {
            item.classList.remove('activo');
            const btn = item.querySelector('.enlace-menu-desplegable');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    }
}

/* ================================================
   ANIMACIONES AL ENTRAR EN VIEWPORT
   ================================================ */
function initRevealAnimations() {
    const elementos = document.querySelectorAll('.reveal');
    if (elementos.length === 0) return;

    if (!('IntersectionObserver' in window)) {
        elementos.forEach((el) => el.classList.add('visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    elementos.forEach((el) => observer.observe(el));
}

/* ================================================
   NAVEGACIÓN SUAVE PARA ENLACES INTERNOS
   ================================================ */
function initNavegacionSuave() {
    document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
        enlace.addEventListener('click', (evento) => {
            const targetId = enlace.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                evento.preventDefault();
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ================================================
   INICIALIZACIÓN
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Hero carrusel con autoplay cada 4 segundos
    new HeroCarrusel('inicio', 'heroSlides', 'heroIndicadores', {
        intervalo: 4000
    });

    // Carrusel de imágenes de la sección info
    new CarruselInfo('infoCarrusel');

    // Carruseles horizontales con scroll-snap
    new Carrusel('categoriasCarrusel', 'categoriasPista', {
        visiblesDesktop: 4,
        visiblesTablet: 3,
        visiblesMobile: 1,
        gap: 20
    });

    new Carrusel('muroCarrusel', 'muroPista', {
        visiblesDesktop: 3,
        visiblesTablet: 2,
        visiblesMobile: 1,
        gap: 20
    });

    new Carrusel('destacadosCarrusel', 'destacadosPista', {
        visiblesDesktop: 4,
        visiblesTablet: 3,
        visiblesMobile: 1,
        gap: 20
    });

    // Menú mobile
    new MenuMobile();

    // Animaciones de reveal
    initRevealAnimations();

    // Navegación suave
    initNavegacionSuave();

    console.log('SublimArts - Index cargado correctamente');
});