/**
 * ==========================================================================
 * INVITACIÓN 50 AÑOS - ARCHIVO DE INTERACTIVIDAD PRINCIPAL (script.js)
 * ==========================================================================
 */

// --- 1. CONFIGURACIÓN EDITABLE DEL EVENTO ---
const EVENT_CONFIG = {
  momName: "Odilia Triviño",
  // Fecha límite de la cuenta regresiva en formato ISO (YYYY-MM-DDTHH:mm:ss)
  // Nota: La fecha debe estar en el futuro.
  eventDate: new Date("2026-07-25T16:00:00"),
  
  // Número de WhatsApp del organizador en formato internacional sin "+" ni espacios
  // Ej: "573001234567" (Código país + número)
  whatsappNumber: "573233217261",
  
  // Ubicación del mapa en el botón de redirección
  mapsUrl: "https://maps.app.goo.gl/vjHSo6CPWVHiBJjk8",
};

document.addEventListener("DOMContentLoaded", () => {
  // Inicialización de componentes
  initNavigation();
  initHeroParticles();
  initCountdown();
  initScrollAnimations();
  initHeroParallax();
  initGalleryLightbox();
  initRSVPForm();
  initVideoAutoplay();
});

/**
 * ==========================================================================
 * 2. MENÚ DE NAVEGACIÓN MÓVIL
 * ==========================================================================
 */
function initNavigation() {
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.getElementById("main-nav");
  const navLinks = document.querySelectorAll(".nav-link");

  if (!menuToggle || !mainNav) return;

  function toggleMenu() {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    
    // Cambiar estados ARIA
    menuToggle.setAttribute("aria-expanded", !isExpanded);
    mainNav.setAttribute("aria-hidden", isExpanded);
    
    // Cambiar clases de visualización
    mainNav.classList.toggle("nav-menu-open");
    
    // Para control visual en CSS se usa aria-hidden
    if (isExpanded) {
      mainNav.style.transform = "translateY(-100%)";
      mainNav.style.opacity = "0";
      mainNav.setAttribute("aria-hidden", "true");
    } else {
      mainNav.style.transform = "translateY(0)";
      mainNav.style.opacity = "1";
      mainNav.setAttribute("aria-hidden", "false");
    }
  }

  menuToggle.addEventListener("click", toggleMenu);

  // Cerrar menú al hacer click en un enlace
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (menuToggle.getAttribute("aria-expanded") === "true") {
        toggleMenu();
      }
    });
  });
}

/**
 * ==========================================================================
 * 3. CANVAS DE PARTÍCULAS DORADAS (HERO)
 * ==========================================================================
 */
function initHeroParticles() {
  const canvas = document.getElementById("hero-canvas");
  const heroSection = document.getElementById("hero");
  if (!canvas || !heroSection) return;

  const ctx = canvas.getContext("2d");
  let particlesArray = [];
  let animationFrameId = null;
  let isHeroVisible = true;

  // Ajuste dinámico de tamaño
  function resizeCanvas() {
    canvas.width = heroSection.offsetWidth;
    canvas.height = heroSection.offsetHeight;
    initParticles();
  }

  // Clase Partícula
  class Particle {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.reset();
      // Inicializar en posiciones aleatorias de la pantalla
      this.y = Math.random() * this.height;
    }

    reset() {
      this.x = Math.random() * this.width;
      this.y = 0;
      this.size = Math.random() * 2.5 + 0.5; // Partículas finas
      this.speedX = Math.random() * 0.4 - 0.2; // Movimiento horizontal suave
      this.speedY = Math.random() * 0.6 + 0.2;  // Flotan hacia abajo
      this.alpha = Math.random() * 0.5 + 0.1;   // Opacidad aleatoria
      this.decay = Math.random() * 0.002 + 0.001; // Velocidad de desvanecimiento
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha -= this.decay;

      // Resetear si salen de la pantalla o se desvanecen
      if (this.y >= this.height || this.alpha <= 0 || this.x < 0 || this.x > this.width) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201, 168, 76, ${this.alpha})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = "rgba(201, 168, 76, 0.5)";
      ctx.fill();
      ctx.restore();
    }
  }

  // Inicializar partículas basadas en el ancho del dispositivo
  function initParticles() {
    particlesArray = [];
    // Móvil: 30 partículas máximo, Desktop: 80 partículas
    const maxParticles = window.innerWidth < 600 ? 30 : 80;
    
    for (let i = 0; i < maxParticles; i++) {
      particlesArray.push(new Particle(canvas.width, canvas.height));
    }
  }

  // Bucle de animación
  function animate() {
    if (!isHeroVisible) return; // Detener animación si no es visible
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    
    animationFrameId = requestAnimationFrame(animate);
  }

  // IntersectionObserver para pausar el canvas fuera de pantalla (Ahorro de batería)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isHeroVisible = entry.isIntersecting;
      if (isHeroVisible) {
        // Reiniciar animación
        if (!animationFrameId) {
          animate();
        }
      } else {
        // Cancelar animación para ahorrar batería en móviles
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    });
  }, { threshold: 0.1 });

  observer.observe(heroSection);

  // Resize Listener
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
}

