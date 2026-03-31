// ===================================================================
//  script.js  —  Happy Kids · Animaciones y mejoras visuales
//  Se carga después de main.js y auth.js
// ===================================================================

document.addEventListener('DOMContentLoaded', function () {

    // Animar cards cada vez que cambia el contenido principal
    var main = document.getElementById('contenido-principal');
    if (!main) return;

    var observer = new MutationObserver(function () {
        var cards = main.querySelectorAll(
            '.producto-card, .categoria-card, .beneficio-card, .dash-card, .faq-item, .carrito-item'
        );
        cards.forEach(function (el, i) {
            el.style.opacity    = '0';
            el.style.transform  = 'translateY(18px)';
            el.style.transition = 'opacity 0.35s ease ' + (i * 0.055) + 's, transform 0.35s ease ' + (i * 0.055) + 's';
            // Forzar reflow y luego animar
            requestAnimationFrame(function () {
                requestAnimationFrame(function () {
                    el.style.opacity   = '1';
                    el.style.transform = 'translateY(0)';
                });
            });
        });
    });

    observer.observe(main, { childList: true });
});
