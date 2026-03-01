import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  submitted = false;
  form = {
    name: '',
    company: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  };

  submit(): void {
    this.submitted = true;
  }
}
