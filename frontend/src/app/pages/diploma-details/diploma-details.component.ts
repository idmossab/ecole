import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DiplomaCertificateStatus, DiplomaProgress, DiplomasMode, DiplomaSummary, SpecializationSummary } from '../../core/models';

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
  specializations: SpecializationSummary[] = [];
  selectedSpecialization: SpecializationSummary | null = null;
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
        this.loadSupplementalData(diplomaId);
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

  private loadSupplementalData(diplomaId: number): void {
    forkJoin({
      certificates: this.api.getDiplomaCertificates(diplomaId),
      specializations: this.api.getDiplomaSpecializations(diplomaId)
    }).subscribe({
      next: ({ certificates, specializations }) => {
        this.requiredCertificates = certificates || [];
        this.specializations = specializations || [];
        this.selectedSpecialization = this.specializations.length ? this.specializations[0] : null;
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

  modeTag(mode: DiplomasMode): string {
    return `${this.modeLabel(mode).toUpperCase()} DIPLOMA`;
  }

  selectSpecialization(item: SpecializationSummary): void {
    this.selectedSpecialization = item;
  }

  isSpecializationSelected(item: SpecializationSummary): boolean {
    return !!this.selectedSpecialization && this.selectedSpecialization.id === item.id;
  }

  diplomaImageUrl(): string {
    const source = this.diploma?.imageUrl;
    if (!source) {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80';
    }
    if (source.startsWith('http://') || source.startsWith('https://')) return source;
    return `http://localhost:8080${source}`;
  }

  durationLabel(): string {
    const specializationDuration = this.selectedSpecialization?.durationText?.trim();
    if (specializationDuration) return specializationDuration;
    if (!this.diploma) return '12-18 months';
    if (this.diploma.mode === 'SPECIALIZED_TECHNICIAN') return '18-24 months';
    if (this.diploma.mode === 'TECHNICIAN') return '12-18 months';
    return '24-30 months';
  }

  credentialLabel(): string {
    const awarded = this.selectedSpecialization?.certificateAwarded?.trim();
    if (awarded) return awarded;
    if (!this.diploma) return 'Professional Diploma Certificate';
    if (this.diploma.mode === 'SPECIALIZED_TECHNICIAN') return 'Specialized Software Developer';
    if (this.diploma.mode === 'TECHNICIAN') return 'Certified IT Technician';
    return 'Professional Qualification Certificate';
  }

  admissionRequirements(): string[] {
    const dynamic = this.parseList(this.selectedSpecialization?.entryRequirements);
    if (dynamic.length) return dynamic;
    if (!this.diploma) return [];
    if (this.diploma.mode === 'SPECIALIZED_TECHNICIAN') {
      return [
        'High school diploma or equivalent',
        'Strong computer literacy',
        'Commitment to full-time study'
      ];
    }
    if (this.diploma.mode === 'TECHNICIAN') {
      return [
        'High school diploma or equivalent',
        'Basic computer literacy',
        'Commitment to full-time study'
      ];
    }
    return [
      'Secondary school certificate',
      'Basic academic readiness',
      'Motivation to complete practical training'
    ];
  }

  programFeatures(): string[] {
    const dynamic = this.parseList(this.selectedSpecialization?.programFeatures);
    if (dynamic.length) return dynamic;
    return [
      'Live instruction from expert teachers',
      'Flexible online and in-person options',
      'Official certification upon completion',
      'Career guidance and support'
    ];
  }

  programOverview(): string {
    return this.selectedSpecialization?.programOverview?.trim()
      || this.selectedSpecialization?.description?.trim()
      || 'Choose your career path from our specialized tracks.';
  }

  private parseList(value?: string | null): string[] {
    if (!value) return [];
    return value
      .split(/\r?\n|;|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}
