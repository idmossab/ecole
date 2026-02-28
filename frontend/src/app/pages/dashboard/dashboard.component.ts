import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AdminIssueComponent } from '../admin-issue/admin-issue.component';
import { AdminIssueStatsComponent } from '../admin-issue-stats/admin-issue-stats.component';

import {
  AdminCertificate,
  AdminCourse,
  AdminDiploma,
  AdminJoinRequest,
  AdminSpecialization,
  AdminStats,
  ApiService
} from '../../core/api.service';
import { DiplomasMode, UserResponse } from '../../core/models';

type QuickActionId = 'students' | 'certificates' | 'diplomas' | 'courses' | 'specializations' | 'issue' | 'issue-stats' | 'join-requests';

type QuickAction = {
  id: QuickActionId;
  title: string;
  description: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminIssueComponent, AdminIssueStatsComponent],
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
    { id: 'specializations', title: 'Specializations', description: 'Create and manage diploma specializations.' },
    { id: 'issue', title: 'Issue Certificate/Diploma', description: 'Issue certificates and diplomas to students.' },
    { id: 'issue-stats', title: 'Issue Statistics', description: 'View accepted join and issued counts.' },
    { id: 'join-requests', title: 'Join Requests', description: 'Review and process students join requests.' }
  ];
  selectedActionId: QuickActionId = 'students';

  loadingAction = false;
  actionError = '';
  actionToast = '';
  loadedActionIds = new Set<QuickActionId>();

  students: UserResponse[] = [];
  currentUserId: number | null = null;
  certificates: AdminCertificate[] = [];
  diplomas: AdminDiploma[] = [];
  courses: (AdminCourse & { certificateTitle?: string })[] = [];
  specializations: (AdminSpecialization & { diplomaTitle?: string })[] = [];
  joinRequests: AdminJoinRequest[] = [];

  formVisible = false;
  editingId: number | null = null;
  submitting = false;
  uploadingImage = false;
  deleteConfirmVisible = false;
  pendingDeleteItem: any = null;
  pendingDeleteActionId: QuickActionId | null = null;
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
    this.api.getMe().subscribe({
      next: (me) => {
        this.currentUserId = me.userId;
      },
      error: () => {}
    });

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
    return this.selectedActionId !== 'students'
      && this.selectedActionId !== 'join-requests'
      && this.selectedActionId !== 'issue'
      && this.selectedActionId !== 'issue-stats';
  }

  get formTitle(): string {
    const mode = this.editingId ? 'Edit' : 'Create';
    if (this.selectedActionId === 'certificates') return `${mode} Certificate`;
    if (this.selectedActionId === 'diplomas') return `${mode} Diploma`;
    if (this.selectedActionId === 'courses') return `${mode} Course`;
    if (this.selectedActionId === 'specializations') return `${mode} Specialization`;
    if (this.selectedActionId === 'issue') return '';
    if (this.selectedActionId === 'issue-stats') return '';
    if (this.selectedActionId === 'join-requests') return '';
    return '';
  }

  selectAction(actionId: QuickActionId): void {
    this.selectedActionId = actionId;
    this.formVisible = false;
    this.uploadingImage = false;
    this.deleteConfirmVisible = false;
    this.pendingDeleteItem = null;
    this.pendingDeleteActionId = null;
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
    this.uploadingImage = false;
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
    if (this.selectedActionId === 'students' && !this.canManageStudentActions(item)) {
      return;
    }
    this.deleteConfirmVisible = true;
    this.pendingDeleteItem = item;
    this.pendingDeleteActionId = this.selectedActionId;
    this.pendingDeleteLabel = this.selectedActionId === 'students'
      ? `${item?.firstName || ''} ${item?.lastName || ''}`.trim() || item?.email || 'selected user'
      : item?.title || item?.id || 'selected item';
  }

  cancelDelete(): void {
    this.deleteConfirmVisible = false;
    this.pendingDeleteItem = null;
    this.pendingDeleteActionId = null;
    this.pendingDeleteLabel = '';
  }

  confirmDelete(): void {
    if (!this.pendingDeleteItem || !this.pendingDeleteActionId) return;
    const item = this.pendingDeleteItem;
    const actionId = this.pendingDeleteActionId;

    if (actionId === 'students') {
      this.api.adminDeleteUser(item.userId).subscribe({
        next: () => {
          this.actionToast = 'User deleted';
          this.cancelDelete();
          this.reloadAction('students');
        },
        error: (err) => {
          this.actionError = err?.error?.message || err?.error || 'Failed to delete user';
        }
      });
      return;
    }

    if (actionId === 'certificates') {
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

    if (actionId === 'diplomas') {
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

    if (actionId === 'courses') {
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

    if (actionId === 'specializations') {
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

  toggleStudentStatus(item: UserResponse): void {
    if (!this.canManageStudentActions(item)) return;
    this.actionError = '';
    this.actionToast = '';
    this.api.adminToggleUserStatus(item.userId).subscribe({
      next: (updated) => {
        this.students = this.students.map((user) => user.userId === item.userId ? updated : user);
        this.actionToast = `User status changed to ${updated.status}`;
      },
      error: (err) => {
        this.actionError = err?.error?.message || err?.error || 'Failed to change user status';
      }
    });
  }

  changeStudentRole(item: UserResponse): void {
    if (!this.canManageStudentActions(item)) return;
    this.actionError = '';
    this.actionToast = '';
    const nextRole: 'ADMIN' | 'USER' = item.role === 'ADMIN' ? 'USER' : 'ADMIN';
    this.api.adminChangeUserRole(item.userId, nextRole).subscribe({
      next: (updated) => {
        this.students = this.students.map((user) => user.userId === item.userId ? updated : user);
        this.actionToast = `User role changed to ${updated.role}`;
      },
      error: (err) => {
        this.actionError = err?.error?.message || err?.error || 'Failed to change user role';
      }
    });
  }

  isSuperAdmin(item: UserResponse): boolean {
    const adminIds = this.students
      .filter((u) => u.role === 'ADMIN')
      .map((u) => u.userId)
      .sort((a, b) => a - b);
    if (!adminIds.length) return false;
    return item.userId === adminIds[0];
  }

  isCurrentUserSuperAdmin(): boolean {
    if (!this.currentUserId) return false;
    const current = this.students.find((u) => u.userId === this.currentUserId);
    if (!current) return false;
    return this.isSuperAdmin(current);
  }

  canManageStudentActions(item: UserResponse): boolean {
    if (this.isSuperAdmin(item)) return false;
    if (item.role === 'ADMIN' && !this.isCurrentUserSuperAdmin()) return false;
    return true;
  }

  acceptJoinRequest(item: AdminJoinRequest): void {
    this.actionError = '';
    this.actionToast = '';
    const call$ = item.requestType === 'DIPLOMA'
      ? this.api.acceptAdminDiplomaJoinRequest(item.id)
      : this.api.acceptAdminJoinRequest(item.id);
    call$.subscribe({
      next: (updated) => {
        this.joinRequests = this.joinRequests.filter(
          (req) => !(req.id === item.id && req.requestType === item.requestType)
        );
        this.actionToast = `Join request #${updated.id} accepted`;
      },
      error: (err) => {
        this.actionError = err?.error?.message || err?.error || 'Failed to accept join request';
      }
    });
  }

  rejectJoinRequest(item: AdminJoinRequest): void {
    this.actionError = '';
    this.actionToast = '';
    const call$ = item.requestType === 'DIPLOMA'
      ? this.api.rejectAdminDiplomaJoinRequest(item.id)
      : this.api.rejectAdminJoinRequest(item.id);
    call$.subscribe({
      next: (updated) => {
        this.joinRequests = this.joinRequests.filter(
          (req) => !(req.id === item.id && req.requestType === item.requestType)
        );
        this.actionToast = `Join request #${updated.id} rejected`;
      },
      error: (err) => {
        this.actionError = err?.error?.message || err?.error || 'Failed to reject join request';
      }
    });
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

  onImageSelected(target: 'certificate' | 'diploma', event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    if (!file) return;

    this.actionError = '';
    this.actionToast = '';

    if (!file.type.startsWith('image/')) {
      this.actionError = 'Please select an image file';
      input.value = '';
      return;
    }

    this.uploadingImage = true;
    this.api.uploadAdminImage(file).subscribe({
      next: (res) => {
        const url = res.url || '';
        if (target === 'certificate') {
          this.certificateForm.imageUrl = url;
        } else {
          this.diplomaForm.imageUrl = url;
        }
        this.uploadingImage = false;
        input.value = '';
      },
      error: (err) => {
        this.actionError = err?.error?.message || err?.error || 'Failed to upload image';
        this.uploadingImage = false;
        input.value = '';
      }
    });
  }

  removeImage(target: 'certificate' | 'diploma'): void {
    if (target === 'certificate') {
      this.certificateForm.imageUrl = '';
      return;
    }
    this.diplomaForm.imageUrl = '';
  }

  imagePreviewUrl(path?: string | null): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://localhost:8080${path}`;
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
      this.api.getAdminUsers().subscribe({
        next: (users) => {
          this.students = users || [];
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

    if (actionId === 'join-requests') {
      this.api.getAdminJoinRequests().subscribe({
        next: (data) => {
          this.joinRequests = data || [];
          this.loadedActionIds.add(actionId);
          this.loadingAction = false;
        },
        error: () => {
          this.actionError = 'Failed to load join requests';
          this.loadingAction = false;
        }
      });
      return;
    }

    if (actionId === 'issue') {
      this.loadedActionIds.add(actionId);
      this.loadingAction = false;
      return;
    }

    if (actionId === 'issue-stats') {
      this.loadedActionIds.add(actionId);
      this.loadingAction = false;
      return;
    }

    this.loadingAction = false;
  }
}
