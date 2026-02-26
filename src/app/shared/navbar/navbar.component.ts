import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar__inner">
        <a routerLink="/" class="navbar__brand">Wilky</a>

        <div class="navbar__links">
          @if (auth.isLoggedIn()) {
            <a routerLink="/feed"      routerLinkActive="active">Feed</a>
            <a routerLink="/projects"  routerLinkActive="active">Projects</a>
            <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
            @if (auth.profile(); as p) {
              <a [routerLink]="['/u', p.username]" routerLinkActive="active">My Page</a>
            }
            <button class="navbar__btn navbar__btn--ghost" (click)="auth.signOut()">
              Sign out
            </button>
          } @else {
            <a routerLink="/login" class="navbar__btn navbar__btn--accent" style="color: #000">Sign in</a>
          }
        </div>

        <button class="navbar__hamburger" (click)="menuOpen = !menuOpen"
                [class.open]="menuOpen" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>

      @if (menuOpen) {
        <div class="navbar__mobile" (click)="menuOpen = false">
          @if (auth.isLoggedIn()) {
            <a routerLink="/feed">Feed</a>
            <a routerLink="/projects">Projects</a>
            <a routerLink="/dashboard">Dashboard</a>
            @if (auth.profile(); as p) {
              <a [routerLink]="['/u', p.username]">My Page</a>
            }
            <button (click)="auth.signOut()">Sign out</button>
          } @else {
            <a routerLink="/login">Sign in</a>
          }
        </div>
      }
    </nav>
  `,
  styles: [`
    .navbar {
      position: sticky; top: 0; z-index: 100;
      background: var(--bg-primary, #0f0f13);
      border-bottom: 1px solid var(--border, #1e1e24);
      backdrop-filter: blur(12px);
    }
    .navbar__inner {
      max-width: 1200px; margin: 0 auto;
      padding: 0 1.5rem; height: 64px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .navbar__brand {
      text-decoration: none;
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-weight: 700; font-size: 1.3rem;
      color: var(--accent, #4a9ebb);
      letter-spacing: -0.02em;
    }
    .navbar__links {
      display: flex; align-items: center; gap: 1.5rem;
    }
    .navbar__links a {
      color: var(--text-secondary, #71717a);
      text-decoration: none; font-size: 0.9rem;
      transition: color 0.2s;
    }
    .navbar__links a:hover,
    .navbar__links a.active { color: var(--accent, #4a9ebb); }
    .navbar__btn {
      border: none; cursor: pointer; font-size: 0.9rem;
      padding: 0.35rem 0.85rem; border-radius: 6px;
      transition: all 0.2s;
    }
    .navbar__btn--accent {
      background: var(--accent, #4a9ebb);
      color: var(--bg-primary, #0f0f13);
    }
    .navbar__btn--accent:hover { filter: brightness(1.15); }
    .navbar__btn--ghost {
      background: transparent;
      color: var(--text-secondary, #71717a);
    }
    .navbar__btn--ghost:hover { color: var(--accent, #4a9ebb); }

    .navbar__hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: pointer; padding: 0.25rem;
    }
    .navbar__hamburger span {
      display: block; width: 22px; height: 2px;
      background: var(--text-primary, #e4e4e7);
      transition: all 0.3s;
    }
    .navbar__hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .navbar__hamburger.open span:nth-child(2) { opacity: 0; }
    .navbar__hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

    .navbar__mobile {
      display: none; flex-direction: column;
      padding: 0.75rem 1.5rem;
      border-top: 1px solid var(--border, #1e1e24);
      background: var(--bg-primary, #0f0f13);
    }
    .navbar__mobile a, .navbar__mobile button {
      color: var(--text-secondary, #71717a);
      text-decoration: none; padding: 0.5rem 0;
      font-size: 0.95rem; background: none;
      border: none; text-align: left; cursor: pointer;
    }
    .navbar__mobile a:hover, .navbar__mobile button:hover {
      color: var(--accent, #4a9ebb);
    }

    @media (max-width: 768px) {
      .navbar__links     { display: none; }
      .navbar__hamburger { display: flex; }
      .navbar__mobile    { display: flex; }
    }
  `],
})
export class NavbarComponent {
  menuOpen = false;
  constructor(public auth: AuthService) {}
}