import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AdminJoinRequest, ApiService, UserIssuedStats } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { UserResponse } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  myCertificates: AdminJoinRequest[] = [];
  myDiplomas: AdminJoinRequest[] = [];
  issuedStats: UserIssuedStats | null = null;
  issuedStatsLoading = true;
  loading = true;
  certificatesLoading = true;
  diplomasLoading = true;
  savingProfile = false;
  editMode = false;
  error = '';
  success = '';
  profileForm = {
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    city: '',
    phone: ''
  };

  joinRedirectMessage = '';
  joinCompleteMessage = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  get isProfileIncomplete(): boolean {
    if (!this.user) return false;
    const phone = this.user.phone?.trim() || '';
    const city = this.user.city?.trim() || '';
    return phone.length === 0 || city.length === 0;
  }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.api.getMe().subscribe({
      next: (me) => {
        this.user = me;
        this.profileForm = {
          firstName: me.firstName || '',
          lastName: me.lastName || '',
          userName: me.userName || '',
          email: me.email || '',
          city: me.city || '',
          phone: me.phone || ''
        };
        this.loading = false;
        if (me.role === 'ADMIN') {
          this.certificatesLoading = false;
          this.diplomasLoading = false;
          this.issuedStatsLoading = false;
          return;
        }

        const editParam = this.route.snapshot.queryParamMap.get('edit');
        const fromParam = this.route.snapshot.queryParamMap.get('from');
        if (editParam === '1') {
          this.editMode = true;
          if (fromParam === 'join') {
            this.joinRedirectMessage = 'Please complete your profile information to request a diploma or certificate.';
            this.joinCompleteMessage = '';
          }
        }

        this.api.getMyAcceptedCertificates().subscribe({
          next: (items) => {
            this.myCertificates = items || [];
            this.certificatesLoading = false;
          },
          error: () => {
            this.certificatesLoading = false;
          }
        });

        this.api.getMyAcceptedDiplomas().subscribe({
          next: (items) => {
            this.myDiplomas = items || [];
            this.diplomasLoading = false;
          },
          error: () => {
            this.diplomasLoading = false;
          }
        });

        this.api.getMyIssuedStats().subscribe({
          next: (stats) => {
            this.issuedStats = stats;
            this.issuedStatsLoading = false;
          },
          error: () => {
            this.issuedStatsLoading = false;
          }
        });
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.error || 'Failed to load profile';
        this.loading = false;
      }
    });
  }

  continueLink(item: AdminJoinRequest): string {
    if (item.courseId) {
      return `/course/${item.courseId}`;
    }
    return `/certificate/${item.certificateId}`;
  }

  diplomaLink(item: AdminJoinRequest): string {
    return `/diplomas/${item.diplomaId}`;
  }

  diplomaActionLabel(item: AdminJoinRequest): string {
    if (item.status === 'ACCEPTED') return 'Continue';
    return 'Continue';
  }

  startEdit(): void {
    this.editMode = true;
    this.success = '';
    this.error = '';
    this.joinRedirectMessage = '';
    this.joinCompleteMessage = '';
  }

  cancelEdit(): void {
    if (this.user) {
      this.profileForm = {
        firstName: this.user.firstName || '',
        lastName: this.user.lastName || '',
        userName: this.user.userName || '',
        email: this.user.email || '',
        city: this.user.city || '',
        phone: this.user.phone || ''
      };
    }
    this.editMode = false;
    this.error = '';
  }

  saveProfile(): void {
    if (!this.user || this.savingProfile) return;
    this.savingProfile = true;
    this.error = '';
    this.success = '';
    this.api.updateMeProfile({
      firstName: this.profileForm.firstName.trim(),
      lastName: this.profileForm.lastName.trim(),
      userName: this.profileForm.userName.trim(),
      email: this.profileForm.email.trim(),
      city: this.profileForm.city.trim(),
      phone: this.profileForm.phone.trim()
    }).subscribe({
      next: (updated) => {
        this.user = updated;
        this.profileForm = {
          firstName: updated.firstName || '',
          lastName: updated.lastName || '',
          userName: updated.userName || '',
          email: updated.email || '',
          city: updated.city || '',
          phone: updated.phone || ''
        };
        this.savingProfile = false;
        this.editMode = false;
        this.success = 'Profile updated';
        if (this.joinRedirectMessage) {
          this.joinRedirectMessage = '';
          this.joinCompleteMessage = 'Profile completed. You can now join any certificate or diploma.';
        }
      },
      error: (err) => {
        this.savingProfile = false;
        this.error = err?.error?.message || err?.error || 'Failed to update profile';
      }
    });
  }
}
