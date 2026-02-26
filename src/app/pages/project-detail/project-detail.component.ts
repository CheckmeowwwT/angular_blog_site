import { Component, OnInit, signal, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { Project } from '../../core/models/models';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (project(); as p) {
      <div class="detail">
        <a routerLink="/projects" class="back-link">← Back to Projects</a>

        <header>
          <h1>{{ p.title }}</h1>
          <p class="desc">{{ p.description }}</p>

          <div class="action-links">
            @if (p.github_url) {
              <a [href]="p.github_url" target="_blank" rel="noopener" class="btn btn-outline">
                GitHub ↗
              </a>
            }
            @if (p.live_url) {
              <a [href]="p.live_url" target="_blank" rel="noopener" class="btn btn-primary">
                Live Demo ↗
              </a>
            }
          </div>
        </header>

        <!-- Cover -->
        @if (p.cover_image_url) {
          <img [src]="p.cover_image_url" [alt]="p.title" class="cover" />
        }

        <!-- Embedded Video -->
        @if (embedUrl()) {
          <div class="video-wrap">
            <iframe
              [src]="embedUrl()"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>
        }

        <!-- Long description -->
        @if (p.long_description) {
          <div class="long-desc" [innerHTML]="p.long_description"></div>
        }

        <!-- Tech stack -->
        @if (p.tech_stack?.length) {
          <div class="tech-section">
            <h3>Tech Stack</h3>
            <div class="tech-tags">
              @for (t of p.tech_stack; track t) {
                <span class="tag">{{ t }}</span>
              }
            </div>
          </div>
        }

        <!-- Image Gallery -->
        @if (p.images?.length) {
          <div class="gallery-section">
            <h3>Gallery</h3>
            <div class="gallery">
              @for (img of p.images; track img) {
                <img [src]="img" alt="Project screenshot" class="gallery-img"
                     (click)="lightbox.set(img)" />
              }
            </div>
          </div>
        }

        <!-- Lightbox -->
        @if (lightbox()) {
          <div class="lightbox-overlay" (click)="lightbox.set(null)">
            <img [src]="lightbox()" alt="Full size" />
          </div>
        }

        <footer class="detail-footer">
          <time>Added {{ p.created_at | date:'mediumDate' }}</time>
        </footer>
      </div>
    } @else if (loading()) {
      <p class="loading">Loading…</p>
    } @else {
      <div class="not-found">
        <h2>Project not found</h2>
        <a routerLink="/projects">← Back to Projects</a>
      </div>
    }
  `,
  styles: [`
    .back-link {
      color: #8b5cf6; text-decoration: none; font-size: 0.85rem;
      display: inline-block; margin-bottom: 1.5rem;
    }
    header h1 { font-size: 2.2rem; color: #fff; margin: 0 0 0.5rem; }
    .desc { color: #999; font-size: 1.05rem; margin-bottom: 1.25rem; }
    .action-links { display: flex; gap: 0.75rem; margin-bottom: 2rem; }
    .btn {
      padding: 0.55rem 1.2rem; border-radius: 6px; font-size: 0.9rem;
      text-decoration: none; transition: all 0.2s;
    }
    .btn-primary { background: #8b5cf6; color: #fff; }
    .btn-primary:hover { background: #7c3aed; }
    .btn-outline { border: 1px solid #333; color: #ccc; }
    .btn-outline:hover { border-color: #8b5cf6; color: #fff; }

    .cover {
      width: 100%; max-height: 500px; object-fit: cover;
      border-radius: 10px; margin-bottom: 2rem;
    }
    .video-wrap {
      position: relative; padding-bottom: 56.25%; height: 0;
      border-radius: 10px; overflow: hidden; margin-bottom: 2rem;
    }
    .video-wrap iframe {
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
    }
    .long-desc {
      color: #ccc; line-height: 1.8; max-width: 720px;
      margin-bottom: 2rem;
    }
    .tech-section { margin-bottom: 2rem; }
    .tech-section h3, .gallery-section h3 {
      color: #fff; font-size: 1.1rem; margin-bottom: 0.75rem;
    }
    .tech-tags { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .tag {
      background: #1e1e2e; color: #8b5cf6;
      padding: 0.3rem 0.7rem; border-radius: 5px;
      font-size: 0.8rem; font-family: 'JetBrains Mono', monospace;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 0.75rem;
    }
    .gallery-img {
      width: 100%; height: 160px; object-fit: cover;
      border-radius: 8px; cursor: pointer;
      transition: transform 0.2s, opacity 0.2s;
    }
    .gallery-img:hover { transform: scale(1.03); opacity: 0.9; }

    .lightbox-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.9);
      display: flex; align-items: center; justify-content: center;
      z-index: 200; cursor: pointer;
    }
    .lightbox-overlay img {
      max-width: 90vw; max-height: 90vh; border-radius: 8px;
    }

    .detail-footer { margin-top: 3rem; color: #555; font-size: 0.85rem; }
    .loading, .not-found { color: #666; }
    .not-found a { color: #8b5cf6; text-decoration: none; }
  `],
})
export class ProjectDetailComponent implements OnInit {
  @Input() slug!: string;

  project = signal<Project | null>(null);
  loading = signal(true);
  embedUrl = signal<SafeResourceUrl | null>(null);
  lightbox = signal<string | null>(null);

  constructor(
    private projectSvc: ProjectService,
    private sanitizer: DomSanitizer,
  ) {}

  async ngOnInit() {
    const p = await this.projectSvc.getProjectBySlug(this.slug);
    this.project.set(p);
    if (p?.video_url) {
      this.embedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(
        this.toEmbedUrl(p.video_url)
      ));
    }
    this.loading.set(false);
  }

  /** Convert YouTube/Vimeo URLs to embeddable format */
  private toEmbedUrl(url: string): string {
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    // Vimeo
    const vmMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`;
    // Already an embed URL or other
    return url;
  }
}