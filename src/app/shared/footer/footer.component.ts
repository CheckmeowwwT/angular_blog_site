import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <span class="footer__brand">Wilky</span>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid var(--border, #1e1e24);
      background: var(--bg-secondary, #18181b);
      padding: 1.5rem;
      text-align: center;
      margin-top: auto;
    }
    .footer__brand {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--accent, #8b5cf6);
      letter-spacing: -0.02em;
    }
  `],
})
export class FooterComponent {}