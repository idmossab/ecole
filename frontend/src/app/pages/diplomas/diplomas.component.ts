import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { DiplomasMode, DiplomaSummary } from '../../core/models';

@Component({
  selector: 'app-diplomas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './diplomas.component.html',
  styleUrl: './diplomas.component.css'
})
export class DiplomasComponent implements OnInit {
  diplomas: DiplomaSummary[] = [];
  error = '';
  loading = true;
  private readonly fallbackImages = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1200&q=80'
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDiplomas().subscribe({
      next: (data) => {
        this.diplomas = data || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load diplomas';
        this.loading = false;
      }
    });
  }

  modeLabel(mode: DiplomasMode): string {
    if (mode === 'SPECIALIZED_TECHNICIAN') return 'Specialized Technician';
    if (mode === 'TECHNICIAN') return 'Technician';
    return 'Qualification';
  }

  modeBadge(mode: DiplomasMode): string {
    if (mode === 'SPECIALIZED_TECHNICIAN') return 'Specialized';
    if (mode === 'TECHNICIAN') return 'Technician';
    return 'Qualification';
  }

  cardImage(item: DiplomaSummary, index: number): string {
    const source = item.imageUrl;
    if (!source) return this.fallbackImages[index % this.fallbackImages.length];
    if (source.startsWith('http://') || source.startsWith('https://')) return source;
    return `http://localhost:8080${source}`;
  }

  durationLabel(mode: DiplomasMode): string {
    if (mode === 'SPECIALIZED_TECHNICIAN') return '18-24 months';
    if (mode === 'TECHNICIAN') return '12-18 months';
    return '24-30 months';
  }

  certificateLabel(mode: DiplomasMode): string {
    if (mode === 'SPECIALIZED_TECHNICIAN') return 'Specialized Software Developer';
    if (mode === 'TECHNICIAN') return 'Certified IT Technician';
    return 'Professional Qualification Certificate';
  }
}
