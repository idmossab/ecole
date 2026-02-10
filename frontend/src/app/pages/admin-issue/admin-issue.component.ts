import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ApiService,
  IssueCertificateOption,
  IssueDiplomaOption,
  IssueGenerateResponse,
  IssueRecentItem,
  IssueStudentContext,
  IssueStudentInfo,
  IssueStudentSearchItem
} from '../../core/api.service';

@Component({
  selector: 'app-admin-issue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-issue.component.html',
  styleUrl: './admin-issue.component.css'
})
export class AdminIssueComponent {
  query = '';
  searching = false;
  searchResults: IssueStudentSearchItem[] = [];
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

  constructor(private api: ApiService) {}

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
    this.success = '';
    this.error = '';

    this.api.getIssueStudentContext(item.userId).subscribe({
      next: (ctx) => {
        this.context = ctx;
        this.student = ctx.student;
        this.selectedCertificateId = ctx.certificates.length ? ctx.certificates[0].certificateId : null;
        this.selectedDiplomaId = ctx.diplomas.length ? ctx.diplomas[0].diplomaId : null;
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
  }

  get certificateOptions(): IssueCertificateOption[] {
    return this.context?.certificates || [];
  }

  get diplomaOptions(): IssueDiplomaOption[] {
    return this.context?.diplomas || [];
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
      this.error = 'Please select a certificate';
      return;
    }
    if (this.issueType === 'DIPLOMA' && !this.selectedDiplomaId) {
      this.error = 'Please select a diploma';
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
        if (this.context) {
          this.selectStudent({
            userId: this.student!.userId,
            name: this.student!.name,
            userName: this.student!.userName,
            email: this.student!.email
          });
        }
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
}
