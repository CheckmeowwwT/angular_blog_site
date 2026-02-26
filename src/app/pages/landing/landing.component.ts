import {
    Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit,
  } from '@angular/core';
  import { RouterLink } from '@angular/router';
  import { AuthService } from '../../core/services/auth.service';
  
  @Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterLink],
    template: `
      <section class="land">
        <canvas #bgCanvas class="land__canvas"></canvas>
  
        <div class="land__content">
          <h1 class="land__title">
            <span class="land__welcome">Welcome to</span>
            <span class="land__name">Wilky</span>
          </h1>
          <p class="land__sub">A place to share your work.</p>
  
          <div class="land__actions">
            @if (auth.isLoggedIn()) {
              <a routerLink="/dashboard" class="land__btn land__btn--primary">
                Go to Dashboard
              </a>
              @if (auth.profile(); as p) {
                <a [routerLink]="['/u', p.username]" class="land__btn land__btn--ghost">
                  View My Page
                </a>
              }
            } @else {
              <a routerLink="/login" class="land__btn land__btn--primary">Get Started</a>
            }
          </div>
        </div>
      </section>
    `,
    styles: [`
      .land {
        position: relative;
        min-height: calc(100vh - 64px);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
  
      /* Particle canvas background */
      .land__canvas {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      }
  
      .land__content {
        position: relative;
        z-index: 1;
        text-align: center;
        padding: 2rem;
      }
  
      .land__title {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
      }
  
      .land__welcome {
        font-size: 1.1rem;
        font-weight: 400;
        color: var(--text-secondary, #71717a);
        letter-spacing: 0.15em;
        text-transform: uppercase;
        opacity: 0;
        animation: fadeSlideUp 0.8s ease forwards;
        animation-delay: 0.2s;
      }
  
      .land__name {
        font-family: var(--font-mono, 'JetBrains Mono', monospace);
        font-size: clamp(3rem, 10vw, 7rem);
        font-weight: 800;
        color: var(--accent, #8b5cf6);
        letter-spacing: -0.03em;
        line-height: 1;
        opacity: 0;
        animation: fadeScaleIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        animation-delay: 0.5s;
        /* subtle glow */
        text-shadow:
          0 0 40px rgba(139, 92, 246, 0.3),
          0 0 80px rgba(139, 92, 246, 0.15);
      }
  
      .land__sub {
        font-size: 1.05rem;
        color: var(--text-secondary, #71717a);
        margin-top: 1rem;
        opacity: 0;
        animation: fadeSlideUp 0.8s ease forwards;
        animation-delay: 1s;
      }
  
      .land__actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
        opacity: 0;
        animation: fadeSlideUp 0.8s ease forwards;
        animation-delay: 1.3s;
      }
  
      .land__btn {
        text-decoration: none;
        padding: 0.65rem 1.6rem;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.25s;
      }
      .land__btn--primary {
        background: var(--accent, #8b5cf6);
        color: var(--bg-primary, #0f0f13);
      }
      .land__btn--primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
      .land__btn--ghost {
        background: transparent;
        color: var(--text-secondary, #71717a);
        border: 1px solid var(--border, #1e1e24);
      }
      .land__btn--ghost:hover {
        color: var(--accent, #8b5cf6);
        border-color: var(--accent, #8b5cf6);
      }
  
      @keyframes fadeSlideUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes fadeScaleIn {
        from { opacity: 0; transform: scale(0.85); }
        to   { opacity: 1; transform: scale(1); }
      }
    `],
  })
  export class LandingComponent implements AfterViewInit, OnDestroy {
    @ViewChild('bgCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
    private animId = 0;
    private particles: { x: number; y: number; vx: number; vy: number; r: number; a: number }[] = [];
  
    constructor(public auth: AuthService) {}
  
    ngAfterViewInit() {
      const canvas = this.canvasRef.nativeElement;
      const ctx = canvas.getContext('2d')!;
      let w = 0, h = 0;
  
      const resize = () => {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
      };
      resize();
      window.addEventListener('resize', resize);
  
      // spawn particles
      const count = Math.floor((w * h) / 12000);
      this.particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.8 + 0.5,
        a: Math.random() * 0.5 + 0.15,
      }));
  
      const accent = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim() || '#8b5cf6';
  
      // parse accent to rgb for drawing
      const hexToRgb = (hex: string) => {
        const h = hex.replace('#', '');
        return `${parseInt(h.substring(0,2),16)},${parseInt(h.substring(2,4),16)},${parseInt(h.substring(4,6),16)}`;
      };
      const rgb = hexToRgb(accent);
  
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
  
        for (const p of this.particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
  
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${rgb}, ${p.a})`;
          ctx.fill();
        }
  
        // draw faint lines between nearby particles
        for (let i = 0; i < this.particles.length; i++) {
          for (let j = i + 1; j < this.particles.length; j++) {
            const a = this.particles[i], b = this.particles[j];
            const dx = a.x - b.x, dy = a.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(${rgb}, ${0.08 * (1 - dist / 120)})`;
              ctx.stroke();
            }
          }
        }
  
        this.animId = requestAnimationFrame(draw);
      };
      draw();
    }
  
    ngOnDestroy() {
      cancelAnimationFrame(this.animId);
    }
  }