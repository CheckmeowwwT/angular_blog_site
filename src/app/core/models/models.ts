export interface Profile {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    github_url?: string;
    website_url?: string;
    created_at: string;
  }
  
  export interface Post {
    id: string;
    author_id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    cover_image_url?: string;
    tags: string[];
    published: boolean;
    featured: boolean;
    created_at: string;
    updated_at: string;
    profiles?: Profile;
  }
  
  export interface Project {
    id: string;
    author_id: string;
    title: string;
    slug: string;
    description?: string;
    long_description?: string;
    cover_image_url?: string;
    video_url?: string;
    github_url?: string;
    live_url?: string;
    tech_stack: string[];
    images: string[];
    featured: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    profiles?: Profile;
  }
  
  export interface Media {
    id: string;
    author_id: string;
    file_name: string;
    file_url: string;
    file_type: 'image' | 'video' | 'document';
    alt_text?: string;
    created_at: string;
  }
  
  export interface UserPreferences {
    id: string;
    bg_color: string;
    bg_secondary: string;
    accent_color: string;
    text_color: string;
    font_family: string;
    animation: AnimationType;
    sidebar_position: 'left' | 'right';
    custom_css: string;
    created_at: string;
    updated_at: string;
  }
  
  export type AnimationType = 'none' | 'particles' | 'gradient' | 'waves' | 'matrix' | 'snow';
  
  export interface AnimationOption {
    id: AnimationType;
    label: string;
    description: string;
    preview_url?: string;
  }