import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ApiService, IssuedCredentialVerify } from '../../core/api.service';

@Component({
  selector: 'app-verify-credential',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify-credential.component.html',
  styleUrl: './verify-credential.component.css'
})
export class VerifyCredentialComponent {
  loading = true;
  error = '';
  data: IssuedCredentialVerify | null = null;

  constructor(route: ActivatedRoute, api: ApiService) {
    const serial = route.snapshot.paramMap.get('serial');
    if (!serial) {
      this.loading = false;
      this.error = 'Invalid verification link';
      return;
    }

    api.verifyIssuedCredential(serial).subscribe({
      next: (res) => {
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.error || 'Credential not found';
      }
    });
  }

  typeLabel(type: string): string {
    if (type === 'DIPLOMA') return 'Specialization';
    if (type === 'CERTIFICATE') return 'Certificate';
    return type;
  }
}
