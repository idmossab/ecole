import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  ApiService,
  IssueCertificateOption,
  IssueDiplomaOption,
  IssueGenerateResponse,
  IssueIssuedStudent,
  IssueRecentItem,
  IssueStudentContext,
  IssueStudentInfo,
  IssueStudentSearchItem
} from '../../core/api.service';

@Component({
  selector: 'app-admin-issue',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-issue.component.html',
  styleUrl: './admin-issue.component.css'
})
export class AdminIssueComponent {
  query = '';
  issuedStudentQuery = '';
  searching = false;
  searchResults: IssueStudentSearchItem[] = [];
  issuedStudents: IssueIssuedStudent[] = [];
  loadingIssuedStudents = false;
  student: IssueStudentInfo | null = null;
  context: IssueStudentContext | null = null;

  issueType: 'CERTIFICATE' | 'DIPLOMA' = 'CERTIFICATE';
  selectedCertificateId: number | null = null;
  selectedDiplomaId: number | null = null;
  issueDate = '';

  generating = false;
  error = '';
  success = '';
  result: IssueGenerateResponse | null = null;
  selectedIssuedResults: IssueRecentItem[] = [];
  selectedIssuedStudentName = '';

  constructor(private api: ApiService) {
    this.loadIssuedStudents();
  }

  onQueryChange(): void {
    this.error = '';
    const q = this.query.trim();
    if (q.length < 2) {
      this.searchResults = [];
      return;
    }
    this.searching = true;
    this.api.searchIssueStudents(q).subscribe({
      next: (data) => {
        this.searchResults = data || [];
        this.searching = false;
      },
      error: () => {
        this.searching = false;
        this.error = 'Failed to search students';
      }
    });
  }

  selectStudent(item: IssueStudentSearchItem): void {
    this.query = `${item.name} (${item.userName})`;
    this.searchResults = [];
    this.result = null;
    this.selectedIssuedResults = [];
    this.selectedIssuedStudentName = '';
    this.success = '';
    this.error = '';

    this.api.getIssueStudentContext(item.userId).subscribe({
      next: (ctx) => {
        this.applyContext(ctx);
      },
      error: () => {
        this.error = 'Failed to load student context';
      }
    });
  }

  onTypeChange(): void {
    this.result = null;
    this.success = '';
    this.error = '';
    if (this.issueType === 'CERTIFICATE' && this.selectedCertificateId == null && this.certificateOptions.length) {
      const firstNotIssued = this.certificateOptions.find((entry) => !entry.alreadyIssued);
      this.selectedCertificateId = (firstNotIssued || this.certificateOptions[0]).certificateId;
    }
    if (this.issueType === 'DIPLOMA' && this.selectedDiplomaId == null && this.diplomaOptions.length) {
      const firstNotIssued = this.diplomaOptions.find((entry) => !entry.alreadyIssued);
      this.selectedDiplomaId = (firstNotIssued || this.diplomaOptions[0]).diplomaId;
    }
  }

  get certificateOptions(): IssueCertificateOption[] {
    return (this.context?.certificates || []).filter((entry) => entry.accepted);
  }

  get diplomaOptions(): IssueDiplomaOption[] {
    return (this.context?.diplomas || []).filter((entry) => entry.accepted);
  }

  get selectedCertificate(): IssueCertificateOption | null {
    return this.certificateOptions.find((c) => c.certificateId === this.selectedCertificateId) || null;
  }

  get selectedDiploma(): IssueDiplomaOption | null {
    return this.diplomaOptions.find((d) => d.diplomaId === this.selectedDiplomaId) || null;
  }

  get alreadyIssued(): boolean {
    if (this.issueType === 'CERTIFICATE') return !!this.selectedCertificate?.alreadyIssued;
    return !!this.selectedDiploma?.alreadyIssued;
  }

  get canGenerate(): boolean {
    if (!this.student || !this.issueDate || this.generating || this.alreadyIssued) return false;
    if (this.issueType === 'CERTIFICATE') return !!this.selectedCertificateId;
    return !!this.selectedDiplomaId;
  }

  generate(): void {
    this.error = '';
    this.success = '';
    this.result = null;

    if (!this.student) {
      this.error = 'Please select a student';
      return;
    }
    if (!this.issueDate) {
      this.error = 'Issue date is required';
      return;
    }
    if (this.issueType === 'CERTIFICATE' && !this.selectedCertificateId) {
      this.error = this.certificateOptions.length ? 'Please select a certificate' : 'No accepted certificates for this student';
      return;
    }
    if (this.issueType === 'DIPLOMA' && !this.selectedDiplomaId) {
      this.error = this.diplomaOptions.length ? 'Please select a diploma' : 'No accepted diplomas for this student';
      return;
    }

    this.generating = true;
    this.api.generateIssue({
      userId: this.student.userId,
      type: this.issueType,
      certificateId: this.issueType === 'CERTIFICATE' ? this.selectedCertificateId : null,
      diplomaId: this.issueType === 'DIPLOMA' ? this.selectedDiplomaId : null,
      issueDate: this.issueDate
    }).subscribe({
      next: (res) => {
        this.generating = false;
        this.result = res;
        this.success = this.issueType === 'CERTIFICATE' ? 'Certificate generated' : 'Diploma generated';
        if (this.student) {
          this.refreshStudentContext(this.student.userId);
        }
        this.loadIssuedStudents();
      },
      error: (err) => {
        this.generating = false;
        this.error = err?.error?.message || err?.error || 'Failed to generate';
      }
    });
  }

