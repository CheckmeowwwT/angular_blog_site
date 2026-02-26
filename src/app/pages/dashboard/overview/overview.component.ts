import { Component, OnInit, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../core/services/post.service';
import { ProjectService } from '../../../core/services/project.service';
import { Post, Project } from '../../../core/models/models';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <div class="ov">
      <h1 class="ov__title">Overview</h1>

      <!-- Stat cards -->
      <div class="ov__stats">
        <div class="ov__stat">
          <span class="ov__stat-num">{{ posts().length }}</span>
          <span class="ov__stat-label">Posts</span>
        </div>
        <div class="ov__stat">
          <span class="ov__stat-num">{{ publishedCount() }}</span>
          <span class="ov__stat-label">Published</span>
        </div>
        <div class="ov__stat">
          <span class="ov__stat-num">{{ draftCount() }}</span>
          <span class="ov__stat-label">Drafts</span>
        </div>
        <div class="ov__stat">
          <span class="ov__stat-num">{{ projects().length }}</span>
          <span class="ov__stat-label">Projects</span>
        </div>
      </div>

      <!-- Recent posts -->
      <section class="ov__section">
        <div class="ov__section-header">
          <h2 class="ov__section-title">Recent Posts</h2>
          <button class="ov__action" (click)="newPost()">+ New Post</button>
        </div>

        @if (posts().length) {
          <div class="ov__list">
            @for (p of posts().slice(0, 8); track p.id) {
              <div class="ov__row">
                <div class="ov__row-info">
                  <a [routerLink]="['/dashboard/posts', p.id, 'edit']" class="ov__row-title">
                    {{ p.title || 'Untitled' }}
                  </a>
                  <span class="ov__row-meta">
                    <span class="ov__badge" [class.pub]="p.published">
                      {{ p.published ? 'Published' : 'Draft' }}
                    </span>
                    @if (p.featured) {
                      <span class="ov__badge feat">Featured</span>
                    }
                    <time>{{ p.created_at | date:'mediumDate' }}</time>
                  </span>
                </div>
                <div class="ov__row-actions">
                  <a [routerLink]="['/dashboard/posts', p.id, 'edit']" class="ov__row-edit">Edit</a>
                  <button class="ov__row-del" (click)="deletePost(p)">×</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="ov__empty">No posts yet. <button class="ov__link" (click)="newPost()">Create one →</button></p>
        }
      </section>

      <!-- Projects -->
      <section class="ov__section">
        <div class="ov__section-header">
          <h2 class="ov__section-title">Projects</h2>
          <button class="ov__action" (click)="newProject()">+ New Project</button>
        </div>

        @if (projects().length) {
          <div class="ov__list">
            @for (p of projects().slice(0, 8); track p.id) {
              <div class="ov__row">
                <div class="ov__row-info">
                  <a [routerLink]="['/dashboard/projects', p.id, 'edit']" class="ov__row-title">
                    {{ p.title }}
                  </a>
                  <span class="ov__row-meta">
                    @if (p.featured) {
                      <span class="ov__badge feat">Featured</span>
                    }
                  </span>
                </div>
                <a [routerLink]="['/dashboard/projects', p.id, 'edit']" class="ov__row-edit">Edit</a>
              </div>
            }
          </div>
        } @else {
          <p class="ov__empty">No projects yet. <button class="ov__link" (click)="newProject()">Create one →</button></p>
        }
      </section>
    </div>
  `,
  styles: [`
    .ov__title {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 1.6rem;
      color: var(--text-primary, #e4e4e7);
      margin-bottom: 2rem;
    }

    /* Stats */
    .ov__stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem; margin-bottom: 3rem;
    }
    .ov__stat {
      background: var(--bg-secondary, #18181b);
      border: 1px solid var(--border, #1e1e24);
      border-radius: 10px;
      padding: 1.25rem;
      display: flex; flex-direction: column; gap: 0.25rem;
    }
    .ov__stat-num {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 1.8rem; font-weight: 700;
      color: var(--accent, #8b5cf6);
    }
    .ov__stat-label {
      font-size: 0.8rem;
      color: var(--text-secondary, #71717a);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* Sections */
    .ov__section { margin-bottom: 3rem; }
    .ov__section-header {
      display: flex; align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }
    .ov__section-title {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 1.1rem;
      color: var(--text-primary, #e4e4e7);
    }
    .ov__action {
      background: none; border: none; cursor: pointer;
      color: var(--accent, #8b5cf6);
      font-size: 0.85rem;
    }
    .ov__action:hover { text-decoration: underline; }

    /* List */
    .ov__list { display: flex; flex-direction: column; }
    .ov__row {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--border, #1e1e24);
    }
    .ov__row:last-child { border-bottom: none; }
    .ov__row-info { display: flex; flex-direction: column; gap: 2px; }
    .ov__row-title {
      color: var(--text-primary, #e4e4e7);
      text-decoration: none; font-size: 0.95rem;
    }
    .ov__row-title:hover { color: var(--accent, #8b5cf6); }
    .ov__row-meta {
      display: flex; align-items: center; gap: 0.75rem;
    }
    .ov__badge {
      font-size: 0.7rem; padding: 0.12rem 0.45rem; border-radius: 10px;
      background: var(--bg-primary, #0f0f13);
      color: var(--text-secondary, #71717a);
    }
    .ov__badge.pub { background: #14532d; color: #4ade80; }
    .ov__badge.feat { background: #422006; color: #fbbf24; }
    .ov__row-meta time {
      color: var(--text-secondary, #71717a);
      font-size: 0.78rem;
    }
    .ov__row-actions { display: flex; align-items: center; gap: 0.75rem; }
    .ov__row-edit {
      color: var(--text-secondary, #71717a);
      text-decoration: none; font-size: 0.8rem;
    }
    .ov__row-edit:hover { color: var(--accent, #8b5cf6); }
    .ov__row-del {
      background: none; border: none;
      color: var(--text-secondary, #71717a);
      font-size: 1rem; cursor: pointer;
      transition: color 0.15s;
    }
    .ov__row-del:hover { color: #f87171; }
    .ov__empty {
      color: var(--text-secondary, #71717a);
      padding: 1rem;
      font-size: 0.9rem;
    }
    .ov__link {
      background: none; border: none; cursor: pointer;
      color: var(--accent, #8b5cf6); font-size: inherit;
    }
  `],
})
export class OverviewComponent implements OnInit {
  posts = signal<Post[]>([]);
  projects = signal<Project[]>([]);

  publishedCount = computed(() => this.posts().filter(p => p.published).length);
  draftCount = computed(() => this.posts().filter(p => !p.published).length);

  constructor(
    private auth: AuthService,
    private postSvc: PostService,
    private projectSvc: ProjectService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const uid = this.auth.user()?.id;
    if (!uid) return;
    const [posts, projects] = await Promise.all([
      this.postSvc.getAllPostsForAuthor(uid),
      this.projectSvc.getAllProjectsForAuthor(uid),
    ]);
    this.posts.set(posts);
    this.projects.set(projects);
  }

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

  async deletePost(post: Post) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    await this.postSvc.deletePost(post.id);
    this.posts.update(list => list.filter(p => p.id !== post.id));
  }
}