import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { NotificationItem } from '../../core/models';

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
  notifications: NotificationItem[] = [];
  unreadCount = 0;
  showNotifications = false;
  showLanguage = false;
  selectedLanguage: 'EN' | 'FR' | 'AR' = 'EN';
  private navSub?: Subscription;

  constructor(private auth: AuthService, private router: Router, private api: ApiService) {}

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
    if (this.loggedIn) {
      this.loadNotifications();
    } else {
      this.notifications = [];
      this.unreadCount = 0;
      this.showNotifications = false;
    }
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

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.loadNotifications();
    }
  }

  toggleLanguage(): void {
    this.showLanguage = !this.showLanguage;
  }

  selectLanguage(code: 'EN' | 'FR' | 'AR'): void {
    this.selectedLanguage = code;
    this.showLanguage = false;
  }

  markRead(item: NotificationItem): void {
    this.api.markNotificationRead(item.id).subscribe({
      next: () => {
        const wasUnread = !item.isRead;
        this.notifications = this.notifications.filter((n) => n.id !== item.id);
        if (wasUnread) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
      },
      error: () => {}
    });
  }

  private loadNotifications(): void {
    this.api.getNotifications().subscribe({
      next: (items) => {
        this.notifications = (items || []).slice(0, 10);
      },
      error: () => {}
    });
    this.api.getUnreadNotificationCount().subscribe({
      next: (res) => {
        this.unreadCount = res?.unreadCount || 0;
      },
      error: () => {}
    });
  }
}