  get recentItems(): IssueRecentItem[] {
    return this.context?.recentlyIssued || [];
  }

  get filteredIssuedStudents(): IssueIssuedStudent[] {
    const q = this.issuedStudentQuery.trim().toLowerCase();
    if (!q) return this.issuedStudents;
    return this.issuedStudents.filter((row) =>
      (row.name || '').toLowerCase().includes(q)
      || (row.userName || '').toLowerCase().includes(q)
      || (row.email || '').toLowerCase().includes(q)
    );
  }

  private refreshStudentContext(userId: number): void {
    this.api.getIssueStudentContext(userId).subscribe({
      next: (ctx) => {
        this.applyContext(ctx);
      },
      error: () => {}
    });
  }

  selectIssuedStudent(item: IssueIssuedStudent): void {
    this.query = `${item.name} (${item.userName})`;
    this.searchResults = [];
    this.result = null;
    this.success = '';
    this.error = '';

    this.api.getIssueStudentContext(item.userId).subscribe({
      next: (ctx) => {
        this.applyContext(ctx);
        this.selectedIssuedStudentName = item.name;
        this.selectedIssuedResults = ctx.recentlyIssued || [];
      },
      error: () => {
        this.error = 'Failed to load selected student details';
      }
    });
  }

  deleteIssuedFromRow(item: IssueIssuedStudent): void {
    if (!item.latestIssuedId) {
      this.error = 'No issued credential found to delete';
      return;
    }
    this.error = '';
    this.success = '';
    this.api.deleteIssuedCredential(item.latestIssuedId).subscribe({
      next: () => {
        this.success = 'Issued credential deleted';
        this.loadIssuedStudents();
        if (this.student?.userId === item.userId) {
          this.refreshStudentContext(item.userId);
          this.selectedIssuedResults = [];
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to delete issued credential';
      }
    });
  }

  banStudentFromRow(item: IssueIssuedStudent): void {
    this.error = '';
    this.success = '';
    this.api.adminToggleUserStatus(item.userId).subscribe({
      next: (updated) => {
        this.success = updated.status === 'BANNED' ? 'Student banned' : 'Student activated';
        this.loadIssuedStudents();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to update student status';
      }
    });
  }

  private loadIssuedStudents(): void {
    this.loadingIssuedStudents = true;
    this.api.getIssueStudentsWithIssued().subscribe({
      next: (list) => {
        this.issuedStudents = list || [];
        this.loadingIssuedStudents = false;
      },
      error: () => {
        this.loadingIssuedStudents = false;
      }
    });
  }

  private toResultFromRecent(item: IssueRecentItem): IssueGenerateResponse {
    return {
      issuedId: item.id,
      serialNumber: item.serialNumber,
      issueDate: item.issueDate,
      qrPreview: `http://localhost:4200/verify/${item.serialNumber}`,
      qrImageUrl: `http://localhost:8080/api/issued/qr/${item.serialNumber}`,
      documentUrl: '/documents/issued/' + item.serialNumber
    };
  }

  qrImageUrlFor(item: IssueRecentItem): string {
    return `http://localhost:8080/api/issued/qr/${item.serialNumber}`;
  }

  verifyUrlFor(item: IssueRecentItem): string {
    return `http://localhost:4200/verify/${item.serialNumber}`;
  }

  private applyContext(ctx: IssueStudentContext): void {
    this.context = ctx;
    this.student = ctx.student;
    const acceptedCertificates = (ctx.certificates || []).filter((entry) => entry.accepted);
    const acceptedDiplomas = (ctx.diplomas || []).filter((entry) => entry.accepted);
    const firstCertificateNotIssued = acceptedCertificates.find((entry) => !entry.alreadyIssued);
    const firstDiplomaNotIssued = acceptedDiplomas.find((entry) => !entry.alreadyIssued);
    this.selectedCertificateId = acceptedCertificates.length
      ? (firstCertificateNotIssued || acceptedCertificates[0]).certificateId
      : null;
    this.selectedDiplomaId = acceptedDiplomas.length
      ? (firstDiplomaNotIssued || acceptedDiplomas[0]).diplomaId
      : null;
  }
}
