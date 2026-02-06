import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.css'
})
export class CertificatesComponent {
  certificates = [
    {
      title: 'Software Development',
      description: 'Build modern applications with clean architecture and best practices.',
      courseCount: 0,
      cta: '/login-required'
    },
    {
      title: 'Networking',
      description: 'Design and secure reliable network systems.',
      courseCount: 0,
      cta: '/login-required'
    },
    {
      title: 'English Language',
      description: 'Boost your academic and professional communication skills.',
      courseCount: 0,
      cta: '/login-required'
    }
  ];
}
