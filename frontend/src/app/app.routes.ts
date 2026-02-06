import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AuthComponent } from './pages/auth/auth.component';
import { RegisterComponent } from './pages/register/register.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DiplomaDetailsComponent } from './pages/diploma-details/diploma-details.component';
import { SpecialityDetailsComponent } from './pages/speciality-details/speciality-details.component';
import { LoginRequiredComponent } from './pages/login-required/login-required.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'login',
    component: AuthComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'diploma',
    component: DiplomaDetailsComponent
  },
  {
    path: 'speciality/:slug',
    component: SpecialityDetailsComponent
  },
  {
    path: 'login-required',
    component: LoginRequiredComponent
  },
  {
    path: 'contact',
    component: ContactComponent
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
