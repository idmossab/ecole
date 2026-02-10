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
import { CourseComponent } from './pages/course/course.component';
import { StatsComingComponent } from './pages/stats-coming/stats-coming.component';
import { AdminCertificatesComponent } from './pages/admin-certificates/admin-certificates.component';
import { AdminCoursesComponent } from './pages/admin-courses/admin-courses.component';
import { AdminDiplomasComponent } from './pages/admin-diplomas/admin-diplomas.component';
import { AdminSpecializationsComponent } from './pages/admin-specializations/admin-specializations.component';
import { AdminIssueComponent } from './pages/admin-issue/admin-issue.component';
import { AdminIssueStatsComponent } from './pages/admin-issue-stats/admin-issue-stats.component';

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
    path: 'diplomas/:id',
    component: DiplomaDetailsComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'admin/certificates',
    component: AdminCertificatesComponent
  },
  {
    path: 'admin/diplomas',
    component: AdminDiplomasComponent
  },
  {
    path: 'admin/courses',
    component: AdminCoursesComponent
  },
  {
    path: 'admin/specializations',
    component: AdminSpecializationsComponent
  },
  {
    path: 'admin/issue',
    component: AdminIssueComponent
  },
  {
    path: 'admin/issue-stats',
    component: AdminIssueStatsComponent
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
