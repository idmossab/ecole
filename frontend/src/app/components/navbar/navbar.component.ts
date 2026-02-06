import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  role: string | null = null;
  loggedIn = false;
  private navSub?: Subscription;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.syncState();
    this.navSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.syncState());
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private syncState(): void {
    this.loggedIn = this.auth.isLoggedIn();
    this.role = this.auth.getRole();
  }

  get isAdmin(): boolean {
    return this.role === 'ADMIN';
  }

  get isUser(): boolean {
    return this.role === 'USER';
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
