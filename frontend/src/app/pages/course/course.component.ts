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
  loading = true;
  error = '';

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
        this.videos = data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  loginToStart(): void {
    if (!this.course) return;
    this.router.navigateByUrl(`/login?returnTo=/course/${this.course.id}`);
  }

  get learnItems(): string[] {
    if (!this.course?.whatYouWillLearn) return [];
    return this.course.whatYouWillLearn
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
