import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Certificate, Course } from '../../core/certificates.data';

@Component({
  selector: 'app-certificate-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './certificate-details.component.html',
  styleUrl: './certificate-details.component.css'
})
export class CertificateDetailsComponent {
  certificate: Certificate | null = null;
  courses: Course[] = [];
  videoCounts: Record<number, number> = {};
  loading = true;
  error = '';
  showComingSoon = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
    private api: ApiService
  ) {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading = false;
      return;
    }
    const id = Number(slug);
    if (Number.isNaN(id)) {
      this.loading = false;
      return;
    }

    this.api.getCertificateById(id).subscribe({
      next: (cert) => {
        this.certificate = cert;
        this.loadCourses(id);
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load certificate';
        this.loading = false;
      }
    });
  }

  private loadCourses(id: number): void {
    this.api.getCertificateCourses(id).subscribe({
      next: (data) => {
        this.courses = data || [];
        this.loadVideoCounts();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  private loadVideoCounts(): void {
    if (!this.courses.length) {
      this.loading = false;
      return;
    }
    forkJoin(this.courses.map((course) => this.api.getCourseMedia(course.id))).subscribe({
      next: (lists) => {
        lists.forEach((media, idx) => {
          const course = this.courses[idx];
          this.videoCounts[course.id] = media?.length || 0;
        });
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

  handleStartCourse(): void {
    if (!this.certificate) return;

    const hasContent = false;
    if (!hasContent) {
      if (!this.auth.isLoggedIn()) {
        this.router.navigateByUrl(`/login?returnTo=/certificate/${this.certificate.id}`);
        return;
      }
      this.showComingSoon = true;
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl(`/login?returnTo=/certificate/${this.certificate.id}`);
      return;
    }

    this.showComingSoon = true;
  }
}
