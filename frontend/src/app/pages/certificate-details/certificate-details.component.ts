import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { certificates, Certificate } from '../../core/certificates.data';

@Component({
  selector: 'app-certificate-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './certificate-details.component.html',
  styleUrl: './certificate-details.component.css'
})
export class CertificateDetailsComponent {
  certificate: Certificate | null = null;
  showComingSoon = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {
    const slug = this.route.snapshot.paramMap.get('slug');
    this.certificate = certificates.find((item) => item.id === slug) || null;
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  handleStartCourse(): void {
    if (!this.certificate) return;

    const hasContent = this.certificate.courses.some((course) => course.videoCount > 0);
    if (!hasContent) {
      if (!this.auth.isLoggedIn()) {
        this.router.navigateByUrl(`/login?returnTo=/certificate/${this.certificate.id}`);
        return;
      }
      this.showComingSoon = true;
      return;
    }

    if (!this.auth.isLoggedIn()) {
      this.router.navigateByUrl(`/login?returnTo=/certificate/${this.certificate.id}`);
      return;
    }

    this.showComingSoon = true;
  }
}
