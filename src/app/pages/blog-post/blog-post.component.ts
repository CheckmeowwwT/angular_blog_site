import { Component, OnInit, signal, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/models';
import { ContentBlock, deserializeBlocks } from '../../core/models/content-blocks';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (post(); as p) {
      <article class="post">
        <a routerLink="/blog" class="back-link">← Back to Blog</a>

        <header class="post-header">
          <div class="post-meta">
            <time>{{ p.created_at | date:'longDate' }}</time>
            @if (p.profiles?.display_name) {
              <span>by {{ p.profiles?.display_name }}</span>
            }
          </div>
          <h1>{{ p.title }}</h1>
          @if (p.tags.length) {
            <div class="tags">
              @for (t of p.tags; track t) {
                <a [routerLink]="['/blog']" [queryParams]="{tag: t}" class="tag">{{ t }}</a>
              }
            </div>
          }
        </header>

        <!-- Content Blocks -->
        <div class="post-content">
          @for (block of blocks(); track $index) {
            @if (block.type === 'text') {
              <div class="content-text">
                @for (para of splitParagraphs(block.body); track $index) {
                  <p>{{ para }}</p>
                }
              </div>
            }

            @if (block.type === 'image') {
              <figure class="content-image">
                <img [src]="block.url" [alt]="block.caption || p.title" />
                @if (block.caption) {
                  <figcaption>{{ block.caption }}</figcaption>
                }
              </figure>
            }

            @if (block.type === 'video') {
              <div class="content-video">
                <span class="video-icon">▶</span>
                <a [href]="block.url" target="_blank" rel="noopener">{{ block.title }}</a>
              </div>
            }
          }
        </div>
      </article>
    } @else if (loading()) {
      <p class="loading">Loading…</p>
    } @else {
      <div class="not-found">
        <h2>Post not found</h2>
        <a routerLink="/blog">← Back to Blog</a>
      </div>
    }
  `,
  styles: [`
    .back-link {
      color: #8b5cf6; text-decoration: none; font-size: 0.85rem;
      display: inline-block; margin-bottom: 1.5rem;
    }
    .post-header { margin-bottom: 2.5rem; }
    .post-meta {
      display: flex; gap: 0.75rem; color: #555; font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }
    .post-header h1 {
      font-size: 2.4rem; color: #fff; margin: 0 0 0.75rem;
      line-height: 1.25; font-weight: 800;
    }
    .tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .tag {
      background: #1e1e2e; color: #8b5cf6;
      padding: 0.2rem 0.5rem; border-radius: 4px;
      font-size: 0.75rem; text-decoration: none;
      font-family: 'JetBrains Mono', monospace;
    }
    .tag:hover { background: #2a2a3e; }

    /* Content blocks */
    .post-content {
      max-width: 720px;
    }

    .content-text p {
      color: #ccc; font-size: 1.05rem; line-height: 1.85;
      margin: 0 0 1.25rem;
    }

    .content-image {
      margin: 2rem 0;
    }
    .content-image img {
      width: 100%; border-radius: 10px;
    }
    .content-image figcaption {
      color: #666; font-size: 0.85rem; font-style: italic;
      text-align: center; margin-top: 0.5rem;
    }

    .content-video {
      display: flex; align-items: center; gap: 0.6rem;
      padding: 0.75rem 1rem; margin: 1.5rem 0;
      background: #1a1a2e; border-radius: 8px;
      border-left: 3px solid #8b5cf6;
    }
    .video-icon { color: #8b5cf6; font-size: 1rem; }
    .content-video a {
      color: #8b5cf6; text-decoration: none; font-size: 1rem;
    }
    .content-video a:hover { text-decoration: underline; }

    .loading, .not-found { color: #666; }
    .not-found a { color: #8b5cf6; text-decoration: none; }
  `],
})
export class BlogPostComponent implements OnInit {
  @Input() slug!: string;

  post = signal<Post | null>(null);
  blocks = signal<ContentBlock[]>([]);
  loading = signal(true);

  constructor(private postSvc: PostService) {}

  async ngOnInit() {
    const p = await this.postSvc.getPostBySlug(this.slug);
    this.post.set(p);
    if (p) {
      this.blocks.set(deserializeBlocks(p.content));
    }
    this.loading.set(false);
  }

  /** Split text on double newlines into paragraphs */
  splitParagraphs(body: string): string[] {
    return body.split(/\n\n+/).filter(s => s.trim());
  }
}