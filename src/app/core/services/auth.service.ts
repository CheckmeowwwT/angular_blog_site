import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { PreferencesService } from './preferences.service';
import { Profile, UserPreferences } from '../models/models';
import { User } from '@supabase/supabase-js';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSignal = signal<User | null>(null);
  private profileSignal = signal<Profile | null>(null);
  private prefsSignal = signal<UserPreferences | null>(null);
  private ready = signal(false);

  user = this.userSignal.asReadonly();
  profile = this.profileSignal.asReadonly();
  preferences = this.prefsSignal.asReadonly();
  isLoggedIn = computed(() => !!this.userSignal());
  isReady = this.ready.asReadonly();

  constructor(
    private sb: SupabaseService,
    private prefsSvc: PreferencesService,
    private router: Router
  ) {
    this.init();
  }

  private async init() {
    const { data: { session } } = await this.sb.auth.getSession();
    if (session?.user) {
      this.userSignal.set(session.user);
      await this.loadProfileAndPrefs(session.user.id);
    }
    this.ready.set(true);

    this.sb.auth.onAuthStateChange(async (event, session) => {
      this.userSignal.set(session?.user ?? null);
      if (session?.user) {
        await this.loadProfileAndPrefs(session.user.id);
      } else {
        this.profileSignal.set(null);
        this.prefsSignal.set(null);
        this.prefsSvc.clearTheme();
      }
    });
  }

  private async loadProfileAndPrefs(userId: string) {
    const { data } = await this.sb.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    this.profileSignal.set(data);

    const prefs = await this.prefsSvc.getPreferences(userId);
    if (prefs) {
      this.prefsSignal.set(prefs);
      this.prefsSvc.applyTheme(prefs);
    }
  }

  /** Call this after saving preferences so the theme updates live */
  reloadPreferences() {
    const uid = this.userSignal()?.id;
    if (uid) {
      this.prefsSvc.getPreferences(uid).then(prefs => {
        if (prefs) {
          this.prefsSignal.set(prefs);
          this.prefsSvc.applyTheme(prefs);
        }
      });
    }
  }

  async signInWithEmail(email: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    this.router.navigate(['/dashboard']);
  }

  async signUp(email: string, password: string, username: string) {
    const { data, error } = await this.sb.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await this.sb.supabase.from('profiles').insert({
        id: data.user.id,
        username,
        display_name: username,
      });
    }
  }

  async signInWithGithub() {
    const { error } = await this.sb.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: window.location.origin + '/dashboard' },
    });
    if (error) throw error;
  }

  async signOut() {
    await this.sb.auth.signOut();
    this.userSignal.set(null);
    this.profileSignal.set(null);
    this.prefsSignal.set(null);
    this.prefsSvc.clearTheme();
    this.router.navigate(['/']);
  }
}