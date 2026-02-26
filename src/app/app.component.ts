import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="app-shell">
      <app-navbar />
      <main class="main-content">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #0a0a0a;
      color: #e0e0e0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .main-content {
      flex: 1;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
    }
  `],
})
export class AppComponent {}