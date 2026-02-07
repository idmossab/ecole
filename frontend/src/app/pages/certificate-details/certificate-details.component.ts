import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Certificate, Course } from '../../core/certificates.data';
import { CertificateProgress } from '../../core/models';

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
  progress: CertificateProgress | null = null;
  loading = true;
  progressLoading = false;
  claimLoading = false;
  error = '';
  claimError = '';
  claimMessage = '';

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
        this.loadProgress(cert.id);
        this.loadCourses(id);
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load certificate';
        this.loading = false;
      }
    });
  }

  private loadProgress(certificateId: number): void {
    if (!this.isLoggedIn) return;
    this.progressLoading = true;
    this.api.getCertificateProgress(certificateId).subscribe({
      next: (data) => {
        this.progress = data;
        this.progressLoading = false;
      },
      error: () => {
        this.progressLoading = false;
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

  openCourse(courseId: number): void {
    this.router.navigateByUrl(`/course/${courseId}`);
  }

  get progressPercent(): number {
    return this.progress?.percentage ?? 0;
  }

  get canClaim(): boolean {
    if (!this.progress) return false;
    return this.progress.isCompleted && !this.progress.isClaimed;
  }

  onGetCertificate(): void {
    this.claimError = '';
    this.claimMessage = '';
    if (!this.isLoggedIn) {
      this.router.navigateByUrl(`/login?returnTo=/certificate/${this.certificate?.id || ''}`);
      return;
    }
    if (!this.certificate || !this.progress) return;
    if (this.progress.isClaimed) {
      this.claimMessage = 'Certificate already claimed.';
      return;
    }

    this.claimLoading = true;
    this.api.claimCertificate(this.certificate.id).subscribe({
      next: (res) => {
        this.claimMessage = res.message;
        this.progress = {
          ...this.progress!,
          isClaimed: true
        };
        this.claimLoading = false;
      },
      error: (err) => {
        this.claimError = err?.error?.message || err?.error || 'Failed to claim certificate';
        this.claimLoading = false;
      }
    });
  }

  showIncompleteClaimMessage(): void {
    this.claimMessage = '';
    this.claimError = 'Finish all videos first to get this certificate.';
  }
}
