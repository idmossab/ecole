import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { UserResponse } from '../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  user: UserResponse | null = null;
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
    this.user = this.auth.getCurrentUser();
  }

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  get isUser(): boolean {
    return this.user?.role === 'USER';
  }
}
