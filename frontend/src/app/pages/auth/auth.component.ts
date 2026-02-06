import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  loginEmailOrUsername = '';
  loginPassword = '';
  loginError = '';
  loginLoading = false;

  firstName = '';
  lastName = '';
  userName = '';
  email = '';
  password = '';
  registerError = '';
  registerLoading = false;

  constructor(private api: ApiService, private auth: AuthService, private router: Router) {}

  submitLogin(): void {
    this.loginError = '';
    this.loginLoading = true;
    this.api.login({ emailOrUsername: this.loginEmailOrUsername, password: this.loginPassword }).subscribe({
      next: (res) => {
        this.auth.setSession(res.user, res.token);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.loginError = err?.error?.message || err?.error || 'Login failed';
        this.loginLoading = false;
      }
    });
  }

  submitRegister(): void {
    this.registerError = '';
    this.registerLoading = true;
    this.api.register({
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        this.auth.setSession(res.user, res.token);
        this.router.navigateByUrl('/home');
      },
      error: (err) => {
        this.registerError = err?.error?.message || err?.error || 'Registration failed';
        this.registerLoading = false;
      }
    });
  }
}
