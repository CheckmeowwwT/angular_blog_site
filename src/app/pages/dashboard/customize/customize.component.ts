import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { PreferencesService } from '../../../core/services/preferences.service';
import { UserPreferences, AnimationType, AnimationOption } from '../../../core/models/models';

@Component({
  selector: 'app-customize',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="cz">
      <h1 class="cz__title">Customize Theme</h1>
      <p class="cz__desc">
        Changes apply to your public profile page and are saved when you click Save.
      </p>

      @if (prefs(); as p) {
        <!-- Colours -->
        <section class="cz__section">
          <h2 class="cz__label">Colours</h2>
          <div class="cz__colors">
            @for (c of colorFields; track c.key) {
              <label class="cz__color-field">
                <span class="cz__color-name">{{ c.label }}</span>
                <div class="cz__color-input">
                  <input type="color"
                    [ngModel]="getField(p, c.key)"
                    (ngModelChange)="setField(c.key, $event)" />
                  <input type="text" class="cz__hex"
                    [ngModel]="getField(p, c.key)"
                    (ngModelChange)="setField(c.key, $event)"
                    placeholder="#000000" maxlength="7" />
                </div>
              </label>
            }
          </div>
        </section>

        <!-- Font -->
        <section class="cz__section">
          <h2 class="cz__label">Typography</h2>
          <label class="cz__select-wrap">
            <span>Font family</span>
            <select [ngModel]="p.font_family"
                    (ngModelChange)="setField('font_family', $event)">
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="Inter">Inter</option>
              <option value="Space Grotesk">Space Grotesk</option>
              <option value="IBM Plex Mono">IBM Plex Mono</option>
              <option value="Fira Code">Fira Code</option>
              <option value="system-ui">System default</option>
            </select>
          </label>
        </section>

        <!-- Animation -->
        <section class="cz__section">
          <h2 class="cz__label">Background Animation</h2>
          <div class="cz__anim-grid">
            @for (a of animOptions(); track a.id) {
              <button class="cz__anim-card"
                      [class.active]="p.animation === a.id"
                      (click)="setField('animation', a.id)">
                <span class="cz__anim-name">{{ a.label }}</span>
                <span class="cz__anim-desc">{{ a.description }}</span>
              </button>
            }
          </div>
        </section>

        <!-- Layout -->
        <section class="cz__section">
          <h2 class="cz__label">Layout</h2>
          <label class="cz__select-wrap">
            <span>Sidebar position</span>
            <select [ngModel]="p.sidebar_position"
                    (ngModelChange)="setField('sidebar_position', $event)">
              <option value="left">Left</option>
              <option value="right">Right</option>
            </select>
          </label>
        </section>

        <!-- Custom CSS -->
        <section class="cz__section">
          <h2 class="cz__label">Custom CSS</h2>
          <textarea class="cz__css"
            [ngModel]="p.custom_css"
            (ngModelChange)="setField('custom_css', $event)"
            placeholder="/* Override anything here */"
            rows="6"></textarea>
        </section>

        <!-- Actions -->
        <div class="cz__actions">
          <button class="cz__btn cz__btn--primary" (click)="save()" [disabled]="saving()">
            {{ saving() ? 'Saving…' : 'Save Changes' }}
          </button>
          @if (saved()) {
            <span class="cz__saved">✓ Saved</span>
          }
        </div>
      } @else {
        <p class="cz__loading">Loading preferences…</p>
      }
    </div>
  `,
  styles: [`
    .cz { max-width: 680px; }
    .cz__title {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 1.6rem;
      color: var(--text-primary, #e4e4e7);
      margin-bottom: 0.5rem;
    }
    .cz__desc {
      color: var(--text-secondary, #71717a);
      margin-bottom: 2rem; line-height: 1.5;
    }
    .cz__section { margin-bottom: 2rem; }
    .cz__label {
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 0.95rem;
      color: var(--text-primary, #e4e4e7);
      margin-bottom: 0.85rem;
    }

    /* Colours */
    .cz__colors {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.85rem;
    }
    .cz__color-field { display: flex; flex-direction: column; gap: 0.25rem; }
    .cz__color-name {
      font-size: 0.8rem;
      color: var(--text-secondary, #71717a);
    }
    .cz__color-input { display: flex; align-items: center; gap: 0.5rem; }
    .cz__color-input input[type="color"] {
      width: 36px; height: 36px;
      border: 1px solid var(--border, #1e1e24);
      border-radius: 6px;
      cursor: pointer; padding: 0; background: none;
    }
    .cz__hex {
      flex: 1;
      background: var(--bg-primary, #0f0f13);
      border: 1px solid var(--border, #1e1e24);
      border-radius: 6px;
      color: var(--text-primary, #e4e4e7);
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 0.85rem;
      padding: 0.35rem 0.5rem;
    }

    /* Select */
    .cz__select-wrap {
      display: flex; flex-direction: column; gap: 0.25rem;
      max-width: 280px;
      font-size: 0.85rem;
      color: var(--text-secondary, #71717a);
    }
    .cz__select-wrap select {
      background: var(--bg-primary, #0f0f13);
      color: var(--text-primary, #e4e4e7);
      border: 1px solid var(--border, #1e1e24);
      border-radius: 6px;
      padding: 0.5rem; font-size: 0.9rem;
    }

    /* Animation cards */
    .cz__anim-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }
    .cz__anim-card {
      display: flex; flex-direction: column; gap: 0.2rem;
      padding: 0.85rem;
      background: var(--bg-secondary, #18181b);
      border: 2px solid var(--border, #1e1e24);
      border-radius: 10px;
      cursor: pointer; transition: border-color 0.2s;
      text-align: left;
    }
    .cz__anim-card:hover { border-color: var(--text-secondary, #71717a); }
    .cz__anim-card.active { border-color: var(--accent, #8b5cf6); }
    .cz__anim-name {
      font-size: 0.85rem;
      color: var(--text-primary, #e4e4e7);
      font-weight: 600;
    }
    .cz__anim-desc {
      font-size: 0.72rem;
      color: var(--text-secondary, #71717a);
    }

    /* Custom CSS */
    .cz__css {
      width: 100%;
      background: var(--bg-primary, #0f0f13);
      color: var(--text-primary, #e4e4e7);
      border: 1px solid var(--border, #1e1e24);
      border-radius: 6px;
      padding: 0.75rem;
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
      font-size: 0.82rem;
      resize: vertical;
    }

    /* Actions */
    .cz__actions {
      display: flex; align-items: center; gap: 1rem;
      margin-top: 1.5rem;
    }
    .cz__btn {
      border: none; cursor: pointer;
      padding: 0.6rem 1.5rem;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .cz__btn--primary {
      background: var(--accent, #8b5cf6);
      color: var(--bg-primary, #0f0f13);
      font-weight: 600;
    }
    .cz__btn--primary:hover { filter: brightness(1.15); }
    .cz__btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .cz__saved {
      font-size: 0.85rem;
      color: var(--accent, #8b5cf6);
      font-family: var(--font-mono, 'JetBrains Mono', monospace);
    }
    .cz__loading {
      color: var(--text-secondary, #71717a);
      padding: 2rem 0;
    }
  `],
})
export class CustomizeComponent implements OnInit {
  prefs = signal<UserPreferences | null>(null);
  animOptions = signal<AnimationOption[]>([]);
  saving = signal(false);
  saved = signal(false);

  colorFields = [
    { key: 'accent_color',  label: 'Accent' },
    { key: 'bg_color',      label: 'Background' },
    { key: 'bg_secondary',  label: 'Surface' },
    { key: 'text_color',    label: 'Text' },
  ] as const;

  constructor(
    private auth: AuthService,
    private prefsSvc: PreferencesService,
  ) {}

  async ngOnInit() {
    const uid = this.auth.user()?.id;
    if (!uid) return;

    const [p, anims] = await Promise.all([
      this.prefsSvc.getPreferences(uid),
      this.prefsSvc.getAnimationOptions(),
    ]);

    if (p) this.prefs.set(p);
    this.animOptions.set(anims.length ? anims : this.defaultAnimOptions());
  }

  getField(p: UserPreferences, key: string): string {
    return (p as any)[key] ?? '';
  }

  setField(key: string, value: any) {
    this.prefs.update(p => (p ? { ...p, [key]: value } : p));
    // Live preview
    this.prefsSvc.applyTheme(this.prefs()!);
  }

  async save() {
    const uid = this.auth.user()?.id;
    const p = this.prefs();
    if (!uid || !p) return;

    this.saving.set(true);
    try {
      await this.prefsSvc.updatePreferences(uid, p);
      this.auth.reloadPreferences();
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2000);
    } finally {
      this.saving.set(false);
    }
  }

  private defaultAnimOptions(): AnimationOption[] {
    return [
      { id: 'none',      label: 'None',      description: 'No animation' },
      { id: 'particles', label: 'Particles',  description: 'Floating particles' },
      { id: 'gradient',  label: 'Gradient',   description: 'Shifting gradient' },
      { id: 'waves',     label: 'Waves',      description: 'Flowing wave lines' },
      { id: 'matrix',    label: 'Matrix',     description: 'Falling code rain' },
      { id: 'snow',      label: 'Snow',       description: 'Gentle snowfall' },
    ];
  }
}