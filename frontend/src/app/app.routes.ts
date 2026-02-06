import { Routes } from '@angular/router';

import { authGuard } from './core/auth.guard';
import { guestGuard } from './core/guest.guard';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { BlogDetailsComponent } from './pages/blog-details/blog-details.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ContactComponent } from './pages/contact/contact.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'login',
    component: LoginComponent,
    canMatch: [guestGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canMatch: [guestGuard]
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: 'blogs/:id',
    component: BlogDetailsComponent,
    canMatch: [authGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canMatch: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
