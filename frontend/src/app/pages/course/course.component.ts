import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Course } from '../../core/certificates.data';
import { CertificateProgress, Media } from '../../core/models';

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
  activeVideoId: number | null = null;
  watchedVideoIds = new Set<number>();
  progress: CertificateProgress | null = null;
  loading = true;
  watchLoading = false;
  error = '';
  watchMessage = '';

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
        this.loadProgress();
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
          this.activeVideoId = this.videos[0].id || null;
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

  private loadProgress(): void {
    const certificateId = this.course?.certificateId;
    if (!this.isLoggedIn || !certificateId) return;
    this.api.getCertificateProgress(certificateId).subscribe({
      next: (progress) => {
        this.progress = progress;
      },
      error: () => {}
    });
  }

  loginToStart(): void {
    if (!this.course) return;
    this.router.navigateByUrl(`/login?returnTo=/course/${this.course.id}`);
  }

  selectVideo(url: string): void {
    if (!this.canWatch) return;
    this.activeVideoUrl = url;
    const selected = this.videos.find((v) => v.url === url);
    this.activeVideoId = selected?.id || null;
  }

  markAsWatched(video: Media, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.isLoggedIn || !video.id) return;

    this.watchMessage = '';
    this.watchLoading = true;
    this.api.markVideoWatched(video.id, true).subscribe({
      next: (progress) => {
        this.watchedVideoIds.add(video.id!);
        this.progress = progress;
        this.watchMessage = 'Video marked as watched.';
        this.watchLoading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to save watched progress';
        this.watchLoading = false;
      }
    });
  }

  onActiveVideoEnded(): void {
    if (!this.activeVideoId) return;
    const active = this.videos.find((video) => video.id === this.activeVideoId);
    if (active) {
      this.markAsWatched(active);
    }
  }

  isVideoWatched(video: Media): boolean {
    if (!video.id) return false;
    if (this.watchedVideoIds.has(video.id)) return true;
    if (!this.progress) return false;
    return this.progress.isCompleted;
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
