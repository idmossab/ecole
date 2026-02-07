import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AuthComponent } from './pages/auth/auth.component';
import { RegisterComponent } from './pages/register/register.component';
import { ContactComponent } from './pages/contact/contact.component';
import { DiplomaDetailsComponent } from './pages/diploma-details/diploma-details.component';
import { CertificateDetailsComponent } from './pages/certificate-details/certificate-details.component';
import { LoginRequiredComponent } from './pages/login-required/login-required.component';
import { CertificatesComponent } from './pages/certificates/certificates.component';
import { DiplomasComponent } from './pages/diplomas/diplomas.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { ManageStudiesComponent } from './pages/manage-studies/manage-studies.component';
import { CourseComponent } from './pages/course/course.component';
import { StatsComingComponent } from './pages/stats-coming/stats-coming.component';

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
    path: 'certificates',
    component: CertificatesComponent
  },
  {
    path: 'certificate/:slug',
    component: CertificateDetailsComponent
  },
  {
    path: 'course/:id',
    component: CourseComponent
  },
  {
    path: 'diplomas',
    component: DiplomasComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'manage-studies',
    component: ManageStudiesComponent
  },
  {
    path: 'manage-students',
    component: StatsComingComponent
  },
  {
    path: 'stats-coming',
    component: StatsComingComponent
  },
  {
    path: 'profile',
    component: ProfileComponent
  },
  {
    path: 'diploma',
    component: DiplomaDetailsComponent
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
