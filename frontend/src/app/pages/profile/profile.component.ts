import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { DiplomaProgress, MyCertificateProgress, UserResponse } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: UserResponse | null = null;
  myCertificates: MyCertificateProgress[] = [];
  myDiplomas: DiplomaProgress[] = [];
  loading = true;
  certificatesLoading = true;
  diplomasLoading = true;
  error = '';

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.api.getMe().subscribe({
      next: (me) => {
        this.user = me;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.error || 'Failed to load profile';
        this.loading = false;
      }
    });

    this.api.getMyCertificatesProgress().subscribe({
      next: (items) => {
        this.myCertificates = items || [];
        this.certificatesLoading = false;
      },
      error: () => {
        this.certificatesLoading = false;
      }
    });

    this.api.getDiplomasProgress().subscribe({
      next: (items) => {
        this.myDiplomas = items || [];
        this.diplomasLoading = false;
      },
      error: () => {
        this.diplomasLoading = false;
      }
    });
  }

  continueLink(item: MyCertificateProgress): string {
    if (item.firstCourseId) {
      return `/course/${item.firstCourseId}`;
    }
    return `/certificate/${item.certificateId}`;
  }

  diplomaLink(item: DiplomaProgress): string {
    return `/diplomas/${item.diplomaId}`;
  }

  diplomaActionLabel(item: DiplomaProgress): string {
    if (item.isClaimed) return 'View Diploma';
    if (item.isCompleted) return 'Get Diploma';
    return 'Continue';
  }
}
