import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService, AdminCourse, AdminCertificate } from '../../core/api.service';
import { Media } from '../../core/models';

@Component({
  selector: 'app-manage-studies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  activeTab: 'certificates' | 'courses' | 'videos' = 'certificates';
  modalType: 'certificate' | 'course' | 'video' | null = null;

  message = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCertificates();
    this.loadCourses(this.selectedCertificateId);
  }

  loadCertificates(): void {
    this.api.getAdminCertificates().subscribe({
      next: (data) => (this.certificates = data || []),
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load certificates';
      },
      complete: () => {
        if (!this.selectedCertificateId && this.certificates.length) {
          this.selectedCertificateId = this.certificates[0].id;
          this.loadCourses(this.selectedCertificateId);
        }
      }
    });
  }

  loadCourses(certificateId?: number | null): void {
    this.api.getAdminCourses(certificateId).subscribe({
      next: (data) => (this.courses = data || []),
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load courses';
      },
      complete: () => {
        if (!this.selectedCourseId && this.courses.length) {
          this.selectedCourseId = this.courses[0].id;
          this.onCourseChange();
        }
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
        this.modalType = null;
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
        this.modalType = null;
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
        this.modalType = null;
        this.onCourseChange();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to upload videos';
      }
    });
  }

  openModal(type: 'certificate' | 'course' | 'video'): void {
    this.message = '';
    this.error = '';
    this.modalType = type;

    if (type === 'course') {
      if (!this.selectedCertificateId && this.certificates.length) {
        this.selectedCertificateId = this.certificates[0].id;
      }
    }

    if (type === 'video') {
      if (!this.selectedCourseId && this.courses.length) {
        this.selectedCourseId = this.courses[0].id;
      }
    }
  }

  closeModal(): void {
    this.modalType = null;
  }

  submitCertificate(): void {
    this.createCertificate();
  }

  submitCourse(): void {
    this.createCourse();
  }

  submitVideoUpload(): void {
    this.uploadVideos();
  }

  setActiveTab(tab: 'certificates' | 'courses' | 'videos'): void {
    this.activeTab = tab;
    this.message = '';
    this.error = '';
    if (tab === 'courses') {
      this.loadCourses(this.selectedCertificateId);
    }
    if (tab === 'videos') {
      if (this.selectedCourseId) {
        this.onCourseChange();
      } else if (this.courses.length) {
        this.selectedCourseId = this.courses[0].id;
        this.onCourseChange();
      }
    }
  }

  activeCertificateTitle(): string {
    if (!this.selectedCertificateId) return '-';
    const cert = this.certificates.find((item) => item.id === this.selectedCertificateId);
    return cert?.title || '-';
  }

  displayVideoName(media: Media): string {
    if (!media?.url) return 'Video';
    const cleaned = media.url.split('/').pop() || media.url;
    return cleaned.replace(/^[0-9a-f-]+_?/i, '');
  }

  selectedCourseTitle(): string {
    if (!this.selectedCourseId) return '-';
    const course = this.courses.find((item) => item.id === this.selectedCourseId);
    return course?.title || '-';
  }

  editCourse(_course: AdminCourse): void {
    this.message = 'Edit course is coming soon';
  }

  deleteCourse(_course: AdminCourse): void {
    this.message = 'Delete course is coming soon';
  }

  deleteCertificate(_certificate: AdminCertificate): void {
    this.message = 'Delete certificate is coming soon';
  }

  deleteVideo(_video: Media): void {
    this.message = 'Delete video is coming soon';
  }
}
