// ============================================
// HERO WAVE ANIMATION — Sine-Wave Interference
// (Source: ambient-effects-dark-mode.js)
// ============================================
(function() {
  class InterferenceRenderer {
    constructor(containerId, options = {}) {
      this.container = document.getElementById(containerId);
      if (!this.container) return;
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.container.appendChild(this.canvas);

      this.width = 0;
      this.height = 0;
      this.time = 0;

      this.mouse = { x: 0, y: 0 };
      this.targetMouse = { x: 0, y: 0 };

      // Customisation — ARX brand colours
      this.colorActive = options.colorActive || '#22D1EE';
      this.colorIdle   = options.colorIdle   || '#7C3AED';
      this.bg          = options.bg          || '#08060F';
      this.lines       = options.lines       || 60;
      this.amplitude   = options.amplitude   || 60;

      this.init();

      window.addEventListener('resize', () => this.resize());
      this.container.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.targetMouse.x = e.clientX - rect.left;
        this.targetMouse.y = e.clientY - rect.top;
      });
    }

    init() {
      this.resize();
      this.animate();
    }

    resize() {
      this.width  = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.canvas.width  = this.width;
      this.canvas.height = this.height;
    }

    draw() {
      this.ctx.fillStyle = 'rgba(8, 6, 15, 0.2)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      const pointsPerLine = 100;
      const margin = 100;

      this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.1;
      this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.1;

      for (let i = 0; i < this.lines; i++) {
        const yBase = margin + (i / this.lines) * (this.height - 2 * margin);
        const distY = Math.abs(yBase - this.mouse.y);
        const influence = Math.max(0, 1 - distY / 200);

        for (let j = 0; j < pointsPerLine; j++) {
          const x = margin + (j / pointsPerLine) * (this.width - 2 * margin);

          const wave1 = Math.sin(j * 0.1 + this.time * 0.02 + i * 0.5);
          const wave2 = Math.sin(j * 0.5 - this.time * 0.05);
          const mouseInteraction = influence * Math.sin(j * 0.2 + this.time * 0.1) * 100;

          const yOffset = (wave1 * this.amplitude * 0.5) + (wave2 * 5) + mouseInteraction;

          const noise = Math.sin(x * yBase);
          if (noise > -0.5) {
            const size = 1.5 + (wave1 * 1);
            this.ctx.fillStyle = influence > 0.1 ? this.colorActive : this.colorIdle;
            this.ctx.beginPath();
            this.ctx.rect(x, yBase + yOffset, size, size);
            this.ctx.fill();
          }
        }
      }
    }

    animate() {
      this.time += 1;
      this.draw();
      requestAnimationFrame(() => this.animate());
    }
  }

  // Initialise with ARX brand colours
  new InterferenceRenderer('hero-wave-wrapper', {
    colorActive: '#22D1EE',
    colorIdle:   '#7C3AED',
    bg:          '#08060F',
    lines:       60,
    amplitude:   60
  });
})();
