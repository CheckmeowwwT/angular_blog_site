import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Sign In</h1>
        <p class="subtitle">Admin access only.</p>

        @if (errorMsg()) {
          <div class="error">{{ errorMsg() }}</div>
        }

        <form (ngSubmit)="onSubmit()">
          <label>
            Email
            <input type="email" [(ngModel)]="email" name="email" required autocomplete="email" />
          </label>
          <label>
            Password
            <input type="password" [(ngModel)]="password" name="password" required autocomplete="current-password" />
          </label>
          <button type="submit" class="btn btn-primary" [disabled]="submitting()">
            {{ submitting() ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>

        <div class="divider"><span>or</span></div>

        <button class="btn btn-github" (click)="githubLogin()">
          Sign in with GitHub
        </button>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      display: flex; justify-content: center; align-items: center;
      min-height: 60vh;
    }
    .login-card {
      background: #151515; border: 1px solid #222; border-radius: 12px;
      padding: 2.5rem; width: 100%; max-width: 400px;
    }
    h1 { color: #fff; font-size: 1.5rem; margin: 0 0 0.25rem; }
    .subtitle { color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .error {
      background: #2d1215; border: 1px solid #5c2329; color: #f87171;
      padding: 0.6rem 0.8rem; border-radius: 6px; font-size: 0.85rem;
      margin-bottom: 1rem;
    }
    label {
      display: block; color: #aaa; font-size: 0.85rem; margin-bottom: 1rem;
    }
    input {
      display: block; width: 100%; margin-top: 0.3rem;
      padding: 0.6rem 0.8rem; background: #0a0a0a; border: 1px solid #333;
      border-radius: 6px; color: #e0e0e0; font-size: 0.95rem;
      box-sizing: border-box;
    }
    input:focus { outline: none; border-color: #8b5cf6; }
    .btn {
      width: 100%; padding: 0.65rem; border-radius: 6px; border: none;
      font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary { background: #8b5cf6; color: #fff; }
    .btn-primary:hover { background: #7c3aed; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .divider {
      text-align: center; margin: 1.25rem 0; color: #444; font-size: 0.8rem;
      display: flex; align-items: center; gap: 0.5rem;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px; background: #333;
    }
    .btn-github {
      background: #222; color: #ccc; border: 1px solid #333;
    }
    .btn-github:hover { border-color: #8b5cf6; color: #fff; }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = signal('');
  submitting = signal(false);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    this.errorMsg.set('');
    this.submitting.set(true);
    try {
      await this.auth.signInWithEmail(this.email, this.password);
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'Sign-in failed');
    }
    this.submitting.set(false);
  }

  async githubLogin() {
    try {
      await this.auth.signInWithGithub();
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'GitHub sign-in failed');
    }
  }
}