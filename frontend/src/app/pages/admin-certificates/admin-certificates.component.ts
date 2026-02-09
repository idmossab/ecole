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

  form = {
    title: '',
    description: '',
    isPublished: true
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
      isPublished: this.form.isPublished
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
    this.form.isPublished = item.isPublished;
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

  private resetForm(): void {
    this.editingId = null;
    this.form = {
      title: '',
      description: '',
      isPublished: true
    };
  }
}
