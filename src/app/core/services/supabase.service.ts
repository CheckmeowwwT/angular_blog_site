import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  get supabase(): SupabaseClient {
    return this.client;
  }

  get auth() {
    return this.client.auth;
  }

  get storage() {
    return this.client.storage;
  }

  /** Upload a file to the portfolio-media bucket */
  async uploadFile(file: File, path: string): Promise<string | null> {
    const { data, error } = await this.storage
      .from('portfolio-media')
      .upload(path, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data: urlData } = this.storage
      .from('portfolio-media')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  /** Delete a file from the portfolio-media bucket */
  async deleteFile(path: string): Promise<boolean> {
    const { error } = await this.storage
      .from('portfolio-media')
      .remove([path]);
    return !error;
  }
}