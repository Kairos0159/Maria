// script.js
document.addEventListener('DOMContentLoaded', function() {
    // ===== ELEMENTOS DEL DOM =====
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const menuToggle = document.getElementById('menu-toggle');
    const navigation = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const currentYear = document.getElementById('current-year');
    const scrollTopBtn = document.querySelector('.scroll-top');
    const contactForm = document.getElementById('contactForm');
    const preloader = document.querySelector('.preloader');
    const particlesContainer = document.querySelector('.particles-container');
    const customCursor = document.querySelector('.custom-cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    // ===== CARRUSEL ELEMENTOS =====
    const carruselTrack = document.querySelector('.carousel-track');
    const carruselSlides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicators = document.querySelectorAll('.indicator');
    
    // ===== LIGHTBOX ELEMENTOS =====
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxCaption = document.querySelector('.lightbox-caption h3');
    const lightboxDescription = document.querySelector('.lightbox-caption p');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    // ===== VARIABLES GLOBALES =====
    let currentSlide = 0;
    let totalSlides = carruselSlides.length;
    let carruselInterval;
    let isTransitioning = false;
    let currentImageIndex = 0;
    let galleryImages = [];
    let mouseX = 0;
    let mouseY = 0;
    
    // ===== INICIALIZACIÓN =====
    function init() {
        setCurrentYear();
        setupNavigation();
        setupTheme();
        setupCarrusel();
        setupScrollTop();
        setupFormValidation();
        setupLightbox();
        setupAnimations();
        setupParticles();
        setupCursor();
        setupIntersectionObserver();
        setupCounters();
        
        // Ocultar preloader después de cargar todo
        setTimeout(() => {
            preloader.classList.add('loaded');
            document.body.style.overflow = 'auto';
        }, 1500);
    }
    
    // ===== AÑO ACTUAL =====
    function setCurrentYear() {
        currentYear.textContent = new Date().getFullYear();
    }
    
    // ===== NAVEGACIÓN =====
    function setupNavigation() {
        // Toggle del menú móvil
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navigation.classList.toggle('active');
            body.style.overflow = navigation.classList.contains('active') ? 'hidden' : 'auto';
        });
        
        // Navegación entre secciones
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                
                // Cerrar menú móvil si está abierto
                if (navigation.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    navigation.classList.remove('active');
                    body.style.overflow = 'auto';
                }
                
                // Actualizar enlace activo
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                this.classList.add('active');
                
                // Mostrar sección activa
                showSection(targetId);
                
                // Desplazamiento suave
                setTimeout(() => {
                    document.getElementById(targetId).scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 300);
            });
        });
        
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !navigation.contains(e.target)) {
                menuToggle.classList.remove('active');
                navigation.classList.remove('active');
                body.style.overflow = 'auto';
            }
        });
    }
    
    // ===== MOSTRAR SECCIÓN =====
    function showSection(sectionId) {
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.display = 'block';
                section.classList.add('active-section');
                
                // Animar elementos dentro de la sección
                setTimeout(() => {
                    animateSectionElements(section);
                }, 100);
            } else {
                section.classList.remove('active-section');
                setTimeout(() => {
                    if (!section.classList.contains('active-section')) {
                        section.style.display = 'none';
                    }
                }, 300);
            }
        });
    }
    
    // ===== TEMA OSCURO/CLARO =====
    function setupTheme() {
        // Cargar tema guardado
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        }
        
        // Cambiar tema
        themeToggle.addEventListener('change', function() {
            if (this.checked) {
                body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
                showNotification('Modo oscuro activado', 'success');
            } else {
                body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
                showNotification('Modo claro activado', 'success');
            }
        });
    }
    
    // ===== CARRUSEL =====
    function setupCarrusel() {
        if (!carruselTrack) return;
        
        // Configurar slides
        updateCarruselDimensions();
        
        // Event listeners
        prevBtn.addEventListener('click', () => navigateCarrusel(-1));
        nextBtn.addEventListener('click', () => navigateCarrusel(1));
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => goToSlide(index));
        });
        
        // Navegación con teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') navigateCarrusel(-1);
            if (e.key === 'ArrowRight') navigateCarrusel(1);
        });
        
        // Swipe para móviles
        let touchStartX = 0;
        let touchEndX = 0;
        
        carruselTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        carruselTrack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const difference = touchStartX - touchEndX;
            
            if (Math.abs(difference) > swipeThreshold) {
                if (difference > 0) {
                    navigateCarrusel(1);
                } else {
                    navigateCarrusel(-1);
                }
            }
        }
        
        // Autoavance
        startAutoAdvance();
        
        // Pausar autoavance al interactuar
        const carruselContainer = document.querySelector('.carousel-container');
        carruselContainer.addEventListener('mouseenter', pauseAutoAdvance);
        carruselContainer.addEventListener('touchstart', pauseAutoAdvance);
        carruselContainer.addEventListener('mouseleave', startAutoAdvance);
        
        // Actualizar en resize
        window.addEventListener('resize', updateCarruselDimensions);
    }
    
    function navigateCarrusel(direction) {
        if (isTransitioning) return;
        
        isTransitioning = true;
        const newSlide = (currentSlide + direction + totalSlides) % totalSlides;
        goToSlide(newSlide);
        
        setTimeout(() => {
            isTransitioning = false;
        }, 600);
    }
    
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        
        // Actualizar posición
        carruselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Actualizar indicadores
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentSlide);
        });
        
        // Restart auto advance
        restartAutoAdvance();
    }
    
    function updateCarruselDimensions() {
        if (carruselTrack) {
            const containerWidth = document.querySelector('.carousel-container').offsetWidth;
            carruselSlides.forEach(slide => {
                slide.style.minWidth = `${containerWidth}px`;
            });
        }
    }
    
    function startAutoAdvance() {
        carruselInterval = setInterval(() => {
            navigateCarrusel(1);
        }, 5000);
    }
    
    function pauseAutoAdvance() {
        clearInterval(carruselInterval);
    }
    
    function restartAutoAdvance() {
        pauseAutoAdvance();
        startAutoAdvance();
    }
    
    // ===== SCROLL TOP =====
    function setupScrollTop() {
        window.addEventListener('scroll', () => {
            // Mostrar/ocultar botón
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
            
            // Actualizar progreso de scroll
            updateScrollProgress();
        });
        
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    function updateScrollProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progressBar = document.querySelector('.progress-bar');
        
        if (progressBar) {
            progressBar.style.width = scrolled + '%';
        }
    }
    
    // ===== FORMULARIO =====
    function setupFormValidation() {
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm()) {
                simulateFormSubmission();
            }
        });
        
        // Validación en tiempo real
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearError);
        });
    }
    
    function validateForm() {
        let isValid = true;
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    function validateField(field) {
        let isValid = true;
        let errorMessage = '';
        
        clearError(field);
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            errorMessage = 'Este campo es requerido';
        }
        
        if (field.type === 'email' && field.value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                isValid = false;
                errorMessage = 'Ingresa un email válido';
            }
        }
        
        if (!isValid) {
            showError(field, errorMessage);
        }
        
        return isValid;
    }
    
    function showError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--danger)';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderBottomColor = 'var(--danger)';
    }
    
    function clearError(field) {
        const error = field.parentNode.querySelector('.error-message');
        if (error) {
            error.remove();
        }
        field.style.borderBottomColor = '';
    }
    
    function simulateFormSubmission() {
        const submitBtn = contactForm.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showNotification('¡Mensaje enviado con éxito! Te responderemos pronto.', 'success');
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            contactForm.reset();
        }, 2000);
    }
    
    // ===== LIGHTBOX =====
    function setupLightbox() {
        // Recopilar imágenes de la galería
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            const title = item.querySelector('h4').textContent;
            const description = item.querySelector('p').textContent;
            
            galleryImages.push({
                src: img.src,
                title: title,
                description: description
            });
            
            // Agregar evento click
            item.addEventListener('click', () => {
                openLightbox(index);
            });
        });
        
        // Event listeners del lightbox
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', showPrevImage);
        lightboxNext.addEventListener('click', showNextImage);
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') showPrevImage();
            if (e.key === 'ArrowRight') showNextImage();
        });
        
        // Cerrar al hacer clic fuera
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    function openLightbox(index) {
        currentImageIndex = index;
        updateLightbox();
        lightbox.classList.add('active');
        body.style.overflow = 'hidden';
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        body.style.overflow = 'auto';
    }
    
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightbox();
    }
    
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightbox();
    }
    
    function updateLightbox() {
        const image = galleryImages[currentImageIndex];
        lightboxImage.src = image.src;
        lightboxCaption.textContent = image.title;
        lightboxDescription.textContent = image.description;
    }
    
    // ===== ANIMACIONES =====
    function setupAnimations() {
        // Animar elementos al entrar en viewport
        const animatedElements = document.querySelectorAll('.pdf-card-3d, .video-card, .resource-card, .stat-card');
        
        animatedElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            el.style.transitionDelay = `${index * 0.1}s`;
        });
    }
    
    function animateSectionElements(section) {
        const elements = section.querySelectorAll('.pdf-card-3d, .video-card, .resource-card, .stat-card, .gallery-item');
        
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 100 + (index * 100));
        });
    }
    
    // ===== PARTÍCULAS =====
    function setupParticles() {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            createParticle();
        }
    }
    
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Tamaño y posición aleatorios
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}vw`;
        particle.style.top = `${posY}vh`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.backgroundColor = `rgba(${Math.random() * 100}, ${Math.random() * 100}, 238, 0.1)`;
        
        particlesContainer.appendChild(particle);
        
        // Eliminar y recrear partícula cuando termine la animación
        setTimeout(() => {
            particle.remove();
            createParticle();
        }, duration * 1000);
    }
    
    // ===== CURSOR PERSONALIZADO =====
    function setupCursor() {
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Actualizar cursor principal
            customCursor.style.left = `${mouseX}px`;
            customCursor.style.top = `${mouseY}px`;
            
            // Actualizar cursor seguidor con retraso
            setTimeout(() => {
                cursorFollower.style.left = `${mouseX}px`;
                cursorFollower.style.top = `${mouseY}px`;
            }, 50);
        });
        
        // Efectos al pasar sobre elementos interactivos
        const interactiveElements = document.querySelectorAll('a, button, .btn, .gallery-item, .pdf-card-3d, .video-card');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                customCursor.style.width = '40px';
                customCursor.style.height = '40px';
                customCursor.style.borderColor = 'var(--secondary)';
                customCursor.style.backgroundColor = 'rgba(247, 37, 133, 0.1)';
                
                cursorFollower.style.width = '60px';
                cursorFollower.style.height = '60px';
                cursorFollower.style.borderColor = 'rgba(247, 37, 133, 0.5)';
            });
            
            el.addEventListener('mouseleave', () => {
                customCursor.style.width = '20px';
                customCursor.style.height = '20px';
                customCursor.style.borderColor = 'var(--primary)';
                customCursor.style.backgroundColor = 'transparent';
                
                cursorFollower.style.width = '40px';
                cursorFollower.style.height = '40px';
                cursorFollower.style.borderColor = 'rgba(67, 97, 238, 0.3)';
            });
        });
    }
    
    // ===== INTERSECTION OBSERVER =====
    function setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    
                    // Animar contadores si es la sección de inicio
                    if (entry.target.id === 'inicio') {
                        animateCounters();
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // Observar secciones
        sections.forEach(section => observer.observe(section));
    }
    
    // ===== CONTADORES ANIMADOS =====
    function setupCounters() {
        const counterElements = document.querySelectorAll('.stat-number');
        
        counterElements.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const increment = target / 100;
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            // Iniciar cuando entre en viewport
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCounter();
                    observer.unobserve(counter);
                }
            });
            
            observer.observe(counter);
        });
    }
    
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const increment = target / 50;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 30);
        });
    }
    
    // ===== NOTIFICACIONES =====
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // Botón para cerrar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto-remover
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
// ===== PDF CARDS 3D =====
function setupPDFCards() {
    const pdfCards = document.querySelectorAll('.pdf-card-3d');
    
    pdfCards.forEach(card => {
        const flipBtn = card.querySelector('[data-action="flip"]');
        const flipBackBtn = card.querySelector('[data-action="flip-back"]');
        
        if (flipBtn) {
            flipBtn.addEventListener('click', () => {
                card.classList.add('flipped');
                
                // En móviles, hacer scroll automático para ver los botones
                if (window.innerWidth <= 768) {
                    setTimeout(() => {
                        const cardRect = card.getBoundingClientRect();
                        const viewportHeight = window.innerHeight;
                        
                        // Si la tarjeta está muy abajo, hacer scroll
                        if (cardRect.bottom > viewportHeight - 100) {
                            card.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    }, 100);
                }
            });
        }
        
        if (flipBackBtn) {
            flipBackBtn.addEventListener('click', () => {
                card.classList.remove('flipped');
            });
        }
        
        // En móviles, agregar un botón de "Volver" más visible
        if (window.innerWidth <= 768) {
            const backBtn = card.querySelector('.btn-close');
            if (backBtn) {
                backBtn.innerHTML = '<i class="fas fa-arrow-left"></i> Volver';
                backBtn.style.fontWeight = '600';
                backBtn.style.backgroundColor = 'var(--theme-border)';
            }
        }
    });
    
    // Asegurar que los PDF se vean bien en móvil
    const pdfIframes = document.querySelectorAll('.pdf-preview iframe');
    pdfIframes.forEach(iframe => {
        iframe.style.minHeight = '200px';
        iframe.style.height = '100%';
    });
}
    // ===== VIDEOS =====
    function setupVideos() {
        const videos = document.querySelectorAll('video');
        const playButtons = document.querySelectorAll('.play-btn');
        
        playButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const video = videos[index];
                const player = video.parentNode;
                
                if (video.paused) {
                    video.play();
                    player.classList.add('playing');
                } else {
                    video.pause();
                    player.classList.remove('playing');
                }
            });
        });
        
        // Actualizar estado del botón play
        videos.forEach((video, index) => {
            video.addEventListener('play', () => {
                const player = video.parentNode;
                player.classList.add('playing');
            });
            
            video.addEventListener('pause', () => {
                const player = video.parentNode;
                player.classList.remove('playing');
            });
        });
    }
    
    // ===== INICIALIZAR TODO =====
    init();
    
    // Inicializar componentes adicionales
    setTimeout(() => {
        setupPDFCards();
        setupVideos();
    }, 1000);
    
    // Manejar errores de carga de imágenes
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            this.style.opacity = '0';
            setTimeout(() => {
                this.style.transition = 'opacity 0.3s';
                this.style.opacity = '1';
            }, 100);
        });
    });
    
    // Efecto de ripple en botones
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const x = e.clientX - this.getBoundingClientRect().left;
            const y = e.clientY - this.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple-effect');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Añadir estilos CSS para ripple effect
    const rippleStyles = document.createElement('style');
    rippleStyles.textContent = `
        .ripple-effect {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
        }
        
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyles);
});