/**
 * ==========================================================================
 * 4. CONTADOR REGRESIVO Y CONFETI
 * ==========================================================================
 */
function initCountdown() {
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const timerGrid = document.getElementById("timer-container");
  const celebrationMsg = document.getElementById("celebration-message");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const targetTime = EVENT_CONFIG.eventDate.getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetTime - now;

    if (difference <= 0) {
      // Llegó a cero
      clearInterval(timerInterval);
      if (timerGrid) timerGrid.classList.add("hidden");
      if (celebrationMsg) {
        celebrationMsg.classList.remove("hidden");
        triggerConfettiCelebration();
      }
      return;
    }

    // Cálculos de tiempo
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Formateo con ceros iniciales
    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  // Ejecutar de inmediato y programar intervalo
  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);
}

// Generador de Confeti para la celebración final
function triggerConfettiCelebration() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;

  canvas.style.display = "block";
  const ctx = canvas.getContext("2d");
  let confettiArray = [];
  let confettiAnimationId = null;

  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;

  const colors = [
    "#C9A84C", // Dorado
    "#F2D2D8", // Rosa
    "#8FAF8F", // Sage
    "#FDF8F2", // Crema
    "#FFD700", // Amarillo brillante
  ];

  class ConfettiPiece {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * -canvas.height - 20;
      this.size = Math.random() * 8 + 4;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.speedY = Math.random() * 3 + 2;
      this.speedX = Math.random() * 2 - 1;
      this.rotation = Math.random() * 360;
      this.rotationSpeed = Math.random() * 4 - 2;
    }

    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;

      // Reiniciar caída si sale de los límites
      if (this.y > canvas.height) {
        this.y = -20;
        this.x = Math.random() * canvas.width;
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.fillStyle = this.color;
      // Dibujar rectángulos rotados como pedacitos de papel
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // Inicializar piezas de confeti (cantidad reducida en móvil)
  const pieceCount = window.innerWidth < 600 ? 40 : 100;
  for (let i = 0; i < pieceCount; i++) {
    confettiArray.push(new ConfettiPiece());
  }

  function animateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiArray.forEach(piece => {
      piece.update();
      piece.draw();
    });

    confettiAnimationId = requestAnimationFrame(animateConfetti);
  }

  animateConfetti();

  // Detener la animación después de 5 segundos para no consumir recursos indefinidamente
  setTimeout(() => {
    // Desvanecer canvas suavemente mientras continúa la animación
    canvas.style.transition = "opacity 1.5s ease-out";
    canvas.style.opacity = "0";
    
    // Cancelar el frame y ocultar tras terminar el fade-out de 1.5s
    setTimeout(() => {
      if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
      }
      canvas.style.display = "none";
    }, 1500);
  }, 5000);
}

/**
 * ==========================================================================
 * 5. ANIMACIONES DE ENTRADA AL HACER SCROLL (IntersectionObserver)
 * ==========================================================================
 */
function initScrollAnimations() {
  const reveals = document.querySelectorAll(".reveal");

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.1, // Gatilla cuando el 10% del elemento es visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        // Desregistrar una vez animado
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach((element) => {
    observer.observe(element);
  });
}

/**
 * ==========================================================================
 * 6. PARALLAX ELEGANTE EN EL HERO (requestAnimationFrame)
 * ==========================================================================
 */
