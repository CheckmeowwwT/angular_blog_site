import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Project } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private sb: SupabaseService) {}

  async getProjects(): Promise<Project[]> {
    const { data, error } = await this.sb.supabase
      .from('projects')
      .select('*, profiles(display_name, avatar_url, username)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  async getFeaturedProjects(): Promise<Project[]> {
    const { data, error } = await this.sb.supabase
      .from('projects')
      .select('*, profiles(display_name, avatar_url, username)')
      .eq('featured', true)
      .order('sort_order', { ascending: true })
      .limit(6);

    if (error) throw error;
    return data ?? [];
  }

  async getProjectBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await this.sb.supabase
      .from('projects')
      .select('*, profiles(display_name, avatar_url, username)')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  async getAllProjectsForAuthor(authorId: string): Promise<Project[]> {
    const { data, error } = await this.sb.supabase
      .from('projects')
      .select('*')
      .eq('author_id', authorId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    const { data, error } = await this.sb.supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const { data, error } = await this.sb.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.sb.supabase
      .from('projects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}