// ============================================
// NAVBAR & SMOOTH SCROLL
// ============================================

// Navbar background on scroll — keep glass effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(37, 30, 48, 0.65)';
  } else {
    navbar.style.background = 'rgba(37, 30, 48, 0.5)';
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