function initHeroParallax() {
  const heroContent = document.querySelector(".hero-content");
  const decor50 = document.querySelector(".decor-50-bg");
  if (!heroContent) return;

  let lastScrollY = 0;
  let ticking = false;

  function updateParallax() {
    // Desplazar el contenido del Hero más lento que el scroll
    if (window.scrollY < window.innerHeight) {
      const scrollFactor = window.scrollY;
      heroContent.style.transform = `translateY(${scrollFactor * 0.3}px)`;
      if (decor50) {
        decor50.style.transform = `translate(-50%, calc(-50% + ${scrollFactor * 0.15}px))`;
      }
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
}

/**
 * ==========================================================================
 * 7. VISUALIZADOR DE GALERÍA (LIGHTBOX CON SOPORTE TÁCTIL Y TECLADO)
 * ==========================================================================
 */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const closeBtn = document.querySelector(".lightbox-close");
  const prevBtn = document.querySelector(".lightbox-prev");
  const nextBtn = document.querySelector(".lightbox-next");

  if (!lightbox || galleryItems.length === 0) return;

  let currentIndex = 0;
  const imageSources = [];
  const imageCaptions = [];

  // Almacenar info de imágenes
  galleryItems.forEach((item, index) => {
    const img = item.querySelector("img");
    if (img) {
      imageSources.push(img.src);
      imageCaptions.push(img.alt || `Momento de Helena ${index + 1}`);
    }

    item.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  function openLightbox(index) {
    currentIndex = index;
    updateLightboxContent();
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Deshabilitar scroll de fondo
  }

  function closeLightbox() {
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Rehabilitar scroll de fondo
  }

  function updateLightboxContent() {
    lightboxImg.src = imageSources[currentIndex];
    lightboxCaption.textContent = imageCaptions[currentIndex];
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % imageSources.length;
    updateLightboxContent();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + imageSources.length) % imageSources.length;
    updateLightboxContent();
  }

  // Asignar eventos de click
  closeBtn.addEventListener("click", closeLightbox);
  nextBtn.addEventListener("click", showNext);
  prevBtn.addEventListener("click", showPrev);

  // Cerrar al hacer clic fuera de la foto (en el overlay)
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Soporte de navegación por teclado (Accesibilidad)
  document.addEventListener("keydown", (e) => {
    if (lightbox.getAttribute("aria-hidden") === "false") {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    }
  });

  // --- SOPORTE DE DESLIZAMIENTO TÁCTIL (SWIPE) ---
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  }, { passive: true });

  function handleSwipeGesture() {
    const swipeThreshold = 50; // Pixels mínimos para considerar deslizamiento
    const swipeLength = touchEndX - touchStartX;

    if (Math.abs(swipeLength) > swipeThreshold) {
      if (swipeLength > 0) {
        // Desliza a la derecha -> Foto anterior
        showPrev();
      } else {
        // Desliza a la izquierda -> Foto siguiente
        showNext();
      }
    }
  }
}

/**
 * ==========================================================================
 * 8. FORMULARIO RSVP Y ENVÍO POR WHATSAPP
 * ==========================================================================
 */
function initRSVPForm() {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  const nameInput    = document.getElementById("rsvp-name");
  const messageInput = document.getElementById("rsvp-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateForm()) sendRSVPToWhatsApp();
  });

  nameInput.addEventListener("input", () => {
    nameInput.parentElement.classList.remove("invalid");
  });

  function validateForm() {
    if (nameInput.value.trim() === "") {
      nameInput.parentElement.classList.add("invalid");
      return false;
    }
    nameInput.parentElement.classList.remove("invalid");
    return true;
  }

  function sendRSVPToWhatsApp() {
    const name       = nameInput.value.trim();
    const userMsg    = messageInput.value.trim();

    let messageText  = `🎂 *CONFIRMACIÓN DE ASISTENCIA* 🎂\n\n`;
    messageText     += `Hola, confirmo que asistiré a la celebración de los 50 años de *${EVENT_CONFIG.momName}* 🥂\n\n`;
    messageText     += `👤 *Nombre:* ${name}\n`;

    if (userMsg !== "") {
      messageText   += `\n💛 *Mensaje para Odilia:*\n"${userMsg}"\n`;
    }

    messageText += `\n¡Hasta pronto! 🌸`;

    const encodedMessage = encodeURIComponent(messageText);
    const whatsappUrl    = `https://wa.me/${EVENT_CONFIG.whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  }
}

/**
 * ==========================================================================
 * 9. VIDEO AUTOPLAY AL HACER SCROLL (estilo TikTok)
 * ==========================================================================
 */
function initVideoAutoplay() {
  const video = document.getElementById("event-video");
  if (!video) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        video.play().catch(() => {
          // Algunos navegadores bloquean autoplay sin interacción
          // En ese caso el usuario toca play manualmente
        });
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.5 }); // Se activa cuando el 50% del video es visible

  observer.observe(video);
  
}