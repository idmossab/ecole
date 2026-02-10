import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import {
  AdminCertificate,
  AdminCourse,
  AdminDiploma,
  AdminSpecialization,
  AdminStats,
  ApiService
} from '../../core/api.service';
import { DiplomasMode, UserResponse } from '../../core/models';

type QuickActionId = 'students' | 'certificates' | 'diplomas' | 'courses' | 'specializations';

type QuickAction = {
  id: QuickActionId;
  title: string;
  description: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats: AdminStats = {
    totalStudents: 0,
    totalCourses: 0,
    totalCertificates: 0,
    totalDiplomas: 0
  };

  quickActions: QuickAction[] = [
    { id: 'students', title: 'Manage Students', description: 'View student accounts.' },
    { id: 'certificates', title: 'Certificates', description: 'Create, edit, and publish certificates.' },
    { id: 'diplomas', title: 'Diplomas', description: 'Create and update diploma programs and modes.' },
    { id: 'courses', title: 'Courses', description: 'Manage live class course information.' },
    { id: 'specializations', title: 'Specializations', description: 'Create and manage diploma specializations.' }
  ];
  selectedActionId: QuickActionId = 'students';

  loadingAction = false;
  actionError = '';
  actionToast = '';
  loadedActionIds = new Set<QuickActionId>();

  students: UserResponse[] = [];
  certificates: AdminCertificate[] = [];
  diplomas: AdminDiploma[] = [];
  courses: (AdminCourse & { certificateTitle?: string })[] = [];
  specializations: (AdminSpecialization & { diplomaTitle?: string })[] = [];

  formVisible = false;
  editingId: number | null = null;
  submitting = false;
  deleteConfirmVisible = false;
  pendingDeleteItem: any = null;
  pendingDeleteLabel = '';

  diplomaModes: DiplomasMode[] = ['SPECIALIZED_TECHNICIAN', 'TECHNICIAN', 'QUALIFICATION'];

  certificateForm = {
    title: '',
    description: '',
    imageUrl: ''
  };

  diplomaForm = {
    title: '',
    imageUrl: '',
    mode: 'TECHNICIAN' as DiplomasMode
  };

  courseForm = {
    certificateId: null as number | null,
    title: '',
    description: '',
    mode: 'ONLINE' as 'ONLINE' | 'ONSITE' | 'IN_PERSON' | 'HYBRID',
    teacherName: '',
    teacherBio: '',
    durationText: '',
    phoneContact: ''
  };

  specializationForm = {
    diplomaId: null as number | null,
    title: '',
    description: '',
    programOverview: '',
    durationText: '',
    certificateAwarded: '',
    entryRequirements: '',
    programFeatures: ''
  };

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: () => {}
    });
    this.loadActionData(this.selectedActionId);
  }

  get selectedAction(): QuickAction {
    return this.quickActions.find((item) => item.id === this.selectedActionId) ?? this.quickActions[0];
  }

  get canCreate(): boolean {
    return this.selectedActionId !== 'students';
  }

  get formTitle(): string {
    const mode = this.editingId ? 'Edit' : 'Create';
    if (this.selectedActionId === 'certificates') return `${mode} Certificate`;
    if (this.selectedActionId === 'diplomas') return `${mode} Diploma`;
    if (this.selectedActionId === 'courses') return `${mode} Course`;
    if (this.selectedActionId === 'specializations') return `${mode} Specialization`;
    return '';
  }

  selectAction(actionId: QuickActionId): void {
    this.selectedActionId = actionId;
    this.formVisible = false;
    this.deleteConfirmVisible = false;
    this.pendingDeleteItem = null;
    this.editingId = null;
    this.actionError = '';
    this.actionToast = '';
    this.loadActionData(actionId);
  }

  showCreateForm(): void {
    this.actionError = '';
    this.actionToast = '';
    this.editingId = null;
    this.formVisible = true;
    this.resetCurrentForm();
    if (this.selectedActionId === 'courses' && !this.courseForm.certificateId && this.certificates.length) {
      this.courseForm.certificateId = this.certificates[0].id;
    }
    if (this.selectedActionId === 'specializations' && !this.specializationForm.diplomaId && this.diplomas.length) {
      this.specializationForm.diplomaId = this.diplomas[0].id;
    }
  }

  cancelForm(): void {
    this.formVisible = false;
    this.editingId = null;
    this.submitting = false;
    this.resetCurrentForm();
  }

  editItem(item: any): void {
    this.actionError = '';
    this.actionToast = '';
    this.formVisible = true;

    if (this.selectedActionId === 'certificates') {
      this.editingId = item.id;
      this.certificateForm = {
        title: item.title || '',
        description: item.description || '',
        imageUrl: item.imageUrl || ''
      };
      return;
    }

    if (this.selectedActionId === 'diplomas') {
      this.editingId = item.id;
      this.diplomaForm = {
        title: item.title || '',
        imageUrl: item.imageUrl || '',
        mode: item.mode || 'TECHNICIAN'
      };
      return;
    }

    if (this.selectedActionId === 'courses') {
      this.editingId = item.id;
      this.courseForm = {
        certificateId: item.certificateId || null,
        title: item.title || '',
        description: item.description || '',
        mode: item.mode || 'ONLINE',
        teacherName: item.teacherName || '',
        teacherBio: item.teacherBio || '',
        durationText: item.durationText || '',
        phoneContact: item.phoneContact || ''
      };
      return;
    }

    if (this.selectedActionId === 'specializations') {
      this.editingId = item.id;
      this.specializationForm = {
        diplomaId: item.diplomaId || null,
        title: item.title || '',
        description: item.description || '',
        programOverview: item.programOverview || '',
        durationText: item.durationText || '',
        certificateAwarded: item.certificateAwarded || '',
        entryRequirements: item.entryRequirements || '',
        programFeatures: item.programFeatures || ''
      };
    }
  }

  removeItem(item: any): void {
    this.actionError = '';
    this.actionToast = '';
    this.deleteConfirmVisible = true;
    this.pendingDeleteItem = item;
    this.pendingDeleteLabel = item?.title || item?.id || 'selected item';
  }

  cancelDelete(): void {
    this.deleteConfirmVisible = false;
    this.pendingDeleteItem = null;
    this.pendingDeleteLabel = '';
  }

  confirmDelete(): void {
    if (!this.pendingDeleteItem) return;
    const item = this.pendingDeleteItem;

    if (this.selectedActionId === 'certificates') {
      this.api.deleteCertificate(item.id).subscribe({
        next: () => {
          this.actionToast = 'Certificate deleted';
          this.cancelDelete();
          this.reloadAction('certificates');
        },
        error: (err) => {
          this.actionError = err?.error?.message || err?.error || 'Failed to delete certificate';
        }
      });
      return;
    }

    if (this.selectedActionId === 'diplomas') {
      this.api.deleteAdminDiploma(item.id).subscribe({
        next: () => {
          this.actionToast = 'Diploma deleted';
          this.cancelDelete();
          this.reloadAction('diplomas');
        },
        error: (err) => {
          this.actionError = err?.error?.message || err?.error || 'Failed to delete diploma';
        }
      });
      return;
    }

    if (this.selectedActionId === 'courses') {
      this.api.deleteCourse(item.id).subscribe({
        next: () => {
          this.actionToast = 'Course deleted';
          this.cancelDelete();
          this.reloadAction('courses');
        },
        error: (err) => {
          this.actionError = err?.error?.message || err?.error || 'Failed to delete course';
        }
      });
      return;
    }

    if (this.selectedActionId === 'specializations') {
      this.api.deleteSpecialization(item.id).subscribe({
        next: () => {
          this.actionToast = 'Specialization deleted';
          this.cancelDelete();
          this.reloadAction('specializations');
        },
        error: (err) => {
          this.actionError = err?.error?.message || err?.error || 'Failed to delete specialization';
        }
      });
    }
  }

  submitForm(): void {
    this.actionError = '';
    this.actionToast = '';
    this.submitting = true;

    if (this.selectedActionId === 'certificates') {
      const payload = {
        title: this.certificateForm.title.trim(),
        description: this.certificateForm.description.trim(),
        imageUrl: this.certificateForm.imageUrl.trim()
      };
      if (!payload.title) {
        this.submitting = false;
        this.actionError = 'Title is required';
        return;
      }
      if (this.editingId) {
        this.api.updateCertificate(this.editingId, payload).subscribe({
          next: () => this.afterSubmit('Certificate updated', 'certificates'),
          error: (err) => this.onSubmitError(err, 'Failed to update certificate')
        });
      } else {
        this.api.createCertificate(payload).subscribe({
          next: () => this.afterSubmit('Certificate created', 'certificates'),
          error: (err) => this.onSubmitError(err, 'Failed to create certificate')
        });
      }
      return;
    }

    if (this.selectedActionId === 'diplomas') {
      const payload = {
        title: this.diplomaForm.title.trim(),
        imageUrl: this.diplomaForm.imageUrl.trim(),
        mode: this.diplomaForm.mode
      };
      if (!payload.title) {
        this.submitting = false;
        this.actionError = 'Title is required';
        return;
      }
      if (this.editingId) {
        this.api.updateAdminDiploma(this.editingId, payload).subscribe({
          next: () => this.afterSubmit('Diploma updated', 'diplomas'),
          error: (err) => this.onSubmitError(err, 'Failed to update diploma')
        });
      } else {
        this.api.createAdminDiploma(payload).subscribe({
          next: () => this.afterSubmit('Diploma created', 'diplomas'),
          error: (err) => this.onSubmitError(err, 'Failed to create diploma')
        });
      }
      return;
    }

    if (this.selectedActionId === 'courses') {
      if (!this.courseForm.certificateId) {
        this.submitting = false;
        this.actionError = 'Certificate is required';
        return;
      }
      const payload = {
        title: this.courseForm.title.trim(),
        description: this.courseForm.description.trim(),
        mode: this.courseForm.mode,
        teacherName: this.courseForm.teacherName.trim(),
        teacherBio: this.courseForm.teacherBio.trim(),
        durationText: this.courseForm.durationText.trim(),
        phoneContact: this.courseForm.phoneContact.trim()
      };
      if (!payload.title) {
        this.submitting = false;
        this.actionError = 'Title is required';
        return;
      }
      if (this.editingId) {
        this.api.updateCourse(this.editingId, payload).subscribe({
          next: () => this.afterSubmit('Course updated', 'courses'),
          error: (err) => this.onSubmitError(err, 'Failed to update course')
        });
      } else {
        this.api.createCourse(this.courseForm.certificateId, payload).subscribe({
          next: () => this.afterSubmit('Course created', 'courses'),
          error: (err) => this.onSubmitError(err, 'Failed to create course')
        });
      }
      return;
    }

    if (this.selectedActionId === 'specializations') {
      if (!this.specializationForm.diplomaId) {
        this.submitting = false;
        this.actionError = 'Diploma is required';
        return;
      }
      const payload = {
        title: this.specializationForm.title.trim(),
        description: this.specializationForm.description.trim(),
        programOverview: this.specializationForm.programOverview.trim(),
        durationText: this.specializationForm.durationText.trim(),
        certificateAwarded: this.specializationForm.certificateAwarded.trim(),
        entryRequirements: this.specializationForm.entryRequirements.trim(),
        programFeatures: this.specializationForm.programFeatures.trim()
      };
      if (!payload.title) {
        this.submitting = false;
        this.actionError = 'Title is required';
        return;
      }
      if (this.editingId) {
        this.api.updateSpecialization(this.editingId, payload).subscribe({
          next: () => this.afterSubmit('Specialization updated', 'specializations'),
          error: (err) => this.onSubmitError(err, 'Failed to update specialization')
        });
      } else {
        this.api.createSpecialization(this.specializationForm.diplomaId, payload).subscribe({
          next: () => this.afterSubmit('Specialization created', 'specializations'),
          error: (err) => this.onSubmitError(err, 'Failed to create specialization')
        });
      }
      return;
    }

    this.submitting = false;
  }

  modeLabel(mode: DiplomasMode): string {
    if (mode === 'SPECIALIZED_TECHNICIAN') return 'Specialized Technician';
    if (mode === 'TECHNICIAN') return 'Technician';
    return 'Qualification';
  }

  private afterSubmit(message: string, actionId: QuickActionId): void {
    this.actionToast = message;
    this.submitting = false;
    this.formVisible = false;
    this.editingId = null;
    this.resetCurrentForm();
    this.reloadAction(actionId);
  }

  private onSubmitError(err: any, fallback: string): void {
    this.submitting = false;
    this.actionError = err?.error?.message || err?.error || fallback;
  }

  private resetCurrentForm(): void {
    if (this.selectedActionId === 'certificates') {
      this.certificateForm = { title: '', description: '', imageUrl: '' };
      return;
    }
    if (this.selectedActionId === 'diplomas') {
      this.diplomaForm = { title: '', imageUrl: '', mode: 'TECHNICIAN' };
      return;
    }
    if (this.selectedActionId === 'courses') {
      this.courseForm = {
        certificateId: this.certificates.length ? this.certificates[0].id : null,
        title: '',
        description: '',
        mode: 'ONLINE',
        teacherName: '',
        teacherBio: '',
        durationText: '',
        phoneContact: ''
      };
      return;
    }
    if (this.selectedActionId === 'specializations') {
      this.specializationForm = {
        diplomaId: this.diplomas.length ? this.diplomas[0].id : null,
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

  private reloadAction(actionId: QuickActionId): void {
    this.loadedActionIds.delete(actionId);
    this.loadActionData(actionId);
  }

  private loadActionData(actionId: QuickActionId): void {
    if (this.loadedActionIds.has(actionId)) return;
    this.loadingAction = true;
    this.actionError = '';

    if (actionId === 'students') {
      this.api.getUsers().subscribe({
        next: (users) => {
          this.students = (users || []).filter((u) => u.role === 'USER');
          this.loadedActionIds.add(actionId);
          this.loadingAction = false;
        },
        error: () => {
          this.actionError = 'Failed to load students';
          this.loadingAction = false;
        }
      });
      return;
    }

    if (actionId === 'certificates') {
      this.api.getAdminCertificates().subscribe({
        next: (data) => {
          this.certificates = data || [];
          this.loadedActionIds.add(actionId);
          this.loadingAction = false;
        },
        error: () => {
          this.actionError = 'Failed to load certificates';
          this.loadingAction = false;
        }
      });
      return;
    }

    if (actionId === 'diplomas') {
      this.api.getAdminDiplomas().subscribe({
        next: (data) => {
          this.diplomas = data || [];
          this.loadedActionIds.add(actionId);
          this.loadingAction = false;
        },
        error: () => {
          this.actionError = 'Failed to load diplomas';
          this.loadingAction = false;
        }
      });
      return;
    }

    if (actionId === 'courses') {
      this.api.getAdminCertificates().subscribe({
        next: (certs) => {
          this.certificates = certs || [];
          if (!this.certificates.length) {
            this.courses = [];
            this.loadedActionIds.add(actionId);
            this.loadingAction = false;
            return;
          }
          forkJoin(this.certificates.map((cert) => this.api.getAdminCourses(cert.id))).subscribe({
            next: (courseGroups) => {
              this.courses = this.certificates.flatMap((cert, index) =>
                (courseGroups[index] || []).map((course) => ({
                  ...course,
                  certificateTitle: cert.title
                }))
              );
              this.loadedActionIds.add(actionId);
              this.loadingAction = false;
            },
            error: () => {
              this.actionError = 'Failed to load courses';
              this.loadingAction = false;
            }
          });
        },
        error: () => {
          this.actionError = 'Failed to load courses';
          this.loadingAction = false;
        }
      });
      return;
    }

    if (actionId === 'specializations') {
      this.api.getAdminDiplomas().subscribe({
        next: (dips) => {
          this.diplomas = dips || [];
          if (!this.diplomas.length) {
            this.specializations = [];
            this.loadedActionIds.add(actionId);
            this.loadingAction = false;
            return;
          }
          forkJoin(this.diplomas.map((dip) => this.api.getAdminSpecializations(dip.id))).subscribe({
            next: (specGroups) => {
              this.specializations = this.diplomas.flatMap((dip, index) =>
                (specGroups[index] || []).map((spec) => ({
                  ...spec,
                  diplomaTitle: dip.title
                }))
              );
              this.loadedActionIds.add(actionId);
              this.loadingAction = false;
            },
            error: () => {
              this.actionError = 'Failed to load specializations';
              this.loadingAction = false;
            }
          });
        },
        error: () => {
          this.actionError = 'Failed to load specializations';
          this.loadingAction = false;
        }
      });
      return;
    }

    this.loadingAction = false;
  }
}
