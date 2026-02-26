import { Component, OnInit, Input, signal, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Post } from '../../../core/models/models';
import {
  ContentBlock,
  fetchVideoTitle,
  serializeBlocks,
  deserializeBlocks,
} from '../../../core/models/content-blocks';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    @if (post(); as p) {
      <div class="editor-page">

        <!-- Title -->
        <input
          class="title-input"
          [(ngModel)]="p.title"
          placeholder="Title" />

        <!-- Content area -->
        <div
          class="content-area"
          (dragover)="onDragOver($event)"
          (dragleave)="dragOver.set(false)"
          (drop)="onDrop($event)"
          [class.drag-active]="dragOver()">

          @for (block of blocks(); track $index; let i = $index) {
            @if (block.type === 'text') {
              <textarea
                class="text-block"
                [ngModel]="block.body"
                (ngModelChange)="updateText(i, $event)"
                (input)="autoResize($event)"
                (paste)="onPaste($event, i)"
                placeholder="Start writing…"></textarea>
            }

            @if (block.type === 'image') {
              <div class="image-block">
                @if (block.url) {
                  <div class="img-wrap">
                    <img [src]="block.url" [alt]="block.caption || ''" />
                    <button class="img-remove" (click)="removeBlock(i)">✕</button>
                  </div>
                  <input
                    class="img-caption"
                    [ngModel]="block.caption ?? ''"
                    (ngModelChange)="updateCaption(i, $event)"
                    placeholder="Caption (optional)" />
                } @else {
                  <div class="img-uploading">Uploading…</div>
                }
              </div>
            }

            @if (block.type === 'video') {
              <div class="link-block">
                <a [href]="block.url" target="_blank" rel="noopener">{{ block.title }}</a>
                <button class="link-remove" (click)="removeBlock(i)">✕</button>
              </div>
            }
          }

          @if (!blocks().length) {
            <textarea
              class="text-block"
              placeholder="Start writing…"
              (focus)="ensureFirstBlock()"
              (paste)="onPaste($event, 0)"></textarea>
          }

          @if (dragOver()) {
            <div class="drop-overlay">Drop image anywhere</div>
          }
        </div>

        <!-- Actions -->
        <div class="actions">
          <button class="btn-draft" (click)="save(false)">Save Draft</button>
          <button class="btn-publish" (click)="save(true)">Post</button>
        </div>
      </div>

      <!-- Link dialog -->
      @if (linkDialog()) {
        <div class="dialog-backdrop" (click)="cancelLink()">
          <div class="dialog" (click)="$event.stopPropagation()">
            <p class="dialog-label">Link detected</p>
            <p class="dialog-url">{{ pendingUrl() }}</p>
            @if (fetchingTitle()) {
              <p class="dialog-fetching">Fetching title…</p>
            }
            <label class="dialog-field">
              <span>Display as</span>
              <input
                class="dialog-input"
                [(ngModel)]="pendingTitle"
                placeholder="Custom title (or leave as-is)" />
            </label>
            <div class="dialog-actions">
              <button class="dbtn-secondary" (click)="insertLinkAsIs()">Keep URL</button>
              <button class="dbtn-primary" (click)="insertLinkWithTitle()">
                {{ pendingTitle ? 'Use Title' : 'Use Fetched Title' }}
              </button>
            </div>
          </div>
        </div>
      }
    } @else {
      <p class="loading">Loading…</p>
    }
  `,
  styles: [`
    .editor-page {
      max-width: 800px; margin: 0 auto;
      display: flex; flex-direction: column; gap: 0;
      min-height: calc(100vh - 160px);
    }

    .title-input {
      width: 100%; background: transparent; border: none;
      color: #fff; font-size: 2.2rem; font-weight: 800;
      padding: 1rem 0; box-sizing: border-box;
      border-bottom: 1px solid #1a1a1a;
    }
    .title-input:focus { outline: none; border-color: #333; }
    .title-input::placeholder { color: #333; }

    /* Content area */
    .content-area {
      position: relative; flex: 1;
      padding: 1.5rem 0; min-height: 500px;
      display: flex; flex-direction: column; gap: 0;
    }
    .content-area.drag-active {
      background: rgba(139,92,246,0.03); border-radius: 8px;
    }

    .text-block {
      width: 100%; background: transparent; border: none; color: #ddd;
      font-size: 1.1rem; line-height: 1.85; resize: none; overflow: hidden;
      padding: 0; font-family: inherit; box-sizing: border-box;
      min-height: 3em;
    }
    .text-block:focus { outline: none; }
    .text-block::placeholder { color: #333; }

    /* Images */
    .image-block { margin: 1rem 0; }
    .img-wrap { position: relative; }
    .img-wrap img { width: 100%; border-radius: 8px; display: block; }
    .img-remove {
      position: absolute; top: 8px; right: 8px;
      background: rgba(0,0,0,0.75); color: #f87171; border: none;
      width: 28px; height: 28px; border-radius: 50%; cursor: pointer;
      font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.15s;
    }
    .img-wrap:hover .img-remove { opacity: 1; }
    .img-caption {
      width: 100%; background: transparent; border: none;
      border-bottom: 1px solid #1a1a1a; color: #666;
      font-size: 0.85rem; font-style: italic; padding: 0.4rem 0;
      box-sizing: border-box;
    }
    .img-caption:focus { outline: none; border-color: #8b5cf6; color: #aaa; }
    .img-caption::placeholder { color: #333; }
    .img-uploading { color: #555; font-size: 0.85rem; padding: 1rem 0; }

    /* Links */
    .link-block {
      display: inline-flex; align-items: center; gap: 0.4rem;
      margin: 0.25rem 0;
    }
    .link-block a {
      color: #8b5cf6; text-decoration: underline; font-size: 1.1rem;
    }
    .link-remove {
      background: none; border: none; color: #444; cursor: pointer;
      font-size: 0.75rem;
    }
    .link-remove:hover { color: #f87171; }

    /* Drop overlay */
    .drop-overlay {
      position: absolute; inset: 0;
      background: rgba(139,92,246,0.06);
      border: 2px dashed #8b5cf6; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      color: #8b5cf6; font-size: 1rem; pointer-events: none;
    }

    /* Actions */
    .actions {
      display: flex; gap: 0.75rem; justify-content: flex-end;
      padding: 1.5rem 0; border-top: 1px solid #1a1a1a;
    }
    .btn-draft {
      background: transparent; border: 1px solid #2a2a2a; color: #888;
      padding: 0.6rem 1.5rem; border-radius: 8px; cursor: pointer;
      font-size: 0.9rem; transition: all 0.2s;
    }
    .btn-draft:hover { border-color: #555; color: #ccc; }
    .btn-publish {
      background: #8b5cf6; border: none; color: #fff;
      padding: 0.6rem 2.5rem; border-radius: 8px; cursor: pointer;
      font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
    }
    .btn-publish:hover { background: #7c3aed; }

    /* Link dialog */
    .dialog-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6);
      display: flex; align-items: center; justify-content: center;
      z-index: 300;
    }
    .dialog {
      background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px;
      padding: 1.5rem; width: 100%; max-width: 420px;
    }
    .dialog-label { color: #ccc; font-size: 0.9rem; margin: 0 0 0.25rem; font-weight: 600; }
    .dialog-url {
      color: #8b5cf6; font-size: 0.8rem; margin: 0 0 1rem;
      word-break: break-all; font-family: 'JetBrains Mono', monospace;
    }
    .dialog-fetching { color: #666; font-size: 0.8rem; font-style: italic; margin: 0 0 0.75rem; }
    .dialog-field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 1.25rem; }
    .dialog-field span { color: #888; font-size: 0.8rem; }
    .dialog-input {
      background: #111; border: 1px solid #333; border-radius: 6px;
      color: #e0e0e0; padding: 0.5rem 0.75rem; font-size: 0.9rem;
      box-sizing: border-box; width: 100%;
    }
    .dialog-input:focus { outline: none; border-color: #8b5cf6; }
    .dialog-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .dbtn-secondary {
      background: transparent; border: 1px solid #333; color: #888;
      padding: 0.45rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
    }
    .dbtn-secondary:hover { border-color: #555; color: #ccc; }
    .dbtn-primary {
      background: #8b5cf6; border: none; color: #fff;
      padding: 0.45rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;
    }
    .dbtn-primary:hover { background: #7c3aed; }

    .loading { color: #555; }
  `],
})
export class PostEditorComponent implements OnInit {
  @Input() id!: string;

  post = signal<Post | null>(null);
  blocks = signal<ContentBlock[]>([]);
  dragOver = signal(false);

  // Link dialog state
  linkDialog = signal(false);
  pendingUrl = signal('');
  pendingTitle = '';
  pendingBlockIndex = 0;
  fetchingTitle = signal(false);
  fetchedTitle = '';

  constructor(
    private postSvc: PostService,
    private sbSvc: SupabaseService,
    private router: Router,
  ) {}

  async ngOnInit() {
    if (this.id === 'new') return;
    const { data } = await this.sbSvc.supabase
      .from('posts')
      .select('*')
      .eq('id', this.id)
      .single();
    if (data) {
      this.post.set(data);
      this.blocks.set(deserializeBlocks(data.content));
    }
  }

  ensureFirstBlock() {
    if (!this.blocks().length) {
      this.blocks.set([{ type: 'text', body: '' }]);
    }
  }

  // --- Text ---

  updateText(i: number, val: string) {
    const arr = [...this.blocks()];
    if (arr[i].type === 'text') arr[i] = { ...arr[i], body: val };
    this.blocks.set(arr);
  }

  autoResize(e: Event) {
    const el = e.target as HTMLTextAreaElement;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  // --- Paste detection for links ---

  onPaste(e: ClipboardEvent, blockIndex: number) {
    const text = e.clipboardData?.getData('text/plain')?.trim();
    if (!text) return;

    // Check if pasted text is a URL
    if (this.isUrl(text)) {
      e.preventDefault();
      this.pendingUrl.set(text);
      this.pendingTitle = '';
      this.fetchedTitle = '';
      this.pendingBlockIndex = blockIndex;
      this.linkDialog.set(true);

      // Auto-fetch title in background
      this.fetchingTitle.set(true);
      fetchVideoTitle(text).then(title => {
        this.fetchedTitle = title;
        if (!this.pendingTitle) {
          this.pendingTitle = title;
        }
        this.fetchingTitle.set(false);
      });
    }
  }

  private isUrl(text: string): boolean {
    try {
      const url = new URL(text);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  insertLinkAsIs() {
    // Insert the raw URL as text
    const url = this.pendingUrl();
    const i = this.pendingBlockIndex;
    const arr = [...this.blocks()];

    if (arr[i]?.type === 'text') {
      arr[i] = { ...arr[i], body: (arr[i] as any).body + url };
    }

    this.blocks.set(arr);
    this.linkDialog.set(false);
  }

  insertLinkWithTitle() {
    const url = this.pendingUrl();
    const title = this.pendingTitle || this.fetchedTitle || url;
    const i = this.pendingBlockIndex;
    const arr = [...this.blocks()];

    // Insert video/link block after current text block
    arr.splice(i + 1, 0, { type: 'video', url, title });
    // Add text block after for continued writing
    if (i + 2 >= arr.length || arr[i + 2]?.type !== 'text') {
      arr.splice(i + 2, 0, { type: 'text', body: '' });
    }

    this.blocks.set(arr);
    this.linkDialog.set(false);
  }

  cancelLink() {
    this.linkDialog.set(false);
  }

  // --- Image drag & drop ---

  onDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.types.includes('Files')) {
      this.dragOver.set(true);
    }
  }

  async onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver.set(false);
    const files = e.dataTransfer?.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;

      const insertAt = this.blocks().length;
      const arr = [...this.blocks()];
      arr.splice(insertAt, 0, { type: 'image', url: '', caption: '' });
      this.blocks.set(arr);

      const p = this.post();
      if (!p) return;
      const path = `posts/${p.id}/img-${Date.now()}-${file.name}`;
      const url = await this.sbSvc.uploadFile(file, path);

      if (url) {
        const updated = [...this.blocks()];
        for (let j = 0; j < updated.length; j++) {
          if (updated[j].type === 'image' && !(updated[j] as any).url) {
            updated[j] = { type: 'image', url, caption: '' };
            break;
          }
        }
        this.blocks.set(updated);

        // Add text block after image
        const after = [...this.blocks()];
        let lastIdx = -1;
        for (let j = after.length - 1; j >= 0; j--) {
          if (after[j].type === 'image' && (after[j] as any).url === url) {
            lastIdx = j; break;
          }
        }
        if (lastIdx >= 0 && (lastIdx === after.length - 1 || after[lastIdx + 1].type !== 'text')) {
          after.splice(lastIdx + 1, 0, { type: 'text', body: '' });
          this.blocks.set(after);
        }
      }
    }
  }

  updateCaption(i: number, val: string) {
    const arr = [...this.blocks()];
    if (arr[i].type === 'image') arr[i] = { ...arr[i], caption: val };
    this.blocks.set(arr);
  }

  removeBlock(i: number) {
    this.blocks.set(this.blocks().filter((_, idx) => idx !== i));
  }

  // --- Save ---

  async save(publish: boolean) {
    const p = this.post();
    if (!p) return;

    p.published = publish;
    p.slug = p.slug?.startsWith('untitled-')
      ? this.postSvc.generateSlug(p.title)
      : (p.slug || this.postSvc.generateSlug(p.title));

    const content = serializeBlocks(this.blocks());

    await this.postSvc.updatePost(p.id, {
      title: p.title,
      slug: p.slug,
      content,
      published: p.published,
    });

    if (publish) {
      this.router.navigate(['/blog', p.slug]);
    }
  }
}