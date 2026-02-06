// js/navbar.js
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.header');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const expanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', (!expanded).toString());
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('is-open');
        });

        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                if (navLinks.classList.contains('open')) {
                    navLinks.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.classList.remove('is-open');
                }
            });
        });

        document.addEventListener('click', (event) => {
            if (!navLinks.classList.contains('open')) return;
            const target = event.target;
            if (navLinks.contains(target) || navToggle.contains(target)) return;
            navLinks.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('is-open');
        });
    }

    // Active link highlighting
    try {
        const path = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-links a').forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            // compare only the filename
            const hrefFile = href.split('/').pop();
            if (hrefFile === path || (path === '' && hrefFile === 'index.html')) {
                a.classList.add('active-link');
            }
        });
    } catch (e) {
        // ignore
    }

    // Sticky header on scroll
    if (header) {
        const onScroll = () => {
            if (window.scrollY > 60) header.classList.add('sticky');
            else header.classList.remove('sticky');
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }
});
