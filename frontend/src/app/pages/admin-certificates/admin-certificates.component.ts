import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService, AdminCertificate } from '../../core/api.service';

@Component({
  selector: 'app-admin-certificates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-certificates.component.html',
  styleUrl: './admin-certificates.component.css'
})
export class AdminCertificatesComponent implements OnInit {
  certificates: AdminCertificate[] = [];
  editingId: number | null = null;
  uploading = false;

  form = {
    title: '',
    description: '',
    imageUrl: ''
  };

  toast = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCertificates();
  }

  loadCertificates(): void {
    this.api.getAdminCertificates().subscribe({
      next: (data) => {
        this.certificates = data || [];
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load certificates';
      }
    });
  }

  submit(): void {
    this.toast = '';
    this.error = '';

    if (!this.form.title.trim()) {
      this.error = 'Title is required';
      return;
    }

    const payload = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      imageUrl: this.form.imageUrl.trim()
    };

    if (this.editingId) {
      this.api.updateCertificate(this.editingId, payload).subscribe({
        next: () => {
          this.toast = 'Certificate updated';
          this.resetForm();
          this.loadCertificates();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.error || 'Failed to update certificate';
        }
      });
      return;
    }

    this.api.createCertificate(payload).subscribe({
      next: () => {
        this.toast = 'Certificate created';
        this.resetForm();
        this.loadCertificates();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to create certificate';
      }
    });
  }

  edit(item: AdminCertificate): void {
    this.editingId = item.id;
    this.form.title = item.title;
    this.form.description = item.description || '';
    this.form.imageUrl = item.imageUrl || '';
    this.toast = '';
    this.error = '';
  }

  remove(item: AdminCertificate): void {
    this.toast = '';
    this.error = '';
    this.api.deleteCertificate(item.id).subscribe({
      next: () => {
        this.toast = 'Certificate deleted';
        if (this.editingId === item.id) {
          this.resetForm();
        }
        this.loadCertificates();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to delete certificate';
      }
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    this.toast = '';
    this.error = '';

    if (!file.type.startsWith('image/')) {
      this.error = 'Please select an image file';
      input.value = '';
      return;
    }

    this.uploading = true;
    this.api.uploadAdminImage(file).subscribe({
      next: (res) => {
        this.form.imageUrl = res.url || '';
        this.uploading = false;
        input.value = '';
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to upload image';
        this.uploading = false;
        input.value = '';
      }
    });
  }

  removeImage(): void {
    this.form.imageUrl = '';
  }

  imagePreviewUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:8080${path}`;
  }

  private resetForm(): void {
    this.editingId = null;
    this.form = {
      title: '',
      description: '',
      imageUrl: ''
    };
  }
}
