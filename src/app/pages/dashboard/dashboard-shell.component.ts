import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PostService } from '../../core/services/post.service';
import { ProjectService } from '../../core/services/project.service';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="dash">
      <!-- Sidebar -->
      <aside class="dash__sidebar" [class.open]="sidebarOpen">
        <div class="dash__sidebar-header">
          <span class="dash__sidebar-title">Dashboard</span>
          <button class="dash__close" (click)="sidebarOpen = false">✕</button>
        </div>

        <nav class="dash__nav">
          <a routerLink="/dashboard" routerLinkActive="active"
             [routerLinkActiveOptions]="{exact:true}"
             (click)="sidebarOpen = false">
            <span class="dash__icon">◻</span> Overview
          </a>
          <a routerLink="/dashboard/customize" routerLinkActive="active"
             (click)="sidebarOpen = false">
            <span class="dash__icon">◈</span> Customize
          </a>

          <span class="dash__divider">Content</span>

          <button class="dash__nav-btn" (click)="newPost(); sidebarOpen = false">
            <span class="dash__icon">+</span> New Post
          </button>
          <button class="dash__nav-btn" (click)="newProject(); sidebarOpen = false">
            <span class="dash__icon">+</span> New Project
          </button>
        </nav>

        <div class="dash__sidebar-section">
          <span class="dash__section-label">Quick Links</span>
          @if (auth.profile(); as p) {
            <a [href]="'/u/' + p.username" target="_blank" class="dash__ext-link">
              <span class="dash__icon">↗</span> View My Page
            </a>
          }
        </div>

        <div class="dash__sidebar-footer">
          @if (auth.profile(); as p) {
            <div class="dash__user">
              <div class="dash__user-avatar">
                {{ (p.display_name || p.username || '?').charAt(0).toUpperCase() }}
              </div>
              <span class="dash__user-name">{{ p.display_name || p.username }}</span>
            </div>
          }
        </div>
      </aside>

      <!-- Mobile fab -->
      <button class="dash__menu-btn" (click)="sidebarOpen = true">☰ Menu</button>

      <!-- Main -->
      <main class="dash__main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .dash {
      display: flex;
      min-height: calc(100vh - 64px);
    }

    /* Sidebar */
    .dash__sidebar {
      width: 240px; flex-shrink: 0;
      background: var(--bg-secondary, #18181b);
      border-right: 1px solid var(--border, #1e1e24);
      padding: 1.5rem 0;
      display: flex; flex-direction: column;
    }
    .dash__sidebar-header {
      padding: 0 1.25rem; margin-bottom: 1.25rem;
      display: flex; align-items: center; justify-content: space-between;
    }
    .dash__sidebar-title {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 1rem;
      color: var(--text-primary, #e4e4e7);
    }
    .dash__close {
      display: none;
      background: none; border: none;
      color: var(--text-secondary, #71717a);
      font-size: 1.2rem; cursor: pointer;
    }

    /* Nav */
    .dash__nav { display: flex; flex-direction: column; }
    .dash__nav a, .dash__ext-link {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 1.25rem;
      color: var(--text-secondary, #71717a);
      text-decoration: none; font-size: 0.9rem;
      transition: all 0.2s;
    }
    .dash__nav a:hover, .dash__ext-link:hover {
      color: var(--text-primary, #e4e4e7);
      background: rgba(255,255,255,0.04);
    }
    .dash__nav a.active {
      color: var(--accent, #8b5cf6);
      background: rgba(139,92,246,0.08);
      border-right: 3px solid var(--accent, #8b5cf6);
    }
    .dash__icon { font-size: 0.85rem; width: 20px; text-align: center; }
    .dash__divider {
      display: block;
      padding: 1.25rem 1.25rem 0.25rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary, #71717a);
      opacity: 0.6;
    }

    .dash__nav-btn {
      display: flex; align-items: center; gap: 0.5rem;
      padding: 0.55rem 1.25rem;
      color: var(--text-secondary, #71717a);
      background: none; border: none;
      font-size: 0.9rem; cursor: pointer;
      width: 100%; text-align: left;
      transition: all 0.2s;
    }
    .dash__nav-btn:hover {
      color: var(--text-primary, #e4e4e7);
      background: rgba(255,255,255,0.04);
    }

    /* Sidebar sections */
    .dash__sidebar-section {
      margin-top: 1.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border, #1e1e24);
    }
    .dash__section-label {
      display: block;
      padding: 0 1.25rem 0.25rem;
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--text-secondary, #71717a);
      opacity: 0.6;
    }
    .dash__sidebar-footer {
      margin-top: auto;
      padding: 1rem 1.25rem 0;
      border-top: 1px solid var(--border, #1e1e24);
    }
    .dash__user {
      display: flex; align-items: center; gap: 0.5rem;
    }
    .dash__user-avatar {
      width: 28px; height: 28px;
      border-radius: 50%;
      background: var(--accent, #8b5cf6);
      color: var(--bg-primary, #0f0f13);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.8rem; font-weight: 700;
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
    }
    .dash__user-name {
      font-size: 0.85rem;
      color: var(--text-primary, #e4e4e7);
    }

    /* Main */
    .dash__main {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    /* Mobile */
    .dash__menu-btn {
      display: none;
      position: fixed;
      bottom: 1.25rem; right: 1.25rem;
      z-index: 50;
      background: var(--accent, #8b5cf6);
      color: var(--bg-primary, #0f0f13);
      border: none; border-radius: 999px;
      padding: 0.5rem 1.25rem;
      font-size: 0.9rem; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    @media (max-width: 768px) {
      .dash__sidebar {
        position: fixed; inset: 0; z-index: 200;
        width: 100%;
        transform: translateX(-100%);
        transition: transform 0.3s;
      }
      .dash__sidebar.open { transform: translateX(0); }
      .dash__close    { display: block; }
      .dash__menu-btn { display: block; }
      .dash__main     { padding: 1.25rem; }
    }
  `],
})
export class DashboardShellComponent {
  sidebarOpen = false;
  constructor(
    public auth: AuthService,
    private postSvc: PostService,
    private projectSvc: ProjectService,
    private router: Router,
  ) {}

  async newPost() {
    const uid = this.auth.user()?.id;
    if (!uid) return;
    const p = await this.postSvc.createPost({
      author_id: uid,
      title: 'Untitled Post',
      slug: 'untitled-' + Date.now(),
      content: '',
      tags: [],
      published: false,
      featured: false,
    });
    this.router.navigate(['/dashboard/posts', p.id, 'edit']);
  }

  async newProject() {
    const uid = this.auth.user()?.id;
    if (!uid) return;
    const p = await this.projectSvc.createProject({
      author_id: uid,
      title: 'Untitled Project',
      slug: 'untitled-' + Date.now(),
      tech_stack: [],
      images: [],
      featured: false,
      sort_order: 0,
    });
    this.router.navigate(['/dashboard/projects', p.id, 'edit']);
  }
}