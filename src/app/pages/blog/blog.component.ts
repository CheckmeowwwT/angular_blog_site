import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="blog-page">
      <h1>Blog</h1>
      <p class="subtitle">Writing about code, ideas, and whatever else demands it.</p>

      <!-- Tag filter -->
      @if (allTags().length) {
        <div class="tag-filter">
          <button
            class="filter-btn"
            [class.active]="!activeTag()"
            (click)="activeTag.set(null)">
            All
          </button>
          @for (tag of allTags(); track tag) {
            <button
              class="filter-btn"
              [class.active]="activeTag() === tag"
              (click)="activeTag.set(tag)">
              {{ tag }}
            </button>
          }
        </div>
      }

      <!-- Posts -->
      @if (filtered().length) {
        <div class="post-list">
          @for (post of filtered(); track post.id) {
            <a [routerLink]="['/blog', post.slug]" class="post-card">
              @if (post.cover_image_url) {
                <img [src]="post.cover_image_url" [alt]="post.title" class="post-img" />
              }
              <div class="post-body">
                <div class="post-meta">
                  <time>{{ post.created_at | date:'mediumDate' }}</time>
                  @for (t of post.tags?.slice(0,3); track t) {
                    <span class="tag">{{ t }}</span>
                  }
                </div>
                <h2>{{ post.title }}</h2>
                <p>{{ post.excerpt }}</p>
              </div>
            </a>
          }
        </div>
      } @else {
        <p class="empty">No posts yet. Check back soon.</p>
      }
    </section>
  `,
  styles: [`
    .blog-page h1 { font-size: 2rem; color: #fff; margin-bottom: 0.25rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }

    .tag-filter {
      display: flex; gap: 0.5rem; flex-wrap: wrap;
      margin-bottom: 2rem;
    }
    .filter-btn {
      background: #151515; border: 1px solid #222; color: #888;
      padding: 0.35rem 0.8rem; border-radius: 20px;
      font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
    }
    .filter-btn:hover { border-color: #8b5cf6; color: #ccc; }
    .filter-btn.active { background: #8b5cf6; border-color: #8b5cf6; color: #fff; }

    .post-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .post-card {
      display: flex; gap: 1.25rem;
      background: #151515; border: 1px solid #222; border-radius: 10px;
      overflow: hidden; text-decoration: none; color: inherit;
      transition: border-color 0.2s;
    }
    .post-card:hover { border-color: #8b5cf6; }
    .post-img { width: 220px; min-height: 160px; object-fit: cover; flex-shrink: 0; }
    .post-body { padding: 1.2rem 1.2rem 1.2rem 0; }
    .post-meta {
      display: flex; align-items: center; gap: 0.6rem;
      margin-bottom: 0.5rem; font-size: 0.8rem; color: #555;
    }
    .tag {
      background: #1e1e2e; color: #8b5cf6;
      padding: 0.15rem 0.45rem; border-radius: 4px;
      font-size: 0.7rem; font-family: 'JetBrains Mono', monospace;
    }
    .post-body h2 { font-size: 1.2rem; color: #e0e0e0; margin: 0 0 0.4rem; }
    .post-body p { color: #777; font-size: 0.9rem; line-height: 1.5; margin: 0; }
    .empty { color: #555; font-style: italic; }

    @media (max-width: 640px) {
      .post-card { flex-direction: column; }
      .post-img { width: 100%; height: 180px; }
      .post-body { padding: 1rem; }
    }
  `],
})
export class BlogComponent implements OnInit {
  posts = signal<Post[]>([]);
  activeTag = signal<string | null>(null);

  allTags = computed(() => {
    const tags = new Set<string>();
    this.posts().forEach(p => p.tags?.forEach(t => tags.add(t)));
    return [...tags].sort();
  });

  filtered = computed(() => {
    const tag = this.activeTag();
    if (!tag) return this.posts();
    return this.posts().filter(p => p.tags?.includes(tag));
  });

  constructor(private postSvc: PostService) {}

  async ngOnInit() {
    this.posts.set(await this.postSvc.getPublishedPosts());
  }
}