import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (this.auth.getToken() && !this.auth.isLoggedIn()) {
      this.auth.logout();
      this.router.navigateByUrl('/login');
    }

  }
}
