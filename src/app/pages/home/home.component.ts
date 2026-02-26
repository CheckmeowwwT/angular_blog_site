import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostService } from '../../core/services/post.service';
import { ProjectService } from '../../core/services/project.service';
import { Post, Project } from '../../core/models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <!-- Hero -->
    <section class="hero">
      <p class="hero-tag">Hey there, I am</p>
      <h1 class="hero-name">Ab</h1>
      <p class="hero-bio">
       Welcome to my blog. Please feel free to check out all my essays on the state of the present world. Or the poems, which are a distraction from it.
      </p>
      <div class="hero-links">
        <a routerLink="/projects" class="btn btn-primary">View Projects</a>
        <a routerLink="/blog" class="btn btn-outline">Read Blog</a>
        <a href="https://github.com/YOUR_USERNAME" target="_blank" rel="noopener" class="btn btn-ghost">GitHub ↗</a>
      </div>
    </section>

    <!-- Featured Projects -->
    @if (projects().length) {
      <section class="section">
        <div class="section-header">
          <h2>Featured Projects</h2>
          <a routerLink="/projects" class="see-all">See all →</a>
        </div>
        <div class="project-grid">
          @for (p of projects(); track p.id) {
            <a [routerLink]="['/projects', p.slug]" class="project-card">
              @if (p.cover_image_url) {
                <img [src]="p.cover_image_url" [alt]="p.title" class="card-img" />
              } @else {
                <div class="card-img placeholder">{{ p.title[0] }}</div>
              }
              <div class="card-body">
                <h3>{{ p.title }}</h3>
                <p class="card-desc">{{ p.description }}</p>
                <div class="tech-tags">
                  @for (t of p.tech_stack?.slice(0,4); track t) {
                    <span class="tag">{{ t }}</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      </section>
    }

    <!-- Recent Posts -->
    @if (posts().length) {
      <section class="section">
        <div class="section-header">
          <h2>Recent Writing</h2>
          <a routerLink="/blog" class="see-all">See all →</a>
        </div>
        <div class="post-list">
          @for (post of posts(); track post.id) {
            <a [routerLink]="['/blog', post.slug]" class="post-row">
              <div>
                <h3>{{ post.title }}</h3>
                <p class="post-excerpt">{{ post.excerpt }}</p>
              </div>
              <time class="post-date">{{ post.created_at | date:'mediumDate' }}</time>
            </a>
          }
        </div>
      </section>
    }
  `,
  styles: [`
    .hero {
      padding: 4rem 0 3rem;
    }
    .hero-tag {
      color: #8b5cf6;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }
    .hero-name {
      font-size: 3rem;
      font-weight: 800;
      color: #fff;
      margin: 0 0 1rem;
    }
    .hero-bio {
      max-width: 600px;
      color: #999;
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .hero-links { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    .btn {
      display: inline-block;
      padding: 0.6rem 1.4rem;
      border-radius: 6px;
      font-size: 0.9rem;
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }
    .btn-primary { background: #8b5cf6; color: #fff; }
    .btn-primary:hover { background: #7c3aed; }
    .btn-outline { border: 1px solid #333; color: #ccc; }
    .btn-outline:hover { border-color: #8b5cf6; color: #fff; }
    .btn-ghost { color: #888; }
    .btn-ghost:hover { color: #8b5cf6; }

    .section { margin-top: 3rem; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 1.5rem;
    }
    .section-header h2 { font-size: 1.5rem; color: #fff; }
    .see-all { color: #8b5cf6; text-decoration: none; font-size: 0.9rem; }

    .project-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .project-card {
      background: #151515;
      border: 1px solid #222;
      border-radius: 10px;
      overflow: hidden;
      text-decoration: none;
      color: inherit;
      transition: border-color 0.2s, transform 0.2s;
    }
    .project-card:hover { border-color: #8b5cf6; transform: translateY(-2px); }
    .card-img { width: 100%; height: 180px; object-fit: cover; }
    .card-img.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #1a1a2e;
      font-size: 2.5rem;
      color: #8b5cf6;
      font-weight: 700;
    }
    .card-body { padding: 1rem 1.2rem; }
    .card-body h3 { font-size: 1.1rem; color: #fff; margin: 0 0 0.4rem; }
    .card-desc { color: #888; font-size: 0.85rem; line-height: 1.5; margin: 0 0 0.75rem; }
    .tech-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .tag {
      background: #1e1e2e;
      color: #8b5cf6;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.72rem;
      font-family: 'JetBrains Mono', monospace;
    }

    .post-list { display: flex; flex-direction: column; gap: 0; }
    .post-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #1a1a1a;
      text-decoration: none;
      color: inherit;
      transition: background 0.15s;
    }
    .post-row:hover { background: #111; }
    .post-row h3 { font-size: 1rem; color: #e0e0e0; margin: 0 0 0.25rem; }
    .post-excerpt { color: #666; font-size: 0.85rem; margin: 0; }
    .post-date { color: #555; font-size: 0.8rem; white-space: nowrap; }

    @media (max-width: 640px) {
      .hero-name { font-size: 2rem; }
      .project-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class HomeComponent implements OnInit {
  posts = signal<Post[]>([]);
  projects = signal<Project[]>([]);

  constructor(
    private postSvc: PostService,
    private projectSvc: ProjectService,
  ) {}

  async ngOnInit() {
    const [posts, projects] = await Promise.all([
      this.postSvc.getFeaturedPosts(),
      this.projectSvc.getFeaturedProjects(),
    ]);
    this.posts.set(posts);
    this.projects.set(projects);
  }
}