import { Component, OnInit, OnDestroy, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { PostService } from '../../core/services/post.service';
import { ProjectService } from '../../core/services/project.service';
import { BgAnimationComponent } from '../../shared/bg-animation/bg-animation.component';
import { Profile, Post, Project, UserPreferences } from '../../core/models/models';

@Component({
  selector: 'app-user-home',
  standalone: true,
  imports: [RouterLink, DatePipe, BgAnimationComponent],
  template: `
    @if (profile(); as u) {
      <div class="uh">
        <!-- Background animation -->
        @if (prefs()?.animation && prefs()?.animation !== 'none') {
          <app-bg-animation
            [animation]="prefs()!.animation"
            [accent]="prefs()!.accent_color || '#8b5cf6'">
          </app-bg-animation>
        }

        <!-- Hero -->
        <section class="uh__hero">
          @if (u.avatar_url) {
            <img [src]="u.avatar_url" class="uh__avatar" />
          } @else {
            <div class="uh__avatar uh__avatar--placeholder">
              {{ (u.display_name || u.username || '?').charAt(0).toUpperCase() }}
            </div>
          }
          <h1 class="uh__name">{{ u.display_name || u.username }}</h1>
          @if (u.bio) {
            <p class="uh__bio">{{ u.bio }}</p>
          }
          <div class="uh__links">
            @if (u.github_url) {
              <a [href]="u.github_url" target="_blank" rel="noopener">GitHub</a>
            }
            @if (u.website_url) {
              <a [href]="u.website_url" target="_blank" rel="noopener">Website</a>
            }
          </div>
        </section>

        <!-- Posts -->
        @if (posts().length) {
          <section class="uh__section">
            <h2 class="uh__section-title">Posts</h2>
            <div class="uh__posts">
              @for (p of posts(); track p.id) {
                <a [routerLink]="['/blog', p.slug]" class="uh__post">
                  <time class="uh__post-date">{{ p.created_at | date:'mediumDate' }}</time>
                  <h3 class="uh__post-title">{{ p.title }}</h3>
                  @if (p.excerpt) {
                    <p class="uh__post-excerpt">{{ p.excerpt }}</p>
                  }
                </a>
              }
            </div>
          </section>
        }

        <!-- Projects -->
        @if (projects().length) {
          <section class="uh__section">
            <h2 class="uh__section-title">Projects</h2>
            <div class="uh__projects">
              @for (p of projects(); track p.id) {
                <a [routerLink]="['/projects', p.slug]" class="uh__project">
                  @if (p.cover_image_url) {
                    <img [src]="p.cover_image_url" class="uh__project-img" loading="lazy" />
                  }
                  <div class="uh__project-body">
                    <h3 class="uh__project-title">{{ p.title }}</h3>
                    @if (p.description) {
                      <p class="uh__project-desc">{{ p.description }}</p>
                    }
                    @if (p.tech_stack?.length) {
                      <div class="uh__tech">
                        @for (t of p.tech_stack; track t) {
                          <span class="uh__tech-pill">{{ t }}</span>
                        }
                      </div>
                    }
                  </div>
                </a>
              }
            </div>
          </section>
        }

        @if (loaded() && !posts().length && !projects().length) {
          <p class="uh__empty">Nothing published yet.</p>
        }
      </div>
    } @else if (loaded()) {
      <div class="uh uh--404">
        <h1>User not found</h1>
        <a routerLink="/">← Back home</a>
      </div>
    }
  `,
  styles: [`
    .uh {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
      position: relative;
      z-index: 1;
    }

    /* Hero */
    .uh__hero {
      text-align: center;
      padding-bottom: 3rem;
      border-bottom: 1px solid var(--border, #1e1e24);
      margin-bottom: 3rem;
    }
    .uh__avatar {
      width: 96px; height: 96px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid var(--accent, #8b5cf6);
      margin: 0 auto 1rem;
      display: block;
    }
    .uh__avatar--placeholder {
      display: flex; align-items: center; justify-content: center;
      background: var(--accent, #8b5cf6);
      color: var(--bg-primary, #0f0f13);
      font-size: 2rem; font-weight: 700;
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
    }
    .uh__name {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 1.8rem;
      color: var(--text-primary, #e4e4e7);
    }
    .uh__bio {
      color: var(--text-secondary, #71717a);
      max-width: 540px;
      margin: 0.5rem auto 0;
      line-height: 1.6;
    }
    .uh__links {
      display: flex; justify-content: center; gap: 1rem;
      margin-top: 1rem;
    }
    .uh__links a {
      color: var(--accent, #8b5cf6);
      text-decoration: none;
      font-size: 0.85rem;
    }
    .uh__links a:hover { text-decoration: underline; }

    /* Sections */
    .uh__section { margin-bottom: 3rem; }
    .uh__section-title {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 1.2rem;
      color: var(--text-primary, #e4e4e7);
      margin-bottom: 1.25rem;
    }

    /* Posts */
    .uh__posts { display: flex; flex-direction: column; gap: 1rem; }
    .uh__post {
      display: block;
      padding: 1.25rem;
      background: var(--bg-secondary, #18181b);
      border: 1px solid var(--border, #1e1e24);
      border-radius: 10px;
      text-decoration: none; color: inherit;
      transition: border-color 0.2s;
    }
    .uh__post:hover { border-color: var(--accent, #8b5cf6); }
    .uh__post-date {
      font-size: 0.75rem;
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      color: var(--text-secondary, #71717a);
    }
    .uh__post-title {
      font-size: 1.1rem;
      color: var(--text-primary, #e4e4e7);
      margin: 0.25rem 0;
    }
    .uh__post-excerpt {
      font-size: 0.88rem;
      color: var(--text-secondary, #71717a);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Projects */
    .uh__projects {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.25rem;
    }
    .uh__project {
      display: flex; flex-direction: column;
      background: var(--bg-secondary, #18181b);
      border: 1px solid var(--border, #1e1e24);
      border-radius: 10px;
      overflow: hidden;
      text-decoration: none; color: inherit;
      transition: border-color 0.25s;
    }
    .uh__project:hover { border-color: var(--accent, #8b5cf6); }
    .uh__project-img { width: 100%; height: 160px; object-fit: cover; }
    .uh__project-body { padding: 1.25rem; }
    .uh__project-title {
      font-size: 1.05rem;
      color: var(--text-primary, #e4e4e7);
      margin-bottom: 0.35rem;
    }
    .uh__project-desc {
      font-size: 0.85rem;
      color: var(--text-secondary, #71717a);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .uh__tech { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.65rem; }
    .uh__tech-pill {
      font-size: 0.7rem;
      padding: 2px 0.5rem;
      border-radius: 999px;
      background: var(--bg-primary, #0f0f13);
      color: var(--accent, #8b5cf6);
      border: 1px solid var(--border, #1e1e24);
    }

    .uh__empty {
      color: var(--text-secondary, #71717a);
      text-align: center;
      padding: 2.5rem;
    }
    .uh--404 {
      text-align: center;
      padding: 5rem 1.5rem;
      color: var(--text-secondary, #71717a);
    }
    .uh--404 h1 { color: var(--text-primary, #e4e4e7); margin-bottom: 1rem; }
    .uh--404 a { color: var(--accent, #8b5cf6); text-decoration: none; }
  `],
})
export class UserHomeComponent implements OnInit, OnDestroy {
  @Input() username!: string;

  profile = signal<Profile | null>(null);
  prefs = signal<UserPreferences | null>(null);
  posts = signal<Post[]>([]);
  projects = signal<Project[]>([]);
  loaded = signal(false);

  constructor(
    private sb: SupabaseService,
    private prefsSvc: PreferencesService,
    private postSvc: PostService,
    private projectSvc: ProjectService,
  ) {}

  async ngOnInit() {
    const { data: profile } = await this.sb.supabase
      .from('profiles')
      .select('*')
      .eq('username', this.username)
      .single();

    if (!profile) {
      this.loaded.set(true);
      return;
    }

    this.profile.set(profile);

    const [prefs, posts, projects] = await Promise.all([
      this.prefsSvc.getPreferences(profile.id),
      this.postSvc.getPublishedPosts(20),
      this.projectSvc.getAllProjectsForAuthor(profile.id),
    ]);

    this.posts.set(posts.filter(p => p.author_id === profile.id));
    this.projects.set(projects);

    if (prefs) {
      this.prefs.set(prefs);
      this.prefsSvc.applyTheme(prefs);
    }

    this.loaded.set(true);
  }

  ngOnDestroy() {
    this.prefsSvc.clearTheme();
  }
}