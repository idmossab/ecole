import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AdminDiploma, ApiService } from '../../core/api.service';
import { DiplomasMode } from '../../core/models';

@Component({
  selector: 'app-admin-diplomas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-diplomas.component.html',
  styleUrl: './admin-diplomas.component.css'
})
export class AdminDiplomasComponent implements OnInit {
  diplomas: AdminDiploma[] = [];
  editingId: number | null = null;
  uploading = false;
  readonly modes: DiplomasMode[] = ['SPECIALIZED_TECHNICIAN', 'TECHNICIAN', 'QUALIFICATION'];

  form = {
    title: '',
    imageUrl: '',
    mode: 'TECHNICIAN' as DiplomasMode
  };

  toast = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadDiplomas();
  }

  loadDiplomas(): void {
    this.api.getAdminDiplomas().subscribe({
      next: (data) => {
        this.diplomas = data || [];
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load diplomas';
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
      imageUrl: this.form.imageUrl.trim(),
      mode: this.form.mode
    };

    if (this.editingId) {
      this.api.updateAdminDiploma(this.editingId, payload).subscribe({
        next: () => {
          this.toast = 'Diploma updated';
          this.resetForm();
          this.loadDiplomas();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.error || 'Failed to update diploma';
        }
      });
      return;
    }

    this.api.createAdminDiploma(payload).subscribe({
      next: () => {
        this.toast = 'Diploma created';
        this.resetForm();
        this.loadDiplomas();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to create diploma';
      }
    });
  }

  edit(item: AdminDiploma): void {
    this.editingId = item.id;
    this.form.title = item.title;
    this.form.imageUrl = item.imageUrl || '';
    this.form.mode = item.mode;
    this.toast = '';
    this.error = '';
  }

  remove(item: AdminDiploma): void {
    this.toast = '';
    this.error = '';
    this.api.deleteAdminDiploma(item.id).subscribe({
      next: () => {
        this.toast = 'Diploma deleted';
        if (this.editingId === item.id) {
          this.resetForm();
        }
        this.loadDiplomas();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to delete diploma';
      }
    });
  }

  modeLabel(mode: DiplomasMode): string {
    if (mode === 'SPECIALIZED_TECHNICIAN') return 'Specialized Technician';
    if (mode === 'TECHNICIAN') return 'Technician';
    return 'Qualification';
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
      imageUrl: '',
      mode: 'TECHNICIAN'
    };
  }
}
