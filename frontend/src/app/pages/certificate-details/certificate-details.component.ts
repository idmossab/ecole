import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-certificate-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './certificate-details.component.html',
  styleUrl: './certificate-details.component.css'
})
export class CertificateDetailsComponent {
  certificate = {
    title: 'Software Development',
    description:
      'Focus on building scalable web and mobile applications with clean architecture, testing, and modern tooling.'
  };

  constructor(private route: ActivatedRoute) {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug === 'networking') {
      this.certificate = {
        title: 'Networking',
        description:
          'Learn to design, secure, and operate enterprise networks, covering routing, switching, and network services.'
      };
    }
  }
}
