import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  hero = {
    title: 'Start Your Learning Journey Today',
    subtitle:
      'Access world-class education and earn recognized diplomas. Learn at your own pace with expert-led courses.',
    cta: 'Get Started Free'
  };

  stats = [
    { value: '50+', label: 'Professional Courses' },
    { value: '10,000+', label: 'Active Students' },
    { value: '5,000+', label: 'Diplomas Issued' }
  ];

  featured = {
    title: 'Bachelor in Computer Science',
    description:
      'Build strong foundations in software engineering, systems, and modern computing with an industry-aligned curriculum.',
    meta: '2 Specialities • 4 Courses'
  };
}
