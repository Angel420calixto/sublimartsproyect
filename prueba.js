/* ================================================
   SublimArts — script/index.js
   Único script del sitio (antes había dos scripts
   cargados a la vez —"prueba.js" + "script/index.js"—
   que enganchaban el mismo botón del submenú dos
   veces: cada clic abría y cerraba el menú en el
   mismo instante. Ese era el bug del submenú mobile.
   Ahora solo existe ESTE archivo.)
   ================================================ */

/* ================================================
   SISTEMA DE CARRUSELES UNIFICADO
   Beneficios / Videos / Muro. Reutilizable: agrega
   más <article class="carrusel-slide"> o
   <div class="muro-item"> dentro de la pista y
   seguirá funcionando sin tocar este archivo.
   ================================================ */
class Carrusel {
    constructor(contenedorId, pistaId, opciones = {}) {
        this.contenedor = document.getElementById(contenedorId);
        if (!this.contenedor) return;

        this.pista = document.getElementById(pistaId);
        this.btnAnterior = this.contenedor.querySelector('.carrusel-flecha-anterior');
        this.btnSiguiente = this.contenedor.querySelector('.carrusel-flecha-siguiente');
        this.slides = Array.from(this.pista.children);
        this.vista = this.contenedor.querySelector('.carrusel-vista');

        this.desplazamiento = 0;
        this.slidesVisibles = opciones.slidesVisibles || 6;
        this.gap = opciones.gap || 20;

        this.touchInicio = 0;
        this.touchDelta = 0;
        this.tracking = false;
        this.startTransform = 0;

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        this.calcularDimensiones();
        this.bindEventos();
        this.actualizarBotones();

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.calcularDimensiones();
                this.desplazamiento = 0;
                this.actualizarPista();
                this.actualizarBotones();
            }, 250);
        });
    }

    calcularDimensiones() {
        this.anchoSlide = this.slides[0].offsetWidth + this.gap;

        if (window.innerWidth <= 768) {
            this.slidesVisibles = 1;
        } else if (window.innerWidth <= 1024) {
            this.slidesVisibles = 3;
        } else {
            this.slidesVisibles = 6;
        }

        this.anchoVista = this.vista.offsetWidth;
        this.maxDesplazamiento = Math.max(0, (this.slides.length * this.anchoSlide) - this.anchoVista);
    }

    bindEventos() {
        if (this.btnAnterior) this.btnAnterior.addEventListener('click', () => this.mover(-1));
        if (this.btnSiguiente) this.btnSiguiente.addEventListener('click', () => this.mover(1));

        this.pista.addEventListener('touchstart', (e) => {
            this.touchInicio = e.touches[0].clientX;
            this.tracking = true;
            this.startTransform = this.desplazamiento;
            this.pista.style.transition = 'none';
        }, { passive: true });

        this.pista.addEventListener('touchmove', (e) => {
            if (!this.tracking) return;
            this.touchDelta = e.touches[0].clientX - this.touchInicio;

            if (Math.abs(this.touchDelta) > 10) {
                e.preventDefault();
            }

            const nuevo = this.startTransform - this.touchDelta;
            const limitado = Math.max(0, Math.min(nuevo, this.maxDesplazamiento));
            this.pista.style.transform = `translateX(${-limitado}px)`;
        }, { passive: false });

        this.pista.addEventListener('touchend', () => {
            if (!this.tracking) return;
            this.tracking = false;
            this.pista.style.transition = 'transform 0.5s ease';

            this.desplazamiento = this.startTransform - this.touchDelta;

            const umbral = 50;
            if (this.touchDelta < -umbral) {
                this.mover(1);
            } else if (this.touchDelta > umbral) {
                this.mover(-1);
            } else {
                this.desplazamiento = this.startTransform;
                this.actualizarPista();
            }

            this.touchDelta = 0;
            this.actualizarBotones();
        });

        this.contenedor.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); this.mover(-1); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); this.mover(1); }
        });
    }

    mover(direccion) {
        const paso = this.anchoSlide * this.slidesVisibles;
        this.desplazamiento += direccion * paso;
        this.desplazamiento = Math.max(0, Math.min(this.desplazamiento, this.maxDesplazamiento));
        this.actualizarPista();
        this.actualizarBotones();
    }

    actualizarPista() {
        this.pista.style.transform = `translateX(${-this.desplazamiento}px)`;
    }

    actualizarBotones() {
        if (this.btnAnterior) this.btnAnterior.disabled = this.desplazamiento <= 0;
        if (this.btnSiguiente) this.btnSiguiente.disabled = this.desplazamiento >= this.maxDesplazamiento;
    }
}

