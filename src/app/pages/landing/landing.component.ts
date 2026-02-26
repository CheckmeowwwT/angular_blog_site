import {
  Component, OnDestroy, ElementRef, ViewChild, AfterViewInit,
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
        <div class="land__logo">
          <svg class="wilky-svg" viewBox="0 0 260 95" xmlns="http://www.w3.org/2000/svg">
            <!-- W -->
            <path class="letter letter--1" d="M10 15 L25 72 L40 35 L55 72 L70 15"
                  fill="none" stroke="#4a9ebb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- i stem -->
            <path class="letter letter--2" d="M95 32 L95 72"
                  fill="none" stroke="#4a9ebb" stroke-width="4" stroke-linecap="round"/>
            <!-- i dot -->
            <circle class="dot" cx="95" cy="18" r="4" fill="#4a9ebb" />
            <!-- l -->
            <path class="letter letter--3" d="M120 15 L120 72"
                  fill="none" stroke="#4a9ebb" stroke-width="4" stroke-linecap="round"/>
            <!-- k -->
            <path class="letter letter--4" d="M150 15 L150 72 M150 48 L173 32 M150 48 L175 72"
                  fill="none" stroke="#4a9ebb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <!-- y -->
            <path class="letter letter--5" d="M205 32 L220 55 M235 32 L213 78 Q207 92 193 88"
                  fill="none" stroke="#4a9ebb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>

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
            <a routerLink="/login" class="land__btn land__btn--primary">Sign In</a>
            <a routerLink="/signup" class="land__btn land__btn--ghost">Create Account</a>
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

    .land__logo {
      display: flex;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .wilky-svg {
      width: clamp(240px, 50vw, 420px);
      height: auto;
      overflow: visible;
    }

    .letter {
      stroke-dasharray: 300;
      stroke-dashoffset: 300;
    }
    .letter--1 { animation: draw 1s ease forwards 0.3s; }
    .letter--2 { animation: draw 0.5s ease forwards 0.9s; }
    .letter--3 { animation: draw 0.5s ease forwards 1.1s; }
    .letter--4 { animation: draw 0.7s ease forwards 1.3s; }
    .letter--5 { animation: draw 0.8s ease forwards 1.7s; }

    .dot {
      opacity: 0;
      transform: translateY(-30px);
      animation: dotDrop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 1.5s;
    }

    @keyframes draw {
      to { stroke-dashoffset: 0; }
    }

    @keyframes dotDrop {
      0%   { opacity: 1; transform: translateY(-30px); }
      60%  { transform: translateY(2px); }
      80%  { transform: translateY(-4px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .land__sub {
      font-size: 1.05rem;
      color: #7a8a8e;
      margin-top: 0.5rem;
      opacity: 0;
      animation: fadeSlideUp 0.8s ease forwards;
      animation-delay: 2.2s;
    }

    .land__actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-top: 2rem;
      opacity: 0;
      animation: fadeSlideUp 0.8s ease forwards;
      animation-delay: 2.5s;
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
      background: #4a9ebb;
      color: #0a0a0a;
    }
    .land__btn--primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
    .land__btn--ghost {
      background: transparent;
      color: #7a8a8e;
      border: 1px solid #333;
    }
    .land__btn--ghost:hover {
      color: #4a9ebb;
      border-color: #4a9ebb;
    }

    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
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

    const count = Math.floor((w * h) / 12000);
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.5,
      a: Math.random() * 0.5 + 0.15,
    }));

    const rgb = '74,158,187';

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