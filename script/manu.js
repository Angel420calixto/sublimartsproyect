// manu.js - VERSIÓN FUNCIONAL
document.addEventListener('DOMContentLoaded', function() {
    'use strict';
    
    // =============================================
    // ELEMENTOS
    // =============================================
    const menuBtn = document.getElementById('boton-menu-mobile');
    const menuPrincipal = document.getElementById('menu-principal');
    const menuOverlay = document.getElementById('menu-overlay');
    const categoriasBtn = document.getElementById('categorias-btn');
    const categoriasDropdown = document.getElementById('categorias-dropdown');
    const modal = document.getElementById('modal-imagen');
    const modalImg = document.getElementById('imagen-ampliada');
    const modalTitulo = document.getElementById('modal-titulo');
    const cerrarModal = document.getElementById('cerrar-modal');
    
    // =============================================
    // MENÚ HAMBURGUESA
    // =============================================
    if (menuBtn && menuPrincipal && menuOverlay) {
        menuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            menuPrincipal.classList.toggle('activo');
            menuOverlay.classList.toggle('activo');
            document.body.classList.toggle('menu-abierto');
        });
        
        menuOverlay.addEventListener('click', function() {
            menuPrincipal.classList.remove('activo');
            menuOverlay.classList.remove('activo');
            document.body.classList.remove('menu-abierto');
            if (categoriasDropdown) {
                categoriasDropdown.classList.remove('activo');
            }
        });
    }
    
    // =============================================
    // SUBMENÚ CATEGORÍAS
    // =============================================
    if (categoriasBtn && categoriasDropdown) {
        categoriasBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.innerWidth <= 768) {
                categoriasDropdown.classList.toggle('activo');
            }
        });
    }
    
    // =============================================
    // ENLACES DEL SUBMENÚ
    // =============================================
    document.querySelectorAll('#categorias-submenu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Cerrar menús
                    if (menuPrincipal) menuPrincipal.classList.remove('activo');
                    if (menuOverlay) menuOverlay.classList.remove('activo');
                    if (categoriasDropdown) categoriasDropdown.classList.remove('activo');
                    document.body.classList.remove('menu-abierto');
                    
                    // Scroll
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // =============================================
    // MODAL DE IMÁGENES
    // =============================================
    // Abrir modal
    document.querySelectorAll('.item-popular, .producto-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') return;
            
            const img = this.querySelector('img');
            if (!img || !modal) return;
            
            const titulo = img.dataset.titulo || this.querySelector('.titulo-producto')?.textContent || 'Producto';
            
            modalImg.src = img.src;
            modalImg.alt = titulo;
            modalTitulo.textContent = titulo;
            
            modal.classList.add('mostrar');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Cerrar modal
    if (cerrarModal) {
        cerrarModal.addEventListener('click', function() {
            modal.classList.remove('mostrar');
            document.body.style.overflow = '';
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('mostrar');
                document.body.style.overflow = '';
            }
        });
    }
    
    // Cerrar con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('mostrar')) {
            modal.classList.remove('mostrar');
            document.body.style.overflow = '';
        }
    });
    
    // =============================================
    // BOTONES "VER MÁS"
    // =============================================
    const botonPopular = document.getElementById('boton-expandir-popular');
    const gridPopular = document.getElementById('grid-popular');
    
    if (botonPopular && gridPopular) {
        botonPopular.addEventListener('click', function() {
            const expandido = gridPopular.classList.toggle('expandido');
            this.textContent = expandido ? 'Ver menos' : 'Ver más';
        });
    }
    
    // =============================================
    // CERRAR AL REDIMENSIONAR
    // =============================================
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            if (menuPrincipal) menuPrincipal.classList.remove('activo');
            if (menuOverlay) menuOverlay.classList.remove('activo');
            if (categoriasDropdown) categoriasDropdown.classList.remove('activo');
            document.body.classList.remove('menu-abierto');
        }
    });
});