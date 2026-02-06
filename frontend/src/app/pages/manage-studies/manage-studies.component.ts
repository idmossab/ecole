import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ApiService, AdminCourse, AdminCertificate } from '../../core/api.service';
import { Media } from '../../core/models';

@Component({
  selector: 'app-manage-studies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-studies.component.html',
  styleUrl: './manage-studies.component.css'
})
export class ManageStudiesComponent implements OnInit {
  certificates: AdminCertificate[] = [];
  courses: AdminCourse[] = [];
  videos: Media[] = [];

  certTitle = '';
  certDescription = '';
  courseTitle = '';
  courseContent = '';
  courseLearn = '';

  selectedCertificateId: number | null = null;
  selectedCourseId: number | null = null;
  videoFiles: File[] = [];

  message = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCertificates();
    this.loadCourses();
  }

  loadCertificates(): void {
    this.api.getAdminCertificates().subscribe({
      next: (data) => (this.certificates = data || []),
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load certificates';
      }
    });
  }

  loadCourses(certificateId?: number | null): void {
    this.api.getAdminCourses(certificateId).subscribe({
      next: (data) => (this.courses = data || []),
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load courses';
      }
    });
  }

  onCertificateChange(): void {
    this.selectedCourseId = null;
    this.videos = [];
    this.loadCourses(this.selectedCertificateId);
  }

  onCourseChange(): void {
    this.videos = [];
    if (!this.selectedCourseId) return;

    this.api.getCourseMedia(this.selectedCourseId).subscribe({
      next: (data) => {
        this.videos = data || [];
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load videos';
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
      content: this.courseContent,
      whatYouWillLearn: this.courseLearn
    }).subscribe({
      next: () => {
        this.courseTitle = '';
        this.courseContent = '';
        this.courseLearn = '';
        this.message = 'Course created';
        this.loadCourses(this.selectedCertificateId);
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to create course';
      }
    });
  }

  onVideoFilesChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newFiles = Array.from(input.files || []);
    if (!newFiles.length) return;
    this.videoFiles = [...this.videoFiles, ...newFiles];
    input.value = '';
  }

  removeSelectedVideo(index: number): void {
    this.videoFiles.splice(index, 1);
  }

  uploadVideos(): void {
    if (!this.selectedCourseId) {
      this.error = 'Select a course first';
      return;
    }
    if (!this.videoFiles.length) {
      this.error = 'Select video files';
      return;
    }
    this.message = '';
    this.error = '';
    this.api.uploadCourseVideos(this.selectedCourseId, this.videoFiles).subscribe({
      next: () => {
        this.videoFiles = [];
        this.message = 'Videos uploaded';
        this.onCourseChange();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to upload videos';
      }
    });
  }
}
