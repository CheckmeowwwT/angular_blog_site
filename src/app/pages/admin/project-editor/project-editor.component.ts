import { Component, OnInit, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Project } from '../../../core/models/models';

@Component({
  selector: 'app-project-editor',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="editor">
      <div class="editor-header">
        <a routerLink="/admin" class="back-link">← Dashboard</a>
        <button class="btn btn-primary" (click)="save()">Save</button>
      </div>

      @if (project(); as p) {
        <div class="editor-body">
          <!-- Title -->
          <input
            class="title-input"
            [(ngModel)]="p.title"
            placeholder="Project title…"
            (blur)="autoSlug()" />

          <!-- Meta -->
          <div class="row">
            <label class="field">
              <span>Slug</span>
              <input [(ngModel)]="p.slug" />
            </label>
            <label class="field">
              <span>Sort Order</span>
              <input type="number" [(ngModel)]="p.sort_order" />
            </label>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="p.featured" />
              Featured
            </label>
          </div>

          <!-- Description -->
          <label class="field">
            <span>Short Description</span>
            <textarea [(ngModel)]="p.description" rows="2"></textarea>
          </label>

          <label class="field">
            <span>Long Description (HTML)</span>
            <textarea [(ngModel)]="p.long_description" rows="8" class="mono"></textarea>
          </label>

          <!-- Links -->
          <div class="row">
            <label class="field">
              <span>GitHub URL</span>
              <input [(ngModel)]="p.github_url" placeholder="https://github.com/…" />
            </label>
            <label class="field">
              <span>Live URL</span>
              <input [(ngModel)]="p.live_url" placeholder="https://…" />
            </label>
            <label class="field">
              <span>Video URL (YouTube/Vimeo)</span>
              <input [(ngModel)]="p.video_url" placeholder="https://youtube.com/watch?v=…" />
            </label>
          </div>

          <!-- Tech stack -->
          <label class="field">
            <span>Tech Stack (comma-separated)</span>
            <input
              [ngModel]="p.tech_stack?.join(', ')"
              (ngModelChange)="parseTech($event)" />
          </label>

          <!-- Cover -->
          <div class="upload-section">
            <span>Cover Image</span>
            @if (p.cover_image_url) {
              <img [src]="p.cover_image_url" class="preview" />
            }
            <input type="file" accept="image/*" (change)="uploadCover($event)" />
          </div>

          <!-- Gallery -->
          <div class="upload-section">
            <span>Gallery Images</span>
            <div class="gallery-grid">
              @for (img of p.images; track img; let i = $index) {
                <div class="gallery-thumb">
                  <img [src]="img" />
                  <button class="remove-btn" (click)="removeImage(i)">✕</button>
                </div>
              }
            </div>
            <input type="file" accept="image/*" multiple (change)="uploadGallery($event)" />
          </div>
        </div>

        @if (saved()) {
          <div class="toast">Saved!</div>
        }
      } @else {
        <p class="loading">Loading…</p>
      }
    </div>
  `,
  styles: [`
    .editor-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 1.5rem;
    }
    .back-link { color: #8b5cf6; text-decoration: none; font-size: 0.85rem; }
    .btn {
      padding: 0.5rem 1rem; border-radius: 6px; border: none;
      font-size: 0.85rem; cursor: pointer;
    }
    .btn-primary { background: #8b5cf6; color: #fff; }
    .btn-primary:hover { background: #7c3aed; }

    .editor-body {
      background: #151515; border: 1px solid #222; border-radius: 10px;
      padding: 2rem;
    }
    .title-input {
      width: 100%; background: transparent; border: none; border-bottom: 1px solid #333;
      color: #fff; font-size: 1.8rem; font-weight: 700; padding: 0.5rem 0;
      margin-bottom: 1.5rem; box-sizing: border-box;
    }
    .title-input:focus { outline: none; border-color: #8b5cf6; }

    .row { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .field { display: flex; flex-direction: column; gap: 0.3rem; flex: 1; min-width: 200px; margin-bottom: 1rem; }
    .field span { color: #888; font-size: 0.8rem; }
    .field input, .field textarea {
      background: #0a0a0a; border: 1px solid #333; border-radius: 6px;
      color: #e0e0e0; padding: 0.5rem 0.75rem; font-size: 0.9rem;
      box-sizing: border-box; width: 100%; font-family: inherit;
    }
    .field input:focus, .field textarea:focus { outline: none; border-color: #8b5cf6; }
    .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; }
    .toggle {
      display: flex; align-items: center; gap: 0.4rem;
      color: #888; font-size: 0.85rem; align-self: flex-end;
    }

    .upload-section {
      margin-bottom: 1.5rem;
    }
    .upload-section > span { display: block; color: #888; font-size: 0.8rem; margin-bottom: 0.3rem; }
    .preview { max-width: 300px; border-radius: 6px; margin: 0.5rem 0; }
    .upload-section input[type="file"] { color: #888; font-size: 0.85rem; }

    .gallery-grid {
      display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.5rem 0;
    }
    .gallery-thumb {
      position: relative; width: 100px; height: 80px;
    }
    .gallery-thumb img {
      width: 100%; height: 100%; object-fit: cover; border-radius: 4px;
    }
    .remove-btn {
      position: absolute; top: 2px; right: 2px;
      background: rgba(0,0,0,0.7); color: #f87171; border: none;
      border-radius: 50%; width: 20px; height: 20px; cursor: pointer;
      font-size: 0.7rem; display: flex; align-items: center; justify-content: center;
    }

    .toast {
      position: fixed; bottom: 2rem; right: 2rem;
      background: #14532d; color: #4ade80;
      padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 0.85rem;
    }
    .loading { color: #666; }
  `],
})
export class ProjectEditorComponent implements OnInit {
  @Input() id!: string;

  project = signal<Project | null>(null);
  saved = signal(false);

  constructor(
    private projectSvc: ProjectService,
    private sbSvc: SupabaseService,
  ) {}

  async ngOnInit() {
    const { data } = await this.sbSvc.supabase
      .from('projects')
      .select('*')
      .eq('id', this.id)
      .single();
    if (data) this.project.set(data);
  }

  autoSlug() {
    const p = this.project();
    if (p && (!p.slug || p.slug.startsWith('untitled-'))) {
      p.slug = this.projectSvc.generateSlug(p.title);
    }
  }

  parseTech(val: string) {
    const p = this.project();
    if (p) p.tech_stack = val.split(',').map(t => t.trim()).filter(Boolean);
  }

  removeImage(idx: number) {
    const p = this.project();
    if (p) p.images = p.images.filter((_, i) => i !== idx);
  }

  async uploadCover(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    const p = this.project();
    if (!file || !p) return;
    const path = `projects/${p.id}/cover-${file.name}`;
    const url = await this.sbSvc.uploadFile(file, path);
    if (url) p.cover_image_url = url;
  }

  async uploadGallery(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    const p = this.project();
    if (!files || !p) return;
    for (const file of Array.from(files)) {
      const path = `projects/${p.id}/gallery-${Date.now()}-${file.name}`;
      const url = await this.sbSvc.uploadFile(file, path);
      if (url) p.images = [...p.images, url];
    }
  }

  async save() {
    const p = this.project();
    if (!p) return;
    await this.projectSvc.updateProject(p.id, {
      title: p.title,
      slug: p.slug,
      description: p.description,
      long_description: p.long_description,
      cover_image_url: p.cover_image_url,
      video_url: p.video_url,
      github_url: p.github_url,
      live_url: p.live_url,
      tech_stack: p.tech_stack,
      images: p.images,
      featured: p.featured,
      sort_order: p.sort_order,
    });
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 2000);
  }
}