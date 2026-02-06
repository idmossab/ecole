import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-diploma-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './diploma-details.component.html',
  styleUrl: './diploma-details.component.css'
})
export class DiplomaDetailsComponent {
  diploma = {
    title: 'Bachelor in Computer Science',
    description:
      'This diploma offers a balanced mix of theory and practical skills. Students build strong foundations in programming, algorithms, systems, and software design while preparing for real-world development and infrastructure roles.',
    requirement: 'This diploma requires a Baccalaureate'
  };

  specialities = [
    {
      title: 'Software Development',
      description: 'Design, build, and deploy modern applications using best practices.',
      slug: 'software-development'
    },
    {
      title: 'Networking',
      description: 'Plan, secure, and manage robust network infrastructures.',
      slug: 'networking'
    }
  ];
}
