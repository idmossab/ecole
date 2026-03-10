import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  faUser = faUser;
  faEnvelope = faEnvelope;
  faLock = faLock;

  firstName = '';
  lastName = '';
  userName = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  submit(): void {
    this.error = '';
    this.loading = true;
    this.api.register({
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.auth.setToken(res.token);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.error = err?.error?.message || err?.error || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
