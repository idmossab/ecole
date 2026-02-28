import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DiplomaCertificateStatus, DiplomaProgress, DiplomasMode, DiplomaSummary, JoinRequestStatus, SpecializationSummary } from '../../core/models';

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
  joinRequested = false;
  joinStatus: JoinRequestStatus['status'] | null = null;

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
          this.loadJoinRequestStatus(diplomaId);
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

  requestJoinDiploma(): void {
    if (!this.diploma || this.isJoinDisabled()) return;
    if (!this.selectedSpecialization?.id) {
      this.message = 'Please select a specialization first.';
      return;
    }
    this.claimLoading = true;
    this.message = '';
    this.api.createDiplomaJoinRequest(this.diploma.id, { specializationId: this.selectedSpecialization.id }).subscribe({
      next: (res) => {
        this.claimLoading = false;
        this.joinStatus = res.status;
        this.joinRequested = this.joinStatus === 'PENDING' || this.joinStatus === 'ACCEPTED';
        this.message = this.statusMessage();
      },
      error: (err) => {
        this.claimLoading = false;
        this.message = err?.error?.message || err?.error || 'Failed to send join request';
      }
    });
  }

  isJoinDisabled(): boolean {
    return this.claimLoading || !this.selectedSpecialization || this.joinStatus === 'PENDING' || this.joinStatus === 'ACCEPTED';
  }

  joinButtonLabel(): string {
    if (this.joinStatus === 'PENDING') return 'Request Sent';
    if (this.joinStatus === 'ACCEPTED') return 'Accepted';
    return 'Request to Join Specialization';
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

  pageTitle(): string {
    const specializationTitle = this.selectedSpecialization?.title?.trim();
    if (specializationTitle) return specializationTitle;
    return this.diploma?.title || 'Specialization';
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
    return 'Duration not specified';
  }

  credentialLabel(): string {
    const awarded = this.selectedSpecialization?.certificateAwarded?.trim();
    if (awarded) return awarded;
    return 'Credential not specified';
  }

  admissionRequirements(): string[] {
    const dynamic = this.parseList(this.selectedSpecialization?.entryRequirements);
    if (dynamic.length) return dynamic;
    return [];
  }

  programFeatures(): string[] {
    const dynamic = this.parseList(this.selectedSpecialization?.programFeatures);
    if (dynamic.length) return dynamic;
    return [];
  }

  programOverview(): string {
    return this.selectedSpecialization?.programOverview?.trim()
      || this.selectedSpecialization?.description?.trim()
      || 'Program overview is not available yet.';
  }

  private parseList(value?: string | null): string[] {
    if (!value) return [];
    return value
      .split(/\r?\n|;|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  private statusMessage(): string {
    if (this.joinStatus === 'PENDING') return 'Request sent. Waiting for admin response.';
    if (this.joinStatus === 'ACCEPTED') return 'Accepted by administration.';
    if (this.joinStatus === 'REJECTED') return 'Rejected by administration.';
    return '';
  }

  private loadJoinRequestStatus(diplomaId: number): void {
    this.api.getMyDiplomaJoinRequestStatus(diplomaId).subscribe({
      next: (res) => {
        if (!res) return;
        this.joinStatus = res.status;
        this.joinRequested = this.joinStatus === 'PENDING' || this.joinStatus === 'ACCEPTED';
        this.message = this.statusMessage();
      },
      error: () => {}
    });
  }
}
