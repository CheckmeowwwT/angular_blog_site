import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { SignupComponent } from './pages/signup/signup.component';

export const routes: Routes = [
  // ── Public ────────────────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'feed',
    loadComponent: () =>
      import('./pages/feed/feed.component').then(m => m.FeedComponent),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./pages/blog-post/blog-post.component').then(m => m.BlogPostComponent),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/projects/projects.component').then(m => m.ProjectsComponent),
  },
  {
    path: 'projects/:slug',
    loadComponent: () =>
      import('./pages/project-detail/project-detail.component').then(m => m.ProjectDetailComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },

  // ── User public profile ──────────────────────────────
  {
    path: 'u/:username',
    loadComponent: () =>
      import('./pages/user-home/user-home.component').then(m => m.UserHomeComponent),

  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./pages/signup/signup.component').then(m => m.SignupComponent),
  },
  // ── Authenticated: Dashboard ─────────────────────────
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard-shell.component').then(m => m.DashboardShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./pages/dashboard/overview/overview.component').then(m => m.OverviewComponent),
      },
      {
        path: 'customize',
        loadComponent: () =>
          import('./pages/dashboard/customize/customize.component').then(m => m.CustomizeComponent),
      },
      {
        path: 'posts/new',
        loadComponent: () =>
          import('./pages/admin/post-editor/post-editor.component').then(m => m.PostEditorComponent),
      },
      {
        path: 'posts/:id/edit',
        loadComponent: () =>
          import('./pages/admin/post-editor/post-editor.component').then(m => m.PostEditorComponent),
      },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./pages/admin/project-editor/project-editor.component').then(m => m.ProjectEditorComponent),
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () =>
          import('./pages/admin/project-editor/project-editor.component').then(m => m.ProjectEditorComponent),
      },
      
    ],
  },

  // ── Fallback ─────────────────────────────────────────
  { path: '**', redirectTo: '' },
];