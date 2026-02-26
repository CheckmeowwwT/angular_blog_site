import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="signup-page">
      <div class="signup-card">
        <h1>Create Account</h1>
        <p class="subtitle">Join Wilky.</p>

        @if (errorMsg()) {
          <div class="msg msg--error">{{ errorMsg() }}</div>
        }
        @if (successMsg()) {
          <div class="msg msg--success">{{ successMsg() }}</div>
        }

        @if (!successMsg()) {
          <form (ngSubmit)="onSubmit()">
            <label>
              Display Name
              <input
                type="text"
                [(ngModel)]="displayName"
                name="displayName"
                required
                autocomplete="name"
                placeholder="How others will see you" />
            </label>
            <label>
              Email
              <input
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email" />
            </label>
            <label>
              Password
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="new-password"
                placeholder="At least 6 characters" />
            </label>
            <label>
              Confirm Password
              <input
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                autocomplete="new-password" />
            </label>
            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              {{ submitting() ? 'Creating account…' : 'Sign Up' }}
            </button>
          </form>

          <div class="divider"><span>or</span></div>

          <button class="btn btn-github" (click)="githubSignup()">
            Sign up with GitHub
          </button>
        }

        <p class="footer-text">
          Already have an account? <a routerLink="/login" class="footer-link">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .signup-page {
      display: flex; justify-content: center; align-items: center;
      min-height: 60vh; padding: 2rem 0;
    }
    .signup-card {
      background: #151515; border: 1px solid #222; border-radius: 12px;
      padding: 2.5rem; width: 100%; max-width: 400px;
    }
    h1 { color: #fff; font-size: 1.5rem; margin: 0 0 0.25rem; }
    .subtitle { color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .msg {
      padding: 0.6rem 0.8rem; border-radius: 6px;
      font-size: 0.85rem; margin-bottom: 1rem;
    }
    .msg--error {
      background: #2d1215; border: 1px solid #5c2329; color: #f87171;
    }
    .msg--success {
      background: #0f1f15; border: 1px solid #1e3d28; color: #6ecf8e;
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
    input::placeholder { color: #555; }
    input:focus { outline: none; border-color: #4a9ebb; }
    .btn {
      width: 100%; padding: 0.65rem; border-radius: 6px; border: none;
      font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary { background: #4a9ebb; color: #fff; }
    .btn-primary:hover { background: #5db8d6; }
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
    .btn-github:hover { border-color: #4a9ebb; color: #fff; }
    .footer-text {
      text-align: center; margin-top: 1.25rem;
      font-size: 0.85rem; color: #666;
    }
    .footer-link {
      color: #4a9ebb; text-decoration: none;
    }
    .footer-link:hover { text-decoration: underline; }
  `],
})
export class SignupComponent {
  displayName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMsg = signal('');
  successMsg = signal('');
  submitting = signal(false);

  constructor(private auth: AuthService) {}

  async onSubmit() {
    this.errorMsg.set('');
    this.successMsg.set('');

    if (!this.displayName.trim()) {
      this.errorMsg.set('Please enter a display name.');
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg.set('Password must be at least 6 characters.');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg.set('Passwords do not match.');
      return;
    }

    this.submitting.set(true);
    try {
        await this.auth.signUp(this.email, this.password, this.displayName);
      this.successMsg.set('Check your email for a verification link.');
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'Sign-up failed.');
    }
    this.submitting.set(false);
  }

  async githubSignup() {
    try {
      await this.auth.signInWithGithub();
    } catch (e: any) {
      this.errorMsg.set(e.message ?? 'GitHub sign-up failed.');
    }
  }
}