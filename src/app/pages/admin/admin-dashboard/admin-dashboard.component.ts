import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { PostService } from '../../../core/services/post.service';
import { ProjectService } from '../../../core/services/project.service';
import { Post, Project } from '../../../core/models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="admin">
      <div class="admin-header">
        <h1>Dashboard</h1>
        <div class="admin-actions">
          <button class="btn btn-primary" (click)="newPost()">+ New Post</button>
          <button class="btn btn-outline" (click)="newProject()">+ New Project</button>
        </div>
      </div>

      <!-- Posts -->
      <div class="panel">
        <h2>Posts ({{ posts().length }})</h2>
        @if (posts().length) {
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of posts(); track p.id) {
                <tr>
                  <td>{{ p.title }}</td>
                  <td>
                    <span class="badge" [class.published]="p.published">
                      {{ p.published ? 'Published' : 'Draft' }}
                    </span>
                  </td>
                  <td>{{ p.created_at | date:'shortDate' }}</td>
                  <td>
                    <a [routerLink]="['/admin/post', p.id]" class="edit-link">Edit</a>
                    <button class="del-btn" (click)="deletePost(p)">✕</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="empty">No posts yet.</p>
        }
      </div>

      <!-- Projects -->
      <div class="panel">
        <h2>Projects ({{ projects().length }})</h2>
        @if (projects().length) {
          <table class="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Featured</th>
                <th>Order</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (p of projects(); track p.id) {
                <tr>
                  <td>{{ p.title }}</td>
                  <td>{{ p.featured ? '⭐' : '—' }}</td>
                  <td>{{ p.sort_order }}</td>
                  <td>
                    <a [routerLink]="['/admin/project', p.id]" class="edit-link">Edit</a>
                    <button class="del-btn" (click)="deleteProject(p)">✕</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        } @else {
          <p class="empty">No projects yet.</p>
        }
      </div>
    </section>
  `,
  styles: [`
    .admin-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;
    }
    h1 { color: #fff; font-size: 1.8rem; margin: 0; }
    .admin-actions { display: flex; gap: 0.5rem; }
    .btn {
      padding: 0.5rem 1rem; border-radius: 6px; border: none;
      font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary { background: #8b5cf6; color: #fff; }
    .btn-primary:hover { background: #7c3aed; }
    .btn-outline { background: transparent; border: 1px solid #333; color: #ccc; }
    .btn-outline:hover { border-color: #8b5cf6; color: #fff; }

    .panel {
      background: #151515; border: 1px solid #222; border-radius: 10px;
      padding: 1.5rem; margin-bottom: 1.5rem;
    }
    .panel h2 { font-size: 1.1rem; color: #ddd; margin: 0 0 1rem; }

    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left; color: #666; font-size: 0.75rem;
      text-transform: uppercase; letter-spacing: 0.05em;
      padding: 0.5rem 0.75rem; border-bottom: 1px solid #222;
    }
    .data-table td {
      padding: 0.6rem 0.75rem; border-bottom: 1px solid #1a1a1a;
      color: #ccc; font-size: 0.9rem;
    }
    .badge {
      font-size: 0.75rem; padding: 0.15rem 0.5rem; border-radius: 10px;
      background: #2a2a2a; color: #888;
    }
    .badge.published { background: #14532d; color: #4ade80; }
    .edit-link {
      color: #8b5cf6; text-decoration: none; font-size: 0.85rem;
      margin-right: 0.75rem;
    }
    .del-btn {
      background: none; border: none; color: #666; cursor: pointer;
      font-size: 0.85rem;
    }
    .del-btn:hover { color: #f87171; }
    .empty { color: #555; font-style: italic; font-size: 0.9rem; }
  `],
})
export class AdminDashboardComponent implements OnInit {
  posts = signal<Post[]>([]);
  projects = signal<Project[]>([]);

  constructor(
    private auth: AuthService,
    private postSvc: PostService,
    private projectSvc: ProjectService,
    private router: Router,
  ) {}

  async ngOnInit() {
    const uid = this.auth.user()?.id;
    if (!uid) return;
    const [posts, projects] = await Promise.all([
      this.postSvc.getAllPostsForAuthor(uid),
      this.projectSvc.getAllProjectsForAuthor(uid),
    ]);
    this.posts.set(posts);
    this.projects.set(projects);
  }

  async newPost() {
    const uid = this.auth.user()?.id;
    if (!uid) return;
    const p = await this.postSvc.createPost({
      author_id: uid,
      title: 'Untitled Post',
      slug: 'untitled-' + Date.now(),
      content: '',
      tags: [],
      published: false,
      featured: false,
    });
    this.router.navigate(['/admin/post', p.id]);
  }

  async newProject() {
    const uid = this.auth.user()?.id;
    if (!uid) return;
    const p = await this.projectSvc.createProject({
      author_id: uid,
      title: 'Untitled Project',
      slug: 'untitled-' + Date.now(),
      tech_stack: [],
      images: [],
      featured: false,
      sort_order: 0,
    });
    this.router.navigate(['/admin/project', p.id]);
  }

  async deletePost(post: Post) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    await this.postSvc.deletePost(post.id);
    this.posts.update(list => list.filter(p => p.id !== post.id));
  }

  async deleteProject(project: Project) {
    if (!confirm(`Delete "${project.title}"?`)) return;
    await this.projectSvc.deleteProject(project.id);
    this.projects.update(list => list.filter(p => p.id !== project.id));
  }
}