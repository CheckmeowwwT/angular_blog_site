import { Component, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/models';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="feed">
      <header class="feed__header">
        <h1 class="feed__title">Feed</h1>
        <p class="feed__sub">All posts, newest first.</p>
      </header>

      <!-- Tag filters -->
      <div class="feed__filters">
        <button
          class="feed__tag"
          [class.active]="!activeTag()"
          (click)="activeTag.set(null)">
          All
        </button>
        @for (t of allTags(); track t) {
          <button
            class="feed__tag"
            [class.active]="activeTag() === t"
            (click)="activeTag.set(t)">
            {{ t }}
          </button>
        }
      </div>

      <!-- Posts grid -->
      @if (filtered().length) {
        <div class="feed__grid">
          @for (p of filtered(); track p.id) {
            <a [routerLink]="['/blog', p.slug]" class="feed__card">
              @if (p.cover_image_url) {
                <img [src]="p.cover_image_url" [alt]="p.title"
                     class="feed__card-img" loading="lazy" />
              }
              <div class="feed__card-body">
                <time class="feed__date">{{ p.created_at | date:'mediumDate' }}</time>
                <h2 class="feed__card-title">{{ p.title }}</h2>
                <p class="feed__excerpt">{{ p.excerpt }}</p>
                @if (p.tags?.length) {
                  <div class="feed__tags">
                    @for (t of p.tags; track t) {
                      <span class="feed__pill">{{ t }}</span>
                    }
                  </div>
                }
              </div>
            </a>
          }
        </div>
      } @else if (loaded()) {
        <p class="feed__empty">No posts yet.</p>
      }
    </section>
  `,
  styles: [`
    .feed {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    .feed__header { margin-bottom: 2rem; }
    .feed__title {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 2rem;
      color: var(--text-primary, #e4e4e7);
    }
    .feed__sub {
      color: var(--text-secondary, #71717a);
      margin-top: 0.25rem;
    }

    /* Filters */
    .feed__filters {
      display: flex; flex-wrap: wrap;
      gap: 0.5rem; margin-bottom: 2rem;
    }
    .feed__tag {
      background: var(--bg-secondary, #18181b);
      color: var(--text-secondary, #71717a);
      border: 1px solid var(--border, #1e1e24);
      padding: 0.25rem 0.85rem;
      border-radius: 999px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .feed__tag:hover,
    .feed__tag.active {
      background: var(--accent, #8b5cf6);
      color: var(--bg-primary, #0f0f13);
      border-color: var(--accent, #8b5cf6);
    }

    /* Grid */
    .feed__grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }
    .feed__card {
      display: flex; flex-direction: column;
      background: var(--bg-secondary, #18181b);
      border: 1px solid var(--border, #1e1e24);
      border-radius: 10px;
      overflow: hidden;
      text-decoration: none; color: inherit;
      transition: border-color 0.25s, transform 0.25s;
    }
    .feed__card:hover {
      border-color: var(--accent, #8b5cf6);
      transform: translateY(-3px);
    }
    .feed__card-img { width: 100%; height: 180px; object-fit: cover; }
    .feed__card-body {
      padding: 1.25rem;
      display: flex; flex-direction: column; gap: 0.5rem;
    }
    .feed__date {
      font-size: 0.75rem;
      color: var(--text-secondary, #71717a);
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
    }
    .feed__card-title {
      font-size: 1.15rem;
      color: var(--text-primary, #e4e4e7);
      line-height: 1.35;
    }
    .feed__excerpt {
      font-size: 0.88rem;
      color: var(--text-secondary, #71717a);
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .feed__tags { display: flex; flex-wrap: wrap; gap: 0.25rem; }
    .feed__pill {
      font-size: 0.7rem;
      padding: 2px 0.5rem;
      border-radius: 999px;
      background: var(--bg-primary, #0f0f13);
      color: var(--accent, #8b5cf6);
      border: 1px solid var(--border, #1e1e24);
    }
    .feed__empty {
      color: var(--text-secondary, #71717a);
      text-align: center;
      padding: 3rem;
    }
  `],
})
export class FeedComponent implements OnInit {
  posts = signal<Post[]>([]);
  loaded = signal(false);
  activeTag = signal<string | null>(null);

  allTags = computed(() =>
    [...new Set(this.posts().flatMap(p => p.tags ?? []))].sort()
  );

  filtered = computed(() => {
    const tag = this.activeTag();
    return tag
      ? this.posts().filter(p => p.tags?.includes(tag))
      : this.posts();
  });

  constructor(private postSvc: PostService) {}

  async ngOnInit() {
    this.posts.set(await this.postSvc.getPublishedPosts(100));
    this.loaded.set(true);
  }
}