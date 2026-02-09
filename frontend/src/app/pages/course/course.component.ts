import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { Course } from '../../core/certificates.data';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './course.component.html',
  styleUrl: './course.component.css'
})
export class CourseComponent {
  course: Course | null = null;
  loading = true;
  error = '';

  constructor(private route: ActivatedRoute, private api: ApiService) {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);
    if (!idParam || Number.isNaN(id)) {
      this.loading = false;
      return;
    }

    this.api.getCourseById(id).subscribe({
      next: (course) => {
        this.course = course;
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Failed to load course';
        this.loading = false;
      }
    });
  }
}
