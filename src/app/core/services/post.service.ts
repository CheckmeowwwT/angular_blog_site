import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Post } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private sb: SupabaseService) {}

  /** Get all published posts (public) */
  async getPublishedPosts(limit = 50): Promise<Post[]> {
    const { data, error } = await this.sb.supabase
      .from('posts')
      .select('*, profiles(display_name, avatar_url, username)')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data ?? [];
  }

  /** Get featured posts for the homepage */
  async getFeaturedPosts(): Promise<Post[]> {
    const { data, error } = await this.sb.supabase
      .from('posts')
      .select('*, profiles(display_name, avatar_url, username)')
      .eq('published', true)
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data ?? [];
  }

  /** Get a single post by slug */
  async getPostBySlug(slug: string): Promise<Post | null> {
    const { data, error } = await this.sb.supabase
      .from('posts')
      .select('*, profiles(display_name, avatar_url, username)')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  /** Get posts by tag */
  async getPostsByTag(tag: string): Promise<Post[]> {
    const { data, error } = await this.sb.supabase
      .from('posts')
      .select('*, profiles(display_name, avatar_url, username)')
      .eq('published', true)
      .contains('tags', [tag])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /** Get all posts for admin (including drafts) */
  async getAllPostsForAuthor(authorId: string): Promise<Post[]> {
    const { data, error } = await this.sb.supabase
      .from('posts')
      .select('*')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }

  /** Create a post */
  async createPost(post: Partial<Post>): Promise<Post> {
    const { data, error } = await this.sb.supabase
      .from('posts')
      .insert(post)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Update a post */
  async updatePost(id: string, updates: Partial<Post>): Promise<Post> {
    const { data, error } = await this.sb.supabase
      .from('posts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Delete a post */
  async deletePost(id: string): Promise<void> {
    const { error } = await this.sb.supabase
      .from('posts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  /** Generate a URL-safe slug from a title */
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}