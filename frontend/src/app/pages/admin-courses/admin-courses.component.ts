import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService, AdminCertificate, AdminCourse } from '../../core/api.service';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-courses.component.html',
  styleUrl: './admin-courses.component.css'
})
export class AdminCoursesComponent implements OnInit {
  certificates: AdminCertificate[] = [];
  courses: AdminCourse[] = [];

  selectedCertificateId: number | null = null;
  editingId: number | null = null;

  form = {
    title: '',
    description: '',
    mode: 'ONLINE' as 'ONLINE' | 'ONSITE' | 'IN_PERSON' | 'HYBRID',
    teacherName: '',
    teacherBio: '',
    durationText: '',
    phoneContact: ''
  };

  toast = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminCertificates().subscribe({
      next: (data) => {
        this.certificates = data || [];
        if (this.certificates.length) {
          this.selectedCertificateId = this.certificates[0].id;
          this.loadCourses();
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load certificates';
      }
    });
  }

  loadCourses(): void {
    this.toast = '';
    this.error = '';
    if (!this.selectedCertificateId) {
      this.courses = [];
      return;
    }

    this.api.getAdminCourses(this.selectedCertificateId).subscribe({
      next: (data) => {
        this.courses = data || [];
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load courses';
      }
    });
  }

  submit(): void {
    this.toast = '';
    this.error = '';

    if (!this.selectedCertificateId) {
      this.error = 'Please select a certificate';
      return;
    }

    if (!this.form.title.trim()) {
      this.error = 'Title is required';
      return;
    }

    const payload = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      mode: this.form.mode,
      teacherName: this.form.teacherName.trim(),
      teacherBio: this.form.teacherBio.trim(),
      durationText: this.form.durationText.trim(),
      phoneContact: this.form.phoneContact.trim()
    };

    if (this.editingId) {
      this.api.updateCourse(this.editingId, payload).subscribe({
        next: () => {
          this.toast = 'Course updated';
          this.resetForm();
          this.loadCourses();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.error || 'Failed to update course';
        }
      });
      return;
    }

    this.api.createCourse(this.selectedCertificateId, payload).subscribe({
      next: () => {
        this.toast = 'Course created';
        this.resetForm();
        this.loadCourses();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to create course';
      }
    });
  }

  edit(item: AdminCourse): void {
    this.editingId = item.id;
    this.form.title = item.title;
    this.form.description = item.description || '';
    this.form.mode = item.mode;
    this.form.teacherName = item.teacherName || '';
    this.form.teacherBio = item.teacherBio || '';
    this.form.durationText = item.durationText || '';
    this.form.phoneContact = item.phoneContact || '';
    this.toast = '';
    this.error = '';
  }

  remove(item: AdminCourse): void {
    this.toast = '';
    this.error = '';
    this.api.deleteCourse(item.id).subscribe({
      next: () => {
        this.toast = 'Course deleted';
        if (this.editingId === item.id) {
          this.resetForm();
        }
        this.loadCourses();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to delete course';
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId = null;
    this.form = {
      title: '',
      description: '',
      mode: 'ONLINE',
      teacherName: '',
      teacherBio: '',
      durationText: '',
      phoneContact: ''
    };
  }
}
