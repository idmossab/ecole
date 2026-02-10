import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
  selectedCourse: Course | null = null;
  loading = true;
  error = '';
  joinRequested = false;
  readonly fallbackPhone = '+1 (555) 123-4567';
  private readonly fallbackBanner =
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1400&q=80';

  constructor(
    private route: ActivatedRoute,
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
        this.selectedCourse = this.courses.length ? this.courses[0] : null;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load courses';
        this.loading = false;
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
  }

  isSelected(course: Course): boolean {
    return !!this.selectedCourse && this.selectedCourse.id === course.id;
  }

  modeBadge(mode?: string | null): string {
    if (!mode) return 'ONLINE';
    const value = mode.toUpperCase();
    if (value === 'ONLINE') return 'ONLINE';
    return 'ONSITE';
  }

  modeDescription(mode?: string | null): string {
    return this.modeBadge(mode) === 'ONLINE'
      ? 'Live via Zoom/Teams'
      : 'In-person';
  }

  certificateImageUrl(): string {
    const source = this.certificate?.imageUrl;
    if (!source) return this.fallbackBanner;
    if (source.startsWith('http://') || source.startsWith('https://')) return source;
    return `http://localhost:8080${source}`;
  }

  teacherName(course: Course | null): string {
    return course?.teacherName?.trim() || 'Teacher not assigned';
  }

  phoneNumber(course: Course | null): string {
    return course?.phoneContact?.trim() || this.fallbackPhone;
  }

  phoneHref(course: Course | null): string {
    const source = this.phoneNumber(course);
    const cleaned = source.replace(/[^+\d]/g, '');
    return cleaned || '+15551234567';
  }

  requestJoinCertificate(): void {
    this.joinRequested = true;
  }
}
