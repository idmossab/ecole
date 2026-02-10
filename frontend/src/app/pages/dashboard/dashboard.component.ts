import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AdminStats, ApiService } from '../../core/api.service';

type QuickAction = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  route: string;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    {
      id: 'students',
      title: 'Manage Students',
      description: 'View, edit, ban, or delete student accounts.',
      ctaLabel: 'Go to Students',
      route: '/manage-students'
    },
    {
      id: 'certificates',
      title: 'Certificates',
      description: 'Create, edit, and publish certificates.',
      ctaLabel: 'Go to Certificates',
      route: '/admin/certificates'
    },
    {
      id: 'diplomas',
      title: 'Diplomas',
      description: 'Create and update diploma programs and modes.',
      ctaLabel: 'Go to Diplomas',
      route: '/admin/diplomas'
    },
    {
      id: 'courses',
      title: 'Courses',
      description: 'Manage live class course information.',
      ctaLabel: 'Go to Courses',
      route: '/admin/courses'
    },
    {
      id: 'specializations',
      title: 'Specializations',
      description: 'Create and manage diploma specializations.',
      ctaLabel: 'Go to Specializations',
      route: '/admin/specializations'
    }
  ];
  selectedActionId = this.quickActions[0].id;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: () => {}
    });
  }

  get selectedAction(): QuickAction {
    return this.quickActions.find((item) => item.id === this.selectedActionId) ?? this.quickActions[0];
  }

  selectAction(actionId: string): void {
    this.selectedActionId = actionId;
  }
}
