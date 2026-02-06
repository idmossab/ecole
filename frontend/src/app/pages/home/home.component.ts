import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  diplomas = [
    { title: 'Software Engineering', label: 'Diploma in Software Engineering' },
    { title: 'Data Science', label: 'Diploma in Data Science' },
    { title: 'Cybersecurity', label: 'Diploma in Cybersecurity' },
    { title: 'Cloud Computing', label: 'Diploma in Cloud Computing' },
    { title: 'UI/UX Design', label: 'Diploma in UI/UX Design' },
    { title: 'Project Management', label: 'Diploma in Project Management' }
  ];
}
