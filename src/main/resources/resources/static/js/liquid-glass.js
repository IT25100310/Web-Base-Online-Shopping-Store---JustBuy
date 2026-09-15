// ==========================================================
// JustBuy — Liquid Glass UI Effects (dashersw/liquid-glass-js)
// ==========================================================

export class LiquidGlass {
  static init() {
    this.attachGlowListeners();
    this.attach3DTilt();
    this.attachLiquidButtons();

    // Re-bind on dynamic DOM renders
    const observer = new MutationObserver(() => {
      this.attachGlowListeners();
      this.attach3DTilt();
      this.attachLiquidButtons();
    });

    const app = document.getElementById('app');
    if (app) {
      observer.observe(app, { childList: true, subtree: true });
    }
  }

  // 1. Dynamic Cursor Specular Glow on Glass Elements
  static attachGlowListeners() {
    const glassElements = document.querySelectorAll('.glass, .glass-lg, .product-card, .btn-glass, .category-card');
    
    glassElements.forEach(el => {
      if (el.dataset.glowAttached) return;
      el.dataset.glowAttached = 'true';

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        el.style.setProperty('--mouse-x', `${x}px`);
        el.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // 2. 3D Tilt Dynamics for Cards & Showcases
  static attach3DTilt() {
    const tiltElements = document.querySelectorAll('.tilt-3d, .product-card, .category-card');

    tiltElements.forEach(el => {
      if (el.dataset.tiltAttached) return;
      el.dataset.tiltAttached = 'true';

      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Calculate rotation angles (-8deg to 8deg)
        const rotateY = ((mouseX / width) - 0.5) * 14;
        const rotateX = -((mouseY / height) - 0.5) * 14;

        el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px) scale3d(1.02, 1.02, 1.02)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale3d(1, 1, 1)';
      });
    });
  }

  // 3. Liquid Glass Ripple on Buttons
  static attachLiquidButtons() {
    const buttons = document.querySelectorAll('.btn-liquid, .btn-primary, .btn-glass');

    buttons.forEach(btn => {
      if (btn.dataset.liquidAttached) return;
      btn.dataset.liquidAttached = 'true';

      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const circle = document.createElement('span');
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('liquid-ripple');

        const existingRipple = btn.getElementsByClassName('liquid-ripple')[0];
        if (existingRipple) existingRipple.remove();

        btn.appendChild(circle);
      });
    });
  }
}
