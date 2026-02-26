import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { UserPreferences, AnimationOption } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  constructor(private sb: SupabaseService) {}

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const { data, error } = await this.sb.supabase
      .from('user_preferences')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  }

  async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
    const { error } = await this.sb.supabase
      .from('user_preferences')
      .update(prefs)
      .eq('id', userId);
    if (error) throw error;
  }

  async getAnimationOptions(): Promise<AnimationOption[]> {
    const { data, error } = await this.sb.supabase
      .from('animations')
      .select('*');
    if (error) return [];
    return data ?? [];
  }

  /**
   * Map DB fields → CSS custom properties on :root.
   * This is why header, footer, dashboard, everything changes.
   */
  applyTheme(prefs: UserPreferences): void {
    const root = document.documentElement;
    const map: Record<string, string | undefined> = {
      '--bg-primary':    prefs.bg_color,
      '--bg-secondary':  prefs.bg_secondary,
      '--accent':        prefs.accent_color,
      '--text-primary':  prefs.text_color,
      // derive muted text and border from the main colours
      '--text-secondary': prefs.text_color ? this.mute(prefs.text_color, 0.45) : undefined,
      '--border':         prefs.bg_secondary ? this.lighten(prefs.bg_secondary, 8) : undefined,
      '--font-mono':      prefs.font_family ? `'${prefs.font_family}', monospace` : undefined,
      '--font-sans':      prefs.font_family ? `'${prefs.font_family}', sans-serif` : undefined,
    };

    for (const [prop, val] of Object.entries(map)) {
      if (val) root.style.setProperty(prop, val);
    }

    // Inject custom CSS if any
    let style = document.getElementById('user-custom-css') as HTMLStyleElement | null;
    if (prefs.custom_css) {
      if (!style) {
        style = document.createElement('style');
        style.id = 'user-custom-css';
        document.head.appendChild(style);
      }
      style.textContent = prefs.custom_css;
    } else if (style) {
      style.remove();
    }
  }

  /** Remove all custom properties so defaults take over */
  clearTheme(): void {
    const root = document.documentElement;
    [
      '--bg-primary', '--bg-secondary', '--accent',
      '--text-primary', '--text-secondary', '--border',
      '--font-mono', '--font-sans',
    ].forEach(p => root.style.removeProperty(p));

    document.getElementById('user-custom-css')?.remove();
  }

  // ── colour helpers ──────────────────────────────────────
  /** Mix a hex colour toward grey by `amount` (0-1) */
  private mute(hex: string, amount: number): string {
    const [r, g, b] = this.hexToRgb(hex);
    const m = (c: number) => Math.round(c + (128 - c) * amount);
    return this.rgbToHex(m(r), m(g), m(b));
  }

  /** Lighten/shift a hex colour by `steps` (0-255) */
  private lighten(hex: string, steps: number): string {
    const [r, g, b] = this.hexToRgb(hex);
    const c = (v: number) => Math.min(255, v + steps);
    return this.rgbToHex(c(r), c(g), c(b));
  }

  private hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
  }
}