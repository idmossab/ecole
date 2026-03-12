import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private auth: AuthService) {}

  get getStartedLink(): string {
    return this.auth.isLoggedIn() ? '/diplomas' : '/register';
  }

  hero = {
    badge: 'Transform Your Future Today',
    title: 'Learn Without Limits',
    highlight: 'Limits',
    subtitle:
      'Master in-demand skills with world-class diploma and certificate programs. Get certified, advance your career, and join successful graduates worldwide.'
  };

  heroStats = [
    { value: '10,000+', label: 'Active Students' },
    { value: '4.9', label: 'Average Rating' },
    { value: 'ISO', label: 'Accredited' }
  ];

  programs = [
    {
      title: 'Courses',
      description: 'Short-term intensive programs designed to build practical skills in just weeks.',
      link: '/certificates',
      icon: '📘',
      cta: 'Explore Courses'
    },
    {
      title: 'Diplomas',
      description: 'Comprehensive diploma tracks with hands-on projects and real career outcomes.',
      link: '/diplomas',
      icon: '🎓',
      cta: 'View Diplomas'
    },
    {
      title: 'Certificates',
      description: 'Professional certificates that validate your expertise and increase credibility.',
      link: '/certificates',
      icon: '🏅',
      cta: 'Get Certified'
    }
  ];

  features = [
    {
      title: 'Expert Instructors',
      description: 'Learn from industry leaders with real-world project experience.',
      icon: '👥'
    },
    {
      title: 'Lifetime Access',
      description: 'Access course materials, updates, and support resources anytime.',
      icon: '⚡'
    },
    {
      title: 'Career Growth',
      description: 'Receive mentorship and guidance for stronger job opportunities.',
      icon: '📈'
    }
  ];

  testimonials = [
    {
      name: 'Jessica Martinez',
      role: 'Full-Stack Developer',
      quote:
        'This program transformed my career. The practical projects helped me get hired quickly.'
    },
    {
      name: 'David Kim',
      role: 'Product Manager',
      quote:
        'Flexible schedules and strong mentorship made it possible to learn while working full-time.'
    },
    {
      name: 'Priya Sharma',
      role: 'UX Designer',
      quote:
        'The curriculum was industry-ready. I immediately applied the skills in real projects.'
    }
  ];
}
