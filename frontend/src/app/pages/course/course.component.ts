import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Course } from '../../core/certificates.data';
import { Media } from '../../core/models';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent {
  course: Course | null = null;
  videos: Media[] = [];
  durationByUrl: Record<string, number> = {};
  activeVideoUrl: string | null = null;
  loading = true;
  error = '';

  private readonly apiBase = 'http://localhost:8080';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!idParam || Number.isNaN(id)) {
      this.loading = false;
      return;
    }

    this.api.getCourseById(id).subscribe({
      next: (course) => {
        this.course = course;
        this.loadVideos(id);
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load course';
        this.loading = false;
      }
    });
  }

  private loadVideos(courseId: number): void {
    this.api.getCourseMedia(courseId).subscribe({
      next: (data) => {
        this.videos = (data || []).map((v) => ({
          ...v,
          url: this.normalizeUrl(v.url)
        }));
        if (this.videos.length) {
          this.activeVideoUrl = this.videos[0].url || null;
          this.prefetchDurations();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private normalizeUrl(url: string | undefined | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/')) return `${this.apiBase}${url}`;
    return `${this.apiBase}/${url}`;
  }

  private prefetchDurations(): void {
    this.videos.forEach((video) => {
      if (!video.url || this.durationByUrl[video.url] != null) return;
      const el = document.createElement('video');
      el.preload = 'metadata';
      el.src = video.url;
      el.onloadedmetadata = () => {
        this.durationByUrl[video.url] = Math.round(el.duration || 0);
      };
      el.onerror = () => {
        this.durationByUrl[video.url] = 0;
      };
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get canWatch(): boolean {
    return this.isLoggedIn;
  }

  loginToStart(): void {
    if (!this.course) return;
    this.router.navigateByUrl(`/login?returnTo=/course/${this.course.id}`);
  }

  selectVideo(url: string): void {
    if (!this.canWatch) return;
    this.activeVideoUrl = url;
  }

  formatDuration(seconds: number | undefined): string {
    const total = seconds || 0;
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  get learnItems(): string[] {
    if (!this.course?.whatYouWillLearn) return [];
    return this.course.whatYouWillLearn
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
