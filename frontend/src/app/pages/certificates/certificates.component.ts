import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { Certificate } from '../../core/certificates.data';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.css'
})
export class CertificatesComponent implements OnInit {
  certificates: Certificate[] = [];
  loading = true;
  error = '';
  private readonly fallbackImages = [
    'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80'
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getCertificates().pipe(
      switchMap((data) => {
        const certs = data || [];
        if (!certs.length) {
          return of(certs);
        }
        const withCounts$ = certs.map((cert) =>
          this.api.getCertificateCourses(cert.id).pipe(
            map((courses) => ({ ...cert, courses })),
            catchError(() => of({ ...cert, courses: [] }))
          )
        );
        return forkJoin(withCounts$);
      })
    ).subscribe({
      next: (data) => {
        this.certificates = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load certificates';
        this.loading = false;
      }
    });
  }

  cardTag(cert: Certificate): string {
    const title = (cert.title || '').toUpperCase();
    if (title.includes('ENGLISH')) return 'ENGLISH';
    if (title.includes('WEB') || title.includes('DEV')) return 'DEVELOPMENT';
    if (title.includes('NETWORK')) return 'NETWORKING';
    return 'CERTIFICATE';
  }

  cardImage(cert: Certificate, index: number): string {
    const fromCourse = cert.courses?.find((course) => !!course.imageUrl)?.imageUrl;
    return fromCourse || this.fallbackImages[index % this.fallbackImages.length];
  }

  durationLabel(cert: Certificate): string {
    const fromCourse = cert.courses?.find((course) => !!course.durationText)?.durationText?.trim();
    return fromCourse || '3-6 months';
  }
}
