import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DiplomaProgress, DiplomasMode, DiplomaSummary } from '../../core/models';

@Component({
  selector: 'app-diplomas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './diplomas.component.html',
  styleUrl: './diplomas.component.css'
})
export class DiplomasComponent implements OnInit {
  diplomas: DiplomaSummary[] = [];
  progressById: Record<number, DiplomaProgress> = {};
  claimLoadingById: Record<number, boolean> = {};
  messageById: Record<number, string> = {};
  error = '';
  loading = true;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void {
    this.api.getDiplomas().subscribe({
      next: (data) => {
        this.diplomas = data || [];
        this.loading = false;
        if (this.isLoggedIn) {
          this.loadProgress();
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load diplomas';
        this.loading = false;
      }
    });
  }

  private loadProgress(): void {
    this.api.getDiplomasProgress().subscribe({
      next: (items) => {
        (items || []).forEach((item) => {
          this.progressById[item.diplomaId] = item;
        });
      },
      error: () => {}
    });
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  isClaimEnabled(diplomaId: number): boolean {
    const progress = this.progressById[diplomaId];
    if (!progress) return false;
    return progress.isCompleted && !progress.isClaimed;
  }

  onTryClaim(diplomaId: number): void {
    const progress = this.progressById[diplomaId];
    if (!progress) return;

    if (!this.isClaimEnabled(diplomaId)) {
      this.messageById[diplomaId] = 'Complete required certificates first to get this diploma.';
      return;
    }

    this.claimLoadingById[diplomaId] = true;
    this.messageById[diplomaId] = '';
    this.api.claimDiploma(diplomaId).subscribe({
      next: (res) => {
        this.claimLoadingById[diplomaId] = false;
        this.messageById[diplomaId] = res.message;
        const current = this.progressById[diplomaId];
        if (current) {
          this.progressById[diplomaId] = {
            ...current,
            isClaimed: true,
            serialNumber: res.serialNumber || null,
            claimedAt: res.claimedAt
          };
        }
      },
      error: (err) => {
        this.claimLoadingById[diplomaId] = false;
        this.messageById[diplomaId] = err?.error?.message || err?.error || 'Failed to claim diploma';
      }
    });
  }

  modeLabel(mode: DiplomasMode): string {
    if (mode === 'SPECIALIZED_TECHNICIAN') return 'Specialized Technician';
    if (mode === 'TECHNICIAN') return 'Technician';
    return 'Qualification';
  }
}
