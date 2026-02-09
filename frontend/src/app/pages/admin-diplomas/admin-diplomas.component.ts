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
  readonly modes: DiplomasMode[] = ['SPECIALIZED_TECHNICIAN', 'TECHNICIAN', 'QUALIFICATION'];

  form = {
    title: '',
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

  private resetForm(): void {
    this.editingId = null;
    this.form = {
      title: '',
      mode: 'TECHNICIAN'
    };
  }
}
