import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';

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
            map((courses) => ({ ...cert, courses }))
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
}
