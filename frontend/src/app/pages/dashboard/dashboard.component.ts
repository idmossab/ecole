import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AdminStats, ApiService } from '../../core/api.service';

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

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: () => {}
    });
  }
}
