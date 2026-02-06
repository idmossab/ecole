import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService } from '../../core/api.service';

type AdminCertificate = {
  id: number;
  title: string;
  description?: string | null;
};

@Component({
  selector: 'app-manage-studies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-studies.component.html',
  styleUrl: './manage-studies.component.css'
})
export class ManageStudiesComponent implements OnInit {
  certificates: AdminCertificate[] = [];

  certTitle = '';
  certDescription = '';
  courseTitle = '';
  courseContent = '';
  selectedCertificateId: number | null = null;
  videoCourseId: number | null = null;
  videoFiles: File[] = [];

  message = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.api.getAdminCertificates().subscribe({
      next: (data) => (this.certificates = data || []),
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load certificates';
      }
    });
  }

  createCertificate(): void {
    this.message = '';
    this.error = '';
    this.api.createCertificate({ title: this.certTitle, description: this.certDescription }).subscribe({
      next: (cert) => {
        this.certificates = [cert, ...this.certificates];
        this.certTitle = '';
        this.certDescription = '';
        this.message = 'Certificate created';
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to create certificate';
      }
    });
  }

  createCourse(): void {
    if (!this.selectedCertificateId) {
      this.error = 'Select a certificate first';
      return;
    }
    this.message = '';
    this.error = '';
    this.api.createCourse({
      certificateId: this.selectedCertificateId,
      title: this.courseTitle,
      content: this.courseContent
    }).subscribe({
      next: () => {
        this.courseTitle = '';
        this.courseContent = '';
        this.message = 'Course created';
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to create course';
      }
    });
  }

  onVideoFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.videoFiles = Array.from(input.files || []);
  }

  uploadVideos(): void {
    if (!this.videoCourseId) {
      this.error = 'Enter a course ID';
      return;
    }
    if (!this.videoFiles.length) {
      this.error = 'Select video files';
      return;
    }
    this.message = '';
    this.error = '';
    this.api.uploadCourseVideos(this.videoCourseId, this.videoFiles).subscribe({
      next: () => {
        this.videoFiles = [];
        this.videoCourseId = null;
        this.message = 'Videos uploaded';
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to upload videos';
      }
    });
  }
}
