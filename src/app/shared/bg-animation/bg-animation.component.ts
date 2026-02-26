import {
    Component, Input, OnChanges, OnDestroy, ElementRef, ViewChild,
    AfterViewInit, SimpleChanges,
  } from '@angular/core';
  import { AnimationType } from '../../core/models/models';
  
  /**
   * Place this anywhere and pass [animation]="'particles'" etc.
   * It fills its parent container with a canvas animation.
   *
   * Usage:
   *   <app-bg-animation [animation]="prefs()?.animation ?? 'none'"
   *                      [accent]="prefs()?.accent_color ?? '#8b5cf6'">
   *   </app-bg-animation>
   */
  @Component({
    selector: 'app-bg-animation',
    standalone: true,
    template: `<canvas #cvs class="bg-anim"></canvas>`,
    styles: [`
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
      }
      .bg-anim {
        width: 100%; height: 100%;
        display: block;
      }
    `],
  })
  export class BgAnimationComponent implements AfterViewInit, OnChanges, OnDestroy {
    @ViewChild('cvs', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
    @Input() animation: AnimationType = 'none';
    @Input() accent = '#8b5cf6';
  
    private animId = 0;
    private ctx!: CanvasRenderingContext2D;
    private w = 0;
    private h = 0;
    private t = 0;
    private state: any[] = [];
  
    ngAfterViewInit() {
      this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
      this.resize();
      window.addEventListener('resize', this.resize);
      this.start();
    }
  
    ngOnChanges(changes: SimpleChanges) {
      if ((changes['animation'] || changes['accent']) && this.ctx) {
        this.stop();
        this.init();
        this.start();
      }
    }
  
    ngOnDestroy() {
      this.stop();
      window.removeEventListener('resize', this.resize);
    }
  
    private resize = () => {
      const c = this.canvasRef.nativeElement;
      this.w = c.width = c.offsetWidth;
      this.h = c.height = c.offsetHeight;
      this.init();
    };
  
    private rgb(): string {
      const hex = this.accent.replace('#', '');
      return `${parseInt(hex.substring(0,2),16)},${parseInt(hex.substring(2,4),16)},${parseInt(hex.substring(4,6),16)}`;
    }
  
    // ── init per animation type ─────────────────────────
    private init() {
      this.state = [];
      switch (this.animation) {
        case 'particles':
          const n = Math.floor((this.w * this.h) / 10000);
          for (let i = 0; i < n; i++) {
            this.state.push({
              x: Math.random() * this.w,
              y: Math.random() * this.h,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              r: Math.random() * 2 + 0.5,
              a: Math.random() * 0.5 + 0.15,
            });
          }
          break;
        case 'snow':
          for (let i = 0; i < 80; i++) {
            this.state.push({
              x: Math.random() * this.w,
              y: Math.random() * this.h,
              r: Math.random() * 3 + 1,
              speed: Math.random() * 0.8 + 0.2,
              wobble: Math.random() * Math.PI * 2,
            });
          }
          break;
        case 'matrix':
          const cols = Math.floor(this.w / 16);
          for (let i = 0; i < cols; i++) {
            this.state.push({
              x: i * 16,
              y: Math.random() * this.h * -1,
              speed: Math.random() * 3 + 1.5,
              chars: Array.from({ length: 20 }, () =>
                String.fromCharCode(0x30A0 + Math.random() * 96)),
            });
          }
          break;
      }
    }
  
    // ── main loop ───────────────────────────────────────
    private start() {
      if (this.animation === 'none') return;
      const loop = () => {
        this.t++;
        this.draw();
        this.animId = requestAnimationFrame(loop);
      };
      loop();
    }
  
    private stop() {
      cancelAnimationFrame(this.animId);
    }
  
    private draw() {
      const { ctx, w, h } = this;
      const rgb = this.rgb();
  
      switch (this.animation) {
        // ── particles ──────────────────────────────
        case 'particles': {
          ctx.clearRect(0, 0, w, h);
          for (const p of this.state) {
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb},${p.a})`;
            ctx.fill();
          }
          for (let i = 0; i < this.state.length; i++) {
            for (let j = i + 1; j < this.state.length; j++) {
              const a = this.state[i], b = this.state[j];
              const d = Math.hypot(a.x - b.x, a.y - b.y);
              if (d < 120) {
                ctx.beginPath();
                ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = `rgba(${rgb},${0.08 * (1 - d / 120)})`;
                ctx.stroke();
              }
            }
          }
          break;
        }
  
        // ── gradient ───────────────────────────────
        case 'gradient': {
          const shift = this.t * 0.005;
          const g = ctx.createLinearGradient(
            w * (0.5 + 0.5 * Math.sin(shift)),
            0,
            w * (0.5 + 0.5 * Math.cos(shift)),
            h,
          );
          g.addColorStop(0, `rgba(${rgb}, 0.12)`);
          g.addColorStop(0.5, `rgba(${rgb}, 0.04)`);
          g.addColorStop(1, `rgba(${rgb}, 0.1)`);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          break;
        }
  
        // ── waves ──────────────────────────────────
        case 'waves': {
          ctx.clearRect(0, 0, w, h);
          for (let line = 0; line < 5; line++) {
            ctx.beginPath();
            const baseY = h * 0.3 + line * (h * 0.12);
            const amp = 30 + line * 8;
            const freq = 0.004 - line * 0.0005;
            const speed = this.t * (0.02 + line * 0.005);
            for (let x = 0; x <= w; x += 3) {
              const y = baseY + Math.sin(x * freq + speed) * amp;
              x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.strokeStyle = `rgba(${rgb}, ${0.15 - line * 0.02})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          break;
        }
  
        // ── matrix ─────────────────────────────────
        case 'matrix': {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
          ctx.fillRect(0, 0, w, h);
          ctx.font = '14px monospace';
          for (const col of this.state) {
            const ch = col.chars[Math.floor(Math.random() * col.chars.length)];
            ctx.fillStyle = `rgba(${rgb}, 0.7)`;
            ctx.fillText(ch, col.x, col.y);
            col.y += col.speed;
            if (col.y > h) col.y = -20;
          }
          break;
        }
  
        // ── snow ───────────────────────────────────
        case 'snow': {
          ctx.clearRect(0, 0, w, h);
          for (const s of this.state) {
            s.wobble += 0.01;
            s.x += Math.sin(s.wobble) * 0.5;
            s.y += s.speed;
            if (s.y > h) { s.y = -5; s.x = Math.random() * w; }
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb}, 0.4)`;
            ctx.fill();
          }
          break;
        }
      }
    }
  }