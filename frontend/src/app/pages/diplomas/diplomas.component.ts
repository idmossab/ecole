import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { ApiService } from '../../core/api.service';
import { DiplomasMode, DiplomaSummary, SpecializationSummary } from '../../core/models';

@Component({
  selector: 'app-diplomas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './diplomas.component.html',
  styleUrl: './diplomas.component.css'
})
export class DiplomasComponent implements OnInit {
  diplomas: DiplomaSummary[] = [];
  specializationsByDiplomaId: Record<number, SpecializationSummary[]> = {};
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
        if (!this.diplomas.length) {
          this.loading = false;
          return;
        }

        forkJoin(
          this.diplomas.map((diploma) => this.api.getDiplomaSpecializations(diploma.id))
        ).subscribe({
          next: (allSpecs) => {
            this.specializationsByDiplomaId = {};
            this.diplomas.forEach((diploma, index) => {
              this.specializationsByDiplomaId[diploma.id] = allSpecs[index] || [];
            });
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
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
    return this.modeLabel(mode);
  }

  cardImage(item: DiplomaSummary, index: number): string {
    const source = item.imageUrl;
    if (!source) return this.fallbackImages[index % this.fallbackImages.length];
    if (source.startsWith('http://') || source.startsWith('https://')) return source;
    return `http://localhost:8080${source}`;
  }

  specializationCount(diplomaId: number): number {
    return (this.specializationsByDiplomaId[diplomaId] || []).length;
  }

  firstSpecialization(diplomaId: number): SpecializationSummary | null {
    const list = this.specializationsByDiplomaId[diplomaId] || [];
    return list.length ? list[0] : null;
  }

  summaryText(diploma: DiplomaSummary): string {
    const spec = this.firstSpecialization(diploma.id);
    return spec?.description?.trim()
      || spec?.programOverview?.trim()
      || 'Specialization details are not available yet.';
  }

  durationText(diplomaId: number): string {
    return this.firstSpecialization(diplomaId)?.durationText?.trim() || 'Duration not specified';
  }

  credentialText(diplomaId: number): string {
    return this.firstSpecialization(diplomaId)?.certificateAwarded?.trim() || 'Credential not specified';
  }
}