/* ================================================
   CARRUSEL DE IMÁGENES — SECCIÓN INFO
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

        this.init();
    }

    init() {
        if (this.slides.length === 0) return;

        if (this.btnAnterior) this.btnAnterior.addEventListener('click', () => this.navegar(-1));
        if (this.btnSiguiente) this.btnSiguiente.addEventListener('click', () => this.navegar(1));

        this.indicadores.forEach((ind, i) => {
            ind.addEventListener('click', () => this.irSlide(i));
        });

        this.carrusel.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') { e.preventDefault(); this.navegar(-1); }
            if (e.key === 'ArrowRight') { e.preventDefault(); this.navegar(1); }
        });

        let inicioX = 0;
        this.carrusel.addEventListener('touchstart', (e) => {
            inicioX = e.touches[0].clientX;
        }, { passive: true });

        this.carrusel.addEventListener('touchend', (e) => {
            const deltaX = e.changedTouches[0].clientX - inicioX;
            if (deltaX < -50) this.navegar(1);
            if (deltaX > 50) this.navegar(-1);
        });

        this.mostrarSlide(this.indice);
    }

    navegar(dir) { this.irSlide(this.indice + dir); }

    irSlide(nuevo) {
        this.indice = (nuevo + this.slides.length) % this.slides.length;
        this.mostrarSlide(this.indice);
    }

    mostrarSlide(i) {
        this.slides.forEach((slide, idx) => slide.classList.toggle('activo', idx === i));
        this.indicadores.forEach((ind, idx) => ind.classList.toggle('activo', idx === i));
    }
}

/* ================================================
   MENÚ MOBILE (hamburguesa + submenú acordeón)
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

        const botonesSubmenu = document.querySelectorAll('.enlace-menu-desplegable');
        botonesSubmenu.forEach((btn) => {
            btn.addEventListener('click', (e) => this.handleSubmenuClick(e, btn));
        });

        const enlacesMenu = document.querySelectorAll('.enlace-menu, .submenu a');
        enlacesMenu.forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && this.estaAbierto) {
                    setTimeout(() => this.cerrarMenu(), 150);
                }
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.estaAbierto) {
                this.cerrarMenu();
                this.boton.focus();
            }
        });

        // Si la ventana pasa a tamaño desktop con el menú abierto,
        // lo reseteamos para evitar estados inconsistentes.
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && this.estaAbierto) {
                this.cerrarMenu();
            }
        });
    }

    handleSubmenuClick(e, btn) {
        if (window.innerWidth > 768) return; // en desktop el submenú abre por :hover (CSS)

        e.preventDefault();
        e.stopPropagation();

        const padre = btn.closest('.menu-con-desplegable');
        if (!padre) return;

        document.querySelectorAll('.menu-con-desplegable.activo').forEach((item) => {
            if (item !== padre) {
                item.classList.remove('activo');
                const otroBtn = item.querySelector('.enlace-menu-desplegable');
                if (otroBtn) otroBtn.setAttribute('aria-expanded', 'false');
            }
        });

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

        document.querySelectorAll('.menu-con-desplegable.activo').forEach((item) => {
            item.classList.remove('activo');
            const btn = item.querySelector('.enlace-menu-desplegable');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    }
}

/* ================================================
   INICIALIZACIÓN
   ================================================ */
document.addEventListener('DOMContentLoaded', () => {
    new CarruselInfo('infoCarrusel');
    new Carrusel('beneficiosCarrusel', 'beneficiosPista', { slidesVisibles: 6, gap: 20 });
    new Carrusel('videosCarrusel', 'videosPista', { slidesVisibles: 6, gap: 20 });
    new Carrusel('muroCarrusel', 'muroPista', { slidesVisibles: 3, gap: 20 });
    new MenuMobile();
});