import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faLock, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';

import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  faUser = faUser;
  faUserPlus = faUserPlus;
  faEnvelope = faEnvelope;
  faLock = faLock;

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

  private returnTo = '/home';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    const target = this.route.snapshot.queryParamMap.get('returnTo');
    if (target) {
      this.returnTo = target;
    }
  }

  submitLogin(): void {
    this.loginError = '';
    this.loginLoading = true;
    this.api.login({ emailOrUsername: this.loginEmailOrUsername, password: this.loginPassword }).subscribe({
      next: (res) => {
        this.auth.setToken(res.token);
        this.router.navigateByUrl(this.returnTo);
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
        this.auth.setToken(res.token);
        this.router.navigateByUrl(this.returnTo);
      },
      error: (err) => {
        this.registerError = err?.error?.message || err?.error || 'Registration failed';
        this.registerLoading = false;
      }
    });
  }
}
