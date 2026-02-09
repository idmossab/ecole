import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ApiService, AdminSpecialization } from '../../core/api.service';
import { DiplomaSummary } from '../../core/models';

@Component({
  selector: 'app-admin-specializations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-specializations.component.html',
  styleUrl: './admin-specializations.component.css'
})
export class AdminSpecializationsComponent implements OnInit {
  diplomas: DiplomaSummary[] = [];
  specializations: AdminSpecialization[] = [];

  selectedDiplomaId: number | null = null;
  editingId: number | null = null;

  form = {
    title: '',
    description: '',
    programOverview: '',
    durationText: '',
    certificateAwarded: '',
    entryRequirements: '',
    programFeatures: ''
  };

  toast = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDiplomas().subscribe({
      next: (data) => {
        this.diplomas = data || [];
        if (this.diplomas.length) {
          this.selectedDiplomaId = this.diplomas[0].id;
          this.loadSpecializations();
        }
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load diplomas';
      }
    });
  }

  loadSpecializations(): void {
    this.toast = '';
    this.error = '';
    if (!this.selectedDiplomaId) {
      this.specializations = [];
      return;
    }

    this.api.getAdminSpecializations(this.selectedDiplomaId).subscribe({
      next: (data) => {
        this.specializations = data || [];
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load specializations';
      }
    });
  }

  submit(): void {
    this.toast = '';
    this.error = '';

    if (!this.selectedDiplomaId) {
      this.error = 'Please select a diploma';
      return;
    }

    if (!this.form.title.trim()) {
      this.error = 'Title is required';
      return;
    }

    const payload = {
      title: this.form.title.trim(),
      description: this.form.description.trim(),
      programOverview: this.form.programOverview.trim(),
      durationText: this.form.durationText.trim(),
      certificateAwarded: this.form.certificateAwarded.trim(),
      entryRequirements: this.form.entryRequirements.trim(),
      programFeatures: this.form.programFeatures.trim()
    };

    if (this.editingId) {
      this.api.updateSpecialization(this.editingId, payload).subscribe({
        next: () => {
          this.toast = 'Specialization updated';
          this.resetForm();
          this.loadSpecializations();
        },
        error: (err) => {
          this.error = err?.error?.message || err?.error || 'Failed to update specialization';
        }
      });
      return;
    }

    this.api.createSpecialization(this.selectedDiplomaId, payload).subscribe({
      next: () => {
        this.toast = 'Specialization created';
        this.resetForm();
        this.loadSpecializations();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to create specialization';
      }
    });
  }

  edit(item: AdminSpecialization): void {
    this.editingId = item.id;
    this.form.title = item.title;
    this.form.description = item.description || '';
    this.form.programOverview = item.programOverview || '';
    this.form.durationText = item.durationText || '';
    this.form.certificateAwarded = item.certificateAwarded || '';
    this.form.entryRequirements = item.entryRequirements || '';
    this.form.programFeatures = item.programFeatures || '';
    this.toast = '';
    this.error = '';
  }

  remove(item: AdminSpecialization): void {
    this.toast = '';
    this.error = '';
    this.api.deleteSpecialization(item.id).subscribe({
      next: () => {
        this.toast = 'Specialization deleted';
        if (this.editingId === item.id) {
          this.resetForm();
        }
        this.loadSpecializations();
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to delete specialization';
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
      programOverview: '',
      durationText: '',
      certificateAwarded: '',
      entryRequirements: '',
      programFeatures: ''
    };
  }
}
