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
      cta: '/login-required'
    },
    {
      title: 'Networking',
      description: 'Design and secure reliable network systems.',
      cta: '/login-required'
    },
    {
      title: 'English Language',
      description: 'Boost your academic and professional communication skills.',
      cta: '/login-required'
    }
  ];
}
