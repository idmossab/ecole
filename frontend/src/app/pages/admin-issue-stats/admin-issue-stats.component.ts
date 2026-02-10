import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ApiService, IssueStats } from '../../core/api.service';

@Component({
  selector: 'app-admin-issue-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-issue-stats.component.html',
  styleUrl: './admin-issue-stats.component.css'
})
export class AdminIssueStatsComponent implements OnInit {
  stats: IssueStats = {
    activeCertificates: 0,
    activeDiplomas: 0,
    issuedDiplomas: 0,
    issuedCertificates: 0
  };
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getIssueStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load statistics';
        this.loading = false;
      }
    });
  }
}
