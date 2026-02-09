import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DiplomaCertificateStatus, DiplomaProgress, DiplomasMode, DiplomaSummary } from '../../core/models';

@Component({
  selector: 'app-diploma-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './diploma-details.component.html',
  styleUrl: './diploma-details.component.css'
})
export class DiplomaDetailsComponent {
  diploma: DiplomaSummary | null = null;
  requiredCertificates: DiplomaCertificateStatus[] = [];
  progress: DiplomaProgress | null = null;
  loading = true;
  message = '';
  error = '';
  claimLoading = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private auth: AuthService
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const diplomaId = Number(idParam);
    if (!idParam || Number.isNaN(diplomaId)) {
      this.loading = false;
      this.error = 'Diploma not found';
      return;
    }

    this.api.getDiplomaById(diplomaId).subscribe({
      next: (diploma) => {
        this.diploma = diploma;
        this.loadCertificates(diplomaId);
        if (this.isLoggedIn) {
          this.loadProgress(diplomaId);
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load diploma';
        this.loading = false;
      }
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  private loadCertificates(diplomaId: number): void {
    this.api.getDiplomaCertificates(diplomaId).subscribe({
      next: (items) => {
        this.requiredCertificates = items || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private loadProgress(diplomaId: number): void {
    this.api.getDiplomaProgress(diplomaId).subscribe({
      next: (progress) => {
        this.progress = progress;
      },
      error: () => {}
    });
  }

  canClaim(): boolean {
    return !!this.progress && this.progress.isCompleted && !this.progress.isClaimed;
  }

  claimDiploma(): void {
    if (!this.diploma || !this.progress) return;
    if (!this.canClaim()) {
      this.message = 'Complete required certificates first to get this diploma.';
      return;
    }
    this.claimLoading = true;
    this.message = '';
    this.api.claimDiploma(this.diploma.id).subscribe({
      next: (res) => {
        this.claimLoading = false;
        this.message = res.message;
        this.progress = {
          ...this.progress!,
          isClaimed: true,
          serialNumber: res.serialNumber || null,
          claimedAt: res.claimedAt
        };
      },
      error: (err) => {
        this.claimLoading = false;
        this.message = err?.error?.message || err?.error || 'Failed to claim diploma';
      }
    });
  }

  get displayCertificates(): DiplomaCertificateStatus[] {
    if (this.progress?.requiredCertificates?.length) {
      return this.progress.requiredCertificates;
    }
    return this.requiredCertificates;
  }

  modeLabel(mode: DiplomasMode): string {
    if (mode === 'SPECIALIZED_TECHNICIAN') return 'Specialized Technician';
    if (mode === 'TECHNICIAN') return 'Technician';
    return 'Qualification';
  }
}
