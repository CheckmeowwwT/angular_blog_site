import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/models';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="projects-page">
      <h1>Projects</h1>
      <p class="subtitle">Things I've built, broken, and occasionally shipped.</p>

      @if (projects().length) {
        <div class="grid">
          @for (p of projects(); track p.id) {
            <a [routerLink]="['/projects', p.slug]" class="card">
              @if (p.cover_image_url) {
                <img [src]="p.cover_image_url" [alt]="p.title" class="card-img" />
              } @else {
                <div class="card-img placeholder">
                  <span>{{ p.title[0] }}</span>
                </div>
              }
              <div class="card-body">
                <h2>{{ p.title }}</h2>
                <p>{{ p.description }}</p>
                <div class="tech-tags">
                  @for (t of p.tech_stack?.slice(0,5); track t) {
                    <span class="tag">{{ t }}</span>
                  }
                </div>
                <div class="card-links">
                  @if (p.github_url) {
                    <span class="link-icon" title="Has GitHub repo">⌨</span>
                  }
                  @if (p.live_url) {
                    <span class="link-icon" title="Has live demo">🔗</span>
                  }
                  @if (p.video_url) {
                    <span class="link-icon" title="Has video">▶</span>
                  }
                </div>
              </div>
            </a>
          }
        </div>
      } @else {
        <p class="empty">No projects yet.</p>
      }
    </section>
  `,
  styles: [`
    .projects-page h1 { font-size: 2rem; color: #fff; margin-bottom: 0.25rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.5rem;
    }
    .card {
      background: #151515; border: 1px solid #222; border-radius: 10px;
      overflow: hidden; text-decoration: none; color: inherit;
      transition: border-color 0.2s, transform 0.2s;
    }
    .card:hover { border-color: #8b5cf6; transform: translateY(-3px); }
    .card-img { width: 100%; height: 200px; object-fit: cover; }
    .card-img.placeholder {
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      font-size: 3rem; color: #8b5cf6; font-weight: 700;
    }
    .card-body { padding: 1.2rem; }
    .card-body h2 { font-size: 1.15rem; color: #fff; margin: 0 0 0.4rem; }
    .card-body p { color: #888; font-size: 0.85rem; line-height: 1.5; margin: 0 0 0.75rem; }
    .tech-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .tag {
      background: #1e1e2e; color: #8b5cf6;
      padding: 0.2rem 0.5rem; border-radius: 4px;
      font-size: 0.72rem; font-family: 'JetBrains Mono', monospace;
    }
    .card-links { display: flex; gap: 0.5rem; font-size: 0.85rem; }
    .link-icon { opacity: 0.5; }
    .empty { color: #555; font-style: italic; }

    @media (max-width: 640px) {
      .grid { grid-template-columns: 1fr; }
    }
  `],
})
export class ProjectsComponent implements OnInit {
  projects = signal<Project[]>([]);

  constructor(private projectSvc: ProjectService) {}

  async ngOnInit() {
    this.projects.set(await this.projectSvc.getProjects());
  }
}